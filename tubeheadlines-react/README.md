# TubeHeadlines Project

This project consists of two main applications:
1. Main Website (`tubeheadlines-react`)
2. Admin Interface (`tubeheadlines-admin`)

## Backup Information

Working backups of both applications are stored in:
- `tubeheadlines-react-backup`
- `tubeheadlines-admin-backup`

### How to Restore from Backup

If either application stops working, you can restore it from the backup using these steps:

#### For the Main Website:
1. Stop any running servers
2. Delete or rename the problematic directory:
   ```
   ren tubeheadlines-react tubeheadlines-react-old
   ```
3. Restore from backup:
   ```
   xcopy /E /I /Y tubeheadlines-react-backup tubeheadlines-react
   ```
4. Start the server:
   ```
   cd tubeheadlines-react
   npm run dev
   ```

#### For the Admin Interface:
1. Stop any running servers
2. Delete or rename the problematic directory:
   ```
   ren tubeheadlines-admin tubeheadlines-admin-old
   ```
3. Restore from backup:
   ```
   xcopy /E /I /Y tubeheadlines-admin-backup tubeheadlines-admin
   ```
4. Start the server:
   ```
   cd tubeheadlines-admin
   npm run dev
   ```

## Port Configuration
- Main Website runs on: http://localhost:5174
- Admin Interface runs on: http://localhost:5173

## Important Notes
1. Both applications use Firebase for data storage
2. The main website is read-only for public users
3. The admin interface requires authentication
4. Changes made in the admin interface are immediately reflected on the main website

## Backup Creation Date
These backups were created on: May 6, 2025
