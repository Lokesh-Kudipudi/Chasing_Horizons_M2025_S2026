const { Tour } = require("../Model/tourModel");
const { Booking } = require("../Model/bookingModel");
const { redis } = require("../config/redis");
const fs = require('fs');
const path = require('path');

async function getAllToursGemini() {
  try {
    const tours = await Tour.find()
      .select(
        "title tags duration startLocation description language price destinations"
      )
      .lean();

    const formattedTours = tours.map((tour) => ({
      ...tour,
      _id: tour._id.toString(),
    }));

    return {
      status: "success",
      data: formattedTours,
    };
  } catch (error) {
    throw new Error("Error fetching tours: " + error.message);
  }
}

async function getAllTours() {
  try {
    const cacheKey = "cache:tours:all";
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {
      console.error("Redis Get Error:", redisError.message);
    }

    if (cachedData) {
      return {
        status: "success",
        data: cachedData,
        source: "redis"
      };
    }

    const tours = await Tour.find().lean();
    
    try {
      await redis.set(cacheKey, tours, { ex: 3600 });
    } catch (redisError) {
      console.error("Redis Set Error:", redisError.message);
    }
    
    return {
      status: "success",
      data: tours,
      source: "mongodb"
    };
  } catch (error) {
    throw new Error("Error fetching tours: " + error.message);
  }
}

async function getRecommendedTours(toursIds) {
  try {
    const recommendedTours = await Tour.find({
      _id: { $in: toursIds },
    });
    return {
      status: "success",
      data: recommendedTours,
    };
  } catch (error) {
    throw new Error(
      "Error fetching recommended tours: " + error.message
    );
  }
}

async function getTourById(tourId) {
  try {
    const tour = await Tour.findById(tourId)
      .populate("tourGuideId", "fullName email phone photo")
      .lean();

    if (!tour) {
      return {
        status: "fail",
        message: "Tour not found",
      };
    }

    if (tour.bookingDetails && tour.bookingDetails.length > 0) {
      const updatedBookingDetails = await Promise.all(
        tour.bookingDetails.map(async (detail) => {
          const bookings = await Booking.find({
            itemId: tourId,
            type: "Tour",
            "bookingDetails.startDate": detail.startDate,
            "bookingDetails.status": { $ne: "cancelled" },
          });

          const bookedCount = bookings.reduce((sum, booking) => {
            return sum + (Number(booking.bookingDetails.numGuests) || 1);
          }, 0);

          const maxPeople = tour.maxPeople || 20; 
          const availableSlots = Math.max(0, maxPeople - bookedCount);

          return {
            ...detail,
            availableSlots,
            maxPeople,
          };
        })
      );
      tour.bookingDetails = updatedBookingDetails;
    }

    return {
      status: "success",
      data: tour,
    };
  } catch (error) {
    throw new Error("Error fetching tour: " + error.message);
  }
}

async function updateTour(tourId, updateData) {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      updateData,
      {
        new: true,
      }
    ).lean();
    if (!updatedTour) {
      return {
        status: "fail",
        message: "Tour not found",
      };
    }
    return {
      status: "success",
      data: updatedTour,
    };
  } catch (error) {
    throw new Error("Error updating tour: " + error.message);
  }
}

async function deleteTour(tourId) {
  try {
    const deletedTour = await Tour.findByIdAndDelete(
      tourId
    ).lean();
    if (!deletedTour) {
      return {
        status: "fail",
        message: "Tour not found",
      };
    }
    return {
      status: "success",
      message: "Tour deleted successfully",
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Tour not found",
    };
  }
}

async function getToursByGuide(guideId) {
  try {
    const tours = await Tour.find({
      tourGuideId: guideId,
    }).lean();
    return {
      status: "success",
      data: tours,
    };
  } catch (error) {
    throw new Error(
      "Error fetching tours by guide: " + error.message
    );
  }
}

module.exports = {
  getAllTours,
  getTourById,
  getRecommendedTours,
  updateTour,
  deleteTour,
  getAllToursGemini,
  getToursByGuide,
  getTopDestinations,
};

async function getTopDestinations() {
  try {
    const cacheKey = "cache:tours:topDestinations";
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {
      console.error("Redis Get Error:", redisError.message);
    }

    if (cachedData) {
      return {
        status: "success",
        data: cachedData,
        source: "redis"
      };
    }

    const destinations = await Tour.aggregate([
      {
        $group: {
          _id: "$title",
          url: { $first: "$_id" },
          image: { $first: "$mainImage" },
          packages: { $sum: 1 },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 6 },
    ]);

    try {
      await redis.set(cacheKey, destinations, { ex: 3600 });
    } catch (redisError) {
      console.error("Redis Set Error:", redisError.message);
    }

    return {
      status: "success",
      data: destinations,
      source: "mongodb"
    };
  } catch (error) {
    throw new Error("Error fetching top destinations: " + error.message);
  }
}
