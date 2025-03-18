# LittleWeather PWA Guide

This guide explains how to use and customize the Progressive Web App (PWA) features of LittleWeather.

## What is a PWA?

A Progressive Web App (PWA) is a type of application that combines the best features of web and mobile apps. PWAs provide:

- **Installability**: Users can add the app to their home screen, making it easily accessible
- **Offline functionality**: The app can work without an internet connection
- **App-like experience**: The app looks and feels like a native application

## LittleWeather PWA Features

LittleWeather has been set up as a PWA with the following features:

1. **Installable**: Users can add LittleWeather to their home screen on mobile devices or desktop
2. **Offline support**: Weather data is cached and available even without internet connection
3. **Responsive design**: Works well on any device size
4. **App icon**: Custom icons for the app when installed

## How to Install LittleWeather on Devices

### On Android:

1. Open Chrome and navigate to your LittleWeather app URL
2. Tap the menu button (three dots in the upper right)
3. Select "Add to Home Screen"
4. Confirm by tapping "Add"

### On iOS:

1. Open Safari and navigate to your LittleWeather app URL
2. Tap the Share button (bottom center)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in the upper right corner

### On Desktop (Chrome):

1. Navigate to your LittleWeather app URL
2. Look for the install icon in the address bar (+ icon)
3. Click "Install" when prompted

## Customizing the PWA

### App Icons

LittleWeather includes a simple icon generator to create custom icons:

1. Open `generate-icons.html` in your web browser
2. Click "Generate All Icons" to preview the weather icons
3. Download each icon size using the buttons
4. Place the downloaded icons in the `public/icons` directory

### Manifest Settings

You can customize the PWA settings by editing `public/manifest.json`:

- `name`: The full name of the app
- `short_name`: Name used on home screens
- `description`: App description
- `theme_color`: Color of the browser UI when app is open
- `background_color`: Background color when the app is loading
- `display`: How the app should be displayed (standalone, fullscreen, etc.)

### Service Worker

The service worker (`public/sw.js`) controls offline functionality and caching. You can modify it to:

- Add more files to the cache
- Change caching strategies
- Implement push notifications (requires additional setup)

## Setup and Management

The PWA setup is automated through:

```
npm run setup-pwa
```

This command:
- Creates the necessary directories
- Generates the manifest file
- Creates the service worker
- Creates placeholder icons (if needed)

## Testing Your PWA

To test if your PWA is correctly configured:

1. Open Chrome DevTools (F12 or right-click > Inspect)
2. Go to the "Application" tab
3. Select "Manifest" to check your app manifest
4. Select "Service Workers" to check your service worker status
5. Try using the app in offline mode (DevTools > Network > Offline)

## Troubleshooting

If your PWA isn't working correctly:

1. Check that the manifest.json and sw.js files are being served correctly
2. Verify that the service worker is registered (check the console for errors)
3. Make sure your app is served over HTTPS when deployed (required for PWAs)
4. Check that all required icons are available

For more information on PWAs, visit [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps/). 