@echo off
echo Restarting Arca Vision Nexus Backend...

echo Stopping processes using port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    if not "%%a"=="0" (
        echo Killing process %%a
        taskkill /f /pid %%a 2>nul
    )
)

echo Waiting for port to be free...
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd backend
start "Arca Backend" cmd /k "npm run dev"

echo Backend restarted!
echo Check the backend window for any errors.
echo Backend should be available at http://localhost:3001

pause