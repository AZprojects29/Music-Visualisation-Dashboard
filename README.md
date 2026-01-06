# Spotify Listening History Visualisation

Visualize your Spotify listening history with beautiful charts and statistics.

## Quick Start

```bash
git clone https://github.com/AZprojects29/Music-Visualisation-Dashboard.git
cd Music-Visualisation-Dashboard
npm install
# Add your Spotify data (see below)
npm run generate-config
npm run dev
```

## Setting Up Your Spotify Data

### Step 1: Request Your Spotify Data

1. Go to [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Scroll down to **"Download your data"**
3. Select **"Extended streaming history"** (this is important!)
4. Click **"Request data"**
5. Wait for Spotify to email you (can take up to 30 days)

> **Note:** The basic "Account data" export does NOT include full streaming history. You need the **Extended streaming history** option.

### Step 2: Download and Extract

1. When you receive the email, download the ZIP file
2. Extract the contents
3. Look for files named like:
   - `Streaming_History_Audio_2020-2022_0.json`
   - `Streaming_History_Audio_2022-2024_1.json`
   - etc.

You may have multiple files depending on how long you've used Spotify.

### Step 3: Add Your Data

#### Option A: Auto-Detection (Recommended)

1. Copy all your `Streaming_History_Audio_*.json` files to:
   ```
   public/data/
   ```

2. Run the config generator:
   ```bash
   npm run generate-config
   ```

3. Start the app:
   ```bash
   npm run dev
   ```

#### Option B: Manual Configuration

If your files have custom names or you want more control:

1. Copy your JSON files to `public/data/`

2. Edit `public/data/data-config.json`:
   ```json
   {
     "autoDetect": {
       "enabled": true,
       "pattern": "Streaming_History_Audio_"
     },
     "files": [
       { "path": "my_spotify_data_2020.json" },
       { "path": "my_spotify_data_2021.json" },
       { "path": "another_export.json", "label": "2022-2023" }
     ]
   }
   ```

3. Start the app:
   ```bash
   npm run dev
   ```

## Expected JSON Format

Your JSON files should contain an array of streaming events. Each event should have these fields:

| Field | Type | Description |
|-------|------|-------------|
| `ts` | string | ISO timestamp (e.g., "2024-01-15T14:30:00Z") |
| `master_metadata_track_name` | string | Song title |
| `master_metadata_album_artist_name` | string | Artist name |
| `master_metadata_album_album_name` | string | Album name |
| `ms_played` | number | Milliseconds played |
| `shuffle` | boolean | Was shuffle enabled |
| `skipped` | boolean | Was the track skipped |

Example entry:
```json
{
  "ts": "2024-01-15T14:30:00Z",
  "platform": "Android",
  "ms_played": 215000,
  "master_metadata_track_name": "Bohemian Rhapsody",
  "master_metadata_album_artist_name": "Queen",
  "master_metadata_album_album_name": "A Night at the Opera",
  "shuffle": false,
  "skipped": false
}
```

## Troubleshooting

### No data showing
- Check that your files are in `public/data/`
- Run `npm run generate-config` to update the configuration
- Check the browser console for errors

### Wrong data format
- Make sure you requested **Extended streaming history** from Spotify
- The basic export has a different format and won't work

### Files not detected
- Ensure filenames end with `.json`
- Run `npm run generate-config` after adding new files
- Or manually add them to `data-config.json`
