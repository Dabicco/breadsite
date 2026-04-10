@echo off 
echo Starting server on http://localhost:8080 
echo Press Ctrl+C to stop 
echo. 
start http://localhost:8080 
python -m http.server 8080 
if errorlevel 1 ( 
    echo ERROR: Python not found. Please install Python from https://python.org 
    pause 
) 
