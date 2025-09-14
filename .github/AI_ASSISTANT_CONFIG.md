# TrueNorth PWA - AI Assistant Context

## Project Context

TrueNorth is a Progressive Web Application (PWA) for vehicle inspections with robust offline capabilities. The app allows inspectors to complete inspections even without internet connectivity and synchronizes data when connection is restored.

## Technology Stack

### Core Technologies
- **React 18+** with functional components and hooks
- **TypeScript** for type safety
- **ES6+ modules** exclusively (no CommonJS)
- **Material UI (MUI)** for all UI components and styling
- **Vite** for building and development
- **VitePWA** for service worker generation
- **IndexedDB** (via Dexie.js) for offline data storage
- **Workbox** for advanced caching strategies

### DO NOT USE
- ❌ **Tailwind CSS** - We use MUI exclusively
- ❌ **CommonJS modules** (`require`/`module.exports`) - Use ES6 imports/exports
- ❌ **Class components** - Use functional components with hooks
- ❌ **CSS-in-JS libraries** other than MUI's styling system
- ❌ **jQuery** or direct DOM manipulation

## Coding Standards

### Component Structure
```tsx
// Preferred component structure
import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { SomeType } from '../types';

interface MyComponentProps {
  title: string;
  onAction: () => void;
  items?: SomeType[];
}

export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction,
  items = [] 
}) => {
  // Implementation
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {items.map(item => (
        // Component content
      ))}
      <Button onClick={onAction} variant="contained">Action</Button>
    </Box>
  );
};
```

### Styling Approach
- Use MUI's `sx` prop for component-specific styling
- Use `createTheme` for global theming
- Follow existing color schemes and spacing patterns

### PWA Requirements
- All network requests must have proper offline fallbacks
- Service worker updates must be handled with user notifications
- The app must function without network connectivity
- Use `subscribeToSWUpdates` for service worker update notifications

## Project Structure

- `app/src/components/` - Reusable UI components
- `app/src/features/` - Feature-specific components and logic
- `app/src/utils/` - Utility functions and helpers
- `app/src/types/` - TypeScript type definitions
- `app/src/styles/` - Global styles and theme

## Common Patterns

### Service Worker Updates
```tsx
import { useEffect, useState } from 'react';
import { subscribeToSWUpdates, updateServiceWorker } from './registerSW';
import UpdateNotification from './components/UpdateNotification';

// In your App component:
const [showUpdateNotification, setShowUpdateNotification] = useState(false);

useEffect(() => {
  const unsubscribe = subscribeToSWUpdates(() => {
    setShowUpdateNotification(true);
  });
  
  return unsubscribe;
}, []);

// Handle update button click
const handleUpdate = () => {
  updateServiceWorker();
  setShowUpdateNotification(false);
};

// In your JSX:
{showUpdateNotification && <UpdateNotification onRefresh={handleUpdate} />}
```

### Offline Data Handling
```tsx
import { useEffect, useState } from 'react';
import { db } from '../features/inspection/db';
import { syncData } from '../utils/sync';

// Example pattern for offline-first data
const [data, setData] = useState([]);
const [isOffline, setIsOffline] = useState(!navigator.onLine);

// Load from IndexedDB first, then try to sync
useEffect(() => {
  const loadData = async () => {
    // Get from local DB
    const localData = await db.inspections.toArray();
    setData(localData);
    
    // Try to sync if online
    if (navigator.onLine) {
      try {
        await syncData();
        // Refresh data after sync
        const refreshedData = await db.inspections.toArray();
        setData(refreshedData);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  };
  
  loadData();
}, []);
```

## Best Practices

1. **Performance**: Minimize component re-renders, use memoization when appropriate
2. **Error Handling**: Implement proper error boundaries and fallbacks
3. **Accessibility**: Ensure all UI components are accessible
4. **Testing**: Write unit tests for critical functionality
5. **Documentation**: Document complex logic and component APIs

## When Suggesting Solutions

1. Always follow the patterns and technologies described above
2. Check existing similar components for styling patterns
3. Ensure offline capability is considered for all features
4. Prefer simpler solutions that align with the existing codebase
