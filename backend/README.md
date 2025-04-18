# Backend Server

This directory contains the FastAPI-based backend that interfaces with the PluralKit API and provides data to the frontend application.

## Features

- PluralKit API integration for system, members, and fronter data
- User authentication with JWT tokens
- User management with admin capabilities
- Metrics collection for fronting time and switch frequency
- Avatar upload and management
- API endpoints for all frontend functionality

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your configuration:
```bash
# PluralKit system token (required)
SYSTEM_TOKEN=your_pluralkit_token

# JWT authentication secret (required)
JWT_SECRET=your_secure_random_string

# Admin user credentials (will be created on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_DISPLAY_NAME=Administrator

# Cache TTL in seconds (optional, default: 30)
CACHE_TTL=30

# Base URL for avatar links (optional)
BASE_URL=https://your-domain.com
```

3. Run the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### System and Members
- `GET /api/system` - Get system information
- `GET /api/members` - Get all system members
- `GET /api/fronters` - Get current fronting members
- `GET /api/member/{member_id}` - Get a specific member's details

### Authentication
- `POST /api/login` - Login with username/password
- `GET /api/user_info` - Get current user information
- `GET /api/is_admin` - Check if current user is an admin

### Front Switching
- `POST /api/switch` - Switch fronters (multiple members)
- `POST /api/switch_front` - Switch to a single fronter

### User Management
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create a new user (admin only)
- `PUT /api/users/{user_id}` - Update a user
- `DELETE /api/users/{user_id}` - Delete a user (admin only)
- `POST /api/users/{user_id}/avatar` - Upload a user avatar

### Metrics
- `GET /api/metrics/fronting-time` - Get member fronting time statistics
- `GET /api/metrics/switch-frequency` - Get switch frequency statistics

## Development

The backend uses FastAPI's automatic documentation. Once running, you can access:
- API documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## File Structure

- `main.py` - Main application file with API routes
- `pluralkit.py` - PluralKit API integration
- `auth.py` - Authentication logic
- `users.py` - User management functions
- `models.py` - Pydantic models for data validation
- `metrics.py` - Metrics calculation logic
- `cache.py` - Simple in-memory caching