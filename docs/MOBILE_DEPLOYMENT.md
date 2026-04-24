# Spektrum TCG Mobile Deployment Guide

This guide covers deploying Spektrum TCG to iOS, Android, and Solana Seeker devices.

## Architecture Overview

The mobile app uses **Capacitor** to wrap the existing React/Three.js web application into native iOS and Android apps. This approach allows:
- Single codebase for web and mobile
- Native device features (haptics, status bar, deep links)
- App store distribution
- Phantom wallet integration via deep links

## Prerequisites

### For iOS Development
- macOS with Xcode 15+
- Apple Developer account ($99/year for App Store distribution)
- CocoaPods installed (`sudo gem install cocoapods`)

### For Android Development
- Android Studio Arctic Fox or later
- Android SDK 33+ (Android 13)
- For Solana Seeker: Physical device recommended

## Quick Start

### 1. Build the Web App
```bash
npm run build
```

### 2. Initialize Capacitor (First Time Only)
```bash
npx cap init "Spektrum TCG" com.spektrum.tcg --web-dir dist/public
```

### 3. Add Native Platforms
```bash
npx cap add ios
npx cap add android
```

### 4. Sync and Open
```bash
npx cap sync
npx cap open ios      # Opens Xcode
npx cap open android  # Opens Android Studio
```

Or use the convenience script:
```bash
./scripts/mobile-build.sh ios     # iOS only
./scripts/mobile-build.sh android # Android only
./scripts/mobile-build.sh both    # Both platforms
```

## Platform-Specific Configuration

### iOS Configuration

1. Open `ios/App/App.xcworkspace` in Xcode
2. Update `Info.plist` with template values from `ios/App/App/Info.plist.template`
3. Configure signing with your Apple Developer account
4. Add app icons to `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

**URL Scheme for Phantom:**
The app uses `spektrum://` scheme for wallet callbacks. Configured in Info.plist.

### Android Configuration

1. Open `android/` folder in Android Studio
2. Update `AndroidManifest.xml` with template values from the template file
3. Configure signing for release builds
4. Add app icons to `android/app/src/main/res/mipmap-*/`

**Deep Links for Phantom:**
The app handles `spektrum://` and `https://spektrum.app/callback` for wallet callbacks.

### Solana Seeker / Saga

Solana Seeker is an Android device, so use the Android build:

1. Connect Seeker device via USB
2. Enable USB debugging in developer options
3. Run from Android Studio or:
```bash
npx cap run android
```

**Seeker-Specific Features:**
- Native Phantom wallet integration
- Seed Vault for secure key storage
- Hardware wallet support

## Wallet Integration

### Phantom Mobile Deep Links

The app uses Phantom's deep link protocol for mobile wallet connections:

1. User taps "Connect Wallet"
2. App opens Phantom via `phantom://` URL scheme
3. User approves connection in Phantom
4. Phantom redirects back to `spektrum://` with encrypted payload
5. App decrypts response and stores public key

**Connection Flow:**
```
App → phantom://v1/connect?... → Phantom App → spektrum://callback?... → App
```

### Native App Context

The Capacitor integration handles:
- URL scheme registration
- Deep link callbacks
- App state management
- Secure storage for session data

## Performance Optimizations

### Three.js Mobile Settings

The app automatically adjusts for mobile:
- Lower pixel ratio on mobile devices
- Reduced shadow quality
- Simplified post-processing
- Touch-optimized controls

### Asset Loading

- Progressive texture loading
- Compressed 3D models
- Lazy loading for non-critical assets
- Service worker caching

## Testing

### iOS Simulator
```bash
npx cap run ios --target "iPhone 15 Pro"
```

### Android Emulator
```bash
npx cap run android --target "Pixel_7_API_33"
```

### Physical Devices
Enable developer mode and connect via USB, then run from IDE.

## App Store Submission

### iOS App Store

1. Archive build in Xcode (Product → Archive)
2. Upload to App Store Connect
3. Complete app metadata and screenshots
4. Submit for review

**Required Screenshots:**
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1242 x 2688)
- iPad Pro 12.9" (2048 x 2732)

### Google Play Store

1. Generate signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

**Required Graphics:**
- Feature graphic (1024 x 500)
- Screenshots (min 2, recommended 8)
- App icon (512 x 512)

## Troubleshooting

### Common Issues

**Wallet Connection Fails:**
- Ensure Phantom app is installed
- Check URL scheme configuration
- Verify CSP allows phantom.app

**3D Rendering Issues:**
- Check WebGL support
- Reduce pixel ratio for older devices
- Disable post-processing effects

**Build Failures:**
- Run `npx cap sync` after changes
- Check Xcode/Android Studio for specific errors
- Verify all native dependencies installed

### Debug Logging

The app includes mobile debug logging. Access via:
```javascript
getMobileErrors()    // View captured errors
clearMobileErrors()  // Clear error log
```

## File Structure

```
├── capacitor.config.ts          # Capacitor configuration
├── ios/                         # iOS native project (generated)
│   └── App/
│       └── App/
│           └── Info.plist.template
├── android/                     # Android native project (generated)
│   └── app/
│       └── src/main/
│           └── AndroidManifest.xml.template
├── client/src/
│   ├── lib/capacitor.ts         # Capacitor utilities
│   └── hooks/useMobile.ts       # Mobile-specific hooks
└── scripts/
    └── mobile-build.sh          # Build automation script
```

## Version History

- **v1.0.0** - Initial mobile release with Capacitor integration
- Supports iOS 14+, Android 10+, Solana Seeker

---

*Last Updated: February 2026*
