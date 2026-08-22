@echo off
REM Shim so Tauri's beforeDevCommand (`pnpm dev`) works without a global pnpm.
setlocal
if /I "%~1"=="dev" (
  call vite.cmd
  exit /b %ERRORLEVEL%
)
if /I "%~1"=="build" (
  call tsc.cmd --noEmit
  if errorlevel 1 exit /b %ERRORLEVEL%
  call vite.cmd build
  exit /b %ERRORLEVEL%
)
if /I "%~1"=="tauri" (
  call tauri.cmd %2 %3 %4 %5 %6 %7 %8 %9
  exit /b %ERRORLEVEL%
)
echo This local pnpm shim only supports: pnpm dev ^| pnpm build ^| pnpm tauri ...
exit /b 1
