#!/bin/bash

# FiberTrace Backend Startup Script
echo "🚀 Starting FiberTrace Backend Server..."
echo "📦 Installing dependencies..."

cd /home/runner/workspace/backend

# Install dependencies
npm install

# Start server
echo "✅ Starting Express server on port 5000..."
npm run dev
