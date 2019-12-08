$clientOnly = $args[0]
$clientOnly = $clientOnly -eq "-c"

if (-not $clientOnly) {
    Write-Host "rm dist"
    Remove-Item ./dist/*
}
Write-Host "rm www/dist"
Remove-Item ./www/dist/*

if (-not $clientOnly) {
    Write-Host "cp shared main"
    Copy-Item ./ipcShared/* ./ipcMain
}
Write-Host "cp shared renderer"
Copy-Item ./ipcShared/* ./ipcRenderer

if (-not $clientOnly) {
    Write-Host "tsc main"
    tsc -p ./ipcMain
}
Write-Host "tsc renderer"
tsc -p ./ipcRenderer

Write-Host "patch __esModule"
foreach ($item in Get-ChildItem '.\www\dist\' | Where-Object Name -match '^*.js$') {
    (Get-Content $item.FullName) -notmatch '__esModule' | Set-Content $item.FullName
}


