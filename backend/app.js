const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const { createStream } = require("rotating-file-stream");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { autoSignIn } = require("./middleware/autoSignIn");
const { authenticateUser } = require("./middleware/authentication");
const { getGeminiRecommendation, getRecommendation } = require("./Controller/geminiController");
const { createContactForm, getUserQueries } = require("./Controller/ContactController");

// Import routers
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const toursRouter = require("./routes/toursRouter");
const hotelsRouter = require("./routes/hotelsRouter");
const bookingsRouter = require("./routes/bookingsRouter");
const adminRouter = require("./routes/adminRouter");
const managerRouter = require("./routes/managerRouter");
const guideRouter = require("./routes/guideRouter");
const favouriteRouter = require("./routes/favouriteRouter");
const customTourRouter = require("./routes/customTourRouter");
const reviewRouter = require("./routes/reviewRouter");
const ownerRouter = require("./routes/ownerRouter");
const employeeRouter = require("./routes/employeeRouter");

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

app.use(helmet());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Logging setup
const logDirectory = path.join(__dirname, "log");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: logDirectory,
  maxFiles: 10,
  compress: "gzip",
});

accessLogStream.on("error", (err) => {
  console.error("Log stream error:", err);
});

app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev"));
app.use(autoSignIn);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
});

// Apply rate limiting to all requests
app.use(limiter);

// Swagger API Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes - All under /api prefix
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/tours", toursRouter);
app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", authenticateUser, bookingsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/manager", managerRouter);
app.use("/api/guide", guideRouter);
app.use("/api/favourites", authenticateUser, favouriteRouter);
app.use("/api/custom-tours", authenticateUser, customTourRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/owner", ownerRouter); // platform‑owner analytics endpoints
app.use("/api/employee", employeeRouter);

// Additional API routes
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, reason, query } = req.body;
  await createContactForm({
    name,
    email,
    phone,
    reason,
    query,
    userId: req.user ? req.user._id : undefined,
  });
  res.json({
    message: "Contact form submitted successfully",
    data: { name, email, phone, reason, query },
  });
});

app.get("/api/queries", authenticateUser, getUserQueries);

app.post("/api/chatbot", async (req, res) => {
  const { userInput, history } = req.body;
  const response = await getGeminiRecommendation(userInput, history);
  res.json(response);
});

app.post("/api/recommendation", async (req, res) => {
  const { preferences, userData } = req.body;
  const response = await getRecommendation(preferences, userData);
  res.json(response);
});

// Database connection
async function connectMongoose() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
}

connectMongoose();

app.listen(process.env.PORT || 5500, () => {
  console.log("Server is running on port 5500");
});
