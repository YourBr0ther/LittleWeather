require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.WEATHER_API_KEY;
const LAT = process.env.LAT || null;
const LON = process.env.LON || null;
const ZIP_CODE = process.env.ZIP_CODE;
const COUNTRY_CODE = process.env.COUNTRY_CODE || 'us';
const UNIT_SYSTEM = process.env.UNIT_SYSTEM || 'imperial'; // 'imperial' for F, 'metric' for C
const DAYS_TO_FORECAST = 2; // Number of days to forecast (today + tomorrow)

// Weather icon mapping
const weatherIcons = {
  '01d': '☀️', // clear sky day
  '01n': '🌙', // clear sky night
  '02d': '🌤️', // few clouds day
  '02n': '🌙☁️', // few clouds night
  '03d': '⛅', // scattered clouds day
  '03n': '☁️', // scattered clouds night
  '04d': '☁️', // broken clouds day
  '04n': '☁️', // broken clouds night
  '09d': '🌧️', // shower rain day
  '09n': '🌧️', // shower rain night
  '10d': '🌦️', // rain day
  '10n': '🌧️', // rain night
  '11d': '⛈️', // thunderstorm day
  '11n': '⛈️', // thunderstorm night
  '13d': '❄️', // snow day
  '13n': '❄️', // snow night
  '50d': '🌫️', // mist day
  '50n': '🌫️', // mist night
  'default': '🌡️'
};

// Clothing recommendation rules (temperatures in Fahrenheit)
const clothingRules = {
  veryHot: {
    temp: 85,
    recommendations: {
      top: 'T-shirt',
      bottom: 'Shorts',
      footwear: 'Sandals',
      outerwear: 'None',
      accessories: 'Sun hat and sunglasses'
    }
  },
  hot: {
    temp: 75,
    recommendations: {
      top: 'T-shirt',
      bottom: 'Shorts or light pants',
      footwear: 'Sneakers or sandals',
      outerwear: 'None',
      accessories: 'Sun hat'
    }
  },
  warm: {
    temp: 65,
    recommendations: {
      top: 'Long sleeve shirt',
      bottom: 'Light pants',
      footwear: 'Sneakers',
      outerwear: 'Light jacket (morning/evening)',
      accessories: 'None'
    }
  },
  cool: {
    temp: 55,
    recommendations: {
      top: 'Long sleeve shirt',
      bottom: 'Pants',
      footwear: 'Sneakers',
      outerwear: 'Light jacket',
      accessories: 'None'
    }
  },
  cold: {
    temp: 40,
    recommendations: {
      top: 'Sweater',
      bottom: 'Warm pants',
      footwear: 'Shoes or boots',
      outerwear: 'Jacket',
      accessories: 'Hat and gloves'
    }
  },
  veryCold: {
    temp: 0,
    recommendations: {
      top: 'Sweater or thermal shirt',
      bottom: 'Warm pants',
      footwear: 'Winter boots',
      outerwear: 'Heavy winter coat',
      accessories: 'Winter hat, scarf, and gloves'
    }
  }
};

function getClothingRecommendation(temperature) {
  // Find the appropriate clothing category based on temperature
  if (temperature >= clothingRules.veryHot.temp) {
    return clothingRules.veryHot.recommendations;
  } else if (temperature >= clothingRules.hot.temp) {
    return clothingRules.hot.recommendations;
  } else if (temperature >= clothingRules.warm.temp) {
    return clothingRules.warm.recommendations;
  } else if (temperature >= clothingRules.cool.temp) {
    return clothingRules.cool.recommendations;
  } else if (temperature >= clothingRules.cold.temp) {
    return clothingRules.cold.recommendations;
  } else {
    return clothingRules.veryCold.recommendations;
  }
}

// Function to format time from timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return hours + ampm;
}

// Function to format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = dayNames[date.getDay()];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  
  return {
    dayName,
    day,
    month,
    dateString: `${dayName}, ${day} ${month}`
  };
}

async function getForecastData() {
  try {
    let url;
    
    // Use coordinates if available, otherwise use ZIP code
    if (LAT && LON) {
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=${UNIT_SYSTEM}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/forecast?zip=${ZIP_CODE},${COUNTRY_CODE}&appid=${API_KEY}&units=${UNIT_SYSTEM}`;
    }
    
    console.log(`Using API URL: ${url.replace(API_KEY, 'API_KEY_HIDDEN')}`);
    
    const response = await axios.get(url);
    const forecastData = response.data;
    const cityName = forecastData.city.name;
    const forecasts = forecastData.list;
    
    // Get sun times
    const sunriseTimestamp = forecastData.city.sunrise;
    const sunsetTimestamp = forecastData.city.sunset;
    const sunrise = formatTime(sunriseTimestamp);
    const sunset = formatTime(sunsetTimestamp);
    
    // Group forecasts by day
    const days = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    forecasts.forEach(forecast => {
      const forecastDate = new Date(forecast.dt * 1000);
      forecastDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((forecastDate - today) / (1000 * 60 * 60 * 24));
      
      // Only process the number of days we want
      if (dayDiff >= 0 && dayDiff < DAYS_TO_FORECAST) {
        if (!days[dayDiff]) {
          const date = formatDate(forecast.dt);
          days[dayDiff] = {
            date: date,
            forecasts: [],
            temps: [],
            icons: []
          };
        }
        
        days[dayDiff].forecasts.push(forecast);
        days[dayDiff].temps.push(forecast.main.temp);
        days[dayDiff].icons.push(forecast.weather[0].icon);
      }
    });
    
    // Process each day to get highs, lows, and determine main weather
    const processedDays = [];
    
    for (let i = 0; i < DAYS_TO_FORECAST; i++) {
      if (days[i]) {
        const temps = days[i].temps;
        const highTemp = Math.round(Math.max(...temps));
        const lowTemp = Math.round(Math.min(...temps));
        
        // Find the most common weather icon for the day
        const iconCounts = {};
        days[i].icons.forEach(icon => {
          iconCounts[icon] = (iconCounts[icon] || 0) + 1;
        });
        
        let mainIcon = 'default';
        let maxCount = 0;
        
        // Find the most common weather condition during daytime hours
        for (const icon in iconCounts) {
          if (iconCounts[icon] > maxCount && icon.includes('d')) {
            maxCount = iconCounts[icon];
            mainIcon = icon;
          }
        }
        
        // If we couldn't find a daytime icon, just use the most common overall
        if (mainIcon === 'default') {
          for (const icon in iconCounts) {
            if (iconCounts[icon] > maxCount) {
              maxCount = iconCounts[icon];
              mainIcon = icon;
            }
          }
        }
        
        // Get primary weather description
        const mainWeather = days[i].forecasts[0].weather[0].main;
        const weatherDescription = days[i].forecasts[0].weather[0].description;
        
        // Get clothing recommendation based on average temperature
        const avgTemp = (highTemp + lowTemp) / 2;
        const clothingRecommendation = getClothingRecommendation(avgTemp);
        
        // Add day to processed days
        processedDays.push({
          date: days[i].date,
          highTemp,
          lowTemp,
          avgTemp,
          mainIcon,
          mainWeather,
          weatherDescription,
          clothing: clothingRecommendation,
          needsRainGear: mainWeather.toLowerCase().includes('rain') || mainWeather.toLowerCase().includes('drizzle'),
          needsSnowGear: mainWeather.toLowerCase().includes('snow')
        });
      }
    }
    
    return {
      cityName,
      sunrise,
      sunset,
      days: processedDays,
      timestamp: new Date().toLocaleString()
    };
    
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    return null;
  }
}

function generateBetterHTML(forecastData) {
  if (!forecastData) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LittleWeather</title>
      <link rel="stylesheet" href="forecast.css">
      <link rel="manifest" href="manifest.json">
      <meta name="theme-color" content="#000000">
      <meta name="description" content="Kids' Weather Wardrobe Helper - Tells you what to wear based on the weather">
      <link rel="apple-touch-icon" href="icons/icon-192x192.png">
    </head>
    <body>
      <div class="error-message">
        <h1>Unable to get weather data</h1>
        <p>Please check your configuration and try again.</p>
      </div>

      <script>
        // Register the service worker
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
              .then(registration => console.log('ServiceWorker registered with scope:', registration.scope))
              .catch(err => console.error('ServiceWorker registration failed:', err));
          });
        }
      </script>
    </body>
    </html>
    `;
  }
  
  const unitSymbol = UNIT_SYSTEM === 'imperial' ? '°F' : '°C';
  const today = forecastData.days[0];
  const tomorrow = forecastData.days[1];
  
  // Create alert HTML if needed
  let alertsHTML = '';
  if (today.needsRainGear) {
    alertsHTML += `
      <div class="alert">
        <span class="alert-icon">☔</span>
        <span>Don't forget your rain gear today!</span>
      </div>`;
  }
  if (today.needsSnowGear) {
    alertsHTML += `
      <div class="alert">
        <span class="alert-icon">❄️</span>
        <span>It's snowing! Wear warm, waterproof clothing.</span>
      </div>`;
  }
  
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LittleWeather</title>
    <link rel="stylesheet" href="forecast.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#000000">
    <meta name="description" content="Kids' Weather Wardrobe Helper - Tells you what to wear based on the weather">
    <link rel="apple-touch-icon" href="icons/icon-192x192.png">
  </head>
  <body>
    <div class="weather-card">
      <header class="header">
        <h1>LittleWeather</h1>
        <p>${forecastData.cityName}</p>
      </header>
      
      <!-- Date headers -->
      <div class="weather-grid">
        <div class="date-header">
          <div class="day-name">${today.date.dayName}</div>
          <div class="date">${today.date.day} ${today.date.month}</div>
        </div>
        <div class="date-header tomorrow">
          <div class="day-name">${tomorrow.date.dayName}</div>
          <div class="date">${tomorrow.date.day} ${tomorrow.date.month}</div>
        </div>
      </div>
      
      <!-- Weather displays -->
      <div class="weather-grid">
        <div class="weather-display">
          <div class="weather-icon">${weatherIcons[today.mainIcon] || weatherIcons['default']}</div>
          <div class="temps">
            <div class="high-temp">${today.highTemp}${unitSymbol}</div>
            <div class="low-temp">${today.lowTemp}${unitSymbol}</div>
          </div>
          <div class="weather-description">${today.weatherDescription}</div>
        </div>
        <div class="weather-display tomorrow">
          <div class="weather-icon">${weatherIcons[tomorrow.mainIcon] || weatherIcons['default']}</div>
          <div class="temps">
            <div class="high-temp">${tomorrow.highTemp}${unitSymbol}</div>
            <div class="low-temp">${tomorrow.lowTemp}${unitSymbol}</div>
          </div>
          <div class="weather-description">${tomorrow.weatherDescription}</div>
        </div>
      </div>
      
      <!-- Sun times -->
      <div class="sun-times">
        <div class="sunrise">
          <span class="sun-icon">🌅</span>
          <span>${forecastData.sunrise}</span>
        </div>
        <div class="sunset">
          <span class="sun-icon">🌇</span>
          <span>${forecastData.sunset}</span>
        </div>
      </div>
      
      <!-- Clothing recommendations -->
      <div class="clothing">
        <div class="clothing-column">
          <div class="clothing-title">Today's Outfit</div>
          <div class="clothing-item">
            <div class="clothing-icon">👕</div>
            <div class="clothing-text">${today.clothing.top}</div>
          </div>
          <div class="clothing-item">
            <div class="clothing-icon">👖</div>
            <div class="clothing-text">${today.clothing.bottom}</div>
          </div>
          <div class="clothing-item">
            <div class="clothing-icon">👟</div>
            <div class="clothing-text">${today.clothing.footwear}</div>
          </div>
          ${today.clothing.outerwear !== 'None' ? `
          <div class="clothing-item">
            <div class="clothing-icon">🧥</div>
            <div class="clothing-text">${today.clothing.outerwear}</div>
          </div>` : ''}
          ${today.clothing.accessories !== 'None' ? `
          <div class="clothing-item">
            <div class="clothing-icon">🧢</div>
            <div class="clothing-text">${today.clothing.accessories}</div>
          </div>` : ''}
        </div>
        <div class="clothing-column tomorrow">
          <div class="clothing-title">Tomorrow's Outfit</div>
          <div class="clothing-item">
            <div class="clothing-icon">👕</div>
            <div class="clothing-text">${tomorrow.clothing.top}</div>
          </div>
          <div class="clothing-item">
            <div class="clothing-icon">👖</div>
            <div class="clothing-text">${tomorrow.clothing.bottom}</div>
          </div>
          <div class="clothing-item">
            <div class="clothing-icon">👟</div>
            <div class="clothing-text">${tomorrow.clothing.footwear}</div>
          </div>
          ${tomorrow.clothing.outerwear !== 'None' ? `
          <div class="clothing-item">
            <div class="clothing-icon">🧥</div>
            <div class="clothing-text">${tomorrow.clothing.outerwear}</div>
          </div>` : ''}
          ${tomorrow.clothing.accessories !== 'None' ? `
          <div class="clothing-item">
            <div class="clothing-icon">🧢</div>
            <div class="clothing-text">${tomorrow.clothing.accessories}</div>
          </div>` : ''}
        </div>
      </div>
    </div>
    
    <!-- Alerts section -->
    ${alertsHTML ? `<div class="alerts">${alertsHTML}</div>` : ''}
    
    <div class="footer">
      Updated: ${forecastData.timestamp}
    </div>

    <script>
      // Register the service worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registered with scope:', registration.scope))
            .catch(err => console.error('ServiceWorker registration failed:', err));
        });
      }
    </script>
  </body>
  </html>
  `;
}

async function main() {
  // Validate environment variables
  if (!API_KEY || ((!LAT || !LON) && !ZIP_CODE)) {
    console.error('Please set WEATHER_API_KEY and either LAT/LON or ZIP_CODE in your .env file');
    return;
  }
  
  const forecastData = await getForecastData();
  
  if (forecastData) {
    // Generate better HTML with external CSS
    const htmlOutput = generateBetterHTML(forecastData);
    fs.writeFileSync(path.join(__dirname, 'forecast-modern.html'), htmlOutput);
    console.log('Modern e-ink forecast page generated: forecast-modern.html');
    
    // Also copy CSS file to the right location
    const cssContent = fs.readFileSync(path.join(__dirname, 'forecast.css'), 'utf8');
    fs.writeFileSync(path.join(__dirname, 'forecast.css'), cssContent);
    
    // Save the forecast data for other uses
    fs.writeFileSync(path.join(__dirname, 'forecast.json'), JSON.stringify(forecastData, null, 2));
    console.log('Forecast data saved to: forecast.json');
  } else {
    console.error('Failed to generate forecast page');
  }
}

main(); 