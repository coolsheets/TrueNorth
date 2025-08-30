# Technical Debt

This document tracks known technical issues, deprecated code patterns, and future improvement opportunities that are not critical but should be addressed in future updates.

## UI Components

### MUI Grid Component Deprecation Warnings

**Priority**: Low  
**Created**: August 29, 2025

#### Issue Description
The application uses deprecated Material UI Grid component patterns that generate console warnings:

1. `Warning: MUI: The 'item' prop has been removed.`
2. `Warning: MUI: The 'xs' prop has been removed.`
3. `Warning: MUI: The 'md' prop has been removed.`

These warnings appear because Material UI v5 has updated the Grid component API. The application is using the legacy pattern but functionality is not affected.

#### Affected Files
- `/src/features/inspection/pages/Vehicle.tsx`
- Any other components using the MUI Grid component with the `item` prop

#### Solution
Update Grid components to follow the new MUI v5 pattern:

```tsx
// Old way (generating warnings)
<Grid container>
  <Grid item xs={12} md={6}>Content</Grid>
</Grid>

// New way (recommended)
<Grid container>
  <Grid xs={12} md={6}>Content</Grid>
</Grid>
```

The main change is to remove the `item` prop from all Grid items, as it's now implied by default when you specify breakpoint props like `xs` or `md`.

#### Reference
For more details, see the [MUI migration guide](https://mui.com/material-ui/migration/v5-component-changes/#grid).
