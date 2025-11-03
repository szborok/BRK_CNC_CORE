# ClampingPlateManager Service

A headless REST API service for managing CNC clamping plates, extracted from the original React application. This service provides all the business logic without UI components, making it perfect for integration with multiple frontends or as part of a larger CNC management ecosystem.

## 🚀 Quick Start

### Prerequisites

- Node.js 14+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB settings
# Start MongoDB locally or use MongoDB Atlas

# Start the service
npm start
```

### Development

```bash
# Start with auto-reload
npm run dev

# Use CLI interface
npm run cli -- --help
```

## 📋 API Endpoints

### Plates Management

```
GET    /api/plates              # Get all plates (with filtering)
GET    /api/plates/analytics    # Get dashboard analytics
GET    /api/plates/:plateId     # Get specific plate
POST   /api/plates              # Create new plate
PUT    /api/plates/:plateId     # Update plate
DELETE /api/plates/:plateId     # Delete plate
```

### Work Management

```
POST /api/plates/:plateId/work/start   # Start work on plate
POST /api/plates/:plateId/work/finish  # Finish work on plate
```

### Plate Status

```
POST /api/plates/:plateId/lock    # Lock plate
POST /api/plates/:plateId/unlock  # Unlock plate
```

### System

```
GET /health                      # Service health check
GET /api                        # API documentation
```

## 🖥️ CLI Usage

The service includes a comprehensive CLI for testing and administration:

```bash
# Create a new plate
npm run cli create-plate -id P001 -s A-12 -n "Standard Clamp" -o "John"

# List all plates
npm run cli list-plates

# Filter plates
npm run cli list-plates --status free
npm run cli list-plates --shelf A-12

# Start work on a plate
npm run cli start-work -id P001 -w W5270NS01001A -o "John"

# Finish work
npm run cli finish-work -id P001 -o "John" --tools "Tool1,Tool2"

# Get plate details
npm run cli get-plate -id P001

# View analytics
npm run cli analytics

# Lock/unlock plates
npm run cli lock-plate -id P001 -o "Admin" -r "Maintenance required"
npm run cli unlock-plate -id P001 -o "Admin"

# Create backup
npm run cli backup
```

## 📡 WebSocket Events

Real-time events for frontend integration:

```javascript
// Connection
socket.on('connected', (data) => { ... });

// Plate events
socket.on('plate-created', (data) => { ... });
socket.on('plate-updated', (data) => { ... });
socket.on('plate-deleted', (data) => { ... });

// Work events
socket.on('work-started', (data) => { ... });
socket.on('work-finished', (data) => { ... });

// Status events
socket.on('plate-locked', (data) => { ... });
socket.on('plate-unlocked', (data) => { ... });

// System events
socket.on('backup-completed', (data) => { ... });
```

## 🗄️ Data Model

### Plate Structure

```javascript
{
  plateId: "P001",
  name: "Standard Clamp A1",
  shelf: "A-12",
  status: {
    health: "new|used|locked",
    occupancy: "free|in-use"
  },
  currentWork: {
    workName: "W5270NS01001A",
    startedAt: Date,
    operator: "John"
  },
  history: [
    {
      id: "uuid",
      action: "work-started",
      user: "John",
      date: Date,
      details: { ... }
    }
  ],
  toolsUsed: [
    {
      toolName: "Tool1",
      usedAt: Date,
      workName: "W5270NS01001A"
    }
  ],
  files: {
    previewImage: "/uploads/...",
    xtFile: "/uploads/...",
    drawings: ["/uploads/..."]
  }
}
```

## 🔧 Configuration

Edit `config.js` or use environment variables:

```javascript
// MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=cnc_management

// Service
PORT=3001
NODE_ENV=development

// CORS
CORS_ORIGINS=http://localhost:3000
```

## 📊 Data Retention

Following your requirements:

- **Clamping Plate Data**: Permanent storage + 7-day rolling backup
- **Activity Logs**: Permanent with backup
- **Backup Collections**: Auto-cleanup after 7 days (TTL indexes)

## 🔗 Integration

### With json_scanner

```javascript
// Send work completion to plate service
await fetch("http://localhost:3001/api/plates/P001/work/finish", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    operator: "json_scanner",
    toolsUsed: extractedTools,
  }),
});
```

### With ToolManager

```javascript
// Update tool usage on plates
await fetch("http://localhost:3001/api/plates", {
  method: "GET",
  params: { workName: "W5270NS01001A" },
});
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2 (Process Manager)

```bash
npm install -g pm2
pm2 start src/main.js --name clamping-plate-service
```

## 🧪 Testing

```bash
# Test service health
curl http://localhost:3001/health

# Create test plate
curl -X POST http://localhost:3001/api/plates \
  -H "Content-Type: application/json" \
  -d '{"plateId":"P001","shelf":"A-12","operator":"Test"}'

# Get analytics
curl http://localhost:3001/api/plates/analytics
```

## 🔍 Monitoring

- **Health Check**: `GET /health`
- **Database Status**: Included in health check
- **WebSocket Status**: Real-time connection monitoring
- **Automatic Backups**: Daily at 2 AM

## 📝 Logs

Service logs include:

- API requests and responses
- Database operations
- WebSocket connections
- Error tracking
- Backup operations

## 🤝 Contributing

This headless service is designed to be the foundation for the CNC management ecosystem. It provides:

- Complete business logic without UI coupling
- RESTful API for any frontend
- Real-time WebSocket updates
- CLI for administration
- Comprehensive data model
- Built-in backup strategy

Perfect for integration with React dashboards, mobile apps, or other CNC management tools!
