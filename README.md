# EarlyRead Quest

Web-based game that detects early signs of dyslexia.

## Tech Stack

- Frontend: Next.js (React + TypeScript)
- Backend: Django + SQLite

## One-Command Local Startup (Windows)

Use the PowerShell script below to install dependencies, run migrations, and start both backend and frontend.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-up.ps1
```

This will:

1. Create a backend virtual environment at `backend/.venv` (if missing)
2. Install backend dependencies from `backend/requirements.txt`
3. Install frontend dependencies with `pnpm install`
4. Run backend migrations
5. Start:
   - Backend at `http://localhost:8000`
   - Frontend at `http://localhost:3000`

## Faster Daily Startup

If dependencies are already installed, skip installation:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev-up.ps1 -SkipInstall
```

## Prerequisites

- Python 3.10+ available in `PATH`
- Node.js + `pnpm` available in `PATH`

## Backend API Base URL

Frontend uses:

- `http://localhost:8000` by default

If needed, set:

```powershell
$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"
```

pnpm dev
python manage.py runserver 8000