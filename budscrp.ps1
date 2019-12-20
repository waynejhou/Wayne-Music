$clientOnly = $args[0]
$clientOnly = $clientOnly -eq "-c"


#  rm last build
if (-not $clientOnly) {
    Write-Host "rm dist"
    Remove-Item ./dist -Force -recurse 
}
Write-Host "rm www/dist"
Remove-Item ./www/dist -Force -recurse 

#  copy d.ts to let tsc known the type
#Write-Host "cp shared renderer"
#Copy-Item ./ipcShared/* ./ipcRenderer/resources/app.asar/www/dist/

#  tsc main
if (-not $clientOnly) {
    Write-Host "tsc main"
    tsc -p ./ipcMain
}
#  tsc renderer
#Write-Host "tsc renderer"
#tsc -p ./ipcRenderer
Write-Host "Copy Renderer js to dist"
Copy-Item ./ipcRenderer  -Destination ./www/dist  -force -recurse 

# copy renderer code for debug exectuion
# When debug executting, "require" provide by electron in renderer think path start from system current path
#Copy-Item ./www/dist/* ./resources/app.asar/www/dist/



#Write-Host "patch __esModule"
#foreach ($item in Get-ChildItem '.\www\dist\' | Where-Object Name -match '^*.js$') {
    #(Get-Content $item.FullName) -notmatch '__esModule' | Set-Content $item.FullName
#}


