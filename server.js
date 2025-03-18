const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Generate the weather data
function updateWeather() {
  return new Promise((resolve, reject) => {
    exec('node forecast-new.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      console.log(`Weather data updated: ${stdout}`);
      
      // Copy generated files to public directory
      try {
        // Ensure public directory exists
        if (!fs.existsSync(path.join(__dirname, 'public'))) {
          fs.mkdirSync(path.join(__dirname, 'public'));
        }
        
        // Ensure public/icons directory exists
        if (!fs.existsSync(path.join(__dirname, 'public', 'icons'))) {
          fs.mkdirSync(path.join(__dirname, 'public', 'icons'));
        }
        
        // Copy HTML file
        fs.copyFileSync(
          path.join(__dirname, 'forecast-modern.html'), 
          path.join(__dirname, 'public', 'index.html')
        );
        
        // Copy CSS file
        fs.copyFileSync(
          path.join(__dirname, 'forecast.css'), 
          path.join(__dirname, 'public', 'forecast.css')
        );
        
        // Copy manifest file
        if (fs.existsSync(path.join(__dirname, 'public', 'manifest.json'))) {
          fs.copyFileSync(
            path.join(__dirname, 'public', 'manifest.json'), 
            path.join(__dirname, 'public', 'manifest.json')
          );
        }
        
        // Copy service worker file
        if (fs.existsSync(path.join(__dirname, 'public', 'sw.js'))) {
          fs.copyFileSync(
            path.join(__dirname, 'public', 'sw.js'), 
            path.join(__dirname, 'public', 'sw.js')
          );
        }
        
        resolve();
      } catch (err) {
        console.error('Error copying files:', err);
        reject(err);
      }
    });
  });
}

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to manually trigger weather update
app.get('/update', async (req, res) => {
  try {
    await updateWeather();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error updating weather data');
  }
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  // Initial weather data generation
  try {
    await updateWeather();
    console.log('Initial weather data generated');
    
    // Set up a schedule to update the weather data every hour
    setInterval(async () => {
      try {
        await updateWeather();
        console.log('Weather data updated');
      } catch (error) {
        console.error('Error updating weather data:', error);
      }
    }, 3600000); // 1 hour in milliseconds
  } catch (error) {
    console.error('Failed to generate initial weather data:', error);
  }
}); 