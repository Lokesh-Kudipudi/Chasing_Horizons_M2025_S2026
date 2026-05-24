const { Room } = require("../Model/roomModel");
const { Hotel } = require("../Model/hotelModel");
const { Booking } = require("../Model/bookingModel");

async function createRoom(hotelId, roomData) {
  try {
    const newRoom = new Room({
      ...roomData,
      hotelId: hotelId,
    });

    const savedRoom = await newRoom.save();

    return {
      status: "success",
      data: savedRoom,
      message: "Room created successfully",
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        status: "fail",
        message: "Room number already exists for this hotel",
      };
    }
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function getRoomsByHotel(hotelId) {
  try {
    const rooms = await Room.find({ hotelId: hotelId })
      .populate("currentBookingId")
      .sort({ roomNumber: 1 }); 

    return {
      status: "success",
      data: rooms,
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function updateRoom(roomId, updateData) {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(roomId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRoom) {
      return {
        status: "fail",
        message: "Room not found",
      };
    }

    return {
      status: "success",
      data: updatedRoom,
      message: "Room updated successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function deleteRoom(roomId) {
  try {
     const room = await Room.findById(roomId);
     if (!room) {
         return { status: "fail", message: "Room not found" };
     }
     
     if (room.status === 'occupied' || room.currentBookingId) {
         return { 
             status: "fail", 
             message: "Cannot delete an occupied room. Please unassign or wait for checkout." 
         };
     }

    await Room.findByIdAndDelete(roomId);

    return {
      status: "success",
      message: "Room deleted successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function assignRoomToBooking(bookingId, roomId) {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return { status: "fail", message: "Booking not found" };
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return { status: "fail", message: "Room not found" };
    }

    if (room.status === "occupied" && String(room.currentBookingId) !== String(bookingId)) {
      return { status: "fail", message: "Room is already occupied" };
    }
    
    if (room.status === "maintenance") {
       return { status: "fail", message: "Room is under maintenance" };
    }

    if (booking.assignedRoomId && String(booking.assignedRoomId) !== String(roomId)) {
        await Room.findByIdAndUpdate(booking.assignedRoomId, {
            status: "available",
            currentBookingId: null
        });
    }

    room.status = "occupied";
    room.currentBookingId = bookingId;
    await room.save();

    booking.assignedRoomId = roomId;
    
    if (booking.bookingDetails) {
        booking.bookingDetails.status = "checkedIn"; 
        booking.markModified('bookingDetails'); 
    }

    await booking.save();

    return {
      status: "success",
      message: "Room assigned successfully",
      data: { room, booking }
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
}

module.exports = {
  createRoom,
  getRoomsByHotel,
  updateRoom,
  deleteRoom,
  assignRoomToBooking,
};
