# Ask for Firebase project ID
$projectId = Read-Host -Prompt "Enter your Firebase project ID"

# Update the script with the project ID
$scriptContent = Get-Content -Path "$PSScriptRoot\fix-all-dates.js" -Raw
$updatedContent = $scriptContent -replace "YOUR_PROJECT_ID", $projectId
Set-Content -Path "$PSScriptRoot\fix-all-dates.js" -Value $updatedContent

# Run the script
Write-Host "Running comprehensive date fix script..." -ForegroundColor Cyan
node $PSScriptRoot\fix-all-dates.js

Write-Host "Press any key to exit..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
