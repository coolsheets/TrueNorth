#!/bin/bash

# Script to serve the PWA with proper MIME types
echo "🚀 Starting PWA server with proper MIME types..."

cd ~/Documents/Projects/TrueNorth/app || { echo "❌ Failed to find project directory"; exit 1; }

# Kill any running servers on port 5173
lsof -i:5173 | grep LISTEN | awk '{print $2}' | xargs -r kill -9
echo "✅ Port 5173 cleared"

# Create a custom serve.json file with proper MIME types
cat > ~/Documents/Projects/TrueNorth/app/serve.json << 'EOF'
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
      "source": "**/*.html",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/html; charset=utf-8"
        }
      ]
    },
    {
      "source": "**/sw.js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
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

# Serve the app with the custom configuration
echo "✅ Configuration created, starting server..."
npx serve -s dist -l 5173
