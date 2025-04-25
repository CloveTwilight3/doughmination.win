#!/bin/bash

# Stop script if any command fails
set -e

# Ensure proper permissions for frontend node_modules
if [ -d "frontend/node_modules" ]; then
    echo "Fixing permissions for node_modules..."
    chmod -R u+w frontend/node_modules
    rm -rf frontend/node_modules/.vite 2>/dev/null || true
fi

# Create necessary directories and set permissions for backend
if [ ! -d "backend/avatars" ]; then
    echo "Creating avatars directory..."
    mkdir -p backend/avatars
    chmod 777 backend/avatars
fi

if [ ! -f "backend/users.json" ]; then
    echo "Creating users.json file..."
    touch backend/users.json
    chmod 666 backend/users.json
fi

# Check if the user has tmux installed
if ! command -v tmux &> /dev/null; then
    echo "tmux is not installed. Running services in separate terminals."
    echo "Install tmux for a better development experience."
    echo ""
    echo "Starting services:"
    
    # Start services in background
    echo "Starting backend service..."
    cd backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    
    # Return to the root directory before starting frontend
    cd ..
    
    echo "Starting frontend service..."
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    
    # Handle cleanup on script exit
    trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
    
    # Wait for user to press Ctrl+C
    echo "Services started. Press Ctrl+C to stop."
    wait
else
    # Using tmux for better management
    echo "Starting services with tmux..."
    
    # Create a new tmux session
    tmux new-session -d -s doughmination
    
    # Start backend in first window
    tmux send-keys -t doughmination "cd $(pwd)/backend && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" C-m
    
    # Create a second window and start frontend
    tmux new-window -t doughmination
    tmux send-keys -t doughmination:1 "cd $(pwd)/frontend && npm run dev" C-m
    
    # Return to the first window and attach to the session
    tmux select-window -t doughmination:0
    tmux attach-session -t doughmination
    
    # When tmux session ends, clean up
    tmux kill-session -t doughmination
fi
