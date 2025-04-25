# Docker Setup Instructions for Doughmination System Server

This guide provides step-by-step instructions for setting up and running the Doughmination System Server using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- A valid PluralKit system token
- Git installed (for cloning the repository)

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/CloveTwilight3/plural-web.git
cd plural-web
```

### 2. Set Up Environment Variables

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:
- Add your PluralKit system token
- Set a secure JWT secret
- Configure admin credentials
- Set the correct BASE_URL (use `http://localhost:8080` for local development)

### 3. Build and Start the Containers

```bash
docker-compose up --build
```

To run in detached mode (background):

```bash
docker-compose up --build -d
```

### 4. Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:8000/api

### 5. Check Container Logs

If you need to see the logs:

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### 6. Stop the Containers

```bash
docker-compose down
```

## Troubleshooting Tips

### 1. Container Connectivity Issues

If the frontend can't connect to the backend:

- Ensure both containers are running:
  ```bash
  docker-compose ps
  ```
- Check the logs for errors:
  ```bash
  docker-compose logs backend
  ```
- Verify that the backend is accessible:
  ```bash
  curl http://localhost:8000/api/system
  ```

### 2. Permission Issues with Volumes

If you encounter permission issues with mounted volumes:

```bash
# Reset permissions on users.json
chmod 666 backend/users.json

# Reset permissions on avatars directory
mkdir -p backend/avatars
chmod 777 backend/avatars
```

### 3. CORS Errors

If you see CORS errors in the browser console:

- Check that your backend CORS configuration includes the correct frontend URL
- Ensure you're accessing the frontend using the same protocol, domain and port as configured in CORS

### 4. JWT Authentication Issues

If authentication fails:

- Verify your JWT_SECRET in the .env file
- Check the backend logs for authentication errors
- Try regenerating the JWT secret and updating it in the .env file

### 5. Container Rebuild

If you've made significant changes and need to rebuild everything:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Development Setup

For active development with hot reloading:

```bash
# Start with the override file that mounts code volumes
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

This will mount your local code directories into the containers so changes are reflected immediately.
