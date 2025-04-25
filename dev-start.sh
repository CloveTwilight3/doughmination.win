#!/bin/bash

# Stop script if any command fails
set -e

# Check if the user has tmux installed
if ! command -v tmux &> /dev/null; then
    echo "tmux is not installed. Running services in separate terminals."
    echo "Install tmux for a better development experience."
    echo ""
    echo "Starting services:"
    
    # Start services in background
    echo "Starting backend service..."
    cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    
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
    tmux send-keys -t doughmination "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" C-m
    
    # Create a second window and start frontend
    tmux new-window -t doughmination
    tmux send-keys -t doughmination:1 "cd frontend && npm run dev" C-m
    
    # Return to the first window and attach to the session
    tmux select-window -t doughmination:0
    tmux attach-session -t doughmination
    
    # When tmux session ends, clean up
    tmux kill-session -t doughmination
fi
