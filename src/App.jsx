import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Navbar from './components/navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Products from './components/Products.jsx';
import './App.css';

function App() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        
        {/* Protected Admin Route */}
        <Route 
          path="/dashboard" 
          element={
            userInfo && userInfo.role === 'admin' 
            ? <Dashboard /> 
            : <Navigate to="/login" />
          } 
        />
        
        {/* Redirect root to products or login depending on auth state */}
        <Route path="/" element={<Navigate to={userInfo ? "/products" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
