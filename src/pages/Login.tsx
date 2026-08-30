import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      let matchedUser: any = null;

      // १. लोकल मेमरी (LocalStorage) मधील युझर्स तपासा
      const storedUsers = JSON.parse(localStorage.getItem('agro_registered_users') || '[]');
      matchedUser = storedUsers.find(
        (u: any) => u.email?.trim().toLowerCase() === cleanEmail && u.password === cleanPassword
      );

      // २. जर बॅकएंड सर्व्हर उपलब्ध असेल तर तिकडून डेटा मिळवण्याचा प्रयत्न करा
      if (!matchedUser) {
        try {
          const res = await fetch(`/api/users?email=${encodeURIComponent(cleanEmail)}&password=${encodeURIComponent(cleanPassword)}`);
          if (res.ok) {
            const users = await res.json();
            if (Array.isArray(users) && users.length > 0) {
              matchedUser = users[0];
            }
          }
        } catch (serverErr) {
          // Vercel वर सर्व्हर उपलब्ध नसताना शांतपणे पुढे जा
        }
      }

      // ३. फॉलबॅक डेमो खाती (Demo Accounts Fallback)
      if (!matchedUser) {
        if (cleanEmail === 'ayushawatirak@gmail.com' && cleanPassword === '1234') {
          matchedUser = {
            id: 'usr_admin',
            name: 'Ayush Awatirak',
            email: 'ayushawatirak@gmail.com',
            role: 'farmer',
            location: 'Maharashtra',
            isEmailVerified: true
          };
        } else if (cleanEmail.includes('farmer') && cleanPassword === '1234') {
          matchedUser = { id: 'usr_farmer', name: 'Kisan Demo', email: cleanEmail, role: 'farmer', location: 'Nashik' };
        } else if (cleanEmail.includes('buyer') && cleanPassword === '1234') {
          matchedUser = { id: 'usr_buyer', name: 'Buyer Demo', email: cleanEmail, role: 'buyer', location: 'Pune' };
        } else if (cleanEmail.includes('transporter') && cleanPassword === '1234') {
          matchedUser = { id: 'usr_transporter', name: 'Driver Demo', email: cleanEmail, role: 'transporter', location: 'Mumbai' };
        }
      }

      // युझर सापडला नाही तर एरर दाखवा
      if (!matchedUser) {
        throw new Error('ईमेल किंवा पासवर्ड चुकीचा आहे! कृपया आधी Register करा.');
      }

      // ४. AuthContext मध्ये यशस्वी लॉगिन करा
      login('mock-jwt-token-' + Date.now(), matchedUser as any);

      // ५. युझरच्या निश्चित केलेल्या मूळ रोलनुसार (Role-Locked) योग्य डॅशबोर्डवर नेणे
      if (matchedUser.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else if (matchedUser.role === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (matchedUser.role === 'transporter') {
        navigate('/transporter-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(err.message || 'लॉगिन अयशस्वी झाले. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        
        {/* 🟢 Back to Home Link */}
        <div className="mb-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-green-600 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Home
          </Link>
        </div>

        {/* 🟢 Logo Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="bg-green-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md shadow-green-100">
              🌾
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Agro<span className="text-green-600">Connect</span>
            </h2>
          </Link>
          <p className="mt-2 text-xs text-gray-500 font-medium">Sign in to access your dashboard</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium leading-relaxed">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition shadow-green-100 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-green-600 hover:text-green-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}