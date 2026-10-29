Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting ICU Central Command Workspace (Backend + Frontend)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if (-not $env:DB_PASSWORD) {
    $env:DB_PASSWORD = "raja2207"
}

# Start Backend in a separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'ICU Backend [Port 8080]'; cd '$PSScriptRoot\backend'; `$env:DB_PASSWORD = '$($env:DB_PASSWORD)'; java -jar target\icu-central-command-backend-1.0.0.jar"

Start-Sleep -Seconds 4

# Start Frontend in a separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'ICU Frontend [Port 5173]'; cd '$PSScriptRoot\frontend'; npm.cmd run dev"

Write-Host ""
Write-Host "Both servers have been launched in separate windows!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend API:  http://localhost:8080/api" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
