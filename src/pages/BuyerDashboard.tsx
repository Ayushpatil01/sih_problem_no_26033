import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket, type Order } from '../context/MarketContext';
import LiveTrackingModal from '../components/LiveTrackingModal';
import InvoiceModal from '../components/InvoiceModal';
import { useLanguage } from '../context/LanguageContext';
import { 
  Search, MapPin, ChevronRight, Plus, Minus, ShoppingBag, 
  RotateCcw, User, Sprout, Phone, Wallet, Award, ArrowRight, 
  ChevronDown, Check, X, ShoppingCart, MessageCircle, Send, 
  Navigation, QrCode
} from 'lucide-react';

export default function BuyerDashboard() {
  const { user, logout } = useAuth();
  const { products: allProducts, orders, addOrder, sendMessage, addReview } = useMarket();
  const { lang, setLang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'reorder' | 'orders' | 'account'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [walletBalance, setWalletBalance] = useState(250);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState(false);

  // 💬 ट्रान्सपोर्टर चॅट मोडल स्टेट
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [buyerMessageInput, setBuyerMessageInput] = useState('');

  // 🗺️ GPS ट्रॅकिंग आणि 🧾 बिल मोडल स्टेट्स
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const categories = [
    { key: 'ALL', name: 'ALL', marathi: 'सर्व', bg: 'bg-emerald-50', color: 'text-emerald-800', img: '🌱' },
    { key: 'FRUITS', name: 'FRUITS', marathi: 'ताजी फळे', bg: 'bg-[#E8F8F0]', color: 'text-emerald-800', img: '🍎' },
    { key: 'VEGETABLE', name: 'VEGETABLE', marathi: 'भाज्या', bg: 'bg-[#FEEFEA]', color: 'text-rose-800', img: '🥦' },
    { key: 'GHEE', name: 'ORGANIC GHEE', marathi: 'गावठी तूप', bg: 'bg-[#FEF8E7]', color: 'text-amber-800', img: '🧈' },
    { key: 'COLD PRESSED OIL', name: 'COLD PRESSED OIL', marathi: 'घाण्याचे तेल', bg: 'bg-[#FDF1E8]', color: 'text-orange-800', img: '🌻' },
    { key: 'VILLAGE STAPLES', name: 'VILLAGE STAPLES', marathi: 'गावरान डाळी', bg: 'bg-[#F2EDFD]', color: 'text-purple-800', img: '🌾' }
  ];

  // फिल्टर केलेले शेतमाल प्रॉडक्ट्स
  const filteredProducts = allProducts.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || (p.category && p.category.toUpperCase() === selectedCategory.toUpperCase());
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.farmer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // कार्ट व्यवस्थापन
  const addToCart = (id: number) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] -= 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const totalCartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalCartAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = allProducts.find(p => p.id === Number(id));
    return sum + (product ? product.price * qty : 0);
  }, 0);

  // थेट ऑर्डर करणे (Checkout)
  const handlePlaceOrder = () => {
    if (totalCartCount === 0) return;

    const firstProduct = allProducts.find(p => cart[p.id]);

    const newOrderItems = Object.entries(cart).map(([id, qty]) => {
      const product = allProducts.find(p => p.id === Number(id))!;
      return {
        name: product.name,
        qty: qty,
        price: product.price,
        unit: product.unit
      };
    });

    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: t('आज, ', 'Today, ') + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      buyerName: user?.name || t('खरेदीदार', 'Buyer'),
      buyerLocation: user?.location || 'पुणे, महाराष्ट्र',
      farmerName: firstProduct?.farmer || t('शेतकरी मित्र', 'Farmer Partner'),
      farmerLocation: firstProduct?.location || 'नाशिक, महाराष्ट्र',
      items: newOrderItems,
      total: totalCartAmount,
      status: 'Pending' as const
    };

    addOrder(newOrder);
    setCart({});
    setShowCartDrawer(false);
    setOrderSuccessModal(true);
  };

  // 💬 चॅट मेसेज पाठवणे
  const handleSendBuyerChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerMessageInput.trim() || !activeChatOrder) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'buyer' as const,
      text: buyerMessageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    sendMessage(activeChatOrder.id, 'buyer', newMsg);
    setBuyerMessageInput('');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] pb-24 text-gray-800 font-sans max-w-md mx-auto relative shadow-2xl">
      
      {/* 🟢 TOP BAR */}
      <div className="bg-[#00897B] text-white px-4 pt-4 pb-5 rounded-b-[28px] shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-emerald-100 uppercase tracking-wider">
              {t('थेट शेतातून जलद डिलिव्हरी', 'Same-day Direct Farm Delivery')}
            </span>
            <div className="flex items-center gap-1 font-bold text-sm">
              <MapPin className="h-4 w-4 text-amber-300" />
              <span>{user?.location || 'Pune, Maharashtra'}</span>
              <ChevronDown className="h-4 w-4 text-emerald-200" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 🌐 Language Toggle Button */}
            <div className="flex bg-black/20 p-0.5 rounded-xl border border-white/20 text-[11px] font-bold">
              <button
                onClick={() => setLang('mr')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  lang === 'mr' ? 'bg-white text-gray-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded-lg transition ${
                  lang === 'en' ? 'bg-white text-gray-900 shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <div 
              onClick={() => setActiveTab('account')}
              className="bg-white/20 hover:bg-white/30 transition cursor-pointer backdrop-blur-md px-3 py-1 rounded-full text-xs font-black border border-white/30 flex items-center gap-1.5"
            >
              <Wallet className="h-3.5 w-3.5 text-amber-300" />
              <span>₹{walletBalance}</span>
            </div>

            <button 
              onClick={() => setShowCartDrawer(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full relative transition"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder={t('ताजी फळे, भाज्या आणि सेंद्रिय धान्य शोधा...', 'Search farm fresh vegetables, fruits & grains...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-gray-900 placeholder-gray-400 rounded-2xl py-2.5 pl-10 pr-8 text-xs font-semibold shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 🟢 TAB 1: HOME STOREFRONT */}
      {activeTab === 'home' && (
        <div className="p-4 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-2.5 flex items-center justify-between text-xs text-amber-900 font-bold">
            <span>{t('🚚 दुपारी २ च्या आधी केलेल्या ऑर्डर्स आजच पाठवल्या जातील', '🚚 Orders placed before 2 PM dispatched same day')}</span>
            <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">Express</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedCategory === cat.key 
                    ? 'bg-[#00897B] text-white shadow-sm' 
                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                <span>{cat.img}</span>
                <span>{lang === 'mr' ? cat.marathi : cat.name}</span>
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-[70%]">
              <span className="text-[9px] bg-white/20 font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-emerald-100">
                {t('०% मध्यस्थ', 'Zero Middlemen')}
              </span>
              <h2 className="text-base font-black mt-1 leading-tight">
                {t('शेतकऱ्यांनी पिकवलेला शुद्ध आणि ताजा शेतमाल', 'Hand-picked FARM PRODUCE Grown Responsibly')}
              </h2>
              <p className="text-[11px] text-emerald-100 mt-1">
                {t('शेतकऱ्याला थेट योग्य भाव, तुम्हाला ताजा शेतमाल.', 'Direct fair price to farmers, fresh produce to you.')}
              </p>
            </div>
            <div className="absolute right-2 -bottom-2 text-6xl opacity-30">🌾</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-gray-900">
                {selectedCategory === 'ALL' 
                  ? t(`AgroConnect थेट बाजारपेठ (${filteredProducts.length})`, `AgroConnect Market (${filteredProducts.length})`) 
                  : `${selectedCategory} (${filteredProducts.length})`}
              </h3>
              {selectedCategory !== 'ALL' && (
                <button onClick={() => setSelectedCategory('ALL')} className="text-xs font-bold text-emerald-700">
                  {t('सर्व दाखवा', 'Reset Filter')}
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
                <p className="text-xs font-bold text-gray-400">
                  {t('या कॅटेगरीत किंवा सर्चमध्ये शेतमाल उपलब्ध नाही.', 'No produce available in this category or search.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredProducts.map((p) => {
                  const qtyInCart = cart[p.id] || 0;
                  return (
                    <div key={p.id} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                      <span className="absolute top-2 left-2 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] px-2 py-0.5 rounded-md">
                        {p.badge || 'Farm Direct'}
                      </span>
                      <div className="w-full h-28 rounded-2xl overflow-hidden mt-4 mb-2 bg-gray-50 flex items-center justify-center">
                        <img 
                          src={p.img || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'} 
                          alt={p.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-900 leading-snug">{p.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{t('शेतकरी:', 'Farmer:')} {p.farmer} ({p.location})</p>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-black text-gray-900">₹{p.price}</span>
                            <span className="text-[10px] text-gray-400 line-through">₹{p.mrp || (p.price + 15)}</span>
                          </div>
                          <span className="text-[9px] text-gray-500 font-semibold">{p.unit || '1 kg'}</span>
                        </div>

                        {qtyInCart > 0 ? (
                          <div className="flex items-center bg-emerald-600 text-white rounded-xl px-1.5 py-1 gap-2 shadow-xs">
                            <button onClick={() => removeFromCart(p.id)} className="p-0.5 hover:bg-emerald-700 rounded-md">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-black">{qtyInCart}</span>
                            <button onClick={() => addToCart(p.id)} className="p-0.5 hover:bg-emerald-700 rounded-md">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => addToCart(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🟢 TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="p-4 space-y-3">
          <h2 className="text-base font-black text-gray-900">{t('कॅटेगरीनुसार खरेदी करा', 'Shop By Categories')}</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.filter(c => c.key !== 'ALL').map((cat, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setActiveTab('home');
                }}
                className={`${cat.bg} p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs border border-black/5 hover:scale-105 active:scale-95 transition cursor-pointer min-h-[110px]`}
              >
                <span className="text-3xl mb-1">{cat.img}</span>
                <span className={`text-[10px] font-black tracking-tight leading-tight ${cat.color}`}>{cat.name}</span>
                <span className="text-[9px] text-gray-500 font-semibold mt-0.5">{cat.marathi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 TAB 3: REORDER */}
      {activeTab === 'reorder' && (
        <div className="p-4 space-y-3">
          <h2 className="text-base font-black text-gray-900">{t('पुन्हा खरेदी करा', 'Reorder Previous Items')}</h2>
          <p className="text-xs text-gray-400">{t('पूर्वी खरेदी केलेला शेतमाल पुन्हा एका क्लिकवर मागवा.', 'Reorder previously purchased farm produce in 1-click.')}</p>
          
          <div className="space-y-3">
            {allProducts.slice(0, 3).map((p) => (
              <div key={p.id} className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={p.img} alt={p.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs font-black text-gray-900">{p.name}</h4>
                    <p className="text-[11px] font-bold text-emerald-700">₹{p.price} / {p.unit}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    addToCart(p.id);
                    setShowCartDrawer(true);
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 border border-emerald-200"
                >
                  <RotateCcw className="h-3 w-3" /> {t('पुन्हा मागवा', 'Reorder')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 TAB 4: ORDERS (With GPS Tracking, Invoice & Chat) */}
      {activeTab === 'orders' && (
        <div className="p-4 space-y-3">
          <h2 className="text-base font-black text-gray-900">{t('माझ्या ऑर्डर्स (My Orders)', 'My Orders')}</h2>

          {orders.length === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center text-center min-h-[50vh]">
              <ShoppingBag className="h-14 w-14 text-gray-300 mb-2" />
              <h3 className="text-sm font-bold text-gray-700">{t('तुम्ही अजून एकही ऑर्डर दिलेली नाही.', 'Oops, you haven\'t placed an order yet')}</h3>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">{ord.id}</span>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">{ord.date}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      {ord.status}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2.5 text-xs space-y-1">
                    {ord.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-gray-700 font-semibold">
                        <span>{item.name} x {item.qty}</span>
                        <span>₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  {/* 🗺️ आणि 🧾 ३ आणि ४ नंबरची नवीन बटणे */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <button 
                      onClick={() => setTrackingOrder(ord)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition"
                    >
                      <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t('मॅप ट्रॅकिंग (GPS)', 'GPS Live Track')}</span>
                    </button>

                    <button 
                      onClick={() => setInvoiceOrder(ord)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-amber-200 transition"
                    >
                      <QrCode className="h-3.5 w-3.5 text-amber-700" />
                      <span>{t('बिल & UPI QR', 'Invoice & QR')}</span>
                    </button>
                  </div>

                  {/* 💬 ट्रान्सपोर्टर सोबत थेट चॅटबॉट बटण */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-xs">
                    <span className="text-gray-500 font-bold">{t('शेतकरी:', 'Farmer:')} {ord.farmerName}</span>
                    <button 
                      onClick={() => setActiveChatOrder(ord)}
                      className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{t('ट्रान्सपोर्टर चॅट', 'Transporter Chat')}</span>
                    </button>
                  </div>

                  {/* ⭐ शेतकरी व मालाचा रिव्ह्यू */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-600">{t('शेतकऱ्याला रेटिंग द्या:', 'Rate Farmer:')}</span>
                    <div className="flex text-amber-400 gap-1 cursor-pointer text-base">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          onClick={() => {
                            addReview(ord.id, star, 'Excellent fresh produce!');
                            alert(t(`⭐ धन्यवाद! आपण शेतकऱ्याला ${star}/5 स्टार रेटिंग दिले आहे.`, `⭐ Thank you! You rated the farmer ${star}/5 stars.`));
                          }}
                          className="hover:scale-125 transition"
                        >
                          {ord.review && ord.review.rating >= star ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🟢 TAB 5: ACCOUNT */}
      {activeTab === 'account' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00897B] text-white font-black text-lg flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">{t('नमस्कार, ', 'Hello, ')}{user?.name || 'Buyer'}</h3>
                <p className="text-xs text-gray-500 font-semibold">{user?.email || 'indiaagroconnect@gmail.com'}</p>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">Verified Buyer</span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Wallet Card */}
          <div className="bg-emerald-50/70 border border-emerald-300 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <Wallet className="h-4 w-4 text-emerald-700" />
                <span>AGRO WALLET - SCHEDULED</span>
              </div>
              <ChevronRight className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-bold text-gray-500">{t('उपलब्ध शिल्लक: ', 'Available balance: ')}</span>
                <span className="text-base font-black text-emerald-800">₹{walletBalance}</span>
              </div>
              <button 
                onClick={() => {
                  setWalletBalance(prev => prev + 500);
                  alert(t('🎉 ₹500 Agro Wallet मध्ये ॲड झाले!', '🎉 ₹500 added to Agro Wallet!'));
                }}
                className="bg-[#00897B] hover:bg-emerald-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs"
              >
                + Add ₹500
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
            {[
              { label: t('माझ्या ऑर्डर्स', 'My Orders'), icon: ShoppingBag, color: 'text-emerald-600', action: () => setActiveTab('orders') },
              { label: t('रिफंड स्थिती', 'Refund Status'), icon: RotateCcw, color: 'text-emerald-600', action: () => alert(t('सर्व रिफंड २ तासांत बँक खात्यात जमा होतात.', 'All refunds processed to bank within 2 hours.')) },
              { label: t('ग्रीन स्कोअर (सस्टेनेबिलिटी)', 'Green Score (Sustainability)'), icon: Award, color: 'text-emerald-600', action: () => alert(t('तुमचा ग्रीन स्कोअर: ९२/१०० 🌱', 'Your Green Score: 92/100 🌱')) },
              { label: t('AgroConnect सपोर्ट', 'AgroConnect Support'), icon: Phone, color: 'text-emerald-600', action: () => window.open('tel:9270558429') },
              { label: t('लॉगआउट', 'Logout'), icon: User, color: 'text-red-600', action: logout }
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={item.action}
                className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className={`text-xs font-bold ${item.color.includes('red') ? 'text-red-600' : 'text-gray-800'}`}>{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 IN-APP CHATBOT MODAL (Buyer <-> Transporter) */}
      {activeChatOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full h-[520px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-4 bg-[#00897B] text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                  🚛
                </div>
                <div>
                  <h4 className="text-sm font-black leading-tight">{t('वाहतूकदार (Transporter)', 'Transporter Partner')}</h4>
                  <p className="text-[10px] text-emerald-100">{activeChatOrder.id} • {t('थेट लोकेशन संपर्क', 'Live Location Chat')}</p>
                </div>
              </div>
              <button onClick={() => setActiveChatOrder(null)} className="p-1 rounded-full hover:bg-white/10 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2.5">
              {(activeChatOrder.buyerChat || []).map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'buyer' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-semibold ${
                    msg.sender === 'buyer' ? 'bg-[#00897B] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs'
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendBuyerChat} className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder={t('पत्ता सांगा किंवा मेसेज करा...', 'Type delivery address or message...')}
                value={buyerMessageInput}
                onChange={(e) => setBuyerMessageInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-[#00897B] text-white p-2.5 rounded-xl hover:bg-emerald-800 transition">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🗺️ LIVE GPS TRACKING MODAL POPUP */}
      {trackingOrder && (
        <LiveTrackingModal 
          order={trackingOrder} 
          onClose={() => setTrackingOrder(null)} 
        />
      )}

      {/* 🧾 TAX INVOICE & UPI QR MODAL POPUP */}
      {invoiceOrder && (
        <InvoiceModal 
          order={invoiceOrder} 
          onClose={() => setInvoiceOrder(null)} 
        />
      )}

      {/* 🟢 CART SLIDE-UP DRAWER */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[32px] p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-700" />
                <h3 className="text-base font-black text-gray-900">{t('तुमचे कार्ट', 'Your Fresh Cart')} ({totalCartCount})</h3>
              </div>
              <button onClick={() => setShowCartDrawer(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {totalCartCount === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs font-bold">
                {t('तुमचे कार्ट रिकामे आहे.', 'Your cart is empty.')}
              </div>
            ) : (
              <>
                <div className="max-h-60 overflow-y-auto space-y-2.5">
                  {Object.entries(cart).map(([id, qty]) => {
                    const product = allProducts.find(p => p.id === Number(id));
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl">
                        <div>
                          <h4 className="text-xs font-black text-gray-900">{product.name}</h4>
                          <p className="text-[11px] text-emerald-700 font-bold">₹{product.price} x {qty} = ₹{product.price * qty}</p>
                        </div>
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-1.5 py-0.5 gap-2">
                          <button onClick={() => removeFromCart(product.id)} className="p-0.5 text-gray-600">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-black">{qty}</span>
                          <button onClick={() => addToCart(product.id)} className="p-0.5 text-gray-600">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>{t('डिलिव्हरी शुल्क (Same-day):', 'Delivery Fee (Same-day):')}</span>
                    <span className="text-emerald-700 font-black">{t('मोफत (FREE)', 'FREE')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900">
                    <span>{t('एकूण रक्कम (Total Bill):', 'Total Bill:')}</span>
                    <span className="text-emerald-700 text-base">₹{totalCartAmount}</span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="w-full bg-[#00897B] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition active:scale-95"
                  >
                    <span>{t('Place Farm Order (थेट ऑर्डर द्या)', 'Place Farm Order Directly')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🟢 ORDER SUCCESS POPUP */}
      {orderSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl border border-emerald-100 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="h-8 w-8 stroke-[3]" />
            </div>
            <h3 className="text-base font-black text-gray-900">{t('ऑर्डर यशस्वी झाली! 🎉', 'Order Placed Successfully! 🎉')}</h3>
            <p className="text-xs text-gray-500 font-medium">{t('तुमची ऑर्डर शेतकरी आणि ट्रान्सपोर्टरकडे पाठवली आहे.', 'Your order is sent to farmer and transporter.')}</p>
            <button
              onClick={() => {
                setOrderSuccessModal(false);
                setActiveTab('orders');
              }}
              className="w-full bg-[#00897B] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              {t('ऑर्डर स्थिती पहा', 'View Order Status')}
            </button>
          </div>
        </div>
      )}

      {/* 🟢 BOTTOM APP NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-between items-center z-40 shadow-lg max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-[#00897B] font-black' : 'text-gray-400 font-medium'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'home' ? 'bg-emerald-50' : ''}`}>
            <Sprout className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('होम', 'Home')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'categories' ? 'text-[#00897B] font-black' : 'text-gray-400 font-medium'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'categories' ? 'bg-emerald-50' : ''}`}>
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
              <div className="bg-current rounded-xs"></div>
              <div className="bg-current rounded-xs"></div>
              <div className="bg-current rounded-xs"></div>
              <div className="bg-current rounded-xs"></div>
            </div>
          </div>
          <span className="text-[10px]">{t('कॅटेगरी', 'Categories')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('reorder')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'reorder' ? 'text-[#00897B] font-black' : 'text-gray-400 font-medium'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'reorder' ? 'bg-emerald-50' : ''}`}>
            <RotateCcw className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('पुन्हा मागवा', 'Reorder')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'orders' ? 'text-[#00897B] font-black' : 'text-gray-400 font-medium'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'orders' ? 'bg-emerald-50' : ''}`}>
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('ऑर्डर्स', 'Orders')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'account' ? 'text-[#00897B] font-black' : 'text-gray-400 font-medium'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'account' ? 'bg-emerald-50' : ''}`}>
            <User className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('खाते', 'Account')}</span>
        </button>
      </div>

    </div>
  );
}