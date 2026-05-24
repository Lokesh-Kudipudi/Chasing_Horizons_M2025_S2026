const { Hotel } = require("../Model/hotelModel");
const { Tour } = require("../Model/tourModel");
const { Booking } = require("../Model/bookingModel");
const { User } = require("../Model/userModel");
const { redis } = require("../config/redis");

async function getOverviewAnalytics(req, res) {
  try {
    const cacheKey = "owner_analytics:overview";
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const bookings = await Booking.find({}).lean();
    const customers = await User.find({ role: "user" }).lean();
    const hotels = await Hotel.find({}).lean();
    const totalTours = await Tour.countDocuments({});

    const activeBookings = bookings.filter(
      (b) => b.bookingDetails?.status !== "cancel"
    );
    const cancelledBookings = bookings.filter(
      (b) => b.bookingDetails?.status === "cancel"
    );

    const totalBookings = activeBookings.length;
    const totalRevenue = activeBookings.reduce(
      (acc, booking) => acc + (booking.bookingDetails?.price || 0),
      0
    );
    const totalCommission = activeBookings.reduce(
      (acc, booking) => acc + (booking.commissionAmount || 0),
      0
    );
    const totalCustomers = customers.length;
    const totalHotels = hotels.length;

    const monthlyBookings = await Booking.aggregate([
      {
        $match: {
          "bookingDetails.status": { $ne: "cancel" },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          revenue: { $sum: "$bookingDetails.price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email")
      .lean();

    const responsePayload = {
      status: "success",
      data: {
        totalRevenue,
        totalCommission,
        totalBookings,
        cancelledBookings: cancelledBookings.length,
        totalCustomers,
        totalHotels,
        totalTours,
        monthlyBookings,
        recentBookings,
      },
    };
    
    await redis.set(cacheKey, responsePayload, { ex: 600 });
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
}

async function getHotelAnalytics(req, res) {
  try {
    const cacheKey = "owner_analytics:hotels";
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const hotels = await Hotel.find({}).populate("ownerId", "fullName email").lean();

    const bookings = await Booking.aggregate([
      { $match: { type: "Hotel" } },
      {
        $group: {
          _id: "$itemId",
          totalBookings: {
            $sum: {
              $cond: [{ $ne: ["$bookingDetails.status", "cancel"] }, 1, 0],
            },
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ["$bookingDetails.status", "cancel"] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $ne: ["$bookingDetails.status", "cancel"] },
                "$bookingDetails.price",
                0,
              ],
            },
          },
          totalCommission: {
            $sum: {
              $cond: [
                { $ne: ["$bookingDetails.status", "cancel"] },
                "$commissionAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const hotelsData = hotels.map((hotel) => {
      const stats = bookings.find(
        (b) => b._id.toString() === hotel._id.toString()
      );
      return {
        _id: hotel._id,
        title: hotel.title,
        status: hotel.status || "active",
        manager: hotel.ownerId?.fullName || "Not Assigned",
        managerEmail: hotel.ownerId?.email || "",
        totalBookings: stats?.totalBookings || 0,
        cancelledBookings: stats?.cancelledBookings || 0,
        totalRevenue: stats?.totalRevenue || 0,
        totalCommission: stats?.totalCommission || 0,
        commissionRate: hotel.commissionRate || 10,
      };
    });

    const responsePayload = {
      status: "success",
      data: { hotels: hotelsData },
    };
    
    await redis.set(cacheKey, responsePayload, { ex: 600 });
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
}

async function getTourAnalytics(req, res) {
  try {
    const cacheKey = "owner_analytics:tours";
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const tours = await Tour.find({}).populate("tourGuideId", "fullName email").lean();

    const bookings = await Booking.aggregate([
      { $match: { type: "Tour" } },
      {
        $group: {
          _id: "$itemId",
          totalBookings: {
            $sum: {
              $cond: [{ $ne: ["$bookingDetails.status", "cancel"] }, 1, 0],
            },
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ["$bookingDetails.status", "cancel"] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $ne: ["$bookingDetails.status", "cancel"] },
                "$bookingDetails.price",
                0,
              ],
            },
          },
          totalCommission: {
            $sum: {
              $cond: [
                { $ne: ["$bookingDetails.status", "cancel"] },
                "$commissionAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const toursData = tours.map((tour) => {
      const stats = bookings.find(
        (b) => b._id.toString() === tour._id.toString()
      );
      return {
        _id: tour._id,
        title: tour.title,
        status: tour.status || "active",
        guide: tour.tourGuideId?.fullName || "Not Assigned",
        guideEmail: tour.tourGuideId?.email || "",
        totalBookings: stats?.totalBookings || 0,
        cancelledBookings: stats?.cancelledBookings || 0,
        totalRevenue: stats?.totalRevenue || 0,
        totalCommission: stats?.totalCommission || 0,
        commissionRate: tour.commissionRate || 10,
      };
    });

    const responsePayload = {
      status: "success",
      data: { tours: toursData },
    };
    
    await redis.set(cacheKey, responsePayload, { ex: 600 });
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
}

async function getPerformanceAnalytics(req, res) {
  try {
    const cacheKey = "owner_analytics:performance";
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const performance = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          "bookingDetails.status": { $ne: "cancel" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          bookingsCount: { $sum: 1 },
          revenue: { $sum: "$bookingDetails.price" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const formattedData = performance.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      bookings: item.bookingsCount,
      revenue: item.revenue,
    }));

    const responsePayload = {
      status: "success",
      data: { performance: formattedData },
    };
    
    await redis.set(cacheKey, responsePayload, { ex: 600 });
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
}

async function getAllBookings(req, res) {
  try {
    const cacheKey = "owner_analytics:bookings";
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const bookings = await Booking.find()
      .populate("userId", "fullName email phone")
      .populate("itemId")
      .sort({ createdAt: -1 })
      .lean();

    const validBookings = bookings.filter((b) => b.itemId !== null);

    const responsePayload = {
      status: "success",
      data: { bookings: validBookings },
    };

    await redis.set(cacheKey, responsePayload, { ex: 600 });
    res.status(200).json(responsePayload);
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
}

async function getPeopleAnalytics(req, res) {
  try {
    const cacheKey = "owner_analytics:people";
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const users = await User.find({
      role: { $in: ["hotelManager", "tourGuide", "admin", "employee", "user"] },
    })
      .select("fullName email phone role createdAt")
      .lean();

    const hotels = await Hotel.find({})
      .select("title ownerId assignedEmployeeId status")
      .lean();

    const tours = await Tour.find({})
      .select("title tourGuideId assignedEmployeeId status")
      .lean();

    const appUsers = users.filter((u) => u.role === "user");
    const userIds = appUsers.map((u) => u._id);

    const userBookings = await Booking.find({ userId: { $in: userIds } })
      .populate("itemId")
      .sort({ createdAt: -1 })
      .lean();

    const bookingsByUserId = userBookings.reduce((acc, booking) => {
      const key = booking.userId?.toString();
      if (!key) return acc;
      if (!acc[key]) acc[key] = [];
      acc[key].push({
        _id: booking._id,
        type: booking.type,
        itemTitle: booking.itemId?.title || booking.itemId?.name || "N/A",
        status: booking.bookingDetails?.status || "pending",
        price: booking.bookingDetails?.price || 0,
        commission: booking.commissionAmount || 0,
        createdAt: booking.createdAt,
      });
      return acc;
    }, {});

    const hotelManagers = users
      .filter((u) => u.role === "hotelManager")
      .map((manager) => {
        const managedHotels = hotels
          .filter(
            (hotel) =>
              hotel.ownerId &&
              hotel.ownerId.toString() === manager._id.toString()
          )
          .map((hotel) => ({
            _id: hotel._id,
            title: hotel.title || "N/A",
            status: hotel.status || "active",
          }));

        return {
          ...manager,
          hotels: managedHotels,
          totalHotels: managedHotels.length,
        };
      });

    const tourGuides = users
      .filter((u) => u.role === "tourGuide")
      .map((guide) => {
        const managedTours = tours
          .filter(
            (tour) =>
              tour.tourGuideId &&
              tour.tourGuideId.toString() === guide._id.toString()
          )
          .map((tour) => ({
            _id: tour._id,
            title: tour.title || "N/A",
            status: tour.status || "active",
          }));

        return {
          ...guide,
          tours: managedTours,
          totalTours: managedTours.length,
        };
      });

    const admins = users.filter((u) => u.role === "admin");

    const employees = users
      .filter((u) => u.role === "employee")
      .map((employee) => {
        const assignedHotels = hotels
          .filter(
            (hotel) =>
              hotel.assignedEmployeeId &&
              hotel.assignedEmployeeId.toString() === employee._id.toString()
          )
          .map((hotel) => ({
            _id: hotel._id,
            title: hotel.title || "N/A",
            status: hotel.status || "active",
          }));

        const assignedTours = tours
          .filter(
            (tour) =>
              tour.assignedEmployeeId &&
              tour.assignedEmployeeId.toString() === employee._id.toString()
          )
          .map((tour) => ({
            _id: tour._id,
            title: tour.title || "N/A",
            status: tour.status || "active",
          }));

        return {
          ...employee,
          assignedHotels,
          assignedTours,
          totalAssignedHotels: assignedHotels.length,
          totalAssignedTours: assignedTours.length,
        };
      });

    const customers = appUsers.map((u) => {
      const bookings = bookingsByUserId[u._id.toString()] || [];
      const totalBookings = bookings.filter((b) => b.status !== "cancel").length;
      const cancelledBookings = bookings.filter((b) => b.status === "cancel").length;
      return {
        ...u,
        bookings,
        totalBookings,
        cancelledBookings,
      };
    });

    const responsePayload = {
      status: "success",
      data: {
        hotelManagers,
        tourGuides,
        admins,
        employees,
        users: customers,
      },
    };

    await redis.set(cacheKey, responsePayload, { ex: 600 });
    return res.status(200).json(responsePayload);
  } catch (error) {
    return res.status(500).json({ status: "fail", message: error.message });
  }
}

module.exports = {
  getOverviewAnalytics,
  getHotelAnalytics,
  getTourAnalytics,
  getPerformanceAnalytics,
  getAllBookings,
  getPeopleAnalytics,
};
