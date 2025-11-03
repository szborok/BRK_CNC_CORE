#!/bin/bash

# ClampingPlateManager Service Demo Script
# This script demonstrates the complete functionality of the headless service

echo "🎉 ClampingPlateManager Service Demo"
echo "=================================="
echo ""

# Set the working directory
cd "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/ClampingPlateManagerService"

echo "📋 1. Creating a new plate..."
npm run cli create-plate -- -id P002 -s B-15 -n "Heavy Duty Clamp" -o "Mike"
echo ""

echo "📋 2. Listing all plates..."
npm run cli list-plates
echo ""

echo "🔧 3. Starting work on a plate..."
npm run cli start-work -- -id P002 -w W5270NS01003A -o "Mike"
echo ""

echo "📊 4. Viewing analytics..."
npm run cli analytics
echo ""

echo "✅ 5. Finishing work..."
npm run cli finish-work -- -id P002 -o "Mike" --tools "Tool1,Tool2,Tool3"
echo ""

echo "📋 6. Getting plate details..."
npm run cli get-plate -- -id P002
echo ""

echo "🔒 7. Locking a plate..."
npm run cli lock-plate -- -id P002 -o "Admin" -r "Maintenance required"
echo ""

echo "🔓 8. Unlocking a plate..."
npm run cli unlock-plate -- -id P002 -o "Admin"
echo ""

echo "📊 9. Final analytics..."
npm run cli analytics
echo ""

echo "🎉 Demo complete! The headless ClampingPlateManager service is fully functional."
echo "=================================="
echo "🌐 API Server: http://localhost:3001"
echo "📋 API Documentation: http://localhost:3001/api" 
echo "❤️  Health Check: http://localhost:3001/health"
echo "📡 WebSocket: ws://localhost:3001"
echo "🗄️  Database: cnc_management"