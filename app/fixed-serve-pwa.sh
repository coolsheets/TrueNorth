#!/bin/bash

# Fix for MIME type issues with modules and manifest
# Kill any existing server processes
echo "Stopping any running servers..."
pkill -f "serve -s" || true
pkill -f "vite preview" || true

# Navigate to dist directory
cd "$(dirname "$0")/dist" || { echo "Cannot find dist directory!"; exit 1; }

# Create an enhanced serve.json for better MIME type handling
echo "Creating enhanced MIME type configuration..."
cat > serve.json <<EOF
{
  "headers": [
    {
      "source": "**/*.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/*.mjs",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/*.css",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/*.html",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/html; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/*.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/json; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/*.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/*.png",
      "headers": [
        {
          "key": "Content-Type",
          "value": "image/png"
        }
      ]
    },
    {
      "source": "**/*.svg",
      "headers": [
        {
          "key": "Content-Type",
          "value": "image/svg+xml"
        }
      ]
    },
    {
      "source": "**/*.jpg",
      "headers": [
        {
          "key": "Content-Type",
          "value": "image/jpeg"
        }
      ]
    },
    {
      "source": "**/*.jpeg",
      "headers": [
        {
          "key": "Content-Type",
          "value": "image/jpeg"
        }
      ]
    },
    {
      "source": "**/*.woff",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/font-woff"
        }
      ]
    },
    {
      "source": "**/*.woff2",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/font-woff2"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        },
        {
          "key": "Cache-Control",
          "value": "no-cache"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/workbox-*.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        },
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    },
    {
      "source": "/icons/**",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
EOF

# Fix manifest format by ensuring it's valid JSON
echo "Validating manifest.webmanifest..."
if [ -f manifest.webmanifest ]; then
  # Check if it's a valid JSON file
  if ! jq . manifest.webmanifest > /dev/null 2>&1; then
    echo "Warning: manifest.webmanifest is not valid JSON. Creating a valid one..."
    # Create a basic valid manifest
    cat > manifest.webmanifest <<EOF
{
  "name": "TrueNorth Inspection App",
  "short_name": "TrueNorth",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF
  fi
  
  # Make sure manifest.json exists as well (some browsers look for this)
  cp manifest.webmanifest manifest.json
fi

# Start the server with the enhanced configuration
echo "Starting server with enhanced MIME type handling on port 4173..."
npx serve -s --cors -l 4173 . --config serve.json