# Dependency Management Options

This document explains the different dependency installation options available in this project.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run install:all` | Basic installation of all dependencies in root, app, and server directories |
| `npm run install:safe` | Install dependencies and run `npm audit fix` in all directories |
| `npm run setup` | User-friendly installation with progress reporting |
| `npm run setup:fix` | User-friendly installation with progress reporting and security fixes |
| `npm run bootstrap` | Legacy command that only installs app and server dependencies |

## Choosing the Right Command

### For Development

- **First time setup**: `npm run setup`
- **After pulling changes**: `npm run install:all`

### For CI/CD and Production

- **Safe deployment**: `npm run install:safe`
- **For workflows**: `npm run setup:fix`

### For Security Concerns

If you need to fix security vulnerabilities:

```bash
# Quick fix all vulnerabilities
npm run install:safe

# Interactive fix with progress reporting
npm run setup:fix
```

## Understanding the Differences

1. **install:all vs. setup**
   - `install:all` is a direct npm command without any output formatting
   - `setup` provides user-friendly console output with progress indicators

2. **With vs. Without Security Fixes**
   - Commands with `:safe` or `:fix` suffix run `npm audit fix`
   - Standard commands only install dependencies without fixing vulnerabilities

## When to Use npm audit fix

Including `npm audit fix` by default can sometimes cause issues:

- It may change dependency versions unexpectedly
- It might break compatibility in some edge cases
- It could increase build time in CI/CD pipelines

For these reasons, we provide separate commands with and without the fix option.

## GitHub Actions Workflows

Our deployment workflows use `npm ci` instead of `npm install` for more reliable builds.
