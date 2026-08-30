import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Menu, X, Search, Sprout, ShoppingBag, Truck, 
  Settings, LogOut, ShieldCheck, ChevronRight, 
  Home as HomeIcon, Phone, MessageCircle, Bot, Sparkles, Send
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Gemini AI Chat State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<{ sender: 'user' | 'gemini'; text: string }[]>([
    {
      sender: 'gemini',
      text: '🌱 **नमस्कार! मी AgroConnect India चा Gemini AI स्मार्ट सल्लागार आहे.**\n\nपैसे कसे वाचवायचे, थेट शेतमाल विक्री, वाहतूक (Logistics), लाईव्ह ट्रॅकिंग किंवा पिकांचे रोग याविषयी मला विचारा!'
    }
  ]);

  // Auth pages वर साइडबार लपवणे
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (!user || isAuthPage) {
    return null;
  }

  const handleRoleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const handleSearchClick = () => {
    setIsOpen(false);
    navigate('/buyer-dashboard');
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // 🧠 AgroConnect India बॅकअप सल्लागार (Offline/Fallback Engine)
  const getAgroAiResponse = (input: string): string => {
    const q = input.toLowerCase().trim();

    if (q.includes('paise') || q.includes('पैसे') || q.includes('vachtil') || q.includes('वाचतील') || q.includes('bachat') || q.includes('profit') || q.includes('faida') || q.includes('कमी खर्च')) {
      return `💰 **AgroConnect India वर पैसे व वेळ वाचवण्याचे ५ मार्ग:**
1. **दलाली (Middlemen) शून्य:** थेट खरेदीदाराला विकल्याने व्यापाऱ्यांचे १०-१५% कमिशन वाचते.
2. **थेट ट्रान्सपोर्टर (Direct Transport):** रिकाम्या गाड्यांना थेट लोड मिळतो, त्यामुळे वाहतूक खर्च २०% कमी होतो.
3. **योग्य ग्रेडिंग (Grading):** Grade A मालाला थेट चांगला भाव मिळवून नासाडी टाळा.
4. **स्थानिक खरेदी (Local Sourcing):** Buyer थेट जवळच्या शेतकऱ्याकडून खरेदी करून डिझेल खर्च वाचवू शकतो.
5. **लाईव्ह ट्रॅकिंग:** माल वेळेत पोहोचल्यामुळे नाशवंत फळे-भाज्या खराब होत नाहीत.`;
    }

    if (q === 'hi' || q === 'hello' || q === 'hey' || q === 'namaskar' || q === 'नमस्कार') {
      return `👋 **नमस्कार ${user?.name || 'मित्र'}!**
मी AgroConnect India AI आहे. मी तुम्हाला पुढील गोष्टींमध्ये मदत करू शकतो:
• 🌾 पिकांची थेट विक्री व योग्य भाव ठरवणे
• 🛒 शेतमालाची थेट खरेदी व ट्रॅकिंग
• 🚛 वाहतूकदार म्हणून डिलिव्हरी जॉब्स शोधणे
• 💰 नफा वाढवणे आणि खर्च कमी करणे
तुम्हाला कशाबद्दल जाणून घ्यायचे आहे?`;
    }

    if (q.includes('transport') || q.includes('वाहतूक') || q.includes('gadi') || q.includes('गाडी') || q.includes('driver') || q.includes('delivery')) {
      return `🚛 **AgroConnect India वाहतूक प्रणाली:**
• खरेदीदाराने ऑर्डर टाकल्यावर ती **Transporter Dashboard** वर 'Nearby Jobs' मध्ये दिसते.
• ट्रान्सपोर्टर **'Accept Job'** करून लोड स्वीकारतो आणि त्याला १०% डिलिव्हरी कमिशन मिळते.
• स्टेटस सायकल: \`Pending\` ➔ \`Processing\` ➔ \`Shipped\` ➔ \`In Transit\` ➔ \`Delivered\`.`;
    }

    if (q.includes('farmer') || q.includes('शेतकरी') || q.includes('sell') || q.includes('विक्री') || q.includes('list')) {
      return `🌾 **शेतकऱ्यांसाठी AgroConnect India मार्गदर्शक:**
1. **Farmer Portal** वर जा आणि **'Add New Crop'** वर क्लिक करा.
2. पिकाचे नाव, फोटो, उपलब्ध वजन (kg) आणि थेट तुमचा भाव (₹/kg) ठरवा.
3. ऑर्डर आल्यावर माल पॅक करून **'Mark as Shipped'** करा.`;
    }

    if (q.includes('buyer') || q.includes('खरेदी') || q.includes('order') || q.includes('ऑर्डर') || q.includes('market')) {
      return `🛒 **खरेदीदारांसाठी (Buyer Guide):**
• **Buyer Marketplace** मध्ये जाऊन थेट शेतातून ताजी फळे/भाज्या निवडा.
• कॅटेगरीनुसार (Fruits, Vegetables, Grains) फिल्टर करा.
• **'Order'** बटनावर क्लिक करून हवे तेवढे वजन निवडा आणि थेट ऑर्डर द्या.`;
    }

    if (q.includes('tomato') || q.includes('टोमॅटो')) {
      return `🍅 **टोमॅटो पीक सल्ला:**
• **करपा/डाग:** मँकोझेब (Mancozeb 2g/Ltr) किंवा बाविस्टिनची फवारणी करा.
• **फुलगळ रोखणे:** प्लानोफिक्स (Planofix 0.25ml/Ltr) फवारा.
• **AgroConnect भाव:** सध्या दर्जेदार टोमॅटोला ₹३५ - ₹५०/kg दर मिळत आहे.`;
    }

    if (q.includes('onion') || q.includes('कांदा')) {
      return `🧅 **कांदा पीक व्यवस्थापन:**
• **फुलकिडे (Thrips):** फिप्रोनिल (Fipronil 1.5ml/Ltr) चा वापर करा.
• **साठवणूक टीप:** काढणीनंतर ३-४ दिवस शेतातच सुकवून नंतर साठवा जेणेकरून वजन घटणार नाही.`;
    }

    if (q.includes('soyabean') || q.includes('सोयाबीन') || q.includes('soyabean peak information')) {
      return `🌱 **सोयाबीन पीक माहिती व व्यवस्थापन:**
• **रोग व किडी:** खोडमाशी व चक्रीभुंगा रोखण्यासाठी क्लोरॅन्ट्रानिलीप्रोल (Chlorantraniliprole 0.3ml/Ltr) फवारा.
• **दाणे भरताना:** १९:१९:१९ किंवा १३:००:४५ ची फवारणी करा, ज्यामुळे दाण्यांचा आकार व वजन वाढते.
• **बाजारभाव:** AgroConnect पोर्टलवर सध्या सोयाबीनला ₹४,५०० - ₹४,७००/क्विंटल भाव मिळत आहे.`;
    }

    if (q.includes('contact') || q.includes('number') || q.includes('support') || q.includes('मदत') || q.includes('ayush')) {
      return `📞 **तांत्रिक व व्यवसाय सपोर्ट:**
• **सपोर्ट एक्झिक्युटिव्ह:** Ayush Awatirak
• **मोबाईल/WhatsApp:** +91 9270558429
• कोणत्याही अडचणीसाठी 'Contact Support' बटण वापरा.`;
    }

    return `💡 **AgroConnect India स्मार्ट टीप:**
तुमच्या प्रश्नासाठी (${input}):
1. बाजारातील मध्यस्थ वगळून थेट पोर्टलवर योग्य दर निश्चित करा.
2. मालाची वाहतूक थेट AgroConnect ट्रान्सपोर्ट नेटवर्कद्वारे करा.
3. अधिक सल्ल्यासाठी 'पिके', 'पैसे कसे वाचवायचे', 'ऑर्डर ट्रॅकिंग' विचारा किंवा थेट 'Ayush Awatirak' यांच्याशी संपर्क साधा.`;
  };

  // 🟢 Live Google Gemini API Integration
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMessage = aiPrompt.trim();
    setAiChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setAiPrompt('');
    setAiLoading(true);

    // 🔑 Google Gemini API Key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AQ.Ab8RN6JbuDpDfP-dCxXqnrRr7N7iJ3rD6h5m7fu4rqe0nKP7jQ";

    try {
      // ✅ Updated to standard Gemini 2.5 Flash Endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are AgroConnect India's expert AI Agricultural and Logistics Assistant. 
Respond politely and clearly in Marathi (or bilingual Marathi/English). 
Help users with farming queries, crop health, pest remedies (like कापूस/kapas, सोयाबीन/soyabean, टोमॅटो), market rates, and how to sell/transport using AgroConnect India.
User query: ${userMessage}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const botReply = data.candidates[0].content.parts[0].text;
        setAiChatHistory(prev => [...prev, { sender: 'gemini', text: botReply }]);
      } else {
        console.warn("Falling back to local Agro response. Details:", data);
        const fallbackResponse = getAgroAiResponse(userMessage);
        setAiChatHistory(prev => [...prev, { sender: 'gemini', text: fallbackResponse }]);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      const fallbackResponse = getAgroAiResponse(userMessage);
      setAiChatHistory(prev => [...prev, { sender: 'gemini', text: fallbackResponse }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      {/* 🟢 Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition focus:outline-none flex items-center gap-2"
            title="Open Menu"
          >
            <Menu className="h-6 w-6 text-gray-800" />
          </button>

          {/* 🌟 AgroConnect INDIA Logo आणि ब्रँडिंग */}
          <Link to="/" className="flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="AgroConnect India" 
              className="w-9 h-9 rounded-full object-cover shadow-xs border border-green-100" 
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Agro<span className="text-green-600">Connect</span> <span className="text-xs font-black tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">INDIA</span>
            </span>
          </Link>
        </div>

        {/* युझर नाव आणि भाषा टॉगल */}
        <div className="flex items-center gap-2">
          {/* 🌐 Global Language Switcher */}
          <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-[11px] font-bold">
            <button
              onClick={() => setLang('mr')}
              className={`px-2 py-0.5 rounded-lg transition ${
                lang === 'mr' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 rounded-lg transition ${
                lang === 'en' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-1.5 pl-1 border-l border-gray-200">
            <span className="text-xs font-bold text-gray-700 capitalize hidden sm:inline">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </span>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Sidebar */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-[310px] max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out border-r border-gray-100 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Drawer Top Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="AgroConnect India" 
                className="w-8 h-8 rounded-full object-cover shadow-xs border border-green-100" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                  Agro<span className="text-green-600">Connect</span> <span className="text-[10px] text-amber-600 font-black">INDIA</span>
                </h2>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {user.role} Portal
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            <button
              onClick={() => handleRoleNavigate('/')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                location.pathname === '/'
                  ? 'bg-green-50 text-green-700 font-bold shadow-xs'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <HomeIcon className="h-5 w-5 text-gray-500" />
                <span>{t('मुख्य पृष्ठ (Home)', 'Home Page')}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>

            <div className="pt-2 border-t border-gray-100 my-2"></div>
            <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('माझे डॅशबोर्ड', 'My Dashboard')}
            </div>

            {user.role === 'farmer' && (
              <button
                onClick={() => handleRoleNavigate('/farmer-dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname === '/farmer-dashboard'
                    ? 'bg-green-50 text-green-700 font-bold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sprout className="h-5 w-5 text-green-600" />
                  <span>{t('शेतकरी पोर्टल', 'Farmer Portal')}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </button>
            )}

            {user.role === 'buyer' && (
              <button
                onClick={() => handleRoleNavigate('/buyer-dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname === '/buyer-dashboard'
                    ? 'bg-green-50 text-green-700 font-bold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                  <span>{t('खरेदीदार मार्केटप्लेस', 'Buyer Marketplace')}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </button>
            )}

            {user.role === 'transporter' && (
              <button
                onClick={() => handleRoleNavigate('/transporter-dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname === '/transporter-dashboard'
                    ? 'bg-green-50 text-green-700 font-bold shadow-xs'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-amber-600" />
                  <span>{t('वाहतूकदार लॉजिस्टिक्स', 'Transporter Logistics')}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-40" />
              </button>
            )}

            <div className="pt-3 border-t border-gray-100 my-2"></div>
            
            <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              {t('मदत आणि साधने', 'Assistance & Tools')}
            </div>

            <button 
              onClick={handleSearchClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition"
            >
              <Search className="h-5 w-5 text-gray-500" />
              <span>{t('शेतमाल शोधा', 'Search Crops & Produce')}</span>
            </button>

            <button
              onClick={() => { setShowGeminiModal(true); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-purple-700 bg-purple-50/80 hover:bg-purple-100 rounded-xl text-sm font-bold transition border border-purple-100"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                <span>{t('Gemini AI शेती सल्ला', 'Gemini AI Agri Help')}</span>
              </div>
              <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black">AI</span>
            </button>

            <button 
              onClick={() => { setShowSupportModal(true); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-semibold transition"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <span>{t('सपोर्टशी संपर्क साधा', 'Contact Support')}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </button>
          </div>
        </div>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white font-black flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-green-700 font-bold capitalize flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user.role} {user.location ? `• ${user.location}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-red-100"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('लॉगआउट', 'Log out')}</span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">AgroConnect Support</h3>
                  <p className="text-xs text-gray-500 font-medium">Direct Technical & Business Support</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-5 space-y-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Support Executive</p>
              <p className="text-lg font-black text-gray-900">Ayush Awatirak</p>
              <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                <span>📞 +91 9270558429</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:9270558429"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-green-100 transition text-sm"
              >
                <Phone className="h-4 w-4" />
                <span>Call Now</span>
              </a>
              <a
                href="https://wa.me/919270558429"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition text-sm"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 Gemini AI Assistant Modal */}
      {showGeminiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[600px] shadow-2xl flex flex-col overflow-hidden border border-purple-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-green-600 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight flex items-center gap-2">
                    Gemini Agri Assistant <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Live AI</span>
                  </h3>
                  <p className="text-[11px] text-purple-100 font-medium">AgroConnect India स्मार्ट शेती व व्यवसाय सल्लागार</p>
                </div>
              </div>
              <button
                onClick={() => setShowGeminiModal(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* AI Chat History */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
              {aiChatHistory.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium shadow-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    {msg.sender === 'gemini' ? 'Gemini Live AI' : 'You'}
                  </span>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-600 font-bold bg-purple-50 p-2.5 rounded-xl w-fit">
                  <Bot className="h-4 w-4 animate-spin" />
                  Gemini विश्लेषण करत आहे...
                </div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSendAiMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder={t('पैसे कसे वाचवायचे, पिके, ट्रान्सपोर्ट याबद्दल विचारा...', 'Ask about crops, pests, market rates, transport...')}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-600 transition"
              />
              <button
                type="submit"
                disabled={!aiPrompt.trim() || aiLoading}
                className="bg-purple-600 text-white p-3 rounded-2xl hover:bg-purple-700 transition disabled:opacity-50 shadow-md shadow-purple-100 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}