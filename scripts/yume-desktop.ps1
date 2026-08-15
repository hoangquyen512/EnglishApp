# Yume desktop — fetch latest nightly from GitHub Releases and launch.
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/yume-desktop.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/yume-desktop.ps1 -Install
#
# - Default: download portable yume.exe into %LOCALAPPDATA%\Yume and run it
# - -Install: download NSIS current-user installer and run it (no admin)

param(
  [switch]$Install,
  [switch]$NoLaunch
)

$ErrorActionPreference = "Stop"
$Repo = "hoangquyen512/EnglishApp"
$Tag = "desktop-nightly"
$InstallDir = Join-Path $env:LOCALAPPDATA "Yume"
$BaseUrl = "https://github.com/$Repo/releases/download/$Tag"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

function Get-Remote([string]$Name, [string]$Dest) {
  $url = "$BaseUrl/$Name"
  Write-Host "Downloading $url ..."
  Invoke-WebRequest -Uri $url -OutFile $Dest -UseBasicParsing
}

if ($Install) {
  $setup = Join-Path $InstallDir "Yume-setup.exe"
  Get-Remote "Yume-setup.exe" $setup
  Write-Host "Running per-user installer..."
  Start-Process -FilePath $setup -Wait
  $exe = Join-Path $InstallDir "yume.exe"
  if (-not (Test-Path $exe)) {
    Write-Host "Installer finished. If Yume is not at $exe, launch it from the Start menu."
    exit 0
  }
} else {
  $exe = Join-Path $InstallDir "yume.exe"
  Get-Remote "yume.exe" $exe
}

Write-Host "Ready: $exe"
if (-not $NoLaunch) {
  # Stop older instances from the same install dir so the new binary can replace cleanly next time
  Get-Process -Name "yume" -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and $_.Path.StartsWith($InstallDir, [System.StringComparison]::OrdinalIgnoreCase) } |
    ForEach-Object {
      Write-Host "Stopping old PID $($_.Id)"
      Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
  Start-Sleep -Milliseconds 400
  Start-Process -FilePath $exe
}
