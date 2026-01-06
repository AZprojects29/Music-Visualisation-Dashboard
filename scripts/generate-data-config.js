import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'data-config.json');

// Pattern to match Spotify streaming history files
const SPOTIFY_PATTERN = /^Streaming_History_Audio.*\.json$/i;

function generateConfig() {
  console.log('Scanning for Spotify streaming history files...');
  console.log(`Directory: ${DATA_DIR}\n`);

  // Check if data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`Error: Data directory not found at ${DATA_DIR}`);
    console.log('Please create the directory and add your Spotify JSON files.');
    process.exit(1);
  }

  // Get all JSON files in the data directory
  const allFiles = fs.readdirSync(DATA_DIR);

  // Filter for Spotify streaming history files (exclude config files)
  const spotifyFiles = allFiles.filter(
    (file) =>
      file.endsWith('.json') &&
      file !== 'data-config.json' &&
      !file.includes('example') &&
      !file.includes('config')
  );

  if (spotifyFiles.length === 0) {
    console.error('No JSON files found in the data directory!');
    console.log('\nTo use this app:');
    console.log('1. Request your Extended Streaming History from Spotify');
    console.log('2. Copy the Streaming_History_Audio_*.json files to:');
    console.log(`   ${DATA_DIR}`);
    console.log('3. Run this script again: npm run generate-config');
    process.exit(1);
  }

  // Separate auto-detected files and other files
  const autoDetected = spotifyFiles.filter((f) => SPOTIFY_PATTERN.test(f));
  const otherFiles = spotifyFiles.filter((f) => !SPOTIFY_PATTERN.test(f));

  console.log(`Found ${spotifyFiles.length} JSON file(s):`);
  spotifyFiles.forEach((f) => console.log(`  - ${f}`));

  // Build the config
  const config = {
    autoDetect: {
      enabled: true,
      pattern: 'Streaming_History_Audio_',
    },
    files: spotifyFiles.map((filename) => ({
      path: filename,
      ...(otherFiles.includes(filename) && {
        label: extractYearRange(filename) || 'Custom data',
      }),
    })),
  };

  // Write the config file
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

  console.log(`\nConfiguration saved to: ${CONFIG_FILE}`);
  console.log('\nYou can now run the app with: npm run dev');

  if (otherFiles.length > 0) {
    console.log('\nNote: Some files have non-standard names:');
    otherFiles.forEach((f) => console.log(`  - ${f}`));
    console.log('You may want to edit data-config.json to add labels for these files.');
  }
}

// Try to extract year range from filename
function extractYearRange(filename) {
  // Match patterns like "2019-2021" or "2024_2025" or just "2024"
  const yearMatch = filename.match(/(\d{4})[-_]?(\d{4})?/);
  if (yearMatch) {
    if (yearMatch[2]) {
      return `${yearMatch[1]}-${yearMatch[2]}`;
    }
    return yearMatch[1];
  }
  return null;
}

generateConfig();
