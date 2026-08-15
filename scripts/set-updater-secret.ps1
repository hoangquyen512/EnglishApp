# One-time: upload the local Tauri signing private key as a GitHub Actions secret.
# Requires GitHub CLI (`gh`) logged in with repo admin access.
#
#   powershell -ExecutionPolicy Bypass -File scripts/set-updater-secret.ps1

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$KeyPath = Join-Path $RepoRoot ".secrets\yume.key"

if (-not (Test-Path $KeyPath)) {
  throw "Missing $KeyPath — generate with: pnpm tauri signer generate -w .secrets/yume.key"
}

$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
  throw "Install GitHub CLI from https://cli.github.com/ then run: gh auth login"
}

Push-Location $RepoRoot
try {
  Write-Host "Uploading TAURI_SIGNING_PRIVATE_KEY to repo secrets..."
  Get-Content $KeyPath -Raw | & gh secret set TAURI_SIGNING_PRIVATE_KEY --repo hoangquyen512/EnglishApp
  # Empty password key — set blank secret so the env var exists
  "" | & gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo hoangquyen512/EnglishApp
  Write-Host "Done. Re-run the Build Windows desktop workflow."
}
finally {
  Pop-Location
}
