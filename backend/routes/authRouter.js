const express = require("express");
const {
  signUpUser,
  signUphotelManager,
  signUpTourGuide,
  signUpOwner,
  fetchUserByEmailPassword,
  logout,
  updatePassword,
  deleteAccount,
  forgotPassword,
  verifyOTP,
  resetPasswordWithToken,
} = require("../Controller/userController");
const { authenticateUser } = require("../middleware/authentication");
const jwt = require("jsonwebtoken");
const { User } = require("../Model/userModel");

const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and User management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 * 
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 * 
 * /api/auth/register/hotel-manager:
 *   post:
 *     summary: Register a hotel manager
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registered successfully
 * 
 * /api/auth/register/tour-guide:
 *   post:
 *     summary: Register a tour guide
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registered successfully
 * 
 * /api/auth/register/owner:
 *   post:
 *     summary: Register a platform owner
 *     tags: [Auth]
 *     responses:
 *       201:
 *         description: Registered successfully
 * 
 * /api/auth/logout:
 *   get:
 *     summary: Log out user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 * 
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns current user data or null
 * 
 * /api/auth/password:
 *   post:
 *     summary: Update password
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Password updated successfully
 * 
 * /api/auth/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 * 
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP sent
 * 
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: OTP verified
 * 
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset successfully
 */

// Public routes
authRouter.post("/login", fetchUserByEmailPassword);
authRouter.post("/register", signUpUser);
authRouter.post("/register/hotel-manager", signUphotelManager);
authRouter.post("/register/tour-guide", signUpTourGuide);
// new route for platform owner signup (could be restricted later via admin)
authRouter.post("/register/owner", signUpOwner);
authRouter.get("/logout", logout);

// Get current user (autologin)
authRouter.get("/me", async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id || decoded.id).select(
      "-passwordHash"
    );

    if (!user) {
      return res.json({ user: null });
    }

    return res.json({ user });
  } catch (err) {
    console.log("Token verification failed:", err);
    return res.json({ user: null });
  }
});

// Protected routes
authRouter.post("/password", authenticateUser, updatePassword);
authRouter.delete("/account", authenticateUser, deleteAccount);

// Password reset flow
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/reset-password", resetPasswordWithToken);

module.exports = authRouter;
