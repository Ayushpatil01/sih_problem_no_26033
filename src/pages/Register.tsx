import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, ShieldCheck, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer' as 'farmer' | 'buyer' | 'transporter',
    location: '',
  });

  // OTP Verification States
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🟢 पायरी १: ईमेल तपासणे आणि Gmail वर OTP पाठवणे
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = formData.email.trim().toLowerCase();

    // 🔴 मुख्य चेक: ईमेल आधीच कोणत्याही रोलसाठी नोंदणीकृत आहे का ते तपासणे
    const existingUsers = JSON.parse(localStorage.getItem('agro_registered_users') || '[]');
    const alreadyRegistered = existingUsers.find(
      (u: any) => u.email?.trim().toLowerCase() === cleanEmail
    );

    if (alreadyRegistered) {
      const existingRole = alreadyRegistered.role.toUpperCase();
      setError(`⚠️ हा ईमेल आधीच "${existingRole}" म्हणून नोंदणीकृत आहे! एका ईमेलने दुसरा रोल किंवा पुन्हा नोंदणी करता येणार नाही. कृपया थेट Sign In करा.`);
      return;
    }

    setSendingEmail(true);

    // ६ अंकी रँडम OTP तयार करणे
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    // EmailJS Credentials
    const PUBLIC_KEY = '05LM5EziB8wCLyguk';
    const SERVICE_ID = 'service_z745ghk'; 
    const TEMPLATE_ID = 'template_gmdvnp4'; 

    const templateParams = {
      to_name: formData.name,
      to_email: formData.email,
      otp_code: randomOtp,
      message: `AgroConnect India OTP: ${randomOtp}`
    };

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      setStep('otp');
    } catch (err: any) {
      console.warn('EmailJS fallback active:', err);
      // फॉलबॅक अलर्ट:
      setStep('otp');
      alert(`🔐 AgroConnect व्हेरिफिकेशन कोड: ${randomOtp}\n(हा कोड खालील बॉक्समध्ये टाका)`);
    } finally {
      setSendingEmail(false);
    }
  };

  // 🟢 पायरी २: OTP व्हेरिफाय करून युझर सुरक्षित सेव्ह करणे (Vercel & Offline Ready)
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userEnteredOtp.trim() !== generatedOtp.trim()) {
      setError('चुकीचा OTP! कृपया बरोबर ६ अंकी OTP टाका.');
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        ...formData,
        email: formData.email.trim().toLowerCase(),
        id: 'usr_' + Date.now(),
        isEmailVerified: true,
        createdAt: new Date().toISOString()
      };

      // १. लोकल मेमरीमध्ये युझर डेटा सुरक्षित सेव्ह करा
      const existingUsers = JSON.parse(localStorage.getItem('agro_registered_users') || '[]');
      existingUsers.push(newUser);
      localStorage.setItem('agro_registered_users', JSON.stringify(existingUsers));

      // २. जर बॅकएंड उपलब्ध असेल तर तिकडेही पाठवा
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
      } catch (backendErr) {
        console.log('Local Mode active for Vercel deployment');
      }

      // ३. युझरला थेट लॉगिन करून स्टेट अपडेट करा
      login('token_' + Date.now(), newUser as any);

      // ४. रोलनुसार संबंधित डॅशबोर्डवर रिडायरेक्ट करा
      if (newUser.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else if (newUser.role === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (newUser.role === 'transporter') {
        navigate('/transporter-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'नोंदणी अयशस्वी झाली. पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-green-600 mb-6 transition">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Home
        </Link>
        <div className="text-center">
          <div className="inline-flex bg-green-100 p-3 rounded-2xl text-green-600 mb-2">
            {step === 'form' ? <UserPlus className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {step === 'form' ? 'Create AgroConnect Account' : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {step === 'form' ? 'Join India’s direct farm-to-market network' : `Verification code sent to ${formData.email}`}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold leading-relaxed">
              {error}
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === 'form' ? (
            <form onSubmit={handleInitiateRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Ramesh Patil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Location (City / District)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Nashik, Maharashtra"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Select Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="farmer">🌾 Farmer (शेतकरी)</option>
                  <option value="buyer">🛒 Buyer (खरेदीदार)</option>
                  <option value="transporter">🚛 Transporter (वाहतूकदार)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={sendingEmail}
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-green-100 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending OTP to Gmail...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification */
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5">
              <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-1 animate-bounce" />
                <p className="text-xs font-bold text-green-900">OTP व्हेरिफिकेशन कोड टाका</p>
                <p className="text-[11px] text-green-700 mt-0.5">तुमच्या Gmail वर पाठवलेला ६ अंकी कोड टाका.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 text-center mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="• • • • • •"
                  value={userEnteredOtp}
                  onChange={(e) => setUserEnteredOtp(e.target.value)}
                  className="block w-full text-center tracking-widest text-2xl font-black px-4 py-3 border-2 border-green-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs transition"
                >
                  Edit Email
                </button>
                <button
                  type="submit"
                  disabled={loading || userEnteredOtp.length !== 6}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-green-100 text-xs disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-green-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}