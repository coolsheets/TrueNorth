# Shared Utilities

This directory contains shared code that is used by both the client and server.

## Contents

- `types.ts`: Common type definitions used across the application
- `sanitization.ts`: Data sanitization utilities for ensuring data consistency

## Usage

### Client-side

In the client application, you can import shared utilities directly:

```typescript
import { sanitizeInspectionData } from '../../../shared/sanitization';
```

### Server-side

In the server application, you can use the `requireShared` helper:

```javascript
const { requireShared } = require('../utils/sharedModules');
const { sanitizeInspectionData } = requireShared('/shared/sanitization');
```

## Building

The shared TypeScript files are compiled during the build process. To build them manually, run:

```bash
npm run build:shared
```

This will compile the TypeScript files in the shared directory and output them to the dist/shared directory.

## Adding New Shared Utilities

When adding new shared utilities:

1. Create a new file in the shared directory
2. Export functions and types that need to be shared
3. Import them in client or server code as needed
4. Make sure to update this README if adding major new functionality
