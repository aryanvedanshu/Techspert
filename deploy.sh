#!/bin/bash

# Techspert Deployment Script
echo "🚀 Techspert - Online Course Platform Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are available ✅"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists, skipping creation"
fi

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
print_success "Logs directory created"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_success "MongoDB is running ✅"
else
    print_error "MongoDB is not responding"
    exit 1
fi

# Check Backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_success "Backend API is running ✅"
else
    print_error "Backend API is not responding"
    exit 1
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is running ✅"
else
    print_error "Frontend is not responding"
    exit 1
fi

# Check Nginx
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_success "Nginx reverse proxy is running ✅"
else
    print_error "Nginx reverse proxy is not responding"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "================================================"
echo ""
echo "📱 Access your application:"
echo "   Main App:     http://localhost"
echo "   Admin Panel:  http://localhost/admin"
echo "   API:          http://localhost/api"
echo "   Health Check: http://localhost/health"
echo ""
echo "🔐 Default Login Credentials:"
echo "   Super Admin:  super-admin@techspert.ai / Admin123"
echo "   Student:      john.doe@example.com / Student123"
echo "   Instructor:   jane.smith@example.com / Instructor123"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
print_success "Techspert is ready to use! 🚀"
