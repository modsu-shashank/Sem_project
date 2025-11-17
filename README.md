# RGO Organic Millets - Full Stack Application

A comprehensive e-commerce platform for organic millets and grains, built with modern web technologies.

## 🏗️ Project Structure

```
project/
├── backend/                 # Backend API server
│   ├── config/             # Database and configuration
│   ├── controllers/        # Business logic controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── frontend/               # React frontend application
│   ├── src/                # Source code
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── index.html          # HTML entry point
└── README.md               # Project documentation
```

## 🚀 Features

### Backend API
- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User, Admin, Moderator)
  - Password reset and email verification
  - Rate limiting and security middleware

- **Product Management**
  - Comprehensive product catalog
  - Category and subcategory organization
  - Stock management and inventory tracking
  - Product reviews and ratings

- **Order Management**
  - Complete order lifecycle
  - Payment processing integration
  - Shipping and tracking
  - Order history and analytics

- **Security Features**
  - Helmet.js security headers
  - CORS configuration
  - Rate limiting
  - Input validation and sanitization
  - SQL injection protection

### Frontend Application
- **User Interface**
  - Modern, responsive design
  - Tailwind CSS styling
  - Mobile-first approach
  - Dark/light theme support

- **User Experience**
  - Intuitive navigation
  - Product search and filtering
  - Shopping cart functionality
  - User dashboard and profile management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet.js, CORS, Rate Limiting
- **Validation**: Express Validator
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rgo-organic-millets
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/analytics` - Get analytics data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **CORS Protection**: Controlled cross-origin requests
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Helmet.js security middleware
- **SQL Injection Protection**: Mongoose ODM protection

## 📱 Demo Credentials

### Admin Account
- **Email**: admin@rgo.com
- **Password**: StrongPassword123!

### User Account
- **Email**: user@rgo.com
- **Password**: StrongPassword123!

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📦 Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 🌍 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📊 Database Schema

### User Model
- Basic info (username, email, password)
- Profile details (firstName, lastName, phone, address)
- Role-based access control
- Account verification and security
- User preferences and settings

### Product Model
- Product information (name, description, category)
- Pricing and inventory management
- Images and specifications
- Reviews and ratings
- Organic certifications

### Order Model
- Order details and items
- Shipping and billing addresses
- Payment information
- Order status tracking
- Customer notes and feedback

## 🔧 Development Tools

- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Nodemon**: Auto-restart on file changes
- **Morgan**: HTTP request logging
- **Compression**: Response compression

## 📈 Performance Features

- **Database Indexing**: Optimized queries
- **Response Compression**: Reduced bandwidth usage
- **Rate Limiting**: API abuse prevention
- **Caching**: Improved response times
- **Error Handling**: Graceful error management

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, AWS, or similar platform
4. Set up SSL certificates

### Frontend Deployment
1. Build the production bundle
2. Deploy to Netlify, Vercel, or similar platform
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete authentication system
- Product management
- Order processing
- Admin dashboard
- Responsive frontend design

---

**Built with ❤️ by the RGO Team**
