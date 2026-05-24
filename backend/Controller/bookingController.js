const { Booking } = require("../Model/bookingModel");
const { Tour } = require("../Model/tourModel");
const { Hotel } = require("../Model/hotelModel");
const { Room } = require("../Model/roomModel");
const CustomTourRequest = require("../Model/CustomTourRequest");


async function getUserBookings(userId) {
  try {
    const bookings = await Booking.find({ userId: userId })
      .populate("userId")
      .populate({
        path: "itemId",
      })
      .lean();

    if (!bookings || bookings.length === 0) {
      return {
        status: "success",
        data: [],
        message: "No bookings found for this user.",
      };
    }

    const validBookings = bookings.filter(
      (booking) => booking.itemId !== null
    );

    if (validBookings.length !== bookings.length) {
      console.warn(
        `${bookings.length - validBookings.length
        } bookings had invalid itemId references`
      );
    }

    return {
      status: "success",
      data: validBookings,
    };
  } catch (error) {
    console.error("Error in getUserBookings:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function getHotelBookings(hotelId) {
  try {
    const bookings = await Booking.find({ itemId: hotelId })
      .populate("userId")
      .lean();

    if (!bookings) {
      throw new Error("No bookings found for this hotel.");
    }

    return {
      status: "success",
      data: bookings,
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function makeTourBooking(userId, tourId, bookingDetails) {
  try {
    const tour = await Tour.findById(tourId);
    if (!tour) {
      throw new Error("Tour not found.");
    }

    const startDate = bookingDetails.startDate;
    if (startDate) {
      const existingBookings = await Booking.find({
        "bookingDetails.startDate": startDate,
        itemId: tourId,
        "bookingDetails.status": { $ne: "cancelled" }, 
      });

      const currentPeopleCount = existingBookings.reduce((sum, booking) => {
        return sum + (booking.bookingDetails.numGuests || 1);
      }, 0);

      const numGuests = Number(bookingDetails.numGuests) || 1;

      if (tour.maxPeople && (currentPeopleCount + numGuests > tour.maxPeople)) {
        throw new Error(`Tour is fully booked for this date. Max capacity: ${tour.maxPeople}. Available: ${Math.max(0, tour.maxPeople - currentPeopleCount)}`);
      }
    }

    const pricePerPerson = tour.price.amount - tour.price.discount * tour.price.amount;

    const numGuests = bookingDetails.numGuests || 1;

    const totalPrice = pricePerPerson * numGuests;

    const commissionRate = tour.commissionRate || 10; 
    const commissionAmount = (totalPrice * commissionRate) / 100;

    const booking = new Booking({
      userId,
      type: "Tour",
      itemId: new mongoose.Types.ObjectId(tourId),
      commissionAmount,
      bookingDetails: {
        ...bookingDetails,
        status: bookingDetails.status || "pending",
        bookingDate: new Date(),
        price: totalPrice,
        pricePerPerson: pricePerPerson,
      },
    });

    const savedBooking = await booking.save();

    return {
      status: "success",
      data: {
        booking: savedBooking,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function makeHotelBooking(
  userId,
  hotelId,
  bookingDetails
) {
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found.");
    }

    let { startDate, endDate, roomTypeId } = bookingDetails;

    if (startDate) startDate = new Date(startDate);
    if (endDate) endDate = new Date(endDate);

    if (startDate && endDate && roomTypeId) {
      const totalRooms = await Room.countDocuments({
        hotelId: hotelId,
        roomTypeId: roomTypeId,
        status: { $ne: "maintenance" } 
      });


      if (totalRooms === 0) {
        throw new Error("No rooms of this type defined in the system.");
      }

      const overlappingBookings = await Booking.find({
        itemId: hotelId,
        type: "Hotel",
        "bookingDetails.roomTypeId": roomTypeId,
        "bookingDetails.status": { $in: ["pending", "booked", "checkedIn"] },
        $or: [
          {
            "bookingDetails.startDate": { $lte: endDate },
            "bookingDetails.endDate": { $gte: startDate },
          }
        ]
      });

      if (overlappingBookings.length >= totalRooms) {
        throw new Error("No rooms available for the selected dates.");
      }
    } else {
      throw new Error("Start date, end date, and room type are required.");
    }

    const parsePrice = (priceVal) => {
      if (typeof priceVal === 'number') return priceVal;
      if (!priceVal) return 0;
      const clean = String(priceVal).replace(/[^\d.-]/g, '');
      return parseFloat(clean) || 0;
    };

    let totalPrice = parsePrice(bookingDetails.price || 0);

    const commissionRate = hotel.commissionRate || 10;
    const commissionAmount = (totalPrice * commissionRate) / 100;

    const booking = new Booking({
      userId,
      type: "Hotel",
      itemId: new mongoose.Types.ObjectId(hotelId),
      commissionAmount,
      bookingDetails: {
        ...bookingDetails,
        status: bookingDetails.status || "pending",
        bookingDate: new Date(),
        price: totalPrice,
        startDate: startDate,
        endDate: endDate
      },
    });

    const savedBooking = await booking.save();

    return {
      status: "success",
      data: {
        booking: savedBooking,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function cancelBooking(bookingId) {
  try {
    const resultPending = await Booking.updateOne(
      { _id: bookingId, "bookingDetails.status": "pending" },
      { $set: { "bookingDetails.status": "cancel" } }
    );

    const resultBooked = await Booking.updateOne(
      { _id: bookingId, "bookingDetails.status": "booked" },
      { $set: { "bookingDetails.status": "cancel" } }
    );

    if (resultPending.modifiedCount === 1 || resultBooked.modifiedCount === 1) {
      console.log("Booking status updated to cancel.");

      return {
        status: "success",
        message: "Booking cancelled successfully.",
      };

    } else {
      console.log(
        "No pending or booked booking found or already updated."
      );

      return {
        status: "error",
        message: "Booking not found or already cancelled.",
      };
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
  }
}

async function updateBookingStatus(bookingId, status) {
  try {
    const validStatuses = ["pending", "booked", "checkedIn", "complete", "cancelled"];
    if (!validStatuses.includes(status)) {
      return {
        status: "error",
        message: "Invalid status"
      };
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: { "bookingDetails.status": status } },
      { new: true }
    );

    if (!booking) {
      return {
        status: "error",
        message: "Booking not found"
      };
    }

    if ((status === "complete" || status === "cancelled") && booking.assignedRoomId) {
      await Room.findByIdAndUpdate(booking.assignedRoomId, {
        status: "available",
        currentBookingId: null
      });
    }

    return {
      status: "success",
      data: booking,
      message: `Booking status updated to ${status}`
    };

  } catch (error) {
    console.error("Error updating booking status:", error);
    return {
      status: "error",
      message: error.message
    };
  }
}

async function getTourGuideBookings(guideId) {
  try {
    const tours = await Tour.find({ tourGuideId: guideId }).lean();
    const tourIds = tours.map((t) => t._id);

    const bookings = await Booking.find({
      itemId: { $in: tourIds },
      type: "Tour",
    })
      .populate("userId", "fullName email")
      .populate("itemId", "title") 
      .lean();

    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      tour: b.itemId, 
      user: b.userId, 
      startDate: b.bookingDetails?.startDate,
      status: b.bookingDetails?.status,
      price: b.bookingDetails?.price,
      createdAt: b.createdAt
    }));

    return {
      status: "success",
      data: formattedBookings,
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function getBookingInvoice(userId, bookingId) {
  try {
    const booking = await Booking.findOne({ _id: bookingId, userId: userId })
      .populate("userId", "fullName email phone address")
      .populate("itemId")
      .lean();

    if (!booking) {
      return {
        status: "error",
        message: "Booking not found or access denied.",
      };
    }

    return {
      status: "success",
      data: booking,
    };
  } catch (error) {
    console.error("Error in getBookingInvoice:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function getHotelBookedDates(hotelId, roomTypeId) {
  try {
    const totalRooms = await Room.countDocuments({
      hotelId: hotelId,
      roomTypeId: roomTypeId,
      status: { $ne: "maintenance" }
    });

    if (totalRooms === 0) {
      return {
        status: "success",
        data: [], 
        message: "No rooms of this type found."
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(today.getMonth() + 2);

    const bookings = await Booking.find({
      itemId: hotelId,
      type: "Hotel",
      "bookingDetails.roomTypeId": roomTypeId,
      "bookingDetails.status": { $in: ["pending", "booked", "checkedIn", "occupied"] },
      "bookingDetails.endDate": { $gte: today },
      "bookingDetails.startDate": { $lte: twoMonthsLater }
    });


    const occupationMap = {}; 

    bookings.forEach(booking => {
      let start = new Date(booking.bookingDetails.startDate);
      let end = new Date(booking.bookingDetails.endDate);

      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);


      for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
        const todayUTC = new Date();
        todayUTC.setUTCHours(0, 0, 0, 0);

        if (d < todayUTC) continue;

        const dateStr = d.toISOString().split('T')[0];
        occupationMap[dateStr] = (occupationMap[dateStr] || 0) + 1;
      }
    });

    const fullyBookedDates = [];
    for (const [date, count] of Object.entries(occupationMap)) {
      if (count >= totalRooms) {
        fullyBookedDates.push(date);
      }
    }

    return {
      status: "success",
      data: fullyBookedDates
    };

  } catch (error) {
    console.error("Error in getHotelBookedDates:", error);
    return {
      status: "error",
      message: error.message
    };
  }
}

async function getAllBookingsAdmin() {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName email phone")
      .populate("itemId")
      .sort({ createdAt: -1 })
      .lean();

    const validBookings = bookings.filter((booking) => booking.itemId !== null);

    const customTours = await CustomTourRequest.find()
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 })
      .lean();

    const formattedCustomTours = customTours.map((tour) => ({
      _id: tour._id,
      userId: tour.userId,
      type: "Custom Tour",
      itemId: {
        title: tour.title,
        ...tour,
      },
      bookingDetails: {
        status: tour.status,
        startDate: tour.travelDates?.startDate,
        price: tour.budget,
      },
      createdAt: tour.createdAt,
    }));

    const allBookings = [...validBookings, ...formattedCustomTours].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      status: "success",
      data: allBookings,
    };
  } catch (error) {
    console.error("Error in getAllBookingsAdmin:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function getBookingDetailsAdmin(bookingId) {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("userId")
      .populate("itemId")
      .lean();

    if (!booking) {
      return {
        status: "error",
        message: "Booking not found",
      };
    }

    return {
      status: "success",
      data: booking,
    };
  } catch (error) {
    console.error("Error in getBookingDetailsAdmin:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function cancelBookingAdmin(bookingId) {
  try {
    let result = await Booking.updateOne(
      { _id: bookingId },
      { $set: { "bookingDetails.status": "cancel" } }
    );

    if (result.modifiedCount === 1) {
      return {
        status: "success",
        message: "Booking cancelled successfully",
      };
    }

    result = await CustomTourRequest.updateOne(
      { _id: bookingId },
      { $set: { status: "cancelled" } }
    );

    if (result.modifiedCount === 1) {
      return {
        status: "success",
        message: "Custom Tour Request cancelled successfully",
      };
    }

    return {
      status: "error",
      message: "Booking not found or already cancelled",
    };
  } catch (error) {
    console.error("Error in cancelBookingAdmin:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

module.exports = {
  getUserBookings,
  getHotelBookings,
  makeTourBooking,
  makeHotelBooking,
  cancelBooking,
  getTourGuideBookings,
  getAllBookingsAdmin,
  getBookingDetailsAdmin,
  cancelBookingAdmin,
  cancelBookingAdmin,
  updateBookingStatus,
  getBookingInvoice,
  getHotelBookedDates,
};