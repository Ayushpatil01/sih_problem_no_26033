import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket, type Order } from '../context/MarketContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, Plus, Package, ArrowRight, 
  MessageCircle, Send, X, Navigation, Clock, Trash2, 
  TrendingUp, RefreshCw, MapPin, Camera, Sparkles, CheckCircle2
} from 'lucide-react';

interface AIQualityResult {
  crop_name: string;
  grade: string;
  quality_score_percent: number;
  defects_observed: string[];
  estimated_mandi_impact: string;
  summary_marathi: string;
}

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { products, addProduct, deleteProduct, orders, sendMessage } = useMarket();
  const { lang, setLang, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'harvest' | 'add' | 'orders'>('harvest');
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [farmerMessageInput, setFarmerMessageInput] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<string>('VEGETABLE');
  const [selectedCropName, setSelectedCropName] = useState<string>('ताजी भेंडी (Fresh Okra)');
  const [customCropName, setCustomCropName] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [cropRate, setCropRate] = useState<string>('28');
  const [cropUnit, setCropUnit] = useState<string>('500g');

  // 📸 Camera & AI State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiScanResult, setAiScanResult] = useState<AIQualityResult | null>(null);

  const myCrops = products.filter(
    (p) =>
      p.farmer === (user?.name || 'शेतकरी मित्र') ||
      p.farmer.includes('पाटील') ||
      p.farmer.includes('शिंदे')
  );

  // 📷 Camera Trigger Handler
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show Preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setIsAnalyzing(true);
    setAiScanResult(null);

    // Send Image to Flask Backend (app.py)
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/grade-produce', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('AI analysis failed');
      }

      const result: AIQualityResult = await response.json();
      setAiScanResult(result);

      // 🤖 ऑटोमॅटिक फॉर्म भरणे (Auto-fill Crop Name)
      if (result.crop_name) {
        setIsCustom(true);
        setCustomCropName(result.crop_name);
      }
    } catch (error) {
      console.error('Camera & AI Scan Error:', error);
      alert(t('पिकाची AI तपासणी करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.', 'Failed to analyze crop. Please try again.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteProduct = (id: number, name: string) => {
    const confirmDelete = window.confirm(t(`तुम्हाला नक्की '${name}' हे पीक मार्केटमधून डिलीट करायचे आहे का?`, `Are you sure you want to delete '${name}' from market?`));
    if (confirmDelete) {
      deleteProduct(id);
      alert(t('✅ शेतमाल यशस्वीरीत्या डिलीट करण्यात आला!', '✅ Crop deleted successfully!'));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    setIsCustom(false);
    setCustomCropName('');
    const crops = categoryCropsMap[cat] || [];
    if (crops.length > 0) {
      setSelectedCropName(crops[0].name);
      setCropUnit(crops[0].defaultUnit);
      setCropRate(crops[0].suggestedRate.toString());
    }
  };

  const handleCropSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM') {
      setIsCustom(true);
      setSelectedCropName('');
    } else {
      setIsCustom(false);
      setSelectedCropName(val);
      const found = categoryCropsMap[selectedCategory]?.find((c) => c.name === val);
      if (found) {
        setCropUnit(found.defaultUnit);
        setCropRate(found.suggestedRate.toString());
      }
    }
  };

  const handlePublishCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isCustom ? customCropName.trim() : selectedCropName;

    if (!finalName || !cropRate) {
      alert(t('कृपया पिकाचे नाव आणि दर टाका.', 'Please enter crop name and price.'));
      return;
    }

    const matchedCrop = categoryCropsMap[selectedCategory]?.find((c) => c.name === finalName);
    const cropImg = previewImage 
      ? previewImage 
      : (matchedCrop ? matchedCrop.img : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400');

    addProduct({
      name: finalName,
      category: selectedCategory === 'VILLAGE_STAPLES' ? 'VILLAGE STAPLES' : selectedCategory === 'COLD_PRESSED_OIL' ? 'COLD PRESSED OIL' : selectedCategory,
      farmer: user?.name || 'शेतकरी मित्र',
      location: user?.location || 'महाराष्ट्र',
      price: Number(cropRate),
      mrp: Number(cropRate) + 15,
      unit: cropUnit || '1 kg',
      img: cropImg,
      badge: aiScanResult ? `AGMARK ${aiScanResult.grade} ⭐` : 'Farm Direct 🌾'
    });

    setCropRate('');
    setCustomCropName('');
    setPreviewImage(null);
    setAiScanResult(null);
    setActiveTab('harvest');
    alert(t('🎉 शेतमाल थेट Buyer App वर प्रसिद्ध झाला आहे!', '🎉 Crop listed live on Buyer App!'));
  };

  const handleSendFarmerChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerMessageInput.trim() || !activeChatOrder) return;

    const newMsg = {
      id: Date.now().toString(),
      sender: 'farmer' as const,
      text: farmerMessageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    sendMessage(activeChatOrder.id, 'farmer', newMsg);
    setFarmerMessageInput('');
  };

  const currentLiveMandiData = mandiLiveRates[selectedCropName] || [
    { market: 'पुणे APMC मार्केट यार्ड', district: 'पुणे', min: Number(cropRate) - 4, max: Number(cropRate) + 5, modal: Number(cropRate), date: 'आज' }
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F6] pb-24 text-gray-800 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {/* 🟢 TOP HEADER */}
      <div className="bg-[#1B5E20] text-white px-5 pt-5 pb-6 rounded-b-[28px] shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <span className="text-[10px] bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-black uppercase">
                FARMER PARTNER
              </span>
              <h2 className="text-base font-black mt-0.5">{t('राम राम, ', 'Welcome, ')}{user?.name || 'शेतकरी मित्र'}</h2>
              <p className="text-[11px] text-emerald-200">{user?.location || 'Pune, Maharashtra'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <button onClick={logout} className="text-xs bg-white/10 px-3 py-1.5 rounded-xl font-bold hover:bg-white/20 transition">
              {t('लॉगआउट', 'Logout')}
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 MAIN CONTENT */}
      <div className="p-4 space-y-4">
        
        {/* TAB 1: MY LISTED CROPS */}
        {activeTab === 'harvest' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">
                {t(`माझा लिस्ट केलेला शेतमाल (${myCrops.length})`, `My Listed Crops (${myCrops.length})`)}
              </h3>
              <button
                onClick={() => setActiveTab('add')}
                className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-xs hover:bg-emerald-700 transition"
              >
                <Plus className="h-3.5 w-3.5" /> {t('नवीन पीक जोडा', 'Add Crop')}
              </button>
            </div>

            <div className="space-y-3">
              {myCrops.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
                  <Sprout className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-400">
                    {t('सध्या कोणताही शेतमाल लिस्ट केलेला नाही.', 'No crops listed yet.')}
                  </p>
                </div>
              ) : (
                myCrops.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={c.img} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-xs font-black text-gray-900">{c.name}</h4>
                        <p className="text-[11px] font-bold text-emerald-700 mt-0.5">₹{c.price} / {c.unit}</p>
                        <span className="text-[9px] bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                          {c.badge || 'Live on Buyer App 🟢'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2.5 py-1 rounded-xl border border-gray-100">
                        {c.category}
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(c.id, c.name)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition shadow-2xs active:scale-90"
                        title={t('पीक डिलीट करा', 'Delete Crop')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* 🟢 TAB 2: ADD NEW CROP WITH AI CAMERA SCAN */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div>
              <h3 className="text-sm font-black text-gray-900">{t('नवीन शेतमाल विक्रीसाठी जोडा', 'List New Crop for Sale')}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t('थेट APMC बाजारभावासह शेतमाल ग्राहकांना विका.', 'Sell produce directly to buyers at live APMC rates.')}</p>
            </div>

            {/* 📸 AI CAMERA SCANNER CARD */}
            <div className="bg-emerald-50/70 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />

              {!previewImage ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">
                      {t('पिकाचा थेट फोटो काढा (AI Quality Scan)', 'Snap Produce Photo (AI Scan)')}
                    </h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {t('Gemini AI आपोआप पिकाचा प्रकार आणि AGMARK प्रतवारी ठरवेल.', 'Gemini AI auto-detects crop & AGMARK grade.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#1B5E20] hover:bg-emerald-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-xs transition flex items-center gap-1.5 mx-auto"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>{t('कॅमेरा उघडा', 'Open Camera')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative inline-block">
                    <img 
                      src={previewImage} 
                      alt="Captured Crop" 
                      className="w-24 h-24 object-cover rounded-xl border border-emerald-400 mx-auto shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setAiScanResult(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full text-xs shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 animate-pulse">
                      <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
                      <span>{t('Gemini AI द्वारे प्रतवारी तपासली जात आहे...', 'Gemini AI is analyzing quality...')}</span>
                    </div>
                  )}

                  {aiScanResult && (
                    <div className="bg-white border border-emerald-200 rounded-xl p-3 text-left space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-emerald-900 text-sm">{aiScanResult.crop_name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {aiScanResult.grade}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600">
                        {t('गुणवत्ता स्कोअर:', 'Quality Score:')} <strong className="text-emerald-700">{aiScanResult.quality_score_percent}%</strong>
                      </p>
                      <p className="text-[11px] text-gray-700 italic mt-1 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                        {aiScanResult.summary_marathi}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handlePublishCrop} className="space-y-4">
              
              {/* १. आधी कॅटेगरी निवडा */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {t('१. आधी कॅटेगरी निवडा (Category)', '1. Select Category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full p-3 border-2 border-emerald-500/40 rounded-2xl text-xs font-bold bg-emerald-50/40 text-emerald-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="VEGETABLE">🥦 VEGETABLE ({t('भाज्या', 'Vegetables')})</option>
                  <option value="FRUITS">🍎 FRUITS ({t('फळे', 'Fruits')})</option>
                  <option value="VILLAGE_STAPLES">🌾 VILLAGE STAPLES ({t('धान्य / डाळी / कापूस', 'Grains & Pulses')})</option>
                  <option value="GHEE">🧈 ORGANIC GHEE ({t('गावठी तूप', 'Cow Ghee')})</option>
                  <option value="COLD_PRESSED_OIL">🌻 COLD PRESSED OIL ({t('घाण्याचे तेल', 'Cold Pressed Oil')})</option>
                </select>
              </div>

              {/* २. पिकाचे नाव निवडा */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {t('२. पिकाचे नाव निवडा (Select Crop)', '2. Select Crop')}
                </label>
                <select
                  value={isCustom ? 'CUSTOM' : selectedCropName}
                  onChange={handleCropSelect}
                  className="w-full p-3 border border-gray-300 rounded-2xl text-xs font-bold bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categoryCropsMap[selectedCategory]?.map((crop, idx) => (
                    <option key={idx} value={crop.name}>
                      {crop.name}
                    </option>
                  ))}
                  <option value="CUSTOM">➕ {t('इतर नाव स्वतः टाईप करा (Other Crop)', 'Type custom crop name')}</option>
                </select>

                {isCustom && (
                  <input
                    type="text"
                    required
                    placeholder={t('उदा. गावरान लसूण, स्ट्रॉबेरी, सीताफळ...', 'e.g. Organic Garlic, Strawberry...')}
                    value={customCropName}
                    onChange={(e) => setCustomCropName(e.target.value)}
                    className="w-full mt-2 p-2.5 border border-emerald-400 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                )}
              </div>

              {/* 🔴 LIVE MANDI RATE CARD */}
              <div className="bg-[#F0FDF4] border border-emerald-300 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                    <TrendingUp className="h-4 w-4 text-emerald-700" />
                    <span>🔴 {t('आजचा थेट APMC बाजारभाव (Live Rates)', 'Today\'s Live APMC Mandi Rates')}</span>
                  </div>
                  <span className="bg-emerald-200 text-emerald-900 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                    Live Agmarknet
                  </span>
                </div>

                <div className="space-y-1.5">
                  {currentLiveMandiData.map((mandi, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100 flex justify-between items-center shadow-2xs">
                      <div>
                        <span className="font-bold text-gray-800 text-xs">{mandi.market}</span>
                        <p className="text-[10px] text-gray-400">
                          {t('किमान:', 'Min:')} ₹{mandi.min}/kg • {t('कमाल:', 'Max:')} ₹{mandi.max}/kg
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-700 text-sm">₹{mandi.modal}/kg</span>
                        <p className="text-[9px] text-gray-500 font-bold">(₹{mandi.modal * 100}/{t('क्विंटल', 'Quintal')})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ३. एकक आणि दर */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t('एकक (Unit)', 'Unit')}</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 1 kg / 500g / 1 Quintal"
                    value={cropUnit}
                    onChange={(e) => setCropUnit(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">{t('तुमचा विक्री दर (₹ प्रति Unit)', 'Your Price (₹ per Unit)')}</label>
                  <input
                    type="number"
                    required
                    placeholder="उदा. 45"
                    value={cropRate}
                    onChange={(e) => setCropRate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1B5E20] hover:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl text-xs shadow-md shadow-emerald-100 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{t('Buyer App वर प्रसिद्ध करा (Publish Directly)', 'Publish to Buyer App')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* 🟢 TAB 3: INCOMING ORDERS & TRANSPORTER CHAT */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-gray-900">
              {t(`खरेदीदार ऑर्डर्स & वाहतूकदार समन्वय (${orders.length})`, `Buyer Orders & Logistics Coordination (${orders.length})`)}
            </h3>

            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400">{t('सध्या कोणतीही ऑर्डर आलेली नाही.', 'No incoming orders right now.')}</p>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">{ord.id}</span>
                      <h4 className="text-xs font-black text-gray-900 mt-1">
                        {ord.items.map((i) => `${i.name} (${i.qty} x ${i.unit})`).join(', ')}
                      </h4>
                    </div>
                    <span className="text-sm font-black text-emerald-700">₹{ord.total}</span>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-2.5 text-xs space-y-1 font-semibold text-gray-700">
                    <p className="flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-blue-600" />
                      <span>{t('खरेदीदार:', 'Buyer:')} {ord.buyerName} ({ord.buyerLocation})</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span>{t('स्टेटस:', 'Status:')} <strong className="text-emerald-700">{ord.status}</strong></span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500">{t('वाहतूक समन्वय:', 'Logistics:')}</span>
                    <button
                      onClick={() => setActiveChatOrder(ord)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{t('ट्रान्सपोर्टर चॅट (पिकअप लोकेशन)', 'Transporter Chat (Pickup)')}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 🟢 IN-APP CHATBOT MODAL */}
      {activeChatOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full h-[520px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95">
            <div className="p-4 bg-[#1B5E20] text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                  🚛
                </div>
                <div>
                  <h4 className="text-sm font-black leading-tight">{t('वाहतूकदार समन्वय (Transporter)', 'Transporter Partner')}</h4>
                  <p className="text-[10px] text-emerald-200">{activeChatOrder.id} • {t('पिकअप लोकेशन संवाद', 'Pickup Location Chat')}</p>
                </div>
              </div>
              <button onClick={() => setActiveChatOrder(null)} className="p-1 rounded-full hover:bg-white/10 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-2.5">
              {(activeChatOrder.farmerChat || []).map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'farmer' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-semibold ${
                    msg.sender === 'farmer' ? 'bg-[#1B5E20] text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs'
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendFarmerChat} className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder={t('पिकअप पत्ता किंवा शेताचे लोकेशन टाका...', 'Type pickup address or farm location...')}
                value={farmerMessageInput}
                onChange={(e) => setFarmerMessageInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-[#1B5E20] text-white p-2.5 rounded-xl hover:bg-emerald-800 transition">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 FARMER BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-40 shadow-lg max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('harvest')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'harvest' ? 'text-[#1B5E20] font-black' : 'text-gray-400'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'harvest' ? 'bg-emerald-50' : ''}`}>
            <Sprout className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('माझे पीक', 'My Crops')}</span>
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'add' ? 'text-[#1B5E20] font-black' : 'text-gray-400'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'add' ? 'bg-emerald-50' : ''}`}>
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('पीक जोडा', 'Add Crop')}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-0.5 ${
            activeTab === 'orders' ? 'text-[#1B5E20] font-black' : 'text-gray-400'
          }`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'orders' ? 'bg-emerald-50' : ''}`}>
            <Package className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('ऑर्डर्स & ट्रान्सपोर्ट', 'Orders & Transport')}</span>
        </button>
      </div>

    </div>
  );
}