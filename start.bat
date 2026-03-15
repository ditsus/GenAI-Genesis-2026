@echo off
REM Start REEL stack: FastAPI backend, Next.js frontend, Railtracks dashboard.
REM Run from repo root: start.bat

cd /d "%~dp0"

start "REEL Backend" cmd /k "cd /d %~dp0\backend && uvicorn main:app --host 0.0.0.0 --port 8000"
timeout /t 2 /nobreak >nul

start "REEL Frontend" cmd /k "cd /d %~dp0\frontend && npm run dev"
timeout /t 2 /nobreak >nul

start "Railtracks Dashboard" cmd /k "cd /d %~dp0 && railtracks viz"
REM Some installs use: railtracks dashboard

echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Railtracks dashboard started in new window.
