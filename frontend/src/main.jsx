import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { CartProvider } from './state/CartContext';
import { ProductDetailModalProvider } from './state/ProductDetailModalContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <ProductDetailModalProvider>
          <App />
        </ProductDetailModalProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);

