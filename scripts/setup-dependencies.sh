#!/bin/bash
# setup-dependencies.sh - Script to ensure all dependencies are installed

echo "=== TrueNorth Dependency Setup ==="
echo

# Check if --fix flag is provided
FIX_SECURITY=false
for arg in "$@"
do
  if [ "$arg" == "--fix" ]; then
    FIX_SECURITY=true
  fi
done

# Install root dependencies
echo "Installing root dependencies..."
npm install
if [ "$FIX_SECURITY" = true ]; then
  echo "Fixing security vulnerabilities in root dependencies..."
  npm audit fix
fi
echo "✅ Root dependencies installed"
echo

# Install app dependencies
echo "Installing app dependencies..."
cd app
npm install
if [ "$FIX_SECURITY" = true ]; then
  echo "Fixing security vulnerabilities in app dependencies..."
  npm audit fix
fi
echo "✅ App dependencies installed"
echo

# Install server dependencies
echo "Installing server dependencies..."
cd ../server
npm install
if [ "$FIX_SECURITY" = true ]; then
  echo "Fixing security vulnerabilities in server dependencies..."
  npm audit fix
fi
echo "✅ Server dependencies installed"
echo

# Return to root
cd ..

echo "=== All dependencies installed successfully ==="
echo "You can now run:"
echo "  - npm run dev      (to start both app and server)"
echo "  - npm run build    (to build the project)"
echo "  - npm run preview  (to preview the built app)"
