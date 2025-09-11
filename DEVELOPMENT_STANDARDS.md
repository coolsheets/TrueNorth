# Development Standards Reference

## Core Technologies
- **Frontend**: React + TypeScript + Material UI (MUI)
- **Build System**: Vite with ES6 modules
- **PWA Features**: Service workers, offline support, installability
- **State Management**: React Context + local state

## Important Guidelines

1. **UI Components**: We exclusively use Material UI (MUI). Do not introduce Tailwind, Bootstrap, or other UI frameworks.

2. **Module System**: Use ES6 module syntax (`import`/`export`) only. CommonJS (`require`/`module.exports`) is not allowed.

3. **TypeScript**: All new code must be properly typed with TypeScript interfaces.

4. **PWA Best Practices**: Consider offline functionality for all features. Handle service worker updates gracefully.

5. **Code Reviews**: All code, whether from human or AI contributors, must adhere to these standards.

## Documentation

- See `PROJECT_STANDARDS.md` for comprehensive project standards
- See `.github/AI_ASSISTANT_CONFIG.md` for AI assistant guidelines
- Use the pre-commit hooks to catch standards violations early

## For AI Assistants

When working with AI code assistants, point them to:
- `.github/AI_ASSISTANT_CONFIG.md` to understand project standards
- Existing similar components as reference for styling patterns
- Our PWA implementation details in `app/src/registerSW.ts`
