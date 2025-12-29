import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          User Management
        </Link>

        <div className="navbar-menu">
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className={`navbar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/profile"
            className={`navbar-link ${isActive('/profile') ? 'active' : ''}`}
          >
            Profile
          </Link>
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
