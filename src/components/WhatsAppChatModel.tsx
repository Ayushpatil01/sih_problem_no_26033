import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Phone, Video, MoreVertical, CheckCheck, Paperclip, Smile } from 'lucide-react';
import { useMarket, type ChatMessage } from '../context/MarketContext';

interface WhatsAppChatModalProps {
  orderId: string;
  target: 'farmer' | 'buyer' | 'transporter';
  title: string;
  subtitle: string;
  currentUserRole: 'farmer' | 'buyer' | 'transporter';
  onClose: () => void;
}

export default function WhatsAppChatModal({
  orderId,
  target,
  title,
  subtitle,
  currentUserRole,
  onClose
}: WhatsAppChatModalProps) {
  const { orders, sendMessage } = useMarket();
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // चालू ऑर्डर आणि तिचे चॅट्स मिळवणे
  const currentOrder = orders.find((o) => o.id === orderId);
  const messages: ChatMessage[] = currentOrder
    ? (target === 'farmer' ? currentOrder.farmerChat : currentOrder.buyerChat) || []
    : [];

  // नवीन मेसेज आल्यावर आपोआप खाली स्क्रोल करणे
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: currentUserRole,
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 🟢 MarketContext मधील sendMessage द्वारे कायमस्वरूपी सेव्ह होईल (गायब होणार नाही)
    sendMessage(orderId, target === 'farmer' ? 'farmer' : 'buyer', newMsg);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#EFEAE2] w-full max-w-md h-[580px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-300 animate-in zoom-in-95">
        
        {/* 🟢 WhatsApp Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center text-lg font-bold border border-white/30 shadow-inner">
              {currentUserRole === 'transporter' ? (target === 'farmer' ? '🌾' : '🛒') : '🚛'}
            </div>
            <div>
              <h4 className="text-sm font-black tracking-tight leading-tight">{title}</h4>
              <p className="text-[11px] text-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                <span>{subtitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white/90">
            <button onClick={() => window.open('tel:9270558429')} className="hover:text-white">
              <Phone className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white transition">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 🟢 WhatsApp Chat Wallpaper Area */}
        <div 
          className="flex-1 p-3.5 overflow-y-auto space-y-2.5"
          style={{
            backgroundColor: '#efeae2',
            backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        >
          {/* Encryption Security Badge */}
          <div className="text-center my-2">
            <span className="bg-[#FFEECD] text-amber-900 text-[10px] font-bold px-3 py-1 rounded-lg shadow-2xs inline-block">
              🔒 AgroConnect Direct End-to-End Encrypted Chat
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === currentUserRole;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[78%] px-3 py-1.5 rounded-2xl shadow-xs relative text-xs font-semibold leading-relaxed ${
                    isMe
                      ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none border border-[#bbf7d0]'
                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                  }`}
                >
                  <p className="pr-1">{msg.text}</p>
                  
                  {/* Time & WhatsApp Double Tick */}
                  <div className="flex items-center justify-end gap-1 mt-0.5 text-[9px] text-gray-500 font-medium">
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        {/* 🟢 WhatsApp Input Bar */}
        <form onSubmit={handleSend} className="p-2.5 bg-[#F0F2F5] border-t border-gray-200 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1.5 border border-gray-200 shadow-xs">
            <Smile className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs text-gray-800 focus:outline-none placeholder-gray-400"
            />
            <Paperclip className="h-4 w-4 text-gray-400 ml-1.5" />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-[#00A884] hover:bg-[#075E54] disabled:opacity-50 text-white rounded-full flex items-center justify-center shadow-md transition active:scale-95 flex-shrink-0"
          >
            <Send className="h-4 w-4 -ml-0.5" />
          </button>
        </form>

      </div>
    </div>
  );
}