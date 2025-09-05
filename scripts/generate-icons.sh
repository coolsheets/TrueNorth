#!/bin/bash

# Check if sharp is installed locally
if ! npm list --prefix app sharp > /dev/null 2>&1; then
  echo "Installing sharp locally..."
  (cd app && npm install --save-dev sharp)
fi

# Create a temporary Node.js script to process the images
cat > /tmp/convert-maple-leaf.js << 'EOL'
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Path to input file and output directory
const inputPath = process.argv[2];
const outputDir = process.argv[3];

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to create a red gradient maple leaf icon
async function createRedLeafIcon(size) {
  try {
    // Load the source image
    let inputBuffer = fs.readFileSync(inputPath);
    
    // Create the initial image processing pipeline
    let imageProcess = sharp(inputBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toColorspace('srgb');

    // Create a red gradient
    const redGradientData = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        // Red gradient from top to bottom (darker red at top, brighter at bottom)
        const normalizedY = y / size;
        redGradientData[i] = Math.floor(200 - normalizedY * 30); // R (200-170)
        redGradientData[i + 1] = Math.floor(30 + normalizedY * 10); // G (30-40)
        redGradientData[i + 2] = Math.floor(30 + normalizedY * 10); // B (30-40)
        redGradientData[i + 3] = 255; // Alpha
      }
    }

    // Create the red gradient image
    const redGradient = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .raw()
      .fromBuffer(redGradientData, { raw: { width: size, height: size, channels: 4 } })
      .png()
      .toBuffer();

    // Extract alpha channel (shape) from the original gold image
    const alphaMask = await sharp(inputBuffer)
      .resize(size, size)
      .extractChannel(3) // Alpha channel
      .toBuffer();

    // Apply the alpha mask to the red gradient
    const finalIcon = await sharp(redGradient)
      .joinChannel(alphaMask, { raw: { width: size, height: size, channels: 1 } })
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));

    console.log(`Created ${size}x${size} red maple leaf icon`);
  } catch (error) {
    console.error(`Error creating ${size}x${size} icon:`, error);
  }
}

// Main function
async function main() {
  try {
    // Create icons in both required sizes
    await createRedLeafIcon(192);
    await createRedLeafIcon(512);
    console.log("Icon generation complete!");
  } catch (error) {
    console.error("Error in icon generation:", error);
  }
}

// Run the main function
main();
EOL

# Make sure there's an image to convert
if [ ! -f "app/maple-leaf.png" ]; then
  if [ ! -f "app/maple-leaf-base64.txt" ]; then
    echo "Error: app/maple-leaf-base64.txt not found. Cannot create app/maple-leaf.png." >&2
    exit 1
  fi
  echo "Creating image from base64..."
  base64 -d <<< $(cat app/maple-leaf-base64.txt | sed 's/^data:image\/png;base64,//') > app/maple-leaf.png
fi

# Run the script
echo "Generating icons..."
(cd app && node /tmp/convert-maple-leaf.js maple-leaf.png public/icons)

# Clean up
echo "Cleaning up temporary files..."
rm -f /tmp/convert-maple-leaf.js

echo "Icons have been generated in app/public/icons!"
