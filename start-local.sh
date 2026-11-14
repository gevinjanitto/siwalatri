#!/usr/bin/env bash
# Menjalankan Siwalatri Terpadu secara lokal: backend FastAPI (port 8001) + frontend React (port 3000).
cd "$(dirname "$0")"
VBIN="bin"; case "$(uname -s 2>/dev/null)" in MINGW*|MSYS*|CYGWIN*) VBIN="Scripts";; esac
trap 'kill 0' INT TERM EXIT
echo "==> Backend : http://localhost:8001/api/"
(cd backend && ".venv/$VBIN/python" -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload) &
echo "==> Frontend: http://localhost:3000"
(cd frontend && BROWSER=none yarn start) &
wait
