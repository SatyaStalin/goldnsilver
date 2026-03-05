# Backend Setup Instructions

## Prerequisites
- Node.js 18+ installed
- MongoDB running on localhost:27017
- Database `goldnsilver` already created

## Installation

1. Install dependencies:
```bash
npm install
```

2. Seed the database with default products:
```bash
npm run seed
```

This will:
- Clear existing products
- Add 4 default products:
  - Digital Gold 10g (stock: 100)
  - Gold Coin 5g (stock: 50)
  - Silver Coin 100g (stock: 200)
  - Gold SIP Monthly Plan (stock: 999)

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all active products
- `GET /api/products?featured=true` - Get featured products
- `GET /api/products/:slug` - Get product by slug

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/:orderId/payment` - Process payment (mock)
- `GET /api/orders/:orderId` - Get order details

## Database Collections

- `products` - Product catalog with stock management
- `orders` - Order and payment tracking
- `users` - User accounts (for future use)

## Stock Management

- Products have a `stock` field that tracks available quantity
- When payment is successful, stock is automatically reduced
- Products with `stock: 0` show "Out of Stock" message
- Products with low stock (< 10) show "Only X left" badge
