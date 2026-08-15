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
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo = "hoangquyen512/EnglishApp"
$Tag = "desktop-nightly"
$InstallDir = Join-Path $env:LOCALAPPDATA "Yume"
$BaseUrl = "https://github.com/$Repo/releases/download/$Tag"
$ApiRelease = "https://api.github.com/repos/$Repo/releases/tags/$Tag"

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

function Test-NightlyRelease {
  try {
    $headers = @{
      "User-Agent" = "yume-desktop-script"
      "Accept" = "application/vnd.github+json"
    }
    $rel = Invoke-RestMethod -Uri $ApiRelease -Headers $headers
    if (-not $rel.assets -or $rel.assets.Count -eq 0) {
      throw "Release '$Tag' exists but has no assets yet."
    }
    Write-Host "Found release '$Tag' with $($rel.assets.Count) asset(s)."
    return $rel
  } catch {
    Write-Host ""
    Write-Host "Nightly release not ready yet." -ForegroundColor Yellow
    Write-Host "  Expected: $BaseUrl/yume.exe"
    Write-Host "  Check CI: https://github.com/$Repo/actions/workflows/build-windows.yml"
    Write-Host "  Release:  https://github.com/$Repo/releases/tag/$Tag"
    Write-Host ""
    Write-Host "Detail: $($_.Exception.Message)" -ForegroundColor DarkYellow
    exit 1
  }
}

function Get-Remote([string]$Name, [string]$Dest) {
  $url = "$BaseUrl/$Name"
  Write-Host "Downloading $url ..."

  # Prefer curl.exe (more reliable than Invoke-WebRequest on corporate networks)
  $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
  if ($curl) {
    & curl.exe -fL --retry 3 --retry-delay 2 --connect-timeout 30 -o $Dest $url
    if ($LASTEXITCODE -ne 0) {
      throw "curl failed (exit $LASTEXITCODE) downloading $url"
    }
  } else {
    $attempt = 0
    while ($true) {
      $attempt++
      try {
        Invoke-WebRequest -Uri $url -OutFile $Dest -UseBasicParsing -TimeoutSec 120
        break
      } catch {
        if ($attempt -ge 3) { throw }
        Write-Host "Retry $attempt after error: $($_.Exception.Message)"
        Start-Sleep -Seconds (2 * $attempt)
      }
    }
  }

  if (-not (Test-Path $Dest) -or (Get-Item $Dest).Length -lt 1000) {
    throw "Download looks empty/corrupt: $Dest"
  }
  Write-Host ("Saved {0:N1} MB" -f ((Get-Item $Dest).Length / 1MB))
}

$null = Test-NightlyRelease

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
  Get-Process -Name "yume" -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and $_.Path.StartsWith($InstallDir, [System.StringComparison]::OrdinalIgnoreCase) } |
    ForEach-Object {
      Write-Host "Stopping old PID $($_.Id)"
      Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
  Start-Sleep -Milliseconds 400
  Start-Process -FilePath $exe
}
