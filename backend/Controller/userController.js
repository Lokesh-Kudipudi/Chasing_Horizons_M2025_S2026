const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../Model/userModel");
const { getUserBookings } = require("./bookingController");
const { sendOTPEmail } = require("../config/nodemailer");
const { Booking } = require("../Model/bookingModel");

async function updatePassword(req, res) {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message: "Password must contain at least one uppercase letter",
      });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message: "Password must contain at least one lowercase letter",
      });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message: "Password must contain at least one digit",
      });
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({
        status: "fail",
        message: "Password must contain at least one special character",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        status: "fail",
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
}

function generateToken(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      photo: user.photo,
      createdAt: user.createdAt,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function signUpUser(req, res) {
  const { fullName, email, password, phone, address } = req.body;
  try {
    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists!",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      phone,
      address,
      passwordHash,
      role: "user",
    });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true, 
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
    });

    req.user = user;

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        photo: user.photo,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

async function signUphotelManager(req, res) {
  const { fullName, email, password, phone, address } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists!",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      phone,
      address,
      role: "hotelManager",
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true, 
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "None",
    });

    req.user = user; 

    res.status(201).json({
      status: "success",
      message: "Hotel Manager created successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

async function signUpTourGuide(req, res) {
  const { fullName, email, password, phone, address } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists!",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      phone,
      address,
      role: "tourGuide",
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "None",
    });

    req.user = user;

    res.status(201).json({
      status: "success",
      message: "Tour Guide created successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

async function signUpOwner(req, res) {
  const { fullName, email, password, phone, address } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists!",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      phone,
      address,
      role: "owner",
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true, 
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "None",
    });

    req.user = user; 

    res.status(201).json({
      status: "success",
      message: "Owner created successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        photo: user.photo,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

async function signUpAdmin(req, res) {
  const { fullName, email, password, phone, address } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists!",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      phone,
      address,
      role: "admin",
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true, 
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
    });

    req.user = user; 

    res.status(201).json({
      status: "success",
      message: "Admin created successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

async function fetchUserByEmailPassword(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const valid = bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid password" });

    }
    

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true, 
      secure: true, 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: "None",
    });

    req.user = user; 

    res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        photo: user.photo,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find().select("-passwordHash");

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}


async function updateUser(req, res) {
  const { fullName, email, phone, address } = req.body || {};
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    if (req.file) {
      user.photo = req.file.path;
    }
    await user.save();

    const token = generateToken(user);

    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.cookie("token", token, {
      httpOnly: true, // Prevents JS access on client-side
      secure: true, // Set to true if using HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "None",
    });

    req.user = user;

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
}

function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Strict",
  });

  req.user = null;
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
}

async function getBookingAnalytics(userId) {
  try {
    const bookings = await getUserBookings(userId);

    if (bookings.status === "error") {
      return {
        status: "error",
        message: bookings.message,
      };
    }

    const userBookings = Array.isArray(bookings.data) ? bookings.data : [];

    // Separate hotel and tour bookings
    const hotelBookings = userBookings.filter(
      (booking) => booking.type === "Hotel"
    );
    const tourBookings = userBookings.filter(
      (booking) => booking.type === "Tour"
    );

    // Count by status
    const getStatusCounts = (bookingList) => {
      const counts = {
        pending: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        total: bookingList.length,
      };

      bookingList.forEach((booking) => {
        const status = booking.bookingDetails?.status || "pending";
        if (status === "cancel") {
          counts.cancelled++;
        } else {
          counts[status] = (counts[status] || 0) + 1;
        }
      });

      return counts;
    };

    const analytics = {
      total: {
        count: userBookings.length,
        hotels: hotelBookings.length,
        tours: tourBookings.length,
      },
      hotels: getStatusCounts(hotelBookings),
      tours: getStatusCounts(tourBookings),
      recent: userBookings
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    };

    return {
      status: "success",
      data: analytics,
    };
  } catch (error) {
    console.error("Error in getBookingAnalytics:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function getBookingAnalyticsController(req, res) {
  try {
    const analytics = await getBookingAnalytics(req.user._id);

    if (analytics.status === "error") {
      console.error("Error fetching booking analytics:", analytics.message);
      return res.render("dashboard/user/bookingAnalytics", {
        user: req.user,
        analytics: null,
        error: "Failed to load booking analytics. Please try again later.",
      });
    }

    res.render("dashboard/user/bookingAnalytics", {
      user: req.user,
      analytics: analytics.data,
    });
  } catch (error) {
    console.error("Unexpected error in getBookingAnalyticsController:", error);
    res.render("dashboard/user/bookingAnalytics", {
      user: req.user,
      analytics: null,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}

async function getHotelBookingsController(req, res) {
  try {
    const bookings = await getUserBookings(req.user._id);

    if (bookings.status === "error") {
      console.error("Error fetching hotel bookings:", bookings.message);
      return res.render("dashboard/user/hotelBookings", {
        user: req.user,
        bookings: [],
        error: "Failed to load hotel bookings. Please try again later.",
      });
    }

    const userBookings = Array.isArray(bookings.data) ? bookings.data : [];
    const hotelBookings = userBookings.filter(
      (booking) => booking.type === "Hotel"
    );

    res.render("dashboard/user/hotelBookings", {
      user: req.user,
      bookings: hotelBookings,
      message:
        hotelBookings.length === 0
          ? "No hotel bookings found. Explore our hotels!"
          : null,
    });
  } catch (error) {
    console.error("Unexpected error in getHotelBookingsController:", error);
    res.render("dashboard/user/hotelBookings", {
      user: req.user,
      bookings: [],
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}

async function getTourBookingsController(req, res) {
  try {
    const bookings = await getUserBookings(req.user._id);

    if (bookings.status === "error") {
      console.error("Error fetching tour bookings:", bookings.message);
      return res.render("dashboard/user/tourBookings", {
        user: req.user,
        bookings: [],
        error: "Failed to load tour bookings. Please try again later.",
      });
    }

    const userBookings = Array.isArray(bookings.data) ? bookings.data : [];
    const tourBookings = userBookings.filter(
      (booking) => booking.type === "Tour"
    );

    res.render("dashboard/user/tourBookings", {
      user: req.user,
      bookings: tourBookings,
      message:
        tourBookings.length === 0
          ? "No tour bookings found. Discover amazing tours!"
          : null,
    });
  } catch (error) {
    console.error("Unexpected error in getTourBookingsController:", error);
    res.render("dashboard/user/tourBookings", {
      user: req.user,
      bookings: [],
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}

async function getUserBookingsController(req, res) {
  // Redirect to analytics page by default
  res.redirect("/dashboard/bookings/analytics");
}

// Delete Account function
async function deleteAccount(req, res) {
  try {
    // Get user ID from authenticated request
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "User not authenticated",
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    
    await Booking.deleteMany({ userId: userId });

    // Clear the authentication cookie
    res.clearCookie("token");

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({
      status: "fail",
      message: err.message || "Failed to delete account",
    });
  }
}

// Forgot Password - Generate and send OTP
async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    // Validate email
    if (!email) {
      return res.status(400).json({
        status: "fail",
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email format",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User with this email does not exist",
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-minute expiration
    await storeOTP(email, otp, 5);

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({
        status: "fail",
        message: emailResult.message,
      });
    }

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email. Valid for 5 minutes.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try again later.",
    });
  }
}

// Verify OTP - Generate reset token
async function verifyOTP(req, res) {
  const { email, otp } = req.body;

  try {
    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        status: "fail",
        message: "Email and OTP are required",
      });
    }

    if (otp.length !== 6) {
      return res.status(400).json({
        status: "fail",
        message: "OTP must be 6 digits",
      });
    }

    // Import Redis function
    const storedOTP = await getOTP(email);

    if (!storedOTP) {
      return res.status(400).json({
        status: "fail",
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Verify OTP matches (trim whitespace and ensure string comparison)
    const userOTP = String(otp).trim();
    const dbOTP = String(storedOTP).trim();

    console.log(`Comparing OTP: User="${userOTP}" vs DB="${dbOTP}"`);

    if (userOTP !== dbOTP) {
      console.log(` OTP Mismatch for ${email}`);
      return res.status(400).json({
        status: "fail",
        message: "Invalid OTP. Please enter the correct OTP.",
      });
    }

    console.log(` OTP Match for ${email}`);

    // Delete OTP after verification (one-time use)
    await deleteOTP(email);

    // Generate JWT reset token (valid for 10 minutes)
    const jwt = require("jsonwebtoken");
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET || "secret", {
      expiresIn: "10m",
    });

    res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try again later.",
    });
  }
}

// Reset Password with JWT token
async function resetPasswordWithToken(req, res) {
  const { resetToken, newPassword, confirmPassword } = req.body;

  try {
    // Validate inputs
    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required",
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match",
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 6 characters long",
      });
    }

    // Verify JWT token
    const jwt = require("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "secret");
    } catch (error) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired reset token",
      });
    }

    // Find user by email from token
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    user.passwordHash = hashedPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message:
        "Password reset successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Error in resetPasswordWithToken:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong. Please try again later.",
    });
  }
}


module.exports = {
  signUpUser,
  signUphotelManager,
  signUpTourGuide,
  signUpOwner,
  signUpAdmin,
  getUsers,
  fetchUserByEmailPassword,
  logout,
  updateUser,
  updatePassword,
  deleteAccount,
  getUserBookingsController,
  getBookingAnalyticsController,
  getHotelBookingsController,
  getTourBookingsController,
  getBookingAnalytics,
  forgotPassword,
  verifyOTP,
  resetPasswordWithToken,
};