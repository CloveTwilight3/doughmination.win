# Frontend UI

This directory contains the frontend web application for the Doughmination System Server. It provides a beautiful, responsive user interface for displaying system members, current fronters, metrics, and user management.

## Features

- Responsive design that works on mobile and desktop
- Light and dark mode with persistent preference
- Real-time display of current fronters with automatic favicon updates
- Member directory with detailed profile views
- Admin dashboard for system management
- User management with multiple accounts and avatars
- Fronting time and switch frequency metrics visualization
- User profile management
- Authentication system with JWT tokens

## Installation

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Customization

The interface is designed to be clean and simple, but you can customize it in several ways:

- Edit `src/styles.css` to change colors, fonts, and other styling elements
- Modify `tailwind.config.js` to update the theme colors and other Tailwind settings
- Update `index.html` meta tags to change SEO information and social media previews

## Directory Structure

- `src/` - Source code
  - `App.jsx` - Main application component with routing
  - `MemberDetails.jsx` - Individual member profile view
  - `AdminDashboard.jsx` - Admin control panel
  - `Metrics.jsx` - Fronting statistics visualization
  - `Login.jsx` - Authentication component
  - `UserManagement.jsx` - User administration
  - `styles.css` - Global styling
- `public/` - Static assets

## Development

The development server will run on port 8080 by default. You can change this in `vite.config.js` and the corresponding npm scripts in `package.json`.