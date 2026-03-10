# StreetLuxCity Mobile App Setup

This guide explains how to build and deploy the StreetLuxCity app for mobile devices using Capacitor.

## Prerequisites

- Node.js (v18 or higher)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Capacitor CLI tools

## Installation

1. Install Capacitor dependencies:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios @capacitor/network --legacy-peer-deps
```

2. Initialize Capacitor:
```bash
npx cap init "StreetLuxCity Mobile" com.streetluxcity.mobile
```

## Building for Mobile

### Quick Build
```bash
npm run build:mobile
```

This script will:
1. Build the Next.js app
2. Export static files
3. Add Capacitor platforms
4. Sync files to Capacitor

### Manual Steps

1. **Build the web app:**
```bash
npm run build
npm run export
```

2. **Add platforms:**
```bash
npm run cap:android
npm run cap:ios  # macOS only
```

3. **Sync files:**
```bash
npx cap sync
```

## Running on Devices

### Android
```bash
# Open Android Studio
npm run cap:open:android

# Or run directly
npx cap run android
```

### iOS
```bash
# Open Xcode
npm run cap:open:ios

# Or run directly
npx cap run ios
```

## Features

### Offline Support
- Service Worker caches essential assets
- Network status monitoring
- Offline indicator when disconnected
- Graceful degradation for limited functionality

### Mobile Optimizations
- PWA manifest for app-like experience
- Touch-friendly interface
- Mobile-specific viewport settings
- Capacitor plugins for native features

### Capacitor Plugins
- Network status monitoring
- Splash screen management
- Push notifications (ready for implementation)
- File system access (ready for implementation)

## Development Workflow

1. Make changes to the web app
2. Test in browser with `npm run dev`
3. Build for mobile: `npm run build:mobile`
4. Test on device/emulator

## Troubleshooting

### Build Issues
- Ensure Android Studio/Xcode is properly installed
- Check that JDK is configured for Android development
- Verify iOS development certificates for iOS builds

### Capacitor Issues
- Run `npx cap sync` after making web changes
- Check platform-specific requirements in Capacitor docs

### Offline Issues
- Verify service worker is registered
- Check browser dev tools for cache issues
- Ensure manifest.json is accessible

## Next Steps

1. **Add more Capacitor plugins** as needed:
   - Camera
   - Geolocation
   - Biometric authentication
   - Deep linking

2. **Optimize for mobile:**
   - Add mobile-specific styling
   - Implement touch gestures
   - Optimize image loading

3. **Enhance offline experience:**
   - Cache API responses
   - Implement background sync
   - Add offline data storage

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Static Export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)