# Development Setup Guide

This guide provides instructions for setting up and running the Doughmination System Server in development mode.

## Option 1: Running Locally (Recommended)

### Prerequisites
- Node.js >= 16
- Python 3.11+
- pip

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   # PluralKit system token (required)
   SYSTEM_TOKEN=your_pluralkit_token

   # JWT authentication secret
   JWT_SECRET=se3a8VExyTeTmJ_WedOZ_ZQ-t3uUx8rsFtfwP-w9z8o

   # Admin user credentials
   ADMIN_USERNAME=cloveadmin
   ADMIN_PASSWORD=yourSecurePassword
   ADMIN_DISPLAY_NAME=Clove

   # Cache TTL in seconds
   CACHE_TTL=30

   # Base URL for avatars and client access
   BASE_URL=http://localhost:8080
   ```

4. Start the backend server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to [http://localhost:8080](http://localhost:8080)

## Option 2: Using Docker

1. Make sure Docker and Docker Compose are installed on your system.

2. Create a `.env` file in the root directory with the same content as the backend `.env` file.

3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

4. Open your browser and navigate to [http://localhost:8080](http://localhost:8080)

## Troubleshooting

### 502 Bad Gateway Error

This usually means the backend server isn't running or the proxy configuration is incorrect.

1. Check if the backend server is running on port 8000.
2. Make sure your firewall isn't blocking port 8000.
3. Check the backend logs for errors.

### JWT Authentication Issues

If login fails:

1. Check that your `.env` file has a valid JWT_SECRET.
2. Verify that the admin credentials match what's in your `.env` file.

### CORS Errors

If you see CORS errors in the browser console:

1. Make sure the backend CORS configuration includes `http://localhost:8080`.
2. Check that the frontend is using the correct API URL.

### File Permissions

If you encounter file permission issues:

```bash
# Fix permissions for users.json
chmod 666 backend/users.json

# Create avatars directory with proper permissions
mkdir -p backend/avatars
chmod 777 backend/avatars
```
