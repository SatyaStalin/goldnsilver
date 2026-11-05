import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { CartProvider } from './state/CartContext';
import { ProductDetailModalProvider } from './state/ProductDetailModalContext';
import { AuthProvider } from './state/AuthContext';
import { ToastProvider } from './state/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <ProductDetailModalProvider>
              <App />
            </ProductDetailModalProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);

