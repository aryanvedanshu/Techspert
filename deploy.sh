#!/bin/bash

echo "========================================"
echo "Firebase Hosting Deployment"
echo "========================================"
echo ""

echo "[1/3] Building application for production..."
npm run build
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Build failed!"
    echo "Please check the errors above and fix them."
    exit 1
fi

echo ""
echo "✓ Build completed successfully!"
echo ""

echo "[2/3] Verifying build output..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: Build output not found in dist/ folder"
    exit 1
fi

echo "✓ Build output verified!"
echo ""

echo "[3/3] Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ ERROR: Deployment failed!"
    echo "Please check:"
    echo "  1. You are logged in: firebase login"
    echo "  2. Correct project is selected: firebase use techspert-4270a"
    echo "  3. Firebase CLI is installed: npm install -g firebase-tools"
    exit 1
fi

echo ""
echo "========================================"
echo "✓ Deployment successful!"
echo "========================================"
echo ""
echo "Your site is live at:"
echo "  https://techspert-4270a.web.app"
echo "  https://techspert-4270a.firebaseapp.com"
echo ""




