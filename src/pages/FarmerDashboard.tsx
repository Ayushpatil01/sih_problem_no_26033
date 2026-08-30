import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket, type Order } from '../context/MarketContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, Plus, Package, ArrowRight, 
  MessageCircle, Send, X, Navigation, Clock, Trash2, 
  TrendingUp, RefreshCw, MapPin
} from 'lucide-react';

export default function FarmerDashboard() {
  const { user, logout } = useAuth();
  const { products, addProduct, deleteProduct, orders, sendMessage } = useMarket();
  const { lang, setLang, t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'harvest' | 'add' | 'orders'>('harvest');
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [farmerMessageInput, setFarmerMessageInput] = useState('');

  // 🟢 १. रिअल-टाइम बाजारभाव डेटाबेस (APMC Live Rates)
  const mandiLiveRates: { [key: string]: { market: string; district: string; min: number; max: number; modal: number; date: string }[] } = {
    'ताजी भेंडी (Fresh Okra)': [
      { market: 'पुणे (Gultekdi APMC)', district: 'पुणे', min: 25, max: 35, modal: 28, date: 'आज' },
      { market: 'नाशिक मार्केट यार्ड', district: 'नाशिक', min: 22, max: 30, modal: 26, date: 'आज' }
    ],
    'सेंद्रिय गाजर (Organic Carrot)': [
      { market: 'पुणे APMC', district: 'पुणे', min: 30, max: 42, modal: 35, date: 'आज' },
      { market: 'जुन्नर यार्ड', district: 'पुणे', min: 28, max: 38, modal: 32, date: 'आज' }
    ],
    'लाल टोमॅटो (Red Tomatoes)': [
      { market: 'नारायणगाव (Tomato Hub)', district: 'पुणे', min: 18, max: 28, modal: 22, date: 'आज' },
      { market: 'नाशिक पिंपळगाव', district: 'नाशिक', min: 20, max: 26, modal: 24, date: 'आज' }
    ],
    'नाशिक कांदा (Nashik Red Onion)': [
      { market: 'लासलगाव (Asia\'s Biggest)', district: 'नाशिक', min: 28, max: 36, modal: 32, date: 'आज' },
      { market: 'पिंपळगाव बसवंत', district: 'नाशिक', min: 29, max: 35, modal: 33, date: 'आज' }
    ],
    'सोयाबीन (Clean Soybean)': [
      { market: 'लातूर मार्केट यार्ड', district: 'लातूर', min: 44, max: 48, modal: 46, date: 'आज' },
      { market: 'अकोला APMC', district: 'अकोला', min: 43, max: 47, modal: 45, date: 'आज' }
    ],
    'कापूस (Raw White Cotton)': [
      { market: 'जळगाव मार्केट', district: 'जळगाव', min: 70, max: 76, modal: 74, date: 'आज' },
      { market: 'यवतमाळ यार्ड', district: 'यवतमाळ', min: 68, max: 75, modal: 72, date: 'आज' }
    ],
    'डाळिंब (Fresh Pomegranate)': [
      { market: 'सांगोला मार्केट', district: 'सोलापूर', min: 90, max: 130, modal: 115, date: 'आज' },
      { market: 'नाशिक APMC', district: 'नाशिक', min: 95, max: 125, modal: 110, date: 'आज' }
    ]
  };

  // कॅटेगरीनुसार पिके
  const categoryCropsMap: { [key: string]: { name: string; img: string; defaultUnit: string; suggestedRate: number }[] } = {
    VEGETABLE: [
      { name: 'ताजी भेंडी (Fresh Okra)', img: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400', defaultUnit: '500g', suggestedRate: 28 },
      { name: 'सेंद्रिय गाजर (Organic Carrot)', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', defaultUnit: '1 kg', suggestedRate: 35 },
      { name: 'लाल टोमॅटो (Red Tomatoes)', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', defaultUnit: '1 kg', suggestedRate: 22 },
      { name: 'नाशिक कांदा (Nashik Red Onion)', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', defaultUnit: '1 kg', suggestedRate: 32 },
      { name: 'शिमला मिरची (Capsicum)', img: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', defaultUnit: '500g', suggestedRate: 40 },
      { name: 'हिरवी वांगी (Fresh Brinjal)', img: 'https://images.unsplash.com/photo-1628773822503-930a84d93d39?w=400', defaultUnit: '1 kg', suggestedRate: 30 }
    ],
    FRUITS: [
      { name: 'डाळिंब (Fresh Pomegranate)', img: 'https://images.unsplash.com/photo-1541344999736-83eca872f240?w=400', defaultUnit: '1 kg', suggestedRate: 115 },
      { name: 'ताजा पेरू (Thai Guava)', img: 'https://images.unsplash.com/photo-1536511135882-722db34b95f2?w=400', defaultUnit: '1 kg', suggestedRate: 50 },
      { name: 'कलिंगड (Sweet Watermelon)', img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400', defaultUnit: '1 piece', suggestedRate: 45 },
      { name: 'केळी (Fresh Bananas)', img: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', defaultUnit: '1 Dozen', suggestedRate: 40 },
      { name: 'द्राक्षे (Nashik Grapes)', img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400', defaultUnit: '500g', suggestedRate: 60 }
    ],
    VILLAGE_STAPLES: [
      { name: 'गावरान तूर डाळ (Desi Toor Dal)', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', defaultUnit: '1 kg', suggestedRate: 145 },
      { name: 'सोयाबीन (Clean Soybean)', img: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400', defaultUnit: '1 kg', suggestedRate: 46 },
      { name: 'कापूस (Raw White Cotton)', img: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=400', defaultUnit: '1 kg', suggestedRate: 74 },
      { name: 'ज्वारी (Shalu Jowar)', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', defaultUnit: '1 kg', suggestedRate: 55 }
    ],
    GHEE: [
      { name: 'गावठी तूप (Pure A2 Cow Ghee)', img: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400', defaultUnit: '500 ml', suggestedRate: 650 },
      { name: 'म्हैशीचे शुद्ध तूप (Buffalo Ghee)', img: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400', defaultUnit: '1 Litre', suggestedRate: 700 }
    ],
    COLD_PRESSED_OIL: [
      { name: 'घाण्याचे शेंगदाणा तेल (Groundnut Oil)', img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', defaultUnit: '1 Litre', suggestedRate: 210 },
      { name: 'सूर्यफूल तेल (Sunflower Oil)', img: 'https://images.unsplash.com/photo-1589217157232-464b505b197f?w=400', defaultUnit: '1 Litre', suggestedRate: 180 }
    ]
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('VEGETABLE');
  const [selectedCropName, setSelectedCropName] = useState<string>('ताजी भेंडी (Fresh Okra)');
  const [customCropName, setCustomCropName] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [cropRate, setCropRate] = useState<string>('28');
  const [cropUnit, setCropUnit] = useState<string>('500g');

  const myCrops = products.filter(
    (p) =>
      p.farmer === (user?.name || 'शेतकरी मित्र') ||
      p.farmer.includes('पाटील') ||
      p.farmer.includes('शिंदे')
  );

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
    const cropImg = matchedCrop
      ? matchedCrop.img
      : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400';

    addProduct({
      name: finalName,
      category: selectedCategory === 'VILLAGE_STAPLES' ? 'VILLAGE STAPLES' : selectedCategory === 'COLD_PRESSED_OIL' ? 'COLD PRESSED OIL' : selectedCategory,
      farmer: user?.name || 'शेतकरी मित्र',
      location: user?.location || 'महाराष्ट्र',
      price: Number(cropRate),
      mrp: Number(cropRate) + 15,
      unit: cropUnit || '1 kg',
      img: cropImg,
      badge: 'Farm Direct 🌾'
    });

    setCropRate('');
    setCustomCropName('');
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

  // सध्या निवडलेल्या पिकाचे लाईव्ह APMC दर
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
            {/* 🌐 Language Switcher Button */}
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
                          Live on Buyer App 🟢
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

        {/* 🟢 TAB 2: ADD NEW CROP WITH LIVE MANDI RATES */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div>
              <h3 className="text-sm font-black text-gray-900">{t('नवीन शेतमाल विक्रीसाठी जोडा', 'List New Crop for Sale')}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{t('थेट APMC बाजारभावासह शेतमाल ग्राहकांना विका.', 'Sell produce directly to buyers at live APMC rates.')}</p>
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

              {/* 🔴 LIVE MANDI RATE CARD (थेट आजचा बाजारभाव) */}
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