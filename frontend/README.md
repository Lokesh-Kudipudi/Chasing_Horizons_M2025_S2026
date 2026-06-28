# Frontend - Chasing Horizons

This directory contains the client-side application for the Chasing Horizons platform. It delivers a fast, responsive, and dynamic user interface for travelers, hotel managers, tour guides, and administrators.

##  Tech Stack

*   **Framework:** React 19
*   **Build Tool:** Vite compilation for lightning-fast HMR and optimized builds
*   **Styling:** Tailwind CSS (v4) for utility-first responsive design
*   **State Management:**
    *   **Redux Toolkit (`@reduxjs/toolkit`)**: Manage global application state (like tours and hotels)
    *   **React Context**: Manage localized global state, primarily authentication context (`UserContext`)
*   **Routing:** React Router DOM (v7) for client-side navigation
*   **Data Visualization:** `chart.js` and `react-chartjs-2` for interactive admin and provider dashboards
*   **UI Components:**
    *   `react-icons` for scalable vector icons
    *   `react-hot-toast` for elegant, non-blocking notifications
*   **Utilities:** `react-to-print` for generating printable documents (e.g., invoices)

##  Folder Structure

```
frontend/
├── index.html             # The main HTML template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration (plugins, server setup)
└── src/
    ├── main.jsx           # Entry point: renders the React tree
    ├── App.jsx            # Defines application routes and global layout
    ├── index.css          # Global styles and Tailwind directives
    ├── assets/            # Static assets (images, global CSS if any)
    ├── components/        # Reusable UI components (Buttons, Navbars, Modals)
    ├── config/            # Configuration constants (e.g., API Base URL)
    ├── context/           # React Context providers (UserContext)
    ├── hooks/             # Custom React hooks (e.g., useFetch, useAuth)
    ├── pages/             # Route-level components (Views)
    │   ├── Home.jsx
    │   ├── ToursIndex.jsx
    │   ├── AdminDashboard.jsx
    │   └── ...
    └── redux/             # Redux store configuration and slices
        ├── store.js
        ├── slices/
        └── ...
```

##  Key Architectural Decisions

1.  **Component-Based UI:** The UI is thoroughly broken down into modular components within the `src/components/` directory, promoting reusability and maintainability.
2.  **Hybrid State Management:**
    *   *Redux* is utilized for complex caching and sharing entity data (Tours, Hotels) across vastly different parts of the application.
    *   *Context API* handles simpler, application-wide data like the authenticated user's session details to avoid Redux boilerplate where it's not strictly necessary.
3.  **Role-Based Routing:** The `App.jsx` router conditionally renders certain routes or redirects users based on the role defined in their `UserContext`.
4.  **Vite for Performance:** Leveraging Vite ensures rapid development startup times and highly optimized production bundling compared to older tools like Webpack.
5.  **Tailwind CSS Standardization:** All styling is done via Tailwind classes, ensuring a consistent design system without the overhead of maintaining massive CSS files.

## ️ Setup & Local Development

### Prerequisites

*   Node.js (v18+ recommended)
*   Ensure the [Backend Server](../backend/) is running locally so the frontend can retrieve data.

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install all dependencies:
    ```bash
    npm install
    ```

### Environment Variables

If your API runs on a port other than the default configured in `src/config/`, or if you have specific client-side API keys, create a `.env` file in the root of the `frontend` directory.

Typically, Vite environment variables must be prefixed with `VITE_`.
*Example:*
```env
VITE_API_BASE_URL=http://localhost:5500/api/v1
```
*(Check `src/config/api.js` or similar configuration files to see exactly how the base URL is constructed).*

### Running the Application

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will typically be accessible at `http://localhost:5173`.

### Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate a `dist/` directory containing the static files ready to be served by a web server (like Nginx) or a static hosting provider (like Vercel or Netlify). To preview the production build locally:

```bash
npm run preview
```
