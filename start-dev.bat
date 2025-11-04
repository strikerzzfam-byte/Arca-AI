@echo off
echo Starting Arca AI Development Environment...
echo.

echo Starting backend server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo.
pause