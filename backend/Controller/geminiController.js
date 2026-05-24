const { Tour } = require("../Model/tourModel");
const { Hotel } = require("../Model/hotelModel");
const { chatGemini } = require("../api/gemini");


async function getGeminiRecommendation(userInput, history) {
  try {
    const [tours, hotels] = await Promise.all([
      Tour.find({}).lean(),
      Hotel.find({}).lean(),
    ]);

    const rawResponse = await chatGemini(userInput, history, tours, hotels);

    const extract = (tag) => {
      const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
      const match = rawResponse.match(regex);
      return match ? match[1].trim() : "";
    };

    const message = extract("message");
    const hotelsRaw = extract("hotels");
    const toursRaw = extract("tours");
    const userIntent = extract("user_intent");
    const redirect = extract("redirect");

    let parsedHotels = [];
    let parsedTours = [];
    try {
      if (hotelsRaw) parsedHotels = JSON.parse(hotelsRaw);
    } catch (_) {}
    try {
      if (toursRaw) parsedTours = JSON.parse(toursRaw);
    } catch (_) {}

    return {
      googleResponse: rawResponse,
      data: {
        message,
        hotels: parsedHotels,
        tours: parsedTours,
        userIntent,
        redirect,
      },
    };
  } catch (error) {
    console.error("Error in getGeminiRecommendation:", error);
    return {
      googleResponse: "",
      data: {
        message: "Sorry, I encountered an error. Please try again.",
        hotels: [],
        tours: [],
        userIntent: "other",
        redirect: "no",
      },
    };
  }
}


async function getRecommendation(preferences, userData) {
  try {
    const { tourIds, hotelIds } = preferences || {}; 

    let tours = [];
    let hotels = [];

    if (tourIds && tourIds.length > 0) {
       tours = await Tour.find({ _id: { $in: tourIds } }).lean();
    } 

    if (hotelIds && hotelIds.length > 0) {
       hotels = await Hotel.find({ _id: { $in: hotelIds } }).lean();
    } 

    return {
      status: "success",
      data: {
        tours: { data: tours },
        hotels: { data: hotels },
      },
    };
  } catch (error) {
    console.error("Error in getRecommendation:", error);
    return {
      status: "fail",
      message: "Failed to fetch recommendations.",
      data: {
        tours: { data: [] },
        hotels: { data: [] },
      },
    };
  }
}

module.exports = {
  getGeminiRecommendation,
  getRecommendation,
};
