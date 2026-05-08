import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Navbar from "./components/navbar.jsx";
import Dashboard from "./components/Dashbord/Dashboard";
import Products from "./components/Products.tsx";
import "./App.css";
import Loading from "./Loading.jsx";
import ResponseStateModal from "./ResponseStateModal.jsx";
import ProductDetails from "./components/Dashbord/components/ProductDetails.tsx";
import EditDeleteProduct from "./components/Dashbord/components/EditDeleteProduct.tsx";

function App() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      <Loading />
      <ResponseStateModal />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route
            path="/product_patch_delete/:id"
            element={<EditDeleteProduct />}
          />

          {/* Protected Admin Route */}
          <Route
            path="/dashboard"
            element={
              userInfo && userInfo.role === "admin" ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Redirect root to products or login depending on auth state */}
          <Route
            path="/"
            element={
              <Navigate to={userInfo ? "/products" : "/login"} replace />
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
