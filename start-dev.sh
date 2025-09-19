#!/bin/bash

echo "Starting AI Content Repurposing Tool Development Environment..."
echo

echo "Starting backend server..."
cd server && npm run dev &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend development server..."
cd ../client && npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Clean up processes
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null
