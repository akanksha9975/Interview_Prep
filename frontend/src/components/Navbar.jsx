import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            🎯 AI Interview Prep
          </Link>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/upload" className="hover:text-blue-200 transition">
                  Upload Docs
                </Link>
                <Link to="/chat" className="hover:text-blue-200 transition">
                  Chat
                </Link>
                <span className="text-sm text-blue-200">{user.email}</span>
                <button
                  onClick={logout}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
