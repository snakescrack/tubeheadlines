# TubeHeadlines Admin Interface

This is the admin interface for managing TubeHeadlines video content. Use this interface to add, edit, and delete videos from your site.

## Getting Started

1. Open a terminal in the `tubeheadlines-admin` directory
2. Run the following command:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to:
   - http://localhost:5173 (default port)
   - If port 5173 is in use, check the terminal output for the correct port number

## Features

- Add new videos with custom headlines
- Set video positions (Featured, Left, Center, Right)
- Edit existing videos
- Delete videos
- Upload custom thumbnails

## Important Notes

- Only one video can be featured at a time
- When you set a video as featured, any existing featured video will automatically move to the center column
- Changes are saved immediately to the database
- No need to delete old featured videos when adding a new one

## Troubleshooting

If you can't access the admin interface:
1. Make sure you're running `npm run dev` in the correct directory
2. Check the terminal output for any error messages
3. Look for the correct port number in the terminal output (it might not always be 5173)
4. Ensure your Firebase configuration is correct in `src/firebase.js`
