const express = require("express");
const {
  getUserBookings,
  cancelBooking,
  updateBookingStatus,
} = require("../Controller/bookingController");
const { authenticateUser, authenticateRole } = require("../middleware/authentication");

const bookingsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management endpoints
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 * 
 * /api/bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel a booking
 *     tags: [Bookings]
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
 *         description: Booking cancelled successfully
 * 
 * /api/bookings/{bookingId}/status:
 *   post:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 */

// Apply authentication to all routes
bookingsRouter.use(authenticateUser);

// Get user's bookings
bookingsRouter.get("/", authenticateRole(["user", "admin", "hotelManager", "tourGuide"]), async (req, res) => {
  try {
    const bookings = await getUserBookings(req.user._id);

    if (bookings.status === "error") {
      return res.status(500).json({
        status: "error",
        message: bookings.message,
      });
    }

    res.status(200).json({
      status: "success",
      data: bookings.data,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Cancel a booking
bookingsRouter.post("/:bookingId/cancel", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await cancelBooking(bookingId);

    if (result.status === "success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Update booking status
bookingsRouter.post("/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const result = await updateBookingStatus(bookingId, status);

    if (result.status === "success") {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = bookingsRouter;
