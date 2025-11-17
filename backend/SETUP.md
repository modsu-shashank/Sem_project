# Backend Setup Guide

## 🚀 Quick Start

### 1. Create Environment File
Create a `.env` file in the `backend` directory with the following content:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://shashankreddy:QhJBlNfUN0j09pzA@cluster0.pf1tu.mongodb.net/rgo-organic-millets?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start the Server
```bash
npm run dev
```

## 🔧 Configuration

### MongoDB Atlas Connection
The backend is configured to connect to your MongoDB Atlas cluster:
- **Cluster**: cluster0.pf1tu.mongodb.net
- **Database**: rgo-organic-millets
- **Username**: shashankreddy
- **Password**: QhJBlNfUN0j09pzA

### Environment Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend application URL

## 📊 Database Models

The backend includes the following models:
- **User**: Authentication and user management
- **Product**: Product catalog and inventory
- **Order**: Order management and tracking

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- CORS protection
- Helmet.js security headers
- Input validation

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

## 🚨 Troubleshooting

### MongoDB Connection Issues
1. Check if your IP is whitelisted in MongoDB Atlas
2. Verify the connection string format
3. Ensure the database name is correct

### Port Already in Use
Change the PORT in your `.env` file:
```env
PORT=5001
```

### JWT Errors
Make sure you have a strong JWT_SECRET in your `.env` file.

## 📝 Notes

- The backend will start even without MongoDB connection for testing
- All routes are functional with placeholder data
- Database models are ready for production use
- Security middleware is fully implemented
