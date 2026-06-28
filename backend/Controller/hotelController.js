const { Hotel } = require("../Model/hotelModel");
const mongoose = require("mongoose");
const { redis } = require("../config/redis");

async function getAllHotels() {
  try {
    const cacheKey = "cache:hotels:all";
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

    const hotels = await Hotel.find().lean();
    
    try {
      await redis.set(cacheKey, hotels, { ex: 3600 });
    } catch (redisError) {
      console.error("Redis Set Error:", redisError.message);
    }

    return {
      status: "success",
      data: hotels,
      source: "mongodb"
    };
  } catch (error) {
    throw new Error("Error fetching hotels: " + error.message);
  }
}

async function getHotelById(hotelId) {
  try {
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return {
        status: "fail",
        message: "Invalid Hotel ID",
      };
    }

    const cacheKey = `cache:hotel:${hotelId}`;
    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (redisError) {
      console.error("Redis Get Error (getHotelById):", redisError.message);
    }

    if (cachedData) {
      return {
        status: "success",
        data: cachedData,
        source: "redis"
      };
    }

    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) {
      return {
        status: "fail",
        message: "Hotel not Found!",
      };
    }

    // Convert features Map to a regular object for JSON serialization
    // Only convert if features is a Map or iterable
    if (
      hotel.features &&
      typeof hotel.features[Symbol.iterator] === "function"
    ) {
      hotel.features = Object.fromEntries(hotel.features);
    }

    try {
      await redis.set(cacheKey, hotel, { ex: 3600 });
    } catch (redisError) {
      console.error("Redis Set Error (getHotelById):", redisError.message);
    }

    return {
      status: "success",
      data: hotel,
      source: "mongodb"
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Error fetching Hotel by Id: " + error.message,
    };
  }
}

async function updateHotel(hotelId, hotelData) {
  try {
    if (hotelData.features) {
      const featuresMap = new Map();
      Object.entries(hotelData.features).forEach(
        ([key, value]) => {
          featuresMap.set(key, value);
        }
      );
      hotelData.features = featuresMap;
    }

    const hotel = await Hotel.findByIdAndUpdate(
      hotelId,
      hotelData,
      {
        new: true,
      }
    );
    if (!hotel) {
      throw new Error("Hotel not Found!");
    }

    // Invalidate caches
    try {
      await redis.del(`cache:hotel:${hotelId}`);
      await redis.del("cache:hotels:all");
    } catch (redisError) {
      console.error("Redis Cache Invalidation Error (updateHotel):", redisError.message);
    }

    return {
      status: "success",
      message: "Hotel updated successfully",
      data: hotel,
    };
  } catch (error) {
    throw new Error("Error updating hotel: " + error.message);
  }
}

async function addRoomType(hotelId, roomTypeData) {
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    hotel.roomType.push(roomTypeData);
    await hotel.save();

    return {
      status: "success",
      message: "Room type added successfully",
      data: hotel,
    };
  } catch (error) {
    throw new Error("Error adding room type: " + error.message);
  }
}

async function updateRoomType(hotelId, roomId, roomTypeData) {
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    const roomIndex = hotel.roomType.findIndex(
      (room) => room._id.toString() === roomId
    );
    if (roomIndex === -1) {
      throw new Error("Room type not found");
    }

    hotel.roomType[roomIndex] = {
      ...hotel.roomType[roomIndex]._doc,
      ...roomTypeData,
    };
    await hotel.save();

    return {
      status: "success",
      message: "Room type updated successfully",
      data: hotel,
    };
  } catch (error) {
    throw new Error(
      "Error updating room type: " + error.message
    );
  }
}

async function getRoomTypesByHotelId(hotelId) {
  try {
    const hotel = await Hotel.findById(hotelId).lean();
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    return {
      status: "success",
      data: hotel.roomType,
    };
  } catch (error) {
    throw new Error(
      "Error fetching room types by hotel ID: " + error.message
    );
  }
}

async function deleteHotel(hotelId) {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { status: "inactive" },
      { new: true }
    );
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    // Invalidate caches
    try {
      await redis.del(`cache:hotel:${hotelId}`);
      await redis.del("cache:hotels:all");
    } catch (redisError) {
      console.error("Redis Cache Invalidation Error (deleteHotel):", redisError.message);
    }

    return {
      status: "success",
      message: "Hotel deleted successfully (soft delete)",
      data: hotel,
    };
  } catch (error) {
    throw new Error("Error deleting hotel: " + error.message);
  }
}

async function createHotel(userId, hotelData) {
  try {
    // Add ownerId to hotelData
    const newHotelData = { ...hotelData, ownerId: userId };
    const newHotel = await Hotel.create(newHotelData);
    
    return {
      status: "success",
      data: newHotel,
    };
  } catch (error) {
    throw new Error("Error creating hotel: " + error.message);
  }
}

async function getHotelByOwnerId(userId) {
  try {
    const hotel = await Hotel.findOne({ ownerId: userId });
    
    if (!hotel) {
      return {
        status: "success",
        data: null,
      };
    }
    
    if (hotel.roomType && hotel.roomType.some(r => r === null)) {
      hotel.roomType = hotel.roomType.filter(r => r !== null);
      await hotel.save();
    }

    return {
      status: "success",
      data: hotel,
    };
  } catch (error) {
    throw new Error(
      "Error fetching hotel by owner ID: " + error.message
    );
  }
}

async function getHotelsByOwnerId(userId) {
  try {
    const hotels = await Hotel.find({ ownerId: userId }).lean();
    return {
      status: "success",
      data: hotels,
    };
  } catch (error) {
    throw new Error(
      "Error fetching hotels by owner ID: " + error.message
    );
  }
}

async function deleteRoomType(hotelId, roomId) {
  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new Error("Hotel not found");
    }

    hotel.roomType.pull({ _id: roomId });
    await hotel.save();

    return {
      status: "success",
      message: "Room type deleted successfully",
      data: hotel,
    };
  } catch (error) {
    throw new Error("Error deleting room type: " + error.message);
  }
}

async function getAllHotelsGemini() {
  try {
    const hotels = await Hotel.find()
      .select(
        "title description address location rating amenities roomType"
      )
      .lean();

    const formattedHotels = hotels.map((hotel) => ({
      ...hotel,
      _id: hotel._id.toString(),
    }));

    return {
      status: "success",
      data: formattedHotels,
    };
  } catch (error) {
    throw new Error("Error fetching hotels: " + error.message);
  }
}

async function getRecommendedHotels(hotelIds) {
  try {
    const recommendedHotels = await Hotel.find({
      _id: { $in: hotelIds },
    });
    return {
      status: "success",
      data: recommendedHotels,
    };
  } catch (error) {
    throw new Error(
      "Error fetching recommended hotels: " + error.message
    );
  }
}

module.exports = {
  getAllHotels,
  getHotelById,
  updateHotel,
  addRoomType,
  updateRoomType,
  getRoomTypesByHotelId,
  deleteHotel,
  createHotel,
  getHotelByOwnerId,
  getHotelsByOwnerId,
  getAllHotelsGemini,
  getRecommendedHotels,
  deleteRoomType,
};
