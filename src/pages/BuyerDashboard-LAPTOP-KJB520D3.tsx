import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, MapPin, Star, MessageCircle, Clock, CheckCircle2, Truck } from 'lucide-react';
import ChatModal from '../components/ChatModal';
import Toast, { type ToastType } from '../components/Toast';

export default function BuyerDashboard() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [chatUser, setChatUser] = useState<{ id: string, name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Fruits', 'Vegetables', 'Grains', 'Pulses'];

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      const allOrders = Array.isArray(data) ? data : [];
      // बायरला स्वतःच्या ऑर्डर्स दिसतील
      const buyerOrders = user?.id 
        ? allOrders.filter((o: any) => String(o.buyerId) === String(user.id))
        : allOrders;
      setOrders(buyerOrders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      // ट्रान्सपोर्टर आणि शेतकरी दोघांना लागणारा सर्व डेटा
      const orderPayload = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: Number(orderQuantity),
        totalPrice: Number((orderQuantity * selectedProduct.price).toFixed(2)),
        farmerId: selectedProduct.farmerId || '1',
        farmerName: selectedProduct.farmerName || 'Farmer Partner',
        farmerLocation: selectedProduct.farmerLocation || selectedProduct.location || 'Farm Origin',
        buyerId: user?.id || '2',
        otherPartyName: user?.name || 'Buyer Partner',
        otherPartyLocation: user?.location || 'City Destination',
        transporterId: null, // सुरुवातीला null असेल जेणेकरून Transporter ला नवीन Job दिसेल
        transporterName: null,
        status: 'Pending', // सुरुवातीचा स्टेटस 'Pending'
        createdAt: new Date().toISOString(),
        trackingHistory: [
          {
            status: 'Order Placed',
            location: user?.location || 'Origin Hub',
            timestamp: new Date().toISOString()
          }
        ]
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload),
      });
      
      if (res.ok) {
        // प्रॉडक्टची उपलब्ध संख्या (Stock) अपडेट करणे
        const remainingQty = Math.max(0, Number(selectedProduct.quantity) - Number(orderQuantity));
        await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            quantity: remainingQty,
            status: remainingQty === 0 ? 'sold_out' : 'available'
          })
        });

        setSelectedProduct(null);
        setOrderQuantity(1);
        fetchOrders();
        fetchProducts();
        setToast({ message: 'Order placed successfully! Transporters notified. 🚛', type: 'success', isVisible: true });
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Something went wrong', type: 'error', isVisible: true });
    }
  };

  const filteredProducts = products.filter(p => {
    const search = searchTerm.toLowerCase();
    const nameMatch = (p?.name?.toLowerCase() || '').includes(search);
    const locationMatch = (p?.farmerLocation?.toLowerCase() || p?.location?.toLowerCase() || '').includes(search);
    const matchesSearch = nameMatch || locationMatch;

    const matchesCategory = selectedCategory === 'All' || p?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Direct Farm Marketplace</h1>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl shadow-sm focus:ring-green-500 focus:border-green-500 bg-white transition-all text-sm font-medium"
            placeholder="Search farm products, regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-gray-500 font-bold">No crops matching your search.</p>
              </div>
            ) : (
              filteredProducts.map(p => (
                <div key={p.id} className={`bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-sm ${p.quantity === 0 ? 'opacity-60 saturate-0' : ''}`}>
                  <div className="relative">
                    <img 
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1615485290382-441e4d019cb5?auto=format&fit=crop&q=80&w=400'} 
                      alt={p.name} 
                      className="w-full h-56 object-cover bg-gray-100" 
                      referrerPolicy="no-referrer" 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-green-700 shadow-sm">
                      ₹{p.price}/kg
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-bold ml-1">4.9</span>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-2 font-medium">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-green-500" />
                      {p.farmerLocation || p.location || 'Maharashtra, India'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-5 font-medium">
                      <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
                      {p.quantity > 0 ? `${p.quantity} kg available` : 'Sold Out'}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        disabled={p.quantity === 0}
                        className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 transition flex justify-center items-center shadow-lg shadow-green-100 disabled:bg-gray-400 disabled:shadow-none"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order
                      </button>
                      <button
                        onClick={() => setChatUser({ id: p.farmerId || '1', name: p.farmerName || 'Farmer' })}
                        className="p-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition flex justify-center items-center shadow-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900">Track Orders</h2>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden min-h-[500px] shadow-sm">
            <ul className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <li className="px-6 py-20 text-gray-500 text-center">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="font-bold">No orders yet.</p>
                  <p className="text-xs">Start browsing the marketplace!</p>
                </li>
              ) : (
                orders.map(o => (
                  <li key={o.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-md font-bold text-gray-900">{o.productName}</h3>
                        <p className="text-xs text-gray-500 font-bold">Qty: {o.quantity}kg • Total: ₹{Number(o.totalPrice || 0).toLocaleString()}</p>
                        {o.transporterName && <p className="text-[10px] text-blue-600 font-bold mt-1">🚛 Transporter: {o.transporterName}</p>}
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' : 
                        o.status === 'Shipped' || o.status === 'In Transit' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    
                    {/* Visual Tracking History */}
                    <div className="mt-4 border-l-2 border-gray-100 ml-2 space-y-4 pr-2">
                      {(o.trackingHistory || []).slice().reverse().map((h: any, i: number) => (
                        <div key={i} className="relative pl-6">
                          <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${i === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <p className={`text-[11px] font-bold ${i === 0 ? 'text-gray-900' : 'text-gray-400'}`}>{h.status}</p>
                          <p className="text-[10px] text-gray-400 italic">{h.location} • {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Checkout</h2>
                <p className="text-gray-500 font-medium">Buying from {selectedProduct.farmerName || 'Farmer'}</p>
              </div>
              <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-md bg-gray-100">
                <img 
                  src={selectedProduct.images?.[0] || 'https://images.unsplash.com/photo-1615485290382-441e4d019cb5?auto=format&fit=crop&q=80&w=400'} 
                  alt={selectedProduct.name} 
                  className="h-full w-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Order Quantity (kg)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedProduct.quantity}
                    required 
                    className="flex-1 border-gray-200 border-2 rounded-2xl p-4 text-xl font-black focus:ring-green-500 focus:border-green-500 outline-none" 
                    value={orderQuantity} 
                    onChange={e => setOrderQuantity(Number(e.target.value))} 
                  />
                  <div className="text-sm font-bold text-gray-400">
                    / {selectedProduct.quantity}kg
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="flex justify-between mb-2 text-sm font-bold text-gray-500">
                  <span>Price per kg</span>
                  <span>₹{selectedProduct.price}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total (INR)</span>
                  <span className="text-green-600">₹{(orderQuantity * selectedProduct.price).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Confirm & Pay
                </button>
                <button type="button" onClick={() => setSelectedProduct(null)} className="w-full py-3 bg-white text-gray-400 font-bold hover:text-gray-600 transition-colors">Cancel Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {chatUser && (
        <ChatModal 
          {...({
            orderId: chatUser.id,
            otherUserId: chatUser.id,
            otherUserName: chatUser.name,
            onClose: () => setChatUser(null)
          } as any)} 
        />
      )}
    </div>
  );
}