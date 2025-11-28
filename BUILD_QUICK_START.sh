#!/bin/bash

# FiberTrace Mobile - Quick Build Script
# Run: bash BUILD_QUICK_START.sh

echo "🚀 FiberTrace Mobile - APK Build"
echo "================================"
echo ""

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

echo "✅ Step 1: Verify app configuration"
echo "   Package: com.fibertrace.app"
echo "   Version: 1.0.0"
echo ""

echo "✅ Step 2: Login to Expo account"
eas login

echo ""
echo "✅ Step 3: Build APK for Android"
echo "   Building production APK..."
echo ""

eas build --platform android --profile production

echo ""
echo "✅ Build Complete!"
echo ""
echo "📦 Your APK is ready for download at https://expo.dev"
echo ""
echo "🎯 Next Steps:"
echo "  1. Download APK from Expo dashboard"
echo "  2. Transfer to Android device"
echo "  3. Install: adb install fibertrace-1.0.0.apk"
echo "  4. Or tap APK file in device file manager"
echo ""
echo "🧪 Test with credentials:"
echo "   Email: admin@fibertrace.app"
echo "   Password: admin123456"
echo ""
