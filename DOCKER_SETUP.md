# Docker Setup for Doughmination System Server

This document provides instructions for setting up the Doughmination System Server using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- PluralKit system token

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/CloveTwilight3/plural-web.git
   cd plural-web
   ```

2. Create an environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file and fill in your configuration values:
   ```
   SYSTEM_TOKEN=your_pluralkit_token
   JWT_SECRET=your_secure_random_string
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ADMIN_DISPLAY_NAME=Administrator
   BASE_URL=https://your-domain.com
   ```

4. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

## Configuration Options

### Environment Variables

- `SYSTEM_TOKEN`: Your PluralKit system token (required)
- `JWT_SECRET`: A secure random string used for JWT authentication (required)
- `ADMIN_USERNAME`: Username for the admin account (default: admin)
- `ADMIN_PASSWORD`: Password for the admin account (default: admin)
- `ADMIN_DISPLAY_NAME`: Display name for the admin account (default: Administrator)
- `CACHE_TTL`: Cache time-to-live in seconds (default: 30)
- `BASE_URL`: Base URL for avatar links (default: https://friends.clovetwilight3.co.uk)

## Volumes

- `backend-data`: Persistent storage for user avatars
- `./backend/users.json:/app/users.json`: User account data that persists between container restarts

## HTTPS Configuration

For production deployments, it's recommended to set up HTTPS. There are several approaches:

### Option 1: Using a reverse proxy (recommended)

Use a reverse proxy like Nginx or Traefik to handle SSL termination.

### Option 2: Configuring HTTPS directly in the container

1. Update the nginx.conf to include SSL settings
2. Mount your SSL certificates into the container
3. Update the docker-compose.yml to expose port 443

## Maintenance

### Viewing Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

### Updating

To update to the latest version:

```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Backup

Regularly backup the following files:

- `users.json`: Contains user account information
- `avatars` directory: Contains user avatar images

```bash
# Example backup command
cp users.json users.json.backup
tar -czf avatars-backup.tar.gz avatars/
```
