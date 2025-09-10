#!/bin/bash

# Kill any running server on port 5173
echo "🔍 Checking for existing servers..."
lsof -i:5173 | grep LISTEN | awk '{print $2}' | xargs -r kill -9
echo "✅ Port 5173 cleared"

# Check if the unregister-sw.html file exists
if [ -f unregister-sw.html ]; then
    # Start a temporary server for unregistration
    echo "🔄 Starting temporary server for service worker unregistration..."
    npx serve -s . -l 5173 &
    SERVER_PID=$!
    
    # Wait for the server to start
    sleep 2
    
    echo "🌐 Please open http://localhost:5173/unregister-sw.html in your browser"
    echo "Use the 'Do Everything' button, then close the tab after it reloads"
    echo "Press Enter when you're done to continue..."
    read -r
    
    # Kill the temporary server
    kill $SERVER_PID
    echo "✅ Temporary server stopped"
fi

# Start the production build server
echo "🚀 Starting PWA server..."
cd ~/Documents/Projects/TrueNorth/app
./serve-with-mime.sh

