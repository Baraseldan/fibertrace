#!/bin/bash

# FiberTrace Database Initialization Script
# This script sets up the PostgreSQL database with all required tables

echo "🗄️ Setting up FiberTrace Database..."

# Create database if it doesn't exist
psql -U postgres -c "CREATE DATABASE fibertrace;" 2>/dev/null || true

# Run schema
psql -U postgres -d fibertrace -f schema.sql

echo "✅ Database initialization complete!"
echo "📊 Tables created:"
psql -U postgres -d fibertrace -c "\dt" 

echo ""
echo "🚀 To start the backend:"
echo "   cd /home/runner/workspace/backend"
echo "   npm run dev"
