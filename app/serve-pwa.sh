#!/bin/bash

# Kill any existing server process
pkill -f "serve -s"

# Navigate to dist directory
cd "$(dirname "$0")/dist" 

# Create .mime.types file
cat > .mime.types <<EOF
types {
  application/javascript js;
  application/manifest+json webmanifest json;
  image/png png;
  text/html html;
  text/css css;
  application/font-woff woff;
  application/font-woff2 woff2;
  application/octet-stream *;
}
EOF

# Create serve.json for serve configuration
cat > serve.json <<EOF
{
  "headers": [
    {
      "source": "**/*.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
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
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
EOF

# Copy manifest.webmanifest to manifest.json for compatibility
cp manifest.webmanifest manifest.json

# Serve the dist directory with explicit MIME type configuration
echo "Starting server with proper MIME types..."
npx serve -s --cors -l 4173 . --config serve.json
