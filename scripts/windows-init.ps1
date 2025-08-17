# Windows initialization helper (run from repo root)
Set-Location apps/client-expo
npx expo prebuild --platform windows
npx react-native-windows-init --overwrite --language cpp
Write-Host "Windows project initialized under apps/client-expo/windows"
