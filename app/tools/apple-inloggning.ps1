# Apple-inloggningen för det som saknar officiellt API (New App, App Privacy) – körs av Carl i en terminal, en gång
# i månaden ungefär (när Apple släpper sessionen). Lösenordet och tvåstegskoden skrivs bara här, i din terminal;
# inget sparas utom sessionen, som fastlane lägger i %USERPROFILE%\.fastlane\spaceship\<apple-id>\cookie.
#   PowerShell:  & D:\GamesProjects\mobilfabriken\app\tools\apple-inloggning.ps1
$env:Path = "C:\Ruby33-x64\bin;$env:Path"
$fil = Join-Path $env:USERPROFILE '.secrets\apple-id.txt'
$id = if (Test-Path $fil) { (Get-Content $fil -Raw).Trim() } else { '' }
$svar = Read-Host "Apple-ID (e-post) for App Store Connect [$id]"
if ($svar) { $id = $svar.Trim() }
if (-not $id) { Write-Host 'Inget Apple-ID angivet.'; exit 1 }
Set-Content -Path $fil -Value $id -NoNewline
Write-Host "Loggar in som $id - skriv ditt losenord och sedan koden fran din iPhone."
fastlane spaceauth -u $id
if ($LASTEXITCODE -eq 0) { Write-Host "`nKlart. Sessionen ligger i $env:USERPROFILE\.fastlane\spaceship\$id\ - sag till Claude att det ar gjort." }
else { Write-Host "`nInloggningen gick inte igenom. Kor skriptet igen." }
