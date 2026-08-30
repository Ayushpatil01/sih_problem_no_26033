import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sprout, ShoppingBag, Truck, ShieldCheck, 
  TrendingUp, Users, ArrowRight, CheckCircle2, 
  Leaf, Award, PhoneCall
} from 'lucide-react';

export default function Home() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F7F9F6] text-gray-800 font-sans pb-16">
      
      {/* 🟢 HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-white pt-8 pb-16 px-4 rounded-b-[40px] shadow-lg">
        {/* Decorative Background Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
          
          {/* Top Language Toggle Bar */}
          <div className="flex justify-end mb-2">
            <div className="flex bg-black/20 p-0.5 rounded-xl border border-white/20 text-xs font-bold backdrop-blur-md">
              <button
                onClick={() => setLang('mr')}
                className={`px-3 py-1 rounded-lg transition ${
                  lang === 'mr' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg transition ${
                  lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold text-emerald-200">
            <Leaf className="h-4 w-4 text-emerald-400" />
            <span>{t('शेतकरी ➔ वाहतूकदार ➔ ग्राहक थेट जोडणी', 'Farmer ➔ Transporter ➔ Buyer Direct Connect')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            {t('शेतकऱ्याचा ताजा शेतमाल,', 'Fresh Farm Produce,')} <br className="hidden sm:inline" />
            <span className="text-amber-400">{t('थेट ग्राहकाच्या दारात!', 'Directly to Your Doorstep!')}</span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            {t(
              'दलालांशिवाय थेट खरेदी-विक्री. शेतकऱ्याला मिळतो १००% योग्य हमीभाव आणि ग्राहकाला मिळतो विषमुक्त, ताजा व परवडणारा शेतमाल.',
              'Zero middlemen supply chain. Farmers get 100% fair pricing, and buyers get organic, fresh, and affordable produce.'
            )}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-gray-950 font-black px-8 py-3.5 rounded-2xl text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
            >
              <span>{t('मोफत खाते उघडा (Register)', 'Get Started Free')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3.5 rounded-2xl text-sm border border-white/30 backdrop-blur-md transition"
            >
              {t('लॉग इन करा (Login)', 'Sign In')}
            </Link>
          </div>
        </div>
      </section>

      {/* 🟢 3 USER ROLES SECTION */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* 1. Farmer Card */}
          <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                <Sprout className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">{t('१. शेतकरी मित्र', '1. For Farmers')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  'लाइव्ह APMC बाजारभाव पाहून स्वतःचा माल थेट ग्राहकांना विका. ०% दलाली आणि थेट बँक खात्यात पैसे.',
                  'List crops with live APMC rates. Get 0% brokerage and direct payments to your bank account.'
                )}
              </p>
            </div>
            <Link
              to="/register"
              className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline pt-2"
            >
              <span>{t('शेतकरी म्हणून जोडा', 'Join as Farmer')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 2. Transporter Card */}
          <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">{t('२. वाहतूकदार पार्टनर', '2. For Transporters')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  'शेतातून माल उचलून शहरात पोहोचवण्याच्या दररोजच्या फेऱ्या मिळवा. वेळेत पक्के भाडे व GPS नेव्हिगेशन.',
                  'Get daily transport loads from farms to city centers. Guaranteed daily payout and GPS live tracking.'
                )}
              </p>
            </div>
            <Link
              to="/register"
              className="text-xs font-bold text-amber-800 flex items-center gap-1 hover:underline pt-2"
            >
              <span>{t('वाहतूकदार म्हणून जोडा', 'Join as Transporter')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 3. Buyer Card */}
          <div className="bg-white p-5 rounded-3xl shadow-md border border-gray-100 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shadow-xs">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">{t('३. ग्राहक / खरेदीदार', '3. For Buyers')}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  'शेतातून थेट तोडलेला ताजा भाजीपाला, फळे आणि डाळी एका दिवसात थेट घरी मिळवा. वाजवी दर व UPI सुविधा.',
                  'Farm-fresh vegetables, fruits, and organic staples delivered same day at direct farmer rates.'
                )}
              </p>
            </div>
            <Link
              to="/register"
              className="text-xs font-bold text-blue-700 flex items-center gap-1 hover:underline pt-2"
            >
              <span>{t('खरेदी सुरू करा', 'Start Buying')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* 🟢 KEY HIGHLIGHTS & TRUST BADGES */}
      <section className="max-w-5xl mx-auto px-4 mt-12 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('विश्वास आणि तंत्रज्ञान', 'Trust & Innovation')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            {t('AgroConnect India ची मुख्य वैशिष्ट्ये', 'Why Choose AgroConnect India?')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-black text-gray-900">{t('लाइव्ह APMC भाव', 'Live Mandi Rates')}</h4>
            <p className="text-[10px] text-gray-400">{t('सरकारी Agmarknet डेटाबेसशी जोडलेले', 'Connected with Agmarknet API')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-black text-gray-900">{t('०% दलाली', '0% Middlemen')}</h4>
            <p className="text-[10px] text-gray-400">{t('शेतकऱ्यांना थेट १०-१५% जास्त नफा', 'Direct maximum profit to farmers')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Truck className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-black text-gray-900">{t('थेट GPS ट्रॅकिंग', 'Live GPS Tracking')}</h4>
            <p className="text-[10px] text-gray-400">{t('गाडीचे थेट लोकेशन व डिलिव्हरी ETA', 'Live route visualizer & ETA')}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-black text-gray-900">{t('UPI बिल पावती', 'Tax Invoice & QR')}</h4>
            <p className="text-[10px] text-gray-400">{t('GPay/PhonePe द्वारे सुलभ पेमेंट', 'Instant QR code payments')}</p>
          </div>
        </div>
      </section>

      {/* 🟢 FOOTER CTA */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-gray-400 border-t border-gray-200 pt-6">
        <p className="font-semibold text-gray-600">
          © 2026 AgroConnect India • {t('शेतकरी आणि ग्राहकांचा डिजिटल सेतू', 'Direct Farmer to Transporter & Buyer Logistics')}
        </p>
      </footer>

    </div>
  );
}