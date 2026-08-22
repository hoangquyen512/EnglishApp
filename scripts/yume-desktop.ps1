# Yume desktop launcher.
# Default (no admin): run the latest source in the browser via Vite.
#   .\scripts\Yume-Desktop.cmd
#
# Optional:
#   -Nightly  download portable yume.exe from GitHub Releases (old packaged app)
#   -Native   try `tauri dev` if MSVC link.exe exists (needs C++ Build Tools)
#   -Install  download NSIS current-user installer and run it

param(
  [switch]$Install,
  [switch]$NoLaunch,
  [switch]$Nightly,
  [switch]$Native,
  [switch]$OpenPreview
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$RepoRoot = Split-Path $PSScriptRoot -Parent
$Repo = "hoangquyen512/EnglishApp"
$Tag = "desktop-nightly"
$InstallDir = Join-Path $env:LOCALAPPDATA "Yume"
$BaseUrl = "https://github.com/$Repo/releases/download/$Tag"
$ApiRelease = "https://api.github.com/repos/$Repo/releases/tags/$Tag"
$PreviewUrl = "http://localhost:1420/"
$PopupUrl = "http://localhost:1420/?window=popup"

function Stop-YumeProcesses {
  $stopped = $false
  Get-Process -Name "yume" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Stopping Yume PID $($_.Id) (file is locked while running)..."
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    $stopped = $true
  }
  if ($stopped) {
    Start-Sleep -Milliseconds 800
  }
}

function Find-Node {
  $hinted = Get-Command node -ErrorAction SilentlyContinue
  $candidates = @(
    $(if ($hinted) { $hinted.Source }),
    (Join-Path ${env:ProgramFiles} "nodejs\node.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\nodejs\node.exe"),
    (Join-Path $env:LOCALAPPDATA "Programs\cursor\resources\app\resources\helpers\node.exe")
  ) | Where-Object { $_ }
  foreach ($path in $candidates) {
    if (Test-Path $path) {
      return $path
    }
  }
  return $null
}

function Find-LinkExe {
  $hinted = Get-Command link.exe -ErrorAction SilentlyContinue
  if ($hinted) {
    return $hinted.Source
  }
  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (-not (Test-Path $vswhere)) {
    return $null
  }
  $vsPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
  if (-not $vsPath) {
    return $null
  }
  $vsDevCmd = Join-Path $vsPath "Common7\Tools\VsDevCmd.bat"
  if (-not (Test-Path $vsDevCmd)) {
    return $null
  }
  cmd /c "`"$vsDevCmd`" -arch=x64 -no_logo && where link.exe" | Select-Object -Last 1
}

function Import-MsvcEnv {
  $vswhere = Join-Path ${env:ProgramFiles(x86)} "Microsoft Visual Studio\Installer\vswhere.exe"
  if (-not (Test-Path $vswhere)) {
    return
  }
  $vsPath = & $vswhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
  if (-not $vsPath) {
    return
  }
  $vsDevCmd = Join-Path $vsPath "Common7\Tools\VsDevCmd.bat"
  if (-not (Test-Path $vsDevCmd)) {
    return
  }
  cmd /c "`"$vsDevCmd`" -arch=x64 -no_logo && set" | ForEach-Object {
    if ($_ -match "^([^=]+)=(.*)$") {
      [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
  }
}

function Use-DevPath([string]$Node) {
  $nodeDir = Split-Path $Node -Parent
  $binDir = Join-Path $RepoRoot "node_modules\.bin"
  $shimDir = Join-Path $PSScriptRoot "dev-bin"
  $cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
  $env:Path = "$cargoBin;$nodeDir;$shimDir;$binDir;$env:Path"
}

function Find-ChromiumApp {
  $candidates = @(
    (Join-Path ${env:ProgramFiles} "Microsoft\Edge\Application\msedge.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Microsoft\Edge\Application\msedge.exe"),
    (Join-Path ${env:ProgramFiles} "Google\Chrome\Application\chrome.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
    (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
  )
  foreach ($path in $candidates) {
    if ($path -and (Test-Path $path)) {
      return $path
    }
  }
  return $null
}

function Start-BrowserPreviewWindows {
  # Desk (main) + floating companion (?window=popup). Prefer Chromium --app for a chrome-less pet window.
  Start-Process $PreviewUrl | Out-Null
  $chromium = Find-ChromiumApp
  if ($chromium) {
    Start-Process -FilePath $chromium -ArgumentList @(
      "--app=$PopupUrl",
      "--window-size=120,120",
      "--window-position=80,80"
    ) | Out-Null
  } else {
    Start-Process $PopupUrl | Out-Null
  }
}

function Invoke-BrowserDev([string]$Node) {
  $viteCmd = Join-Path $RepoRoot "node_modules\.bin\vite.CMD"
  if (-not (Test-Path $viteCmd)) {
    throw "Missing node_modules (vite). Open this repo after dependencies are installed."
  }
  Use-DevPath $Node
  Write-Host "No C++ compiler / no admin needed."
  Write-Host "Opening local preview:"
  Write-Host "  Desk:       $PreviewUrl"
  Write-Host "  Floating:   $PopupUrl"
  Write-Host "Log in / onboard on Desk first, then click the pet in the small window to study."
  Write-Host "Close this window to stop the preview."
  $self = Join-Path $PSScriptRoot "yume-desktop.ps1"
  Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-Command",
    "Start-Sleep -Seconds 4; & '$self' -OpenPreview"
  ) | Out-Null
  Set-Location $RepoRoot
  & $viteCmd
  if ($LASTEXITCODE -ne 0) {
    throw "vite exited with code $LASTEXITCODE"
  }
}

function Invoke-NativeDev([string]$Node) {
  $cargoBin = Join-Path $env:USERPROFILE ".cargo\bin"
  $cargo = Join-Path $cargoBin "cargo.exe"
  if (-not (Test-Path $cargo)) {
    throw "Cannot find cargo.exe at $cargo."
  }
  $tauriCmd = Join-Path $RepoRoot "node_modules\.bin\tauri.CMD"
  if (-not (Test-Path $tauriCmd)) {
    throw "Missing node_modules. Install repo dependencies and retry."
  }
  Import-MsvcEnv
  $link = Find-LinkExe
  if (-not $link) {
    Write-Host "Native build needs MSVC link.exe (admin). Falling back to browser preview."
    Invoke-BrowserDev $Node
    return
  }
  Use-DevPath $Node
  Stop-YumeProcesses
  Write-Host "Launching native tauri dev from $RepoRoot"
  Write-Host "  node : $Node"
  Write-Host "  cargo: $cargo"
  Write-Host "  link : $link"
  Set-Location $RepoRoot
  & $tauriCmd "dev"
  if ($LASTEXITCODE -ne 0) {
    throw "tauri dev exited with code $LASTEXITCODE"
  }
}

function Invoke-LocalSource {
  $node = Find-Node
  if (-not $node) {
    throw "Cannot find node.exe. Install Node.js LTS (user install), or run: .\scripts\Yume-Desktop.cmd -Nightly"
  }
  if ($Native) {
    Invoke-NativeDev $node
    return
  }
  Invoke-BrowserDev $node
}

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
  $tmp = "$Dest.download"
  Write-Host "Downloading $url ..."

  if (Test-Path $tmp) {
    Remove-Item -Force $tmp -ErrorAction SilentlyContinue
  }

  $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
  if ($curl) {
    & curl.exe -fL --retry 3 --retry-delay 2 --connect-timeout 30 -o $tmp $url
    if ($LASTEXITCODE -ne 0) {
      if (Test-Path $tmp) { Remove-Item -Force $tmp -ErrorAction SilentlyContinue }
      throw "curl failed (exit $LASTEXITCODE). If Permission denied, close Yume then retry."
    }
  } else {
    $attempt = 0
    while ($true) {
      $attempt++
      try {
        Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing -TimeoutSec 120
        break
      } catch {
        if ($attempt -ge 3) { throw }
        Write-Host "Retry $attempt after error: $($_.Exception.Message)"
        Start-Sleep -Seconds (2 * $attempt)
      }
    }
  }

  if (-not (Test-Path $tmp) -or (Get-Item $tmp).Length -lt 1000) {
    throw "Download looks empty/corrupt: $tmp"
  }

  try {
    Move-Item -Force -Path $tmp -Destination $Dest
  } catch {
    if (Test-Path $tmp) { Remove-Item -Force $tmp -ErrorAction SilentlyContinue }
    throw "Cannot replace $Dest - close Yume (tray icon too) then retry. $($_.Exception.Message)"
  }

  Write-Host ("Saved {0:N1} MB" -f ((Get-Item $Dest).Length / 1MB))
}

function Invoke-NightlyOrInstall {
  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  $null = Test-NightlyRelease
  Stop-YumeProcesses

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
    Start-Process -FilePath $exe
  }
}

if ($OpenPreview) {
  Start-BrowserPreviewWindows
  exit 0
}

if ($Nightly -or $Install) {
  Invoke-NightlyOrInstall
  exit 0
}

Invoke-LocalSource
