#!/bin/bash

echo "🚀 Starting TelecomBilling Development Servers..."

# Kill any existing processes
pkill -f "php artisan serve"
pkill -f "next dev"

# Start backend
echo "🔧 Starting Laravel backend on http://localhost:8000..."
cd backend
php artisan serve --port=8000 &
BACKEND_PID=$!

# Start frontend  
echo "🎨 Starting Next.js frontend on http://localhost:3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo "   Backend:  http://localhost:8000/api"
echo "   Frontend: http://localhost:3000"
echo ""
echo "🔑 Test Accounts:"
echo "   GLO-2510-001 / pass001"
echo "   GLO-2510-002 / pass002"
echo "   GLO-2510-003 / pass003"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait