# FiberTrace Mobile - Build & Deploy Guide

## Prerequisites
- Expo Account (create at https://expo.dev if needed)
- Node.js 18+ installed locally
- EAS CLI installed: `npm install -g eas-cli`

## Step 1: Build APK Using EAS

### Option A: Cloud Build (Recommended - No Local Setup)
```bash
# Login to your Expo account
eas login

# Build APK in Expo's cloud infrastructure
eas build --platform android --profile production

# Download APK from Expo dashboard at https://expo.dev
```

### Option B: Local Build (Requires Android SDK)
```bash
# Build locally on your machine
eas build --platform android --profile production --local

# APK will be generated in current directory
```

## Step 2: Install on Android Device

### Via ADB (Requires Android SDK)
```bash
adb install -r fibertrace-1.0.0.apk
```

### Via File Transfer
1. Copy APK to Android device
2. Open file manager and tap the APK
3. Follow installation prompts

## Step 3: Test Application

### Test Account
- **Email**: admin@fibertrace.app
- **Password**: admin123456

### Features to Test
- ✅ Login/Registration/Password Recovery
- ✅ 5 Hub Navigation (tap tabs within each hub)
- ✅ Offline functionality (disable internet and navigate)
- ✅ Data persistence (close and reopen app)
- ✅ GPS tracking (if device has GPS)
- ✅ Bluetooth scanning (on supported devices)

## Backend Server (Optional for Full Testing)

To test with real backend:

```bash
cd backend
npm install
createdb fibertrace
psql fibertrace < schema.sql
npm start
# Server runs on http://localhost:5001
```

Then update `src/lib/authStorage.ts`:
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_BACKEND_IP:8000';
```

## Build Troubleshooting

### Build Fails with "Project not configured"
```bash
eas logout
eas login
eas build --platform android --profile production
```

### Build Hangs or Times Out
```bash
eas build --platform android --profile production --clear-cache
```

### APK Installation Fails
- Verify Android version 8.0+ on device
- Check device has ~100MB free space
- Try: `adb install -r fibertrace-1.0.0.apk`

## App Specifications

| Property | Value |
|----------|-------|
| Package | com.fibertrace.app |
| Version | 1.0.0 |
| Min SDK | 24 (Android 7.0) |
| Build Type | APK (Release) |
| Size | ~80-100 MB |

## Distribution Options

1. **Direct APK Share** - Email APK file to users
2. **Google Play Store** - Submit to Play Store for broader distribution
3. **Enterprise MDM** - Deploy via mobile device management
4. **QR Code** - Host APK and share QR code link

## Next Steps

1. Build APK: `eas build --platform android`
2. Test on device with test credentials
3. Gather feedback from testers
4. Make adjustments and rebuild as needed
5. Deploy to Google Play Store or distribute directly

---

**Questions?** Check Expo documentation at https://docs.expo.dev
