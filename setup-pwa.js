// PWA Setup Script for LittleWeather
// This script creates necessary directories and files for Progressive Web App functionality

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up PWA for LittleWeather...');

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    console.log('Creating public directory...');
    fs.mkdirSync('public');
}

// Create icons directory if it doesn't exist
if (!fs.existsSync(path.join('public', 'icons'))) {
    console.log('Creating public/icons directory...');
    fs.mkdirSync(path.join('public', 'icons'));
}

// Create manifest.json if it doesn't exist
const manifestPath = path.join('public', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
    console.log('Creating manifest.json...');
    const manifest = {
        "name": "LittleWeather",
        "short_name": "LittleWeather",
        "description": "Kids' Weather Wardrobe Helper",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#ffffff",
        "theme_color": "#000000",
        "icons": [
            {
                "src": "icons/icon-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "icons/icon-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

// Create service worker if it doesn't exist
const swPath = path.join('public', 'sw.js');
if (!fs.existsSync(swPath)) {
    console.log('Creating service worker...');
    const serviceWorker = `// LittleWeather Service Worker
const CACHE_NAME = 'littleweather-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/forecast.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response because it's a one-time use
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;
    
    fs.writeFileSync(swPath, serviceWorker);
}

// Create placeholder icons if they don't exist
// This is a basic placeholder. Users should replace with generated icons.
const createPlaceholderIcon = (size) => {
    const iconPath = path.join('public', 'icons', `icon-${size}x${size}.png`);
    
    if (!fs.existsSync(iconPath)) {
        console.log(`Creating placeholder ${size}x${size} icon...`);
        
        // This is a very simple Base64-encoded PNG that's just a blue square with "LW" text
        // For production, users should replace this with proper icons using generate-icons.html
        const iconBase64 = `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0NERBNUJGMTA4OUQxMUUzOEI3MkZFOEM1MTY1MUU0NSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0NERBNUJGMTA4OUQxMUUzOEI3MkZFOEM1MTY1MUU0NSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjQ0REE1QkVFMDg5RDExRTM4QjcyRkU4QzUxNjUxRTQ1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ0REE1QkVGMDg5RDExRTM4QjcyRkU4QzUxNjUxRTQ1Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+q+zciwAAAK5JREFUeNpi/P//PwMlgImBQkCxAQxQA1YD8R8oXgyiGaECIIMEgfgdEP+GsvmQ5EGAEYkzFYhfsxBQkAHE3EC8BYizkMRv4zIgRQnCBs+AWAuIzaB8ByCW4SKUDYLnIG9CxWyB2AGP5pcwA85CFaaHskOQxDOJNSABKSwDgTgC5H8k8ZUUGwCyPAZJDJuBxkDMT6wBPEjidchyTIyU5gVGSosCxQYABBgAJAkTIbUEdz0AAAAASUVORK5CYII=`;
        
        // Write base64 icon to file
        const iconData = Buffer.from(iconBase64, 'base64');
        fs.writeFileSync(iconPath, iconData);
    }
};

// Create placeholder icons
createPlaceholderIcon('192');
createPlaceholderIcon('512');

// Print success message and next steps
console.log('\nPWA setup complete!');
console.log('\nNext steps:');
console.log('1. Generate custom app icons using generate-icons.html (recommended)');
console.log('2. Place the generated icons in the public/icons directory');
console.log('3. Start the server using: npm start');
console.log('4. Access your PWA at http://localhost:3000');
console.log('5. Install to your device from the browser menu\n'); 