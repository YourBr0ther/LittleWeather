const fs = require('fs');
const path = require('path');

// Files to keep
const keepFiles = [
  '.env',
  '.env.example',
  '.gitignore',
  'LICENSE',
  'README.md',
  'forecast.css',
  'forecast-new.js',
  'package.json',
  'package-lock.json',
  'server.js',
  'cleanup.js'
];

// Files to delete
const currentDir = __dirname;
fs.readdir(currentDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    // Skip directories except the specific ones we want to remove
    if (fs.statSync(path.join(currentDir, file)).isDirectory()) {
      if (file === 'node_modules' || file === '.git') {
        // Skip these directories
        return;
      }
      
      if (file === 'public') {
        // Create the public directory if it doesn't exist
        if (!fs.existsSync(path.join(currentDir, 'public'))) {
          fs.mkdirSync(path.join(currentDir, 'public'));
        }
        return;
      }
      
      console.log(`Skipping directory: ${file}`);
      return;
    }
    
    // Check if file should be kept
    if (!keepFiles.includes(file)) {
      try {
        fs.unlinkSync(path.join(currentDir, file));
        console.log(`Deleted: ${file}`);
      } catch (err) {
        console.error(`Error deleting ${file}:`, err);
      }
    } else {
      console.log(`Keeping: ${file}`);
    }
  });
  
  console.log('Cleanup complete!');
}); 