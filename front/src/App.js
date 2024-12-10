import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
