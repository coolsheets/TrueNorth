# Development Workflows

## Mobile and PWA Testing

This project includes specific npm scripts for mobile and PWA testing:

- `npm run dev:mobile`: Runs both the server and client with network access enabled, making the app available on your local network for testing on mobile devices.
- `npm run dev:app:host`: Runs just the app with the `--host` flag, making it accessible from other devices.

### Importance

These scripts are critical for properly testing the PWA functionality on actual mobile devices. Never remove these scripts as they're essential for our development process.

### Usage

1. Run `npm run dev:mobile`
2. Find your local IP address (e.g., 192.168.1.x)
3. On your mobile device, visit `http://[your-ip]:5173`
4. To test the PWA installation, add to home screen

## VIN Search Functionality

The Vehicle.tsx component includes a VIN search capability that allows users to automatically retrieve vehicle details by entering a VIN. This functionality:

- Uses the NHTSA API to decode VINs
- Auto-populates year, make, and model information
- Provides validation and user feedback
- Enhances the inspection process by reducing manual data entry

### Required Files

- `app/src/features/inspection/pages/Vehicle.tsx`: Contains the VIN search UI and logic
- `app/src/utils/vin.ts`: Contains the VIN decoding and validation utilities

### Validation

A validation script (`npm run validate:vin-search`) ensures this functionality remains intact. This script runs automatically as part of pre-commit hooks for relevant files.

## Code Quality

To maintain code quality and prevent inadvertent edits:

- Always review your diffs before committing
- Use descriptive commit messages that mention all changes
- When editing package.json, be careful to preserve critical scripts
- Run validation (`npm run validate`) before committing
- Run linting (`npm run lint`) before committing
