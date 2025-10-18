#!/bin/bash

# Techspert Backend Startup Script
echo "🚀 Starting Techspert Backend Server..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until mongosh --host mongodb --port 27017 --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "MongoDB is unavailable - sleeping"
  sleep 2
done

echo "✅ MongoDB is ready!"

# Check if database needs seeding
echo "🔍 Checking if database needs seeding..."
SEEDED=$(mongosh --host mongodb --port 27017 --username admin --password password123 --authenticationDatabase admin --eval "db.admin.find().count()" --quiet)

if [ "$SEEDED" -eq 0 ]; then
  echo "🌱 Database is empty, seeding with sample data..."
  npm run seed
  echo "✅ Database seeded successfully!"
else
  echo "✅ Database already contains data, skipping seeding."
fi

# Start the server
echo "🎯 Starting Node.js server..."
npm start
