const express = require("express");
const mongoose = require("mongoose");
const { Hotel } = require("../Model/hotelModel");
const { authenticateUser, authenticateRole } = require("../middleware/authentication");
const {
  getAllHotels,
  getHotelById,
  createHotel,
  getHotelByOwnerId,
} = require("../Controller/hotelController");
const {
  makeHotelBooking,
  getHotelBookedDates,
} = require("../Controller/bookingController");
const {
  addRoomType,
  updateRoomType,
  deleteRoomType,
} = require("../Controller/hotelController");

const {
  createRoom,
  getRoomsByHotel,
  updateRoom,
  deleteRoom,
  assignRoomToBooking,
} = require("../Controller/roomController");

const upload = require("../middleware/upload");

const hotelsRouter = express.Router();

async function resolveManagerHotel(req) {
  const requestedHotelId = req.query?.hotelId;
  if (requestedHotelId) {
    if (!mongoose.Types.ObjectId.isValid(requestedHotelId)) {
      return null;
    }
    const ownedHotel = await Hotel.findOne({
      _id: requestedHotelId,
      ownerId: req.user._id,
    }).lean();
    return ownedHotel || null;
  }

  const hotelResponse = await getHotelByOwnerId(req.user._id);
  if (hotelResponse.status !== "success") return null;
  return hotelResponse.data || null;
}

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Hotel listing, CRUD, room types, rooms, bookings and availability
 */

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Create a new hotel
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Grand Palace Hotel"
 *               description:
 *                 type: string
 *               address:
 *                 type: string
 *               location:
 *                 type: string
 *               rating:
 *                 type: number
 *               currency:
 *                 type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               mainImage:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *     responses:
 *       200:
 *         description: Hotel created successfully
 *       401:
 *         description: Unauthorized
 */
// authenticateRole already calls authenticateUser internally in many setups,
// but we add authenticateUser explicitly here to be consistent and safe.
hotelsRouter
  .route("/")
  .post(authenticateUser, authenticateRole(["admin", "hotelManager"]), async (req, res) => {
    const hotelPayload = { ...req.body };
    if (req.user.role === "hotelManager") {
      hotelPayload.status = "pending";
    } else if (!hotelPayload.status) {
      hotelPayload.status = "active";
    }

    let response = await createHotel(req.user._id, hotelPayload);

    if (response.status != "success") {
      res.json({
        status: "fail",
        message: response.message,
      });
    } else {
      res.json({
        status: "success",
        message:
          response.data?.status === "pending"
            ? "Hotel submitted for admin verification"
            : "Hotel created successfully",
        data: response.data,
      });
    }
  });

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get all active hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: List of active hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       location:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       mainImage:
 *                         type: string
 */
hotelsRouter.route("/").get(async (req, res) => {
  let response = await getAllHotels();

  if (response.status != "success") {
    res.json({
      status: "fail",
      message: response.message,
    });
  }

  let hotelsToDisplay = response.data.filter(
    (hotel) => (hotel.status || "active").toLowerCase() === "active"
  );

  res.json({
    status: "success",
    data: hotelsToDisplay,
  });
});

/**
 * @swagger
 * /api/hotels/my-hotel:
 *   get:
 *     summary: Get the hotel owned by the current user
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *         description: Optional specific hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *       401:
 *         description: Unauthorized
 */
hotelsRouter
  .route("/my-hotel")
  .get(
    authenticateUser,
    authenticateRole(["hotelManager", "admin"]),
    async (req, res) => {
      const requestedHotelId = req.query?.hotelId;
      let response;
      if (requestedHotelId) {
        const selected = await resolveManagerHotel(req);
        response = {
          status: "success",
          data: selected,
        };
      } else {
        response = await getHotelByOwnerId(req.user._id);
      }

      if (response.status != "success") {
        res.json({
          status: "fail",
          message: response.message,
        });
      } else {
        res.json({
          status: "success",
          data: response.data,
        });
      }
    }
  );

/**
 * @swagger
 * /api/hotels/room-types:
 *   post:
 *     summary: Add a room type to the manager's hotel
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *         description: Optional hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: string
 *               rating:
 *                 type: number
 *               features:
 *                 type: string
 *                 description: Comma-separated list of features
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Room type added
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */
hotelsRouter
  .route("/room-types")
  .post(
    authenticateUser,
    authenticateRole(["hotelManager", "admin"]),
    upload.single("image"),
    async (req, res) => {
      if (req.file) {
        req.body.image = req.file.path;
      }

      if (req.body.features && typeof req.body.features === "string") {
        if (req.body.features.includes(",")) {
          req.body.features = req.body.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          req.body.features = [req.body.features];
        }
      }

      const hotel = await resolveManagerHotel(req);
      if (!hotel) {
        return res.status(404).json({
          status: "fail",
          message: "Hotel not found for this user",
        });
      }
      const hotelId = hotel._id;

      let response = await addRoomType(hotelId, req.body);

      if (response.status != "success") {
        res.json({
          status: "fail",
          message: response.message,
        });
      } else {
        res.json({
          status: "success",
          message: "Room type added successfully",
          data: response.data,
        });
      }
    }
  );

/**
 * @swagger
 * /api/hotels/room-types/{roomId}:
 *   put:
 *     summary: Update a room type
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room type ID
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: string
 *               rating:
 *                 type: number
 *               features:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Room type updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */
hotelsRouter
  .route("/room-types/:roomId")
  .put(
    authenticateUser,
    authenticateRole(["hotelManager", "admin"]),
    upload.single("image"),
    async (req, res) => {
      if (req.file) {
        req.body.image = req.file.path;
      }

      if (req.body.features && typeof req.body.features === "string") {
        if (req.body.features.includes(",")) {
          req.body.features = req.body.features
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          req.body.features = [req.body.features];
        }
      }

      const roomId = req.params.roomId;

      const hotel = await resolveManagerHotel(req);
      if (!hotel) {
        return res.status(404).json({
          status: "fail",
          message: "Hotel not found for this user",
        });
      }
      const hotelId = hotel._id;

      let response = await updateRoomType(hotelId, roomId, req.body);

      if (response.status != "success") {
        res.json({
          status: "fail",
          message: response.message,
        });
      } else {
        res.json({
          status: "success",
          message: "Room type updated successfully",
          data: response.data,
        });
      }
    }
  );

/**
 * @swagger
 * /api/hotels/room-types/{roomId}:
 *   delete:
 *     summary: Delete a room type
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room type ID
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room type deleted
 *       400:
 *         description: Deletion failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */
hotelsRouter
  .route("/room-types/:roomId")
  .delete(
    authenticateUser,
    authenticateRole(["hotelManager", "admin"]),
    async (req, res) => {
      const roomId = req.params.roomId;

      const hotel = await resolveManagerHotel(req);
      if (!hotel) {
        return res.status(404).json({
          status: "fail",
          message: "Hotel not found for this user",
        });
      }
      const hotelId = hotel._id;

      let response = await deleteRoomType(hotelId, roomId);

      if (response.status != "success") {
        return res.status(400).json({
          status: "fail",
          message: response.message,
        });
      }

      res.json({
        status: "success",
        message: "Room type deleted successfully",
        data: response.data,
      });
    }
  );

// ─── ROOM MANAGEMENT ROUTES ──────────────────────────────────────────────────

/**
 * @swagger
 * /api/hotels/rooms:
 *   post:
 *     summary: Create a room for the manager's hotel
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *               roomTypeId:
 *                 type: string
 *               floor:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [available, occupied, maintenance]
 *     responses:
 *       200:
 *         description: Room created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */
hotelsRouter.route("/rooms").post(
  authenticateUser,
  authenticateRole(["hotelManager", "admin"]),
  async (req, res) => {
    const hotel = await resolveManagerHotel(req);
    if (!hotel) {
      return res.status(404).json({ status: "fail", message: "Hotel not found" });
    }
    const hotelId = hotel._id;

    let response = await createRoom(hotelId, req.body);
    if (response.status !== "success") {
      res.status(400).json(response);
    } else {
      res.json(response);
    }
  }
);

/**
 * @swagger
 * /api/hotels/rooms:
 *   get:
 *     summary: Get all rooms for the manager's hotel
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of rooms
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Hotel not found
 */
hotelsRouter.route("/rooms").get(
  authenticateUser,
  authenticateRole(["hotelManager", "admin"]),
  async (req, res) => {
    const hotel = await resolveManagerHotel(req);
    if (!hotel) {
      return res.status(404).json({ status: "fail", message: "Hotel not found" });
    }
    const hotelId = hotel._id;

    let response = await getRoomsByHotel(hotelId);
    if (response.status !== "success") {
      res.status(400).json(response);
    } else {
      res.json(response);
    }
  }
);

/**
 * @swagger
 * /api/hotels/rooms/{id}:
 *   put:
 *     summary: Update a room
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *               floor:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated
 *       400:
 *         description: Update failed
 *       401:
 *         description: Unauthorized
 */
hotelsRouter.route("/rooms/:id").put(
  authenticateUser,
  authenticateRole(["hotelManager", "admin"]),
  async (req, res) => {
    let response = await updateRoom(req.params.id, req.body);
    if (response.status !== "success") {
      res.status(400).json(response);
    } else {
      res.json(response);
    }
  }
);

/**
 * @swagger
 * /api/hotels/rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted
 *       400:
 *         description: Deletion failed
 *       401:
 *         description: Unauthorized
 */
hotelsRouter.route("/rooms/:id").delete(
  authenticateUser,
  authenticateRole(["hotelManager", "admin"]),
  async (req, res) => {
    let response = await deleteRoom(req.params.id);
    if (response.status !== "success") {
      res.status(400).json(response);
    } else {
      res.json(response);
    }
  }
);

/**
 * @swagger
 * /api/hotels/bookings/{bookingId}/assign-room:
 *   post:
 *     summary: Assign a room to a booking
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *             properties:
 *               roomId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room assigned to booking
 *       400:
 *         description: Room ID missing or assignment failed
 *       401:
 *         description: Unauthorized
 */
hotelsRouter.route("/bookings/:bookingId/assign-room").post(
  authenticateUser,
  authenticateRole(["hotelManager", "admin"]),
  async (req, res) => {
    const { roomId } = req.body;
    if (!roomId)
      return res.status(400).json({ status: "fail", message: "Room ID is required" });

    let response = await assignRoomToBooking(req.params.bookingId, roomId);
    if (response.status !== "success") {
      res.status(400).json(response);
    } else {
      res.json(response);
    }
  }
);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get a hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     responses:
 *       200:
 *         description: Hotel details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     location:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     amenities:
 *                       type: array
 *                       items:
 *                         type: string
 *                     roomType:
 *                       type: array
 *                       items:
 *                         type: object
 */
hotelsRouter.route("/:id").get(async (req, res) => {
  const id = req.params.id;

  let response = await getHotelById(id);

  if (response.status != "success") {
    res.json({
      stats: "Fail",
      message: response.message,
    });
  }

  const hotel = response.data;

  res.json({
    status: "success",
    data: hotel,
  });
});

/**
 * @swagger
 * /api/hotels/{id}/book:
 *   post:
 *     summary: Book a hotel
 *     tags: [Hotels]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomTypeId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               guests:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Booking successful
 *       401:
 *         description: Unauthorized
 */
hotelsRouter.route("/:id/book").post(
  authenticateUser,
  authenticateRole(["user"]),
  async (req, res) => {
    const id = req.params.id;

    let response = await makeHotelBooking(req.user._id, id, req.body);

    if (response.status != "success") {
      res.json({
        status: "fail",
        message: response.message,
      });
    } else {
      res.json({
        status: "success",
        message: "Booking successful",
      });
    }
  }
);

/**
 * @swagger
 * /api/hotels/{id}/availability:
 *   get:
 *     summary: Get booked dates for a hotel room type
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Hotel ID
 *       - in: query
 *         name: roomTypeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room type ID
 *     responses:
 *       200:
 *         description: List of booked dates
 *       400:
 *         description: Room Type ID is required
 */
hotelsRouter.route("/:id/availability").get(async (req, res) => {
  const hotelId = req.params.id;
  const { roomTypeId } = req.query;

  if (!roomTypeId) {
    return res.status(400).json({
      status: "fail",
      message: "Room Type ID is required",
    });
  }

  let response = await getHotelBookedDates(hotelId, roomTypeId);

  if (response.status != "success") {
    res.json({
      status: "fail",
      message: response.message,
    });
  } else {
    res.json({
      status: "success",
      data: response.data,
    });
  }
});

module.exports = hotelsRouter;
