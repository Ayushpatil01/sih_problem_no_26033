import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogOut, User as UserIcon, Truck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Truck className="h-8 w-8" />
              <span className="font-bold text-xl tracking-tight">AgroConnect India</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/contact"
              className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === 'farmer' ? '/farmer-dashboard' : (user.role === 'buyer' ? '/buyer-dashboard' : '/transporter-dashboard')}
                  className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2 bg-green-700 px-3 py-1.5 rounded-full">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-green-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
