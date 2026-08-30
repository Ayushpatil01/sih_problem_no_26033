import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket, type Order, type ChatMessage } from '../context/MarketContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Truck, MapPin, Navigation, Wallet, MessageCircle, Send, 
  User, X, Check, Phone, Smile, Paperclip, CheckCheck 
} from 'lucide-react';

export default function TransporterDashboard() {
  const { user, logout } = useAuth();
  const { orders, updateOrderStatus, sendMessage } = useMarket();
  const { lang, setLang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'jobs' | 'active' | 'account'>('jobs');
  const [walletBalance, setWalletBalance] = useState(8400);

  // Chatbot Modal State
  const [activeChat, setActiveChat] = useState<{ order: Order; target: 'farmer' | 'buyer' } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // उपलब्ध जॉब्स व सक्रिय ट्रिप्स
  const availableJobs = orders.filter((o) => o.status === 'Pending');
  const activeTrips = orders.filter((o) => o.status === 'Accepted by Transporter' || o.status === 'In Transit');

  // चॅट उघडल्यावर किंवा नवीन मेसेज आल्यावर खाली स्क्रोल करणे
  const currentChatMessages: ChatMessage[] = activeChat
    ? (activeChat.target === 'farmer' ? activeChat.order.farmerChat : activeChat.order.buyerChat) || []
    : [];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChatMessages, activeChat]);

  const handleAcceptJob = (orderId: string) => {
    updateOrderStatus(orderId, 'Accepted by Transporter');
    setActiveTab('active');
    alert(t('🚛 ट्रान्सपोर्ट जॉब स्वीकारला! शेतकरी आणि खरेदीदारासोबत चॅट सुरू करा.', '🚛 Transport job accepted! Start chat with farmer and buyer.'));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChat) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'transporter',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // सामायिक स्टेटमध्ये मेसेज पाठवणे
    sendMessage(activeChat.order.id, activeChat.target, newMsg);

    // स्थानिक मोडल अपडेट ठेवणे
    setActiveChat((prev) => {
      if (!prev) return null;
      const updatedOrder = {
        ...prev.order,
        [prev.target === 'farmer' ? 'farmerChat' : 'buyerChat']: [
          ...(prev.target === 'farmer' ? prev.order.farmerChat : prev.order.buyerChat),
          newMsg
        ]
      };
      return { ...prev, order: updatedOrder };
    });

    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F6] pb-24 text-gray-800 font-sans max-w-md mx-auto shadow-2xl relative">
      
      {/* 🟢 TOP BAR */}
      <div className="bg-[#B45309] text-white px-4 pt-4 pb-5 rounded-b-[28px] shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-amber-200 uppercase tracking-wider">Agro Logistics Partner</span>
            <div className="flex items-center gap-1 font-bold text-sm">
              <Truck className="h-4 w-4 text-amber-300" />
              <span>{user?.name || 'Transporter Partner'}</span>
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

            {/* Logistics Wallet */}
            <div 
              onClick={() => setActiveTab('account')}
              className="bg-white/20 hover:bg-white/30 transition cursor-pointer backdrop-blur-md px-3 py-1 rounded-full text-xs font-black border border-white/30 flex items-center gap-1.5"
            >
              <Wallet className="h-3.5 w-3.5 text-amber-300" />
              <span>₹{walletBalance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 MAIN TAB 1: AVAILABLE LOADS (JOBS) */}
      {activeTab === 'jobs' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900">
              {t(`उपलब्ध ट्रान्सपोर्ट ऑर्डर्स (${availableJobs.length})`, `Available Transport Orders (${availableJobs.length})`)}
            </h3>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">Live Trips</span>
          </div>

          {availableJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-400">
                {t('सध्या नवीन जॉब्स उपलब्ध नाहीत.', 'No new trips available right now.')}
              </p>
            </div>
          ) : (
            availableJobs.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md">{order.id}</span>
                    <h4 className="text-xs font-black text-gray-900 mt-1">
                      {order.items.map((i) => `${i.name} (${i.qty} x ${i.unit})`).join(', ')}
                    </h4>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    ₹{Math.round(order.total * 0.2 + 250)} {t('भाडे', 'Payout')}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 text-xs space-y-1.5 font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{t('शेतकरी:', 'Farmer:')} {order.farmerName} ({order.farmerLocation})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-3.5 w-3.5 text-rose-600 flex-shrink-0" />
                    <span>{t('खरेदीदार:', 'Buyer:')} {order.buyerName} ({order.buyerLocation})</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleAcceptJob(order.id)}
                  className="w-full bg-[#B45309] hover:bg-amber-800 text-white font-bold py-3 rounded-2xl text-xs transition shadow-md shadow-amber-100 flex items-center justify-center gap-2"
                >
                  <Truck className="h-4 w-4" />
                  <span>{t('ट्रान्सपोर्ट स्वीकारा (Accept Trip)', 'Accept Trip')}</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 🟢 MAIN TAB 2: ACTIVE RUNNING TRIPS */}
      {activeTab === 'active' && (
        <div className="p-4 space-y-4">
          <h3 className="text-sm font-black text-gray-900">
            {t('सक्रिय फेऱ्या (Active Running Trips)', 'Active Running Trips')}
          </h3>

          {activeTrips.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-100">
              <Navigation className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-400">
                {t('कोणतीही चालू फेरी नाही.', 'No active trips in transit.')}
              </p>
            </div>
          ) : (
            activeTrips.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl p-4 border-2 border-amber-500 shadow-md space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-full">{order.status}</span>
                  <span className="text-xs font-bold text-gray-400">{order.id}</span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-gray-900">
                    {order.items.map((i) => i.name).join(', ')}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{order.farmerLocation} ➔ {order.buyerLocation}</p>
                </div>

                {/* 💬 WhatsApp Style Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => setActiveChat({ order, target: 'farmer' })}
                    className="bg-[#E7FCE8] text-[#075E54] py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[#25D366]/40 hover:bg-[#d5f7d7] transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                    <span>{t('शेतकरी WhatsApp', 'Farmer WhatsApp')}</span>
                  </button>

                  <button 
                    onClick={() => setActiveChat({ order, target: 'buyer' })}
                    className="bg-[#EAF3FD] text-[#0A58CA] py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 hover:bg-blue-100 transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
                    <span>{t('खरेदीदार WhatsApp', 'Buyer WhatsApp')}</span>
                  </button>
                </div>

                {/* Status Buttons */}
                <div className="flex gap-2">
                  {order.status === 'Accepted by Transporter' ? (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'In Transit')}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold transition"
                    >
                      {t('माल उचलला (Start Delivery)', 'Picked Up (Start Delivery)')}
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        updateOrderStatus(order.id, 'Delivered');
                        setWalletBalance((prev) => prev + 350);
                        alert(t('🎉 डिलिव्हरी पूर्ण! भाडे वॉलेटमध्ये जमा झाले.', '🎉 Delivered successfully! Payout credited to wallet.'));
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Check className="h-4 w-4" /> {t('माल पोहोचवला (Mark Delivered)', 'Mark Delivered')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 🟢 MAIN TAB 3: ACCOUNT & WALLET */}
      {activeTab === 'account' && (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#B45309] text-white font-black text-lg flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">{t('नमस्कार, ', 'Hello, ')}{user?.name || 'Transporter'}</h3>
                <p className="text-xs text-gray-500 font-semibold">{user?.email || 'driver@agroconnect.com'}</p>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">Verified Logistics Partner</span>
              </div>
            </div>
          </div>

          {/* Wallet */}
          <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-amber-200">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                <Wallet className="h-4 w-4 text-amber-700" />
                <span>LOGISTICS WALLET</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <span className="text-xs font-bold text-gray-500">{t('उपलब्ध शिल्लक: ', 'Available Balance: ')}</span>
                <span className="text-base font-black text-amber-800">₹{walletBalance}</span>
              </div>
              <button 
                onClick={() => alert(t('बँक खात्यात ट्रान्सफर रिक्वेस्ट पाठवली.', 'Transfer request sent to bank.'))}
                className="bg-[#B45309] hover:bg-amber-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
            <div onClick={logout} className="flex items-center justify-between p-3.5 hover:bg-gray-50 rounded-2xl cursor-pointer text-red-600 font-bold text-xs">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4" />
                <span>{t('लॉगआउट', 'Logout')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 WHATSAPP STYLE CHATBOT MODAL */}
      {activeChat && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#EFEAE2] w-full max-w-sm h-[560px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-300 animate-in zoom-in-95">
            
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center text-lg border border-white/20">
                  {activeChat.target === 'farmer' ? '🌾' : '🛒'}
                </div>
                <div>
                  <h4 className="text-sm font-black leading-tight">
                    {activeChat.target === 'farmer' 
                      ? `${t('शेतकरी:', 'Farmer:')} ${activeChat.order.farmerName}` 
                      : `${t('खरेदीदार:', 'Buyer:')} ${activeChat.order.buyerName}`}
                  </h4>
                  <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
                    <span>{activeChat.target === 'farmer' ? t('पिकअप लोकेशन', 'Pickup Location') : t('ड्रॉप लोकेशन', 'Drop Location')}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => window.open('tel:9270558429')} className="p-1 text-white/90 hover:text-white">
                  <Phone className="h-4 w-4" />
                </button>
                <button onClick={() => setActiveChat(null)} className="p-1 rounded-full hover:bg-white/20 text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Wallpaper Area */}
            <div 
              className="flex-1 p-3.5 overflow-y-auto space-y-2.5"
              style={{
                backgroundColor: '#efeae2',
                backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            >
              <div className="text-center my-1">
                <span className="bg-[#FFEECD] text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-2xs">
                  🔒 End-to-End Encrypted Chat
                </span>
              </div>

              {currentChatMessages.map((msg) => {
                const isMe = msg.sender === 'transporter';
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[80%] px-3 py-1.5 rounded-2xl shadow-xs text-xs font-semibold ${
                        isMe
                          ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none border border-[#bbf7d0]'
                          : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-gray-500">
                        <span>{msg.time}</span>
                        {isMe && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="p-2 bg-[#F0F2F5] border-t border-gray-200 flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1.5 border border-gray-200">
                <Smile className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder={activeChat.target === 'farmer' 
                    ? t('पिकअप लोकेशन मागा...', 'Ask for pickup location...') 
                    : t('ड्रॉप पत्ता विचारा...', 'Ask for drop address...')}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 text-xs text-gray-800 focus:outline-none"
                />
                <Paperclip className="h-4 w-4 text-gray-400 ml-1" />
              </div>
              <button 
                type="submit" 
                disabled={!chatInput.trim()}
                className="w-9 h-9 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-md transition active:scale-95 flex-shrink-0"
              >
                <Send className="h-4 w-4 -ml-0.5" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 🟢 BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-around items-center z-40 shadow-lg max-w-md mx-auto">
        <button 
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'jobs' ? 'text-[#B45309] font-black' : 'text-gray-400'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'jobs' ? 'bg-amber-50' : ''}`}>
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('ट्रिप्स / जॉब्स', 'Trips / Jobs')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('active')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'active' ? 'text-[#B45309] font-black' : 'text-gray-400'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'active' ? 'bg-amber-50' : ''}`}>
            <Navigation className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('चालू ट्रॅक', 'Active Track')}</span>
        </button>

        <button 
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'account' ? 'text-[#B45309] font-black' : 'text-gray-400'}`}
        >
          <div className={`p-1 rounded-xl ${activeTab === 'account' ? 'bg-amber-50' : ''}`}>
            <User className="h-5 w-5" />
          </div>
          <span className="text-[10px]">{t('खाते', 'Account')}</span>
        </button>
      </div>

    </div>
  );
}