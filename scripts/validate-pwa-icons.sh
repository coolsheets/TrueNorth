#!/bin/bash
# Script to validate icon setup for PWA

echo "===== PWA Icon Validation ====="
echo

# Check manifest file
echo "Checking manifest file..."
if [ -f "app/public/manifest.webmanifest" ]; then
  echo "✅ Found manifest file"
  
  # Check if manifest has icon entries
  icon_count=$(grep -c "\"icons\"" app/public/manifest.webmanifest)
  if [ "$icon_count" -gt 0 ]; then
    echo "✅ Found icon entries in manifest"
  else
    echo "❌ No icon entries found in manifest"
  fi
else
  echo "❌ Manifest file not found"
fi

echo

# Check icon files
echo "Checking icon files..."
if [ -d "app/public/icons" ]; then
  echo "✅ Found icons directory"
  
  # Check for required icon files
  if [ -f "app/public/icons/icon-192.png" ]; then
    echo "✅ Found icon-192.png"
    file_info=$(file app/public/icons/icon-192.png)
    echo "   $file_info"
  else
    echo "❌ icon-192.png not found"
  fi
  
  if [ -f "app/public/icons/icon-512.png" ]; then
    echo "✅ Found icon-512.png"
    file_info=$(file app/public/icons/icon-512.png)
    echo "   $file_info"
  else
    echo "❌ icon-512.png not found"
  fi
else
  echo "❌ Icons directory not found"
fi

echo

# Check build output (if available)
echo "Checking build output..."
if [ -d "app/dist" ]; then
  echo "✅ Found build directory"
  
  # Check if icons are copied to the build directory
  if [ -d "app/dist/icons" ]; then
    echo "✅ Found icons directory in build"
    
    # Check for icon files in build
    if [ -f "app/dist/icons/icon-192.png" ]; then
      echo "✅ Found icon-192.png in build"
    else
      echo "❌ icon-192.png not found in build"
    fi
    
    if [ -f "app/dist/icons/icon-512.png" ]; then
      echo "✅ Found icon-512.png in build"
    else
      echo "❌ icon-512.png not found in build"
    fi
  else
    echo "❌ Icons directory not found in build"
  fi
  
  # Check if manifest is in the build
  if [ -f "app/dist/manifest.webmanifest" ]; then
    echo "✅ Found manifest file in build"
  else
    echo "❌ Manifest file not found in build"
  fi
else
  echo "⚠️  Build directory not found. Run 'npm run build' first."
fi

echo
echo "===== Validation Complete ====="
