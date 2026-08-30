import React from 'react';
import { X, Truck, MapPin, Navigation, CheckCircle2, Phone } from 'lucide-react';
import type { Order } from '../context/MarketContext';

interface LiveTrackingProps {
  order: Order;
  onClose: () => void;
}

export default function LiveTrackingModal({ order, onClose }: LiveTrackingProps) {
  // प्रगती (Progress Percentage)
  const getProgress = () => {
    switch (order.status) {
      case 'Pending': return 15;
      case 'Accepted by Transporter': return 40;
      case 'In Transit': return 75;
      case 'Delivered': return 100;
      default: return 20;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-[#1B5E20] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Truck className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-black">थेट व्हेईकल ट्रॅकिंग (Live GPS)</h3>
              <p className="text-[10px] text-emerald-200">{order.id} • थेट लोकेशन</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 🗺️ Interactive Live Map Visualizer */}
        <div className="relative h-44 bg-emerald-50 overflow-hidden border-b border-emerald-100 flex items-center justify-center">
          {/* Map Grid Graphic */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#059669 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px'
            }}
          />

          {/* Route Connecting Line */}
          <div className="absolute w-[80%] h-2 bg-emerald-200 rounded-full">
            <div 
              className="h-full bg-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          {/* Farm Pickup Pin */}
          <div className="absolute left-6 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-black text-gray-700 mt-1 bg-white px-1.5 py-0.5 rounded shadow-2xs">शेतातून</span>
          </div>

          {/* Moving Vehicle Truck */}
          <div 
            className="absolute transition-all duration-1000 flex flex-col items-center z-10"
            style={{ left: `calc(${getProgress()}% - 16px)` }}
          >
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shadow-xs mt-0.5">
              चालू गाडी
            </span>
          </div>

          {/* Buyer Destination Pin */}
          <div className="absolute right-6 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Navigation className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-black text-gray-700 mt-1 bg-white px-1.5 py-0.5 rounded shadow-2xs">ग्राहक</span>
          </div>
        </div>

        {/* Location Details */}
        <div className="p-4 space-y-3.5">
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">पिकअप पत्ता (Farmer):</span>
                <p className="font-bold text-gray-900">{order.farmerName} • {order.farmerLocation}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">डिलिव्हरी पत्ता (Buyer):</span>
                <p className="font-bold text-gray-900">{order.buyerName} • {order.buyerLocation}</p>
              </div>
            </div>
          </div>

          {/* Status & ETA */}
          <div className="bg-emerald-50 rounded-2xl p-3 flex justify-between items-center border border-emerald-200">
            <div>
              <span className="text-[10px] font-bold text-emerald-800">डिलिव्हरी स्थिती:</span>
              <h4 className="text-xs font-black text-emerald-950">{order.status}</h4>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-500">अंदाजे वेळ (ETA):</span>
              <p className="text-xs font-black text-gray-800">३५ - ४५ मिनिटे</p>
            </div>
          </div>

          <button 
            onClick={() => window.open('tel:9270558429')}
            className="w-full bg-[#1B5E20] hover:bg-emerald-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            <Phone className="h-4 w-4" />
            <span>ड्रायव्हरशी संपर्क साधा</span>
          </button>
        </div>

      </div>
    </div>
  );
}