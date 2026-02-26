#!/usr/bin/env bash

set -euo pipefail

SKIP_INSTALL=false
if [[ "${1:-}" == "--skip-install" ]]; then
    SKIP_INSTALL=true
fi

require_command() {
    local name="$1"
    if ! command -v "$name" >/dev/null 2>&1; then
        echo "Required command '$name' was not found in PATH."
        exit 1
    fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${REPO_ROOT}/backend"
FRONTEND_DIR="${REPO_ROOT}/frontend"
VENV_DIR="${BACKEND_DIR}/.venv"
VENV_PYTHON="${VENV_DIR}/bin/python"

require_command "python3"
require_command "pnpm"

if [[ ! -d "${BACKEND_DIR}" ]]; then
    echo "Backend directory not found: ${BACKEND_DIR}"
    exit 1
fi

if [[ ! -d "${FRONTEND_DIR}" ]]; then
    echo "Frontend directory not found: ${FRONTEND_DIR}"
    exit 1
fi

if [[ ! -x "${VENV_PYTHON}" ]]; then
    echo "Creating backend virtual environment..."
    (
        cd "${BACKEND_DIR}"
        python3 -m venv .venv
    )
fi

if [[ "${SKIP_INSTALL}" == "false" ]]; then
    echo "Installing backend dependencies..."
    "${VENV_PYTHON}" -m pip install --upgrade pip
    "${VENV_PYTHON}" -m pip install -r "${BACKEND_DIR}/requirements.txt"

    echo "Installing frontend dependencies..."
    (
        cd "${FRONTEND_DIR}"
        pnpm install
    )
else
    echo "Skipping dependency installation."
fi

echo "Applying database migrations..."
(
    cd "${BACKEND_DIR}"
    "${VENV_PYTHON}" manage.py migrate
)

cleanup() {
    echo ""
    echo "Stopping servers..."
    [[ -n "${BACKEND_PID:-}" ]] && kill "${BACKEND_PID}" >/dev/null 2>&1 || true
    [[ -n "${FRONTEND_PID:-}" ]] && kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

echo "Starting backend on http://localhost:8000 ..."
(
    cd "${BACKEND_DIR}"
    "${VENV_PYTHON}" manage.py runserver 8000
) &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:3000 ..."
(
    cd "${FRONTEND_DIR}"
    pnpm dev
) &
FRONTEND_PID=$!

echo "Done. Waiting for both servers to initialize..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"

wait "${BACKEND_PID}" "${FRONTEND_PID}"
