param (
    [Parameter()]
    [ValidateSet('local', 'production')]
    [string]
    $env = "production"
)
Write-Host -ForegroundColor DarkGray "setting build env to $env"
# keep track of the original env to make sure we don't lose it after build
$configProps = Get-Content ./assets/config.json | ConvertFrom-json -AsHashtable
$originalEnv = $configProps.env
$configProps.env = $env
$configProps | ConvertTo-Json > ./assets/config.json
Write-Host -Foreground DarkGray 'Running Expo Prebuild'
npx expo prebuild -p android
Write-Host -Foreground Green 'Success!'
Write-Host -Foreground DarkGray 'Running Android build...'
Set-Location android
./gradlew app:assembleRelease
Write-Host -ForegroundColor DarkGray "restoring env back to $originalEnv"
$configProps.env = $originalEnv
$configProps | ConvertTo-Json > ../assets/config.json
# TODO check for build result
Set-Location app/build/outputs/apk/release
Write-Host -Foreground Green 'Success! Moving to output directory. Run `adb install ./app-release.apk` to continue'
