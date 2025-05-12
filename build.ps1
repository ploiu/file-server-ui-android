Write-Host -Foreground DarkGray 'Running Expo Prebuild'
npx expo prebuild -p android
Write-Host -Foreground Green 'Success!'
Write-Host -Foreground DarkGray 'Running Android build...'
cd android
./gradlew app:assembleRelease
cd app/build/outputs/apk/release
Write-Host -Foreground Green 'Success! Moving to output directory. Run `adb install ./app-release.apk` to continue'
