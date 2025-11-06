@echo off
echo Setting up Arca Vision Nexus...

echo Installing frontend dependencies...
call npm install

echo Installing backend dependencies...
cd backend
call npm install

echo Running database migration...
call npm run migrate

echo Setup complete!
echo.
echo To start the application:
echo 1. Run "npm run dev" in the backend folder
echo 2. Run "npm run dev" in the root folder
echo.
echo Or use start-dev.bat to start both servers automatically.

pause