@echo off
rem Double-cliquer : ouvre la page des avis dans le navigateur (outils/avis_page.py).
cd /d "%~dp0"
python avis_page.py
if errorlevel 1 pause
