import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './loginPage/login';
import CategoriesPage from './categoriesPage/categories';
import ProductsPage from './productsPage/products';
import SentimentsPage from './sentimentPage/sentiment';
import SubscriptionPage from './subscriptionPage/subscription';
import Unauthorized from './unauthorized/unauthorized';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sentiment" element={<SentimentsPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
