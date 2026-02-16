import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";
// Force rebuild
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Splash from "./components/Splash";
// import "./i18n"; // Import i18n config
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import ShippingPolicy from "./pages/ShippingPolicy"; // Added
import AdminPriorityOrders from "./pages/admin/AdminPriorityOrders";
import AdminProjectOrders from "./pages/admin/AdminProjectOrders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProjects from "./pages/admin/AdminProjects"; // Added
import AdminWorkshopEnquiries from "./pages/admin/AdminWorkshopEnquiries"; // Added
import AdminWorkshops from "./pages/admin/AdminWorkshops"; // Added
import Projects from "./pages/Projects";
import Workshops from "./pages/Workshops";
import TrackOrder from "./pages/TrackOrder";
import CompleteProfile from "./pages/CompleteProfile"; // Added

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem("seenSplash");
  });

  // Redefining ProtectedRoute locally as per instruction
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    return children; // Added return children to complete the component logic
  };

  const handleSplashFinish = () => {
    sessionStorage.setItem("seenSplash", "1");
    setShowSplash(false);
  };

  return (
    <GoogleOAuthProvider clientId="733597529233-msuclt8qeide7tgimobj99p0tp397uqd.apps.googleusercontent.com">
      <>
        {showSplash ? (
          <Splash onFinish={handleSplashFinish} duration={5000} />
        ) : null}

        {!showSplash && (
          <Router>
            <ToastContainer position="top-center" autoClose={1800} />
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="enquiries" element={<AdminWorkshopEnquiries />} />
                <Route path="workshops" element={<AdminWorkshops />} />
                <Route path="priority-orders" element={<AdminPriorityOrders />} />
                <Route path="project-orders" element={<AdminProjectOrders />} />
              </Route>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/about" element={<About />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/track-order/:orderId" element={<TrackOrder />} />
              <Route path="/checkout" element={<ProtectedRoute> <Checkout /> </ProtectedRoute>} />
              <Route path="/order/:id" element={<ProtectedRoute> <OrderDetails /> </ProtectedRoute>} />
              <Route path="/my_orders" element={<ProtectedRoute> <MyOrders /> </ProtectedRoute>} />
              <Route path="/Profile" element={<ProtectedRoute> <Profile /> </ProtectedRoute>} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
            </Routes >
          </Router >
        )}
      </>
    </GoogleOAuthProvider>
  );
}

export default App;
// Rebuild trigger
