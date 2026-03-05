# Gold & Silver Investment Platform - MERN Stack

A full-stack platform for buying and selling gold & silver products with digital and physical options.

## Features

- 🏠 **Home Page**: 9-item carousel grid with modal view
- 🛒 **Shopping Cart**: Full cart functionality with Razorpay payment
- 📦 **Product Management**: Admin panel with CRUD operations
- 📊 **Admin Dashboard**: Charts, order management, statistics
- 💳 **Payment Gateway**: Razorpay integration with abstraction layer
- 📤 **CSV Import/Export**: Bulk product management
- 🖼️ **Image Upload**: Product image management
- 📱 **Fully Responsive**: Mobile-first design

## Tech Stack

### Frontend
- React 18 (Vite)
- React Router
- Axios
- Custom CSS with gold theme

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Multer (file uploads)
- Razorpay SDK
- CSV parser/writer

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017
- Database `goldnsilver` created

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/goldnsilver
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. Seed the database:
```bash
npm run seed
```

5. Start the server:
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional):
```env
VITE_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Payment Gateway Setup

See `PAYMENT_SETUP.md` for detailed Razorpay setup instructions.

**Quick Setup:**
1. Get Razorpay keys from https://dashboard.razorpay.com/
2. Add to backend `.env`:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Payment gateway abstraction allows easy switching to other gateways

## Admin Access

- URL: `/admin`
- Username: `admin`
- Password: `admin@1432`

## API Endpoints

### Products
- `GET /api/products` - Get all active products
- `GET /api/products/:slug` - Get product by slug
- `GET /api/admin/products` - Get all products (admin, paginated)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/products/upload-image` - Upload product image
- `POST /api/products/import/import` - Import products from CSV
- `GET /api/products/import/export` - Export products to CSV

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:orderId` - Get order details

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment

## CSV Import/Export

### Sample File
Download `sample-products.csv` from admin panel or backend root.

### Format
```csv
Name,Slug,Metal,Type,Category,Description,Price Per Unit,Unit,Stock,Image URL,Is Featured,Is Active
```

### Import
1. Go to Admin → Products tab
2. Click "Import CSV"
3. Select your CSV file
4. Products will be imported automatically

### Export
1. Go to Admin → Products tab
2. Click "Export CSV"
3. File will download with all products

## Image Upload

- Maximum file size: 5MB
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Images stored in `backend/uploads/products/`
- Accessible via `/uploads/products/filename`

## Stock Management

- Products track available stock
- Stock automatically reduces on successful payment
- "Out of Stock" badge when stock = 0
- "Only X left" badge when stock < 10
- Cart prevents adding more than available stock

## Project Structure

```
GoldProjectMERN/
├── backend/
│   ├── src/
│   │   ├── config/         # DB configuration
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/    # Upload, error handling
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Seed scripts
│   │   ├── services/       # Payment gateway abstraction
│   │   └── server.js       # Entry point
│   ├── uploads/            # Uploaded images
│   └── sample-products.csv
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── state/         # Context providers
│   │   └── styles.css     # Global styles
│   └── index.html
└── README.md
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/goldnsilver
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify database `goldnsilver` exists
- Check `.env` file exists with correct values

### Payment not working
- Verify Razorpay credentials in `.env`
- Check Razorpay script loaded in `index.html`
- Use test keys for development

### Images not showing
- Check `uploads` folder exists in backend
- Verify image URLs in database
- Check file permissions

## License

MIT
