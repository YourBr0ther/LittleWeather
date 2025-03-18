# LittleWeather - Kids' Weather Wardrobe Helper

A fun and interactive app that helps kids decide what to wear based on the weather! LittleWeather makes getting dressed in the morning an engaging experience for children while teaching them about weather and appropriate clothing choices.

This version is designed for eInk displays but can also be hosted as a web app and accessed from any device.

## Features
- Clean, modern UI optimized for eInk displays
- Weather forecast showing today and tomorrow
- High and low temperatures with weather icons
- Weather-based clothing recommendations for each day
- Sunrise and sunset times
- Special alerts for rain or snow
- Automatic hourly weather updates
- Progressive Web App (PWA) support for install on mobile devices
- Offline functionality

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- OpenWeatherMap API key (free tier available at https://openweathermap.org/)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```
   WEATHER_API_KEY=your_api_key_here
   ZIP_CODE=your_zip_code
   COUNTRY_CODE=us
   UNIT_SYSTEM=imperial
   PORT=3000
   ```
   Alternatively, you can use latitude and longitude for more precise location:
   ```
   WEATHER_API_KEY=your_api_key_here
   LAT=40.7128
   LON=-74.0060
   UNIT_SYSTEM=imperial
   PORT=3000
   ```

### App Icons

The app includes a simple icon generator. Open `generate-icons.html` in your browser to:
1. Preview the app icons
2. Download the icons
3. Place the downloaded icons in the `public/icons` directory

### Running the App

Start the web server:
```
npm start
```

This will:
1. Generate the weather forecast
2. Start a web server on the port specified in `.env` (default: 3000)
3. Update the weather data every hour

You can then access the app at `http://localhost:3000`

To manually update the weather data, visit `http://localhost:3000/update`

### Progressive Web App

LittleWeather is designed as a Progressive Web App (PWA), which means you can:

1. Install it on your smartphone or tablet's home screen
2. Use it offline once it's been loaded
3. Get a native app-like experience

To install the PWA:
- On Android: Visit the app in Chrome and select "Add to Home Screen" from the menu
- On iOS: Visit the app in Safari and tap the share button, then "Add to Home Screen"

### Development

For development with auto-restart:
```
npm run dev
```

## Deployment

### Hosting on Heroku
1. Create a Heroku account and install the Heroku CLI
2. Log in to Heroku: `heroku login`
3. Create a new Heroku app: `heroku create your-app-name`
4. Set environment variables:
   ```
   heroku config:set WEATHER_API_KEY=your_api_key_here
   heroku config:set ZIP_CODE=your_zip_code
   heroku config:set COUNTRY_CODE=us
   heroku config:set UNIT_SYSTEM=imperial
   ```
5. Deploy: `git push heroku main`

### Hosting on other platforms
The app can be easily deployed to any platform that supports Node.js applications, such as:
- Vercel
- Netlify
- DigitalOcean
- AWS
- Google Cloud

## Customization

You can customize the clothing recommendations by modifying the temperature thresholds and clothing items in the `clothingRules` object in `forecast-new.js`.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 