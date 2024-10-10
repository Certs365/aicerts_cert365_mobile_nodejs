const fs = require('fs-extra'); // Import fs-extra for file operations
const path = require('path'); // Import path to handle file paths

// Define source and destination directories
const srcDir = path.join(__dirname, 'src', '.well-known'); // Source directory
const destDir = path.join(__dirname, 'dist', '.well-known'); // Destination directory

// Copy the directory
fs.copy(srcDir, destDir)
  .then(() => console.log('Successfully copied .well-known directory!'))
  .catch(err => console.error('Error copying directory:', err));
