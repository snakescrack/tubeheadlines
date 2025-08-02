# Load environment variables from .env file in the tubeheadlines-react directory
$envFile = "$PSScriptRoot\tubeheadlines-react\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "Loaded environment variables from $envFile" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found at $envFile" -ForegroundColor Yellow
}

# Run the fix script
Write-Host "Running database fix script..." -ForegroundColor Cyan
node $PSScriptRoot\fix-dates.js

Write-Host "Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
