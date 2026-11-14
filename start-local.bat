@echo off
REM Menjalankan Siwalatri Terpadu secara lokal (Windows CMD)
cd /d "%~dp0"
start "Siwalatri Backend" cmd /k "cd backend && .venv\Scripts\python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
start "Siwalatri Frontend" cmd /k "cd frontend && yarn start"
echo Backend : http://localhost:8001/api/
echo Frontend: http://localhost:3000
