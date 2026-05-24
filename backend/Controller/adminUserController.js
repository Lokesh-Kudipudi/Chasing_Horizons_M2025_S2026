const { User } = require("../Model/userModel");
const { Hotel } = require("../Model/hotelModel");
const { Tour } = require("../Model/tourModel");
const { Booking } = require("../Model/bookingModel");
const bcrypt = require("bcryptjs");

const parsePrice = (priceVal) => {
  if (typeof priceVal === "number") return priceVal;
  if (!priceVal) return 0;
  const clean = String(priceVal).replace(/[^\d.-]/g, "");
  return parseFloat(clean) || 0;
};

async function getAllTourGuides(req, res) {
  try {
    const tourGuides = await User.find({ role: "tourGuide" })
      .select("-passwordHash")
      .lean();

    const guideIds = tourGuides.map((g) => g._id);
    const tours = await Tour.find({ tourGuideId: { $in: guideIds } })
      .select("title _id tourGuideId")
      .lean();

    const tourIds = tours.map((t) => t._id);
    const bookings = await Booking.find({
      type: "Tour",
      itemId: { $in: tourIds },
      "bookingDetails.status": { $nin: ["cancel", "cancelled", "Cancel", "Cancelled"] },
    })
      .select("itemId bookingDetails.price")
      .lean();

    const revenueByTourId = new Map();
    for (const booking of bookings) {
      const key = String(booking.itemId);
      const current = revenueByTourId.get(key) || 0;
      revenueByTourId.set(key, current + parsePrice(booking.bookingDetails?.price));
    }

    const toursByGuide = new Map();
    for (const tour of tours) {
      const key = String(tour.tourGuideId);
      if (!toursByGuide.has(key)) toursByGuide.set(key, []);
      toursByGuide.get(key).push({
        id: tour._id,
        title: tour.title,
        type: "Tour",
        revenue: revenueByTourId.get(String(tour._id)) || 0,
      });
    }

    const guidesWithAssignments = tourGuides.map((guide) => {
      const assignments = toursByGuide.get(String(guide._id)) || [];
      const totalTourRevenue = assignments.reduce((sum, a) => sum + (a.revenue || 0), 0);

      return {
        ...guide,
        assignments,
        totalTourRevenue,
        totalHotelRevenue: 0,
        totalRevenue: totalTourRevenue,
      };
    });

    return res.status(200).json({
      status: "success",
      data: guidesWithAssignments,
    });
  } catch (error) {
    console.error("Error fetching tour guides:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function getAllHotelManagers(req, res) {
  try {
    const hotelManagers = await User.find({ role: "hotelManager" })
      .select("-passwordHash")
      .lean();

    const managerIds = hotelManagers.map((m) => m._id);
    const hotels = await Hotel.find({ ownerId: { $in: managerIds } })
      .select("title _id ownerId")
      .lean();

    const hotelIds = hotels.map((h) => h._id);
    const bookings = await Booking.find({
      type: "Hotel",
      itemId: { $in: hotelIds },
      "bookingDetails.status": { $nin: ["cancel", "cancelled", "Cancel", "Cancelled"] },
    })
      .select("itemId bookingDetails.price")
      .lean();

    const revenueByHotelId = new Map();
    for (const booking of bookings) {
      const key = String(booking.itemId);
      const current = revenueByHotelId.get(key) || 0;
      revenueByHotelId.set(key, current + parsePrice(booking.bookingDetails?.price));
    }

    const hotelsByManager = new Map();
    for (const hotel of hotels) {
      const key = String(hotel.ownerId);
      if (!hotelsByManager.has(key)) hotelsByManager.set(key, []);
      hotelsByManager.get(key).push({
        id: hotel._id,
        title: hotel.title,
        type: "Hotel",
        revenue: revenueByHotelId.get(String(hotel._id)) || 0,
      });
    }

    const managersWithAssignments = hotelManagers.map((manager) => {
      const assignments = hotelsByManager.get(String(manager._id)) || [];
      const totalHotelRevenue = assignments.reduce((sum, a) => sum + (a.revenue || 0), 0);

      return {
        ...manager,
        assignments,
        totalHotelRevenue,
        totalTourRevenue: 0,
        totalRevenue: totalHotelRevenue,
      };
    });

    return res.status(200).json({
      status: "success",
      data: managersWithAssignments,
    });
  } catch (error) {
    console.error("Error fetching hotel managers:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}


async function getAllEmployees(req, res) {
  try {
    const employees = await User.find({ role: "employee" })
      .select("-passwordHash")
      .lean();

    const employeesWithAssignments = await Promise.all(
      employees.map(async (emp) => {

        const hotels = await Hotel.find({ assignedEmployeeId: emp._id }).select("title _id").lean();


        const tours = await Tour.find({ assignedEmployeeId: emp._id }).select("title _id").lean();

        const assignments = [];
        let totalHotelRevenue = 0;
        let totalTourRevenue = 0;

        for (const hotel of hotels) {
          const hotelBookings = await Booking.find({
            itemId: { $in: [hotel._id, hotel._id.toString()] },
            type: "Hotel",
            "bookingDetails.status": { $nin: ["cancel", "cancelled", "Cancel", "Cancelled"] }
          }).select("bookingDetails.price").lean();

          const revenue = hotelBookings.reduce((sum, b) => sum + parsePrice(b.bookingDetails?.price), 0);
          totalHotelRevenue += revenue;
          assignments.push({
            id: hotel._id,
            title: hotel.title,
            type: "Hotel",
            revenue
          });
        }

        for (const tour of tours) {
          const tourBookings = await Booking.find({
            itemId: { $in: [tour._id, tour._id.toString()] },
            type: "Tour",
            "bookingDetails.status": { $nin: ["cancel", "cancelled", "Cancel", "Cancelled"] }
          }).select("bookingDetails.price").lean();

          const revenue = tourBookings.reduce((sum, b) => sum + parsePrice(b.bookingDetails?.price), 0);
          totalTourRevenue += revenue;
          assignments.push({
            id: tour._id,
            title: tour.title,
            type: "Tour",
            revenue
          });
        }

        return {
          ...emp,
          assignments,
          totalHotelRevenue,
          totalTourRevenue,
          totalRevenue: totalHotelRevenue + totalTourRevenue,
          assignedTo: assignments.length > 0
            ? assignments.map(a => a.title).join(", ")
            : null
        };
      })
    );

    return res.status(200).json({
      status: "success",
      data: employeesWithAssignments,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function createUser(req, res) {
  try {
    const { fullName, email, password, role, phone, address } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields: fullName, email, password, role",
      });
    }

    if (!["tourGuide", "hotelManager", "employee"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role. Must be 'tourGuide', 'hotelManager', or 'employee'",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      passwordHash,
      role,
      phone: phone || "",
      address: address || "",
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;

    return res.status(201).json({
      status: "success",
      data: userResponse,
      message: `${role === 'employee' ? 'Employee' : (role === 'tourGuide' ? 'Tour guide' : 'Hotel manager')} created successfully`,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["tourGuide", "hotelManager", "user", "employee"].includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: user,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

module.exports = {
  getAllTourGuides,
  getAllHotelManagers,
  getAllEmployees,
  createUser,
  updateUserRole,
  deleteUser,
};
