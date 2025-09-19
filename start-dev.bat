@echo off
echo Starting AI Content Repurposing Tool Development Environment...
echo.

echo Starting backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
