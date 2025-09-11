# TrueNorth PWA Project Standards

This document defines the core technical standards for the TrueNorth PWA project. All contributors, including AI assistants, should adhere to these standards.

## Technology Stack

### Core Framework
- **React**: Using functional components and hooks
- **TypeScript**: Strict typing for all components and functions
- **ES6+ Modules**: Using ES6 module syntax (`import`/`export`) exclusively, not CommonJS

### UI Framework
- **Material UI (MUI)**: The primary UI component library
  - Use MUI components for all UI elements
  - Follow MUI styling patterns using the sx prop or styled components
  - **DO NOT** use Tailwind, Bootstrap, or other CSS frameworks

### PWA Implementation
- **VitePWA**: For service worker generation and management
- **Workbox**: For advanced caching strategies
- **IndexedDB**: For offline data storage

### Build Tools
- **Vite**: For development and building
- **ESLint**: For code quality
- **TypeScript**: For type checking

## Coding Standards

### Component Structure
- Use functional components with hooks
- Split large components into smaller reusable pieces
- Use TypeScript interfaces for component props

### Styling
- Use MUI's sx prop for styling whenever possible
- Use styled components for more complex styling needs
- Follow the existing color scheme and design patterns

### State Management
- Use React Context for global state
- Use local state (useState) for component-specific state
- Consider React Query for API data

### PWA Best Practices
- Ensure service worker updates are handled gracefully
- Implement offline-first strategies
- Include proper notification for updates
- Test extensively in various network conditions

## File Structure
- Component files should be named with PascalCase
- Utility functions should be in separate files in the utils directory
- Keep related components in feature-based directories

## Testing
- Write unit tests for critical functionality
- Test PWA features in various network conditions
- Test on multiple device types and browsers

## When in Doubt
If you're unsure about a standard, refer to existing code in the project as a guide. The goal is consistency throughout the codebase.
