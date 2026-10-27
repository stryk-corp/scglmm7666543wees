@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv
  if errorlevel 1 exit /b %errorlevel%
)

".venv\Scripts\python.exe" -m pip install -r requirements.txt
if errorlevel 1 exit /b %errorlevel%

".venv\Scripts\python.exe" -m PyInstaller --noconfirm --clean --onefile --windowed ^
  --name ScholarverseDashboard-ReadOnly --specpath build --distpath dist --workpath build ^
  firestore_dashboard.py
if errorlevel 1 exit /b %errorlevel%

echo.
echo Build complete: %~dp0dist\ScholarverseDashboard-ReadOnly.exe
endlocal
