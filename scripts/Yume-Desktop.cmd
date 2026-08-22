@echo off
REM Latest source in the browser (no admin / no Visual Studio).
REM Optional: -Nightly to download GitHub portable yume.exe
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0yume-desktop.ps1" %*
