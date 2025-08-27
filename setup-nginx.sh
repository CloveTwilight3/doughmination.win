#!/bin/bash

# Script to set up nginx configuration and SSL certificate for doughmination.win

set -e  # Exit on any error

echo "Setting up nginx configuration for doughmination.win..."

# Copy nginx configuration file
echo "Copying nginx configuration..."
sudo cp ./nginx.setup /etc/nginx/sites-available/doughmination.win

# Get SSL certificate with certbot
echo "Obtaining SSL certificate..."
sudo certbot certonly --nginx -d doughmination.win -d www.doughmination.win

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

# Restart nginx service
echo "Restarting nginx..."
sudo systemctl restart nginx

echo "Setup complete!"
