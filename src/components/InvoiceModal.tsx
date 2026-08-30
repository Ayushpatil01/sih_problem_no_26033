import React from 'react';
import { X, CheckCircle2, Download, Printer, QrCode } from 'lucide-react';
import type { Order } from '../context/MarketContext';

interface InvoiceProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceProps) {
  // UPI Payment Link (PhonePe / GPay / Paytm)
  const upiId = 'agroconnect@upi'; // तुमचा UPI आयडी
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}&pn=AgroConnect&am=${order.total}&cu=INR`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in zoom-in-95">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1B5E20] text-white p-4 flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-amber-400 text-gray-950 font-black px-2 py-0.5 rounded-full uppercase">
              Official Tax Invoice
            </span>
            <h3 className="text-sm font-black mt-1">AgroConnect India बिल</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-gray-800">
          
          {/* Order Details Header */}
          <div className="flex justify-between border-b pb-3 border-gray-100 text-[11px]">
            <div>
              <p className="font-bold text-gray-400">बिल क्रमांक:</p>
              <p className="font-black text-gray-900">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-400">तारीख:</p>
              <p className="font-black text-gray-900">{order.date}</p>
            </div>
          </div>

          {/* Customer & Farmer */}
          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-2xl text-[11px]">
            <div>
              <span className="font-bold text-emerald-800">शेतकरी (Seller):</span>
              <p className="font-semibold text-gray-700">{order.farmerName}</p>
              <p className="text-[9px] text-gray-400">{order.farmerLocation}</p>
            </div>
            <div>
              <span className="font-bold text-blue-800">खरेदीदार (Buyer):</span>
              <p className="font-semibold text-gray-700">{order.buyerName}</p>
              <p className="text-[9px] text-gray-400">{order.buyerLocation}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <div className="bg-gray-100 px-3 py-1.5 font-black text-[10px] text-gray-600 flex justify-between">
              <span>शेतमाल</span>
              <span>रक्कम</span>
            </div>
            <div className="divide-y divide-gray-50 p-2 space-y-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <div>
                    <p className="font-bold text-gray-800">{it.name}</p>
                    <p className="text-[10px] text-gray-400">{it.qty} x ₹{it.price}/{it.unit}</p>
                  </div>
                  <span className="font-black text-gray-900">₹{it.qty * it.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Calculation */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl space-y-1 border border-emerald-100">
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>शेतमाल उपएकूण:</span>
              <span>₹{order.total}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-600">
              <span>थेट वाहतूक आकार:</span>
              <span className="text-emerald-700 font-bold">मोफत / समाविष्ट</span>
            </div>
            <div className="flex justify-between text-sm font-black text-emerald-950 pt-1 border-t border-emerald-200">
              <span>एकूण रक्कम (Total):</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          {/* 📱 UPI QR Code For Direct Payment */}
          <div className="text-center bg-gray-50 p-3 rounded-2xl border border-dashed border-gray-300 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black text-gray-800">
              <QrCode className="h-4 w-4 text-emerald-700" />
              <span>UPI स्कॅन करून पैसे भरा</span>
            </div>
            <img src={upiQrUrl} alt="UPI QR Code" className="w-32 h-32 mx-auto rounded-xl shadow-xs border bg-white p-1" />
            <p className="text-[10px] text-gray-500 font-bold">Google Pay / PhonePe / Paytm द्वारे स्कॅन करा</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => window.print()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>प्रिंट करा</span>
            </button>
            <button 
              onClick={() => alert('✅ बिल डाऊनलोड झाले!')}
              className="bg-[#1B5E20] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>PDF डाऊनलोड</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}