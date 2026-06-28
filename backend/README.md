# Backend - Chasing Horizons

This directory contains the server-side application for the Chasing Horizons platform. It provides RESTful APIs to serve the frontend, interact with the MongoDB database, and integrate with external services like Google Gemini AI.

##  Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js (v5.1.0)
*   **Database:** MongoDB via Mongoose (v8.19.1)
*   **Authentication & Security:** 
    *   JSON Web Tokens (`jsonwebtoken`)
    *   `bcryptjs` for password hashing
    *   `helmet` for securing HTTP headers
    *   `express-rate-limit` for mitigating brute-force attacks
    *   `cors` for Cross-Origin Resource Sharing
*   **File Management:** 
    *   `multer` and `multer-storage-cloudinary` for handling file uploads directly to Cloudinary
*   **Caching & Sessions:** 
    *   `redis` and `@upstash/redis` for performance optimization
    *   `express-session` for managing user sessions
*   **Email Services:** `nodemailer` for transactional emails
*   **AI Integration:** `@google/genai` (Google Gemini API) for chatbots and personalized recommendations
*   **Logging:** `morgan` and `rotating-file-stream` for detailed request logging

##  Folder Structure

```
backend/
├── app.js                 # Entry point: Express app configuration, middleware, and route mounting
├── config/                # Database connection, Redis setup, and other configuration files
├── Controller/            # Handlers for API endpoints (business logic)
│   ├── authController.js
│   ├── userController.js
│   ├── tourController.js
│   ├── ...
├── middleware/            # Custom middleware functions
│   ├── authMiddleware.js  # JWT verification and role-based access control
│   ├── errorHandler.js    # Global error handling
│   └── ...
├── Model/                 # Mongoose schemas and models
│   ├── userModel.js
│   ├── tourModel.js
│   ├── hotelModel.js
│   └── ...
├── routes/                # Express routers defining API endpoints
│   ├── authRouter.js
│   ├── usersRouter.js
│   ├── toursRouter.js
│   └── ...
├── log/                   # Auto-generated application logs
└── scripts/               # Utility scripts (e.g., database seeding)
```

##  Key Architectural Decisions

1.  **MVC Pattern:** The application follows a Model-View-Controller architecture (minus the View, as it's an API), cleanly separating routes, controllers, and models.
2.  **Role-Based Access Control (RBAC):** Middleware checks verify user roles (`user`, `admin`, `hotelManager`, `tourGuide`) before granting access to specific endpoints (e.g., only `admin` can approve domains; only `tourGuide` can create tours).
3.  **JWT Authentication:** Stateless authentication using JWTs stored in HTTP-only cookies to enhance security against XSS attacks.
4.  **Cloudinary Integration:** Images are uploaded directly to Cloudinary during request processing via `multer-storage-cloudinary`, preventing server filesystem bloat.

## ️ Setup & Local Development

### Prerequisites

*   Node.js (v18+ recommended)
*   MongoDB instance (Local or Atlas)
*   Redis instance (optional, but recommended for full functionality)
*   Cloudinary Account
*   Google Gemini API Key

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install all dependencies:
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the `backend` directory. Please ensure you configure the following keys:

```env
PORT=5500
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Nodemailer)
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password or app_password

# Redis (Optional but recommended)
REDIS_URL=your_redis_connection_string
```

### Running the Server

Start the development server (uses `nodemon` for hot-reloading):

```bash
npm run dev
```

To run in production mode:

```bash
npm start
```

The server will be running at `http://localhost:5500` (or your configured `PORT`).

##  API Architecture Summary

The RESTful APIs are structured around the core entities:
*   `/api/v1/auth`: Registration, login, logout.
*   `/api/v1/users`: Profile management and user-specific actions.
*   `/api/v1/tours`: CRUD operations for tour packages.
*   `/api/v1/hotels`: Hotel listings, room management, and availability searches.
*   `/api/v1/bookings`: Creating and managing reservations.
*   `/api/v1/admin`: Analytics and platform management endpoints.
*   `/api/v1/gemini`: AI interaction endpoints.
