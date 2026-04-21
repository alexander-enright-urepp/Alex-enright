# Alex Enright iOS App

A native iOS wrapper for alexenright.com with enhanced features for App Store compliance.

## Features

### 1. In-App External Links ✅
External links now open in an in-app Safari view (SFSafariViewController) instead of leaving the app.

### 2. Splash Screen
The splash screen uses iOS's built-in launch screen system. It's configured in `Info.plist` via the `UILaunchScreen` key.

**To customize the launch screen:**
Create a `LaunchScreen.storyboard` file for full control:

1. In Xcode, File → New → File → Launch Screen
2. Design your launch screen with logo, background, etc.
3. Reference it in Info.plist under `UILaunchStoryboardName`

Currently using the minimal launch screen (blank white while app loads).

### 3. Push Notifications ✅
Daily push notifications when new posts are published.

**Setup required:**
- Apple Developer account with Push Notifications capability enabled
- Backend endpoint at `https://alexenright.com/api/push/register` to store device tokens
- APNS certificate or key configured in Apple Developer Portal

**Device Token Flow:**
1. App requests notification permission on first launch
2. If granted, app registers with APNS
3. Device token is sent to your server
4. Server stores token for sending daily push notifications

### 4. Community Photo Upload ✅
Native camera and photo library integration for community posts.

**Features:**
- Take photos with camera
- Choose from photo library
- Add descriptions before posting
- Uploads to `/api/community/post` endpoint

**Required Permissions:**
- Camera access (NSCameraUsageDescription)
- Photo Library access (NSPhotoLibraryUsageDescription)

## Backend API Requirements

Your backend needs these endpoints:

### 1. Push Notification Registration
```
POST /api/push/register
Content-Type: application/json

{
  "device_token": "...",
  "platform": "ios"
}
```

### 2. Community Post Upload
```
POST /api/community/post
Content-Type: multipart/form-data

Fields:
- description: string
- image: file (JPEG)
```

### 3. Send Push Notifications (Server-side)
Use Apple's APNS HTTP/2 API to send notifications:
```json
{
  "aps": {
    "alert": {
      "title": "New Daily Post",
      "body": "Check out today's update!"
    },
    "badge": 1,
    "sound": "default"
  },
  "post_url": "https://alexenright.com/posts/123"
}
```

## Build & Run

1. Open `AlexEnright.xcodeproj` in Xcode
2. Select your team in Signing & Capabilities
3. Enable "Push Notifications" capability
4. Enable "Background Modes" → "Remote notifications"
5. Build and run on device or simulator

## App Store Submission Notes

- Minimum iOS: 16.0
- Universal app (iPhone + iPad)
- Requires camera/photo permissions (will show dialogs on first use)
- Push notifications require proper backend setup

## Files Structure

```
AlexEnright/
├── AlexEnrightApp.swift       # App entry + Push notification setup
├── ContentView.swift          # Main UI with WebView
├── DataExtension.swift        # Helper for multipart uploads
├── Info.plist                 # Config + permissions
└── Assets.xcassets/           # App icons
```