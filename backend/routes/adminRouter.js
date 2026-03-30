const express = require("express");
const { authenticateUser, authenticateRole } = require("../middleware/authentication");
const {
  getAdminHomepageAnalytics,
  getAdminPackagesAnalytics,
  getAdminHotelAnalytics,
} = require("../Controller/analyticsController");
const {
  getAllQueries,
  deleteQuery,
  replyToQuery,
} = require("../Controller/ContactController");
const {
  getAllBookingsAdmin,
  cancelBookingAdmin,
} = require("../Controller/bookingController");
const {
  getAllTourGuides,
  createUser,
  deleteUser,
  getAllHotelManagers,
  getAllEmployees,
} = require("../Controller/adminUserController");
const {
  getAllRequests,
  assignTourGuide,
} = require("../Controller/adminCustomTourController");
const {
  assignHotelToEmployee,
  assignTourToEmployee,
} = require("../Controller/adminAssignmentController");
const {
  getHotelCommissionReport,
  getTourCommissionReport,
} = require("../Controller/reportingController");
const { User } = require("../Model/userModel");
const { Booking } = require("../Model/bookingModel");
const { Hotel } = require("../Model/hotelModel");
const { Tour } = require("../Model/tourModel");

const adminRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin operations and analytics
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved
 * 
 * /api/admin/customers:
 *   get:
 *     summary: Get all customers and their stats
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customers list retrieved
 * 
 * /api/admin/queries:
 *   get:
 *     summary: Get all contact queries
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queries retrieved
 * 
 * /api/admin/queries/{id}:
 *   delete:
 *     summary: Delete a contact query
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Query deleted
 * 
 * /api/admin/queries/{id}/reply:
 *   post:
 *     summary: Reply to a contact query
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Replied successfully
 * 
 * /api/admin/hotels/analytics:
 *   get:
 *     summary: Get admin hotel analytics
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved
 * 
 * /api/admin/verifications:
 *   get:
 *     summary: Get verification queue
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verifications retrieved
 * 
 * /api/admin/hotels/{id}/commission:
 *   put:
 *     summary: Update hotel commission
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Commission updated
 * 
 * /api/admin/hotels/{id}/status:
 *   patch:
 *     summary: Approve/reject hotel listing
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 * 
 * /api/admin/tours/analytics:
 *   get:
 *     summary: Get admin tour analytics
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tour analytics retrieved
 * 
 * /api/admin/tours/{id}/commission:
 *   put:
 *     summary: Update tour commission
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Commission updated
 * 
 * /api/admin/tours/{id}/status:
 *   patch:
 *     summary: Approve/reject tour listing
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 * 
 * /api/admin/bookings:
 *   get:
 *     summary: Get all bookings
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings retrieved
 * 
 * /api/admin/bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel a booking (admin)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 * 
 * /api/admin/tour-guides:
 *   get:
 *     summary: Get all tour guides
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tour guides retrieved
 * 
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User created
 * 
 * /api/admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 * 
 * /api/admin/custom-tours:
 *   get:
 *     summary: Get all custom tour requests
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Custom tours retrieved
 * 
 * /api/admin/custom-tours/{id}/assign:
 *   post:
 *     summary: Assign a tour guide to custom tour
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guide assigned
 * 
 * /api/admin/hotel-managers:
 *   get:
 *     summary: Get all hotel managers
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Hotel managers retrieved
 * 
 * /api/admin/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees retrieved
 * 
 * /api/admin/assign/hotel/{hotelId}:
 *   patch:
 *     summary: Assign hotel to employee
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hotel assigned
 * 
 * /api/admin/assign/tour/{tourId}:
 *   patch:
 *     summary: Assign tour to employee
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tour assigned
 * 
 * /api/admin/reports/commissions/hotels:
 *   get:
 *     summary: Get hotel commission report
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report retrieved
 * 
 * /api/admin/reports/commissions/tours:
 *   get:
 *     summary: Get tour commission report
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Report retrieved
 */

// Apply authentication and admin role to all routes
adminRouter.use(authenticateUser);
adminRouter.use(authenticateRole(["admin"]));

// Dashboard analytics
adminRouter.get("/dashboard", async (req, res) => {
  try {
    const analytics = await getAdminHomepageAnalytics();
    if (analytics.status === "error") {
      return res.status(500).json(analytics);
    }
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Customer management
adminRouter.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "user" })
      .select("-passwordHash")
      .lean();

    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const bookings = await Booking.find({ userId: customer._id }).lean();
        const totalBookings = bookings.length;
        const totalSpent = bookings.reduce(
          (acc, b) => acc + (b.bookingDetails?.price || 0),
          0
        );
        const lastBooking = bookings.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )[0];

        return {
          ...customer,
          bookings: totalBookings,
          spent: totalSpent,
          lastTravel: lastBooking
            ? new Date(lastBooking.createdAt).toLocaleDateString()
            : "N/A",
          status: "Active",
          membership:
            totalSpent > 10000
              ? "Platinum"
              : totalSpent > 5000
                ? "Gold"
                : "Silver",
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: customersWithStats,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Query management
adminRouter.get("/queries", getAllQueries);
adminRouter.delete("/queries/:id", deleteQuery);
adminRouter.post("/queries/:id/reply", replyToQuery);

// Hotel analytics
adminRouter.get("/hotels/analytics", async (req, res) => {
  try {
    const analytics = await getAdminHotelAnalytics();
    if (analytics.status === "error") {
      return res.status(500).json(analytics);
    }
    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Verification queue (pending hotels and tours with owner/creator details)
adminRouter.get("/verifications", async (req, res) => {
  try {
    const [pendingHotels, pendingTours] = await Promise.all([
      Hotel.find({ status: "pending" })
        .populate("ownerId", "fullName email phone role")
        .populate("assignedEmployeeId", "fullName email")
        .lean(),
      Tour.find({ status: "pending" })
        .populate("tourGuideId", "fullName email phone role")
        .populate("assignedEmployeeId", "fullName email")
        .lean(),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        hotels: pendingHotels,
        tours: pendingTours,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Update hotel commission
adminRouter.put("/hotels/:id/commission", async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      { commissionRate },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ status: "error", message: "Hotel not found" });
    }

    res.status(200).json({ status: "success", data: hotel });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Approve/reject hotel listing
adminRouter.patch("/hotels/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["active", "inactive", "pending"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Use active, inactive, or pending.",
      });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ status: "error", message: "Hotel not found" });
    }

    res.status(200).json({ status: "success", data: hotel });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Tour/package analytics
adminRouter.get("/tours/analytics", async (req, res) => {
  try {
    const packageAnalytics = await getAdminPackagesAnalytics();
    if (packageAnalytics.status === "error") {
      return res.status(500).json(packageAnalytics);
    }
    res.status(200).json(packageAnalytics);
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Update tour commission
adminRouter.put("/tours/:id/commission", async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;

    const tour = await Tour.findByIdAndUpdate(
      id,
      { commissionRate },
      { new: true }
    );

    if (!tour) {
      return res.status(404).json({ status: "error", message: "Tour not found" });
    }

    res.status(200).json({ status: "success", data: tour });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Approve/reject tour listing
adminRouter.patch("/tours/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["active", "inactive", "pending"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status. Use active, inactive, or pending.",
      });
    }

    const tour = await Tour.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (!tour) {
      return res.status(404).json({ status: "error", message: "Tour not found" });
    }

    res.status(200).json({ status: "success", data: tour });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Booking management
adminRouter.get("/bookings", async (req, res) => {
  const result = await getAllBookingsAdmin();
  if (result.status === "success") {
    return res.status(200).json(result);
  }
  return res.status(500).json(result);
});

adminRouter.post("/bookings/:bookingId/cancel", async (req, res) => {
  const result = await cancelBookingAdmin(req.params.bookingId);
  if (result.status === "success") {
    return res.status(200).json(result);
  }
  return res.status(400).json(result);
});

// User management
adminRouter.get("/tour-guides", getAllTourGuides);
adminRouter.post("/users", createUser);
adminRouter.delete("/users/:userId", deleteUser);

// Custom tour management
adminRouter.get("/custom-tours", getAllRequests);
adminRouter.post("/custom-tours/:id/assign", assignTourGuide);

adminRouter.get("/hotel-managers", getAllHotelManagers);
adminRouter.get("/employees", getAllEmployees);

// Assignment APIs
adminRouter.patch("/assign/hotel/:hotelId", assignHotelToEmployee);
adminRouter.patch("/assign/tour/:tourId", assignTourToEmployee);

// Reporting APIs
adminRouter.get("/reports/commissions/hotels", getHotelCommissionReport);
adminRouter.get("/reports/commissions/tours", getTourCommissionReport);

module.exports = adminRouter;
