# Kiran Dairy Farm - ERP & POS System

A complete MERN Stack application for managing dairy farm operations, including inventory management, stock dispatch, and point-of-sale billing.

## 📁 Project Structure

```
Kiran-Dairy/
├── server/           # Node.js/Express backend
│   ├── src/
│   │   ├── config/   # Database & environment config
│   │   ├── models/   # MongoDB schemas
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── seed/     # Seed data
│   ├── package.json
│   └── server.js
│
└── client/           # React frontend
    ├── src/
    │   ├── api/      # API integration
    │   ├── components/
    │   ├── pages/
    │   ├── layouts/
    │   ├── context/
    │   ├── hooks/
    │   ├── utils/
    │   └── App.jsx
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/update `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/kiran-dairy
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Seed initial data:
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create/update `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Tailwind CSS Installation (Optional - Already configured):
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3004`

## 🔐 Demo Credentials

### Admin Login
- **Email:** admin@kiran-dairy.com
- **Password:** admin123

### Shop Login
- **Email:** shop1@kiran-dairy.com
- **Password:** admin123

## 📋 Demo Flow

### Part 1: Admin Panel
1. **Admin Login** → Authenticate with admin credentials
2. **Admin Dashboard** → View overview of shops, stock, and dispatches
3. **Create Dispatch** → Select shop and products to dispatch
4. **Dispatch History** → View all created dispatches
5. **Admin Logs** → View stock ledger/transaction history

### Part 2: Shop Panel
1. **Shop Login** → Authenticate with shop credentials
2. **Shop Dashboard** → View received stock summary
3. **Inventory** → View all products and current quantities
4. **POS Billing** → Create sales and reduce stock automatically
5. **Sales History** → View completed transactions
6. **Returns** → Manage product returns

## 🗄️ Database Models

- **User** - Admin and Shop users
- **Shop** - Branch/Store information
- **Product** - Product catalog
- **Inventory** - Shop-wise stock levels
- **Dispatch** - Stock transfers from admin to shops
- **Sale** - Point-of-sale transactions
- **Return** - Product returns
- **StockLedger** - All stock movements (Admin logs)

## 📦 Key Features

✅ Role-based access control (Admin/Shop)
✅ Real-time inventory management
✅ Automated stock tracking with ledger
✅ POS billing system
✅ Dispatch management
✅ Sales and returns processing
✅ Dashboard analytics
✅ JWT authentication

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router
- Axios
- Tailwind CSS
- Context API

## 📚 API Endpoints (To be implemented)

### Auth
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration (supports both `admin` and `shop` roles; shop signup creates a Shop record)


**Client pages**
- `/login` – combined login for admin/shop
- `/register` – new registration page with role selector

### Admin
- GET `/api/admin/dashboard` - Admin dashboard data
- GET `/api/admin/shops` - Get all shops
- GET `/api/admin/products` - Get all products

### Dispatch
- POST `/api/dispatch` - Create dispatch
- GET `/api/dispatch` - Get all dispatches
- GET `/api/dispatch/:id` - Get dispatch details

### Sales
- POST `/api/sales` - Create sale
- GET `/api/sales` - Get all sales
- GET `/api/sales/history` - Sales history

### Ledger
- GET `/api/ledger` - Get stock ledger
- GET `/api/ledger/shop/:shopId` - Ledger by shop
- GET `/api/ledger/product/:productId` - Ledger by product

## 🎯 Next Steps

1. Implement all controller functions
2. Connect database and models to routes
3. Add form validations
4. Implement error handling
5. Add real-time notifications
6. Deploy to production

## 📝 Notes

- The project uses ES6 modules (`"type": "module"` in package.json)
- Tailwind CSS is configured for styling
- All routes require authentication except login pages
- Seed data includes demo admin and 2 shop accounts

## 🤝 Contributing

This is a learning project. Feel free to extend and modify as needed.

## 📄 License

MIT License

---

Happy Coding! 🎉
