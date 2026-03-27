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

## Testing

### Functional And Input Validation Tests

The backend test suite now covers:

- Session creation and round loading
- Submission of all three mini-challenges across the full activity flow
- Final report generation and score aggregation
- Rejection of invalid age bands
- Rejection of malformed event payloads such as missing session identifiers, negative latency values, and invalid task component labels
- Prevention of session completion before all three mini-challenges are submitted

Run the backend tests with:

```powershell
cd backend
python manage.py test
```

### Performance / Load Testing

A Locust scenario is included at `backend/locustfile.py`. It simulates classroom-scale usage by repeatedly:

1. Creating a session
2. Loading each round
3. Submitting the three mini-challenge events
4. Generating the final report

Install the development dependencies and run Locust with:

```powershell
cd backend
python -m pip install -r requirements.txt
locust -f locustfile.py --host=http://localhost:8000
```
