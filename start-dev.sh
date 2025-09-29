#!/bin/bash

echo "🌱 Starting Plant API Development Server..."
echo ""
echo "📋 Configuration:"
echo "   ✅ MongoDB with Mongoose ODM"
echo "   ✅ JWT Authentication with Passport"
echo "   ✅ User registration and login"
echo "   ✅ Global validation with class-validator"
echo "   ✅ CORS configured for frontend integration"
echo "   ✅ Global API prefix: /api/v1"
echo "   ✅ Swagger documentation available"
echo ""
echo "🔗 Available endpoints:"
echo "   POST /api/v1/auth/register - User registration"
echo "   POST /api/v1/auth/login - User login"
echo "   GET  /api/v1/auth/profile - Get user profile (protected)"
echo "   POST /api/v1/auth/refresh - Refresh JWT token (protected)"
echo "   GET  /api/v1/users/profile - Get detailed user profile (protected)"
echo "   GET  /api/v1/health - Health check"
echo ""
echo "🚀 Starting server on port 3001..."
echo "📱 Frontend can connect to: http://localhost:3001"
echo "📚 Swagger Documentation: http://localhost:3001/api/docs"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with default configuration..."
    cat > .env << EOL
# MongoDB Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/plant_db?authSource=admin
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=plant_db
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:4200
EOL
    echo "✅ .env file created successfully!"
    echo ""
fi

# Start the development server
pnpm run start:dev
