#!/bin/bash
# setup_cloud_mongo.sh
# Setup script for MongoDB Atlas cloud connection

echo "🌐 CNC Management Tools - MongoDB Atlas Setup"
echo "================================================"
echo ""

# Check if MongoDB URI is provided
if [ -z "$1" ]; then
    echo "❌ Usage: ./setup_cloud_mongo.sh 'your-mongodb-atlas-connection-string'"
    echo ""
    echo "Example:"
    echo "./setup_cloud_mongo.sh 'mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority'"
    echo ""
    echo "📝 Get your connection string from:"
    echo "   1. MongoDB Atlas Dashboard"
    echo "   2. Click 'Connect' on your cluster"
    echo "   3. Choose 'Connect your application'"
    echo "   4. Copy the connection string"
    exit 1
fi

MONGODB_URI="$1"

echo "🔧 Setting up environment variables..."

# Create .env files for each project
echo "📋 Setting up ClampingPlateManagerService..."
cat > "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/ClampingPlateManagerService/.env" << EOF
MONGODB_URI=$MONGODB_URI
MONGODB_DATABASE=cnc_management
STORAGE_TYPE=auto
EOF

echo "🔍 Setting up json_scanner..."
cat > "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/json_scanner/.env" << EOF
MONGODB_URI=$MONGODB_URI
MONGODB_DATABASE=cnc_scanner
STORAGE_TYPE=auto
EOF

echo "🔧 Setting up ToolManager..."
cat > "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/ToolManager/.env" << EOF
MONGODB_URI=$MONGODB_URI
MONGODB_DATABASE=cnc_tools
STORAGE_TYPE=auto
EOF

echo ""
echo "✅ Setup complete! Your CNC tools will now use:"
echo ""
echo "📊 Database Mapping:"
echo "   • ClampingPlateManager → cnc_management"
echo "   • json_scanner        → cnc_scanner"  
echo "   • ToolManager         → cnc_tools"
echo ""
echo "🔗 Connection: MongoDB Atlas (cloud)"
echo "🔄 Storage mode: auto (MongoDB with local fallback)"
echo ""
echo "🧪 Test your setup:"
echo "   cd ClampingPlateManagerService && npm start"
echo "   cd json_scanner && node main.js --manual"
echo "   cd ToolManager && node main.js --manual"
echo ""
echo "🎉 Ready to use cloud MongoDB with all CNC tools!"