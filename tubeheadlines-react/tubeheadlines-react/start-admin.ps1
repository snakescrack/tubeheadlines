# Change to the admin directory
Set-Location -Path "$PSScriptRoot\tubeheadlines-admin"

Write-Host "Starting TubeHeadlines Admin Interface..." -ForegroundColor Green
Write-Host "Once the server starts, look for the URL in the output (usually http://localhost:5173)" -ForegroundColor Yellow

# Run npm dev command
npm run dev

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nPress any key to exit..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
