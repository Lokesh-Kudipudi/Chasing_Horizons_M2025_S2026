const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { performance } = require("perf_hooks");
const { redis } = require("../config/redis");
const { Tour } = require("../Model/tourModel");
const { Hotel } = require("../Model/hotelModel");

// Controllers
const { getAllTours, getTourById } = require("../Controller/tourController");
const { getAllHotels, getHotelById } = require("../Controller/hotelController");
const {
  getOverviewAnalytics,
  getHotelAnalytics,
  getTourAnalytics
} = require("../Controller/ownerAnalyticsController");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected.");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// Helper to run a regular controller function (directly returning data)
async function measureDirectFunction(fn, label, arg = null) {
  const start = performance.now();
  const res = arg ? await fn(arg) : await fn();
  const end = performance.now();
  const duration = (end - start).toFixed(2);
  return { duration };
}

// Helper to run express controller (req, res style)
function measureExpressController(fn, label) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const mockReq = {};
    const mockRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        const end = performance.now();
        const duration = (end - start).toFixed(2);
        resolve({ duration });
      }
    };
    try {
      fn(mockReq, mockRes);
    } catch (err) {
      reject(err);
    }
  });
}

async function runBenchmark() {
  await connectDB();
  console.log("\n--- BENCHMARK PREPARATION ---");

  // Get a sample tour ID and hotel ID to run detail benchmarks
  const sampleTour = await Tour.findOne({});
  const sampleHotel = await Hotel.findOne({});

  if (!sampleTour || !sampleHotel) {
    console.error("Please seed the database first using 'npm run seed' to run benchmark.");
    mongoose.connection.close();
    process.exit(1);
  }

  const tourId = sampleTour._id.toString();
  const hotelId = sampleHotel._id.toString();

  // Clear existing caches to force misses
  console.log("Clearing Redis cache keys to start clean...");
  const keysToClear = [
    "cache:tours:all",
    `cache:tour:${tourId}`,
    "cache:hotels:all",
    `cache:hotel:${hotelId}`,
    "owner_analytics:overview",
    "owner_analytics:hotels",
    "owner_analytics:tours",
    "owner_analytics:performance",
    "owner_analytics:bookings",
    "owner_analytics:people"
  ];
  for (const k of keysToClear) {
    await redis.del(k);
  }

  const results = [];

  console.log("\n=== RUN 1: Cache Misses (MongoDB Queries) ===");

  // 1. getAllTours
  console.log("Benchmarking getAllTours (list)...");
  const toursMiss = await measureDirectFunction(getAllTours, "getAllTours");
  results.push({ name: "getAllTours (List)", type: "Direct", miss: toursMiss.duration });

  // 2. getTourById
  console.log("Benchmarking getTourById (detail with N+1 bookings)...");
  const tourDetailMiss = await measureDirectFunction(getTourById, "getTourById", tourId);
  results.push({ name: "getTourById (Detail)", type: "Direct", miss: tourDetailMiss.duration });

  // 3. getAllHotels
  console.log("Benchmarking getAllHotels (list)...");
  const hotelsMiss = await measureDirectFunction(getAllHotels, "getAllHotels");
  results.push({ name: "getAllHotels (List)", type: "Direct", miss: hotelsMiss.duration });

  // 4. getHotelById
  console.log("Benchmarking getHotelById (detail)...");
  const hotelDetailMiss = await measureDirectFunction(getHotelById, "getHotelById", hotelId);
  results.push({ name: "getHotelById (Detail)", type: "Direct", miss: hotelDetailMiss.duration });

  // 5. getOverviewAnalytics
  console.log("Benchmarking getOverviewAnalytics...");
  const overviewMiss = await measureExpressController(getOverviewAnalytics, "getOverviewAnalytics");
  results.push({ name: "getOverviewAnalytics", type: "Express", miss: overviewMiss.duration });

  // 6. getHotelAnalytics
  console.log("Benchmarking getHotelAnalytics...");
  const hotelAnalyticsMiss = await measureExpressController(getHotelAnalytics, "getHotelAnalytics");
  results.push({ name: "getHotelAnalytics", type: "Express", miss: hotelAnalyticsMiss.duration });

  // 7. getTourAnalytics
  console.log("Benchmarking getTourAnalytics...");
  const tourAnalyticsMiss = await measureExpressController(getTourAnalytics, "getTourAnalytics");
  results.push({ name: "getTourAnalytics", type: "Express", miss: tourAnalyticsMiss.duration });


  console.log("\n=== RUN 2: Cache Hits (Redis Key Fetches) ===");

  // 1. getAllTours
  const toursHit = await measureDirectFunction(getAllTours, "getAllTours");
  results.find(r => r.name === "getAllTours (List)").hit = toursHit.duration;

  // 2. getTourById
  const tourDetailHit = await measureDirectFunction(getTourById, "getTourById", tourId);
  results.find(r => r.name === "getTourById (Detail)").hit = tourDetailHit.duration;

  // 3. getAllHotels
  const hotelsHit = await measureDirectFunction(getAllHotels, "getAllHotels");
  results.find(r => r.name === "getAllHotels (List)").hit = hotelsHit.duration;

  // 4. getHotelById
  const hotelDetailHit = await measureDirectFunction(getHotelById, "getHotelById", hotelId);
  results.find(r => r.name === "getHotelById (Detail)").hit = hotelDetailHit.duration;

  // 5. getOverviewAnalytics
  const overviewHit = await measureExpressController(getOverviewAnalytics, "getOverviewAnalytics");
  results.find(r => r.name === "getOverviewAnalytics").hit = overviewHit.duration;

  // 6. getHotelAnalytics
  const hotelAnalyticsHit = await measureExpressController(getHotelAnalytics, "getHotelAnalytics");
  results.find(r => r.name === "getHotelAnalytics").hit = hotelAnalyticsHit.duration;

  // 7. getTourAnalytics
  const tourAnalyticsHit = await measureExpressController(getTourAnalytics, "getTourAnalytics");
  results.find(r => r.name === "getTourAnalytics").hit = tourAnalyticsHit.duration;

  console.log("\n--- BENCHMARK RESULTS ---");
  console.table(results.map(r => {
    const missVal = parseFloat(r.miss);
    const hitVal = parseFloat(r.hit);
    const speedup = hitVal > 0 ? (missVal / hitVal).toFixed(1) : "N/A";
    return {
      "Route/Endpoint": r.name,
      "Cache Miss (MongoDB)": `${r.miss} ms`,
      "Cache Hit (Redis)": `${r.hit} ms`,
      "Speedup Factor": `${speedup}x`
    };
  }));

  mongoose.connection.close();
  // Exit the process
  setTimeout(() => process.exit(0), 500);
}

runBenchmark();
