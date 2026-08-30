import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: number;
  name: string;
  category: string;
  farmer: string;
  location: string;
  price: number;
  mrp: number;
  unit: string;
  img: string;
  badge: string;
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'buyer' | 'transporter';
  text: string;
  time: string;
}

export interface Order {
  id: string;
  date: string;
  buyerName: string;
  buyerLocation: string;
  farmerName: string;
  farmerLocation: string;
  items: { name: string; qty: number; price: number; unit: string }[];
  total: number;
  status: 'Pending' | 'Accepted by Transporter' | 'In Transit' | 'Delivered';
  pickupLocation?: string;
  dropLocation?: string;
  farmerChat: ChatMessage[];
  buyerChat: ChatMessage[];
  review?: { rating: number; comment: string };
}

interface MarketContextType {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: number) => void; // 🟢 Delete Product Function Type
  addOrder: (order: Omit<Order, 'farmerChat' | 'buyerChat'>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  sendMessage: (orderId: string, type: 'farmer' | 'buyer', message: ChatMessage) => void;
  addReview: (orderId: string, rating: number, comment: string) => void;
}

const defaultProducts: Product[] = [
  { id: 1, name: 'ताजी भेंडी (Fresh Okra)', category: 'VEGETABLE', farmer: 'रामचंद्र पाटील', location: 'नाशिक', price: 28, mrp: 40, unit: '500g', img: 'https://images.unsplash.com/photo-1525607551316-4a8e16d1f9ba?w=400', badge: 'Kisan Direct' },
  { id: 2, name: 'सेंद्रिय गाजर (Organic Carrot)', category: 'VEGETABLE', farmer: 'ज्ञानेश्वर शिंदे', location: 'पुणे', price: 35, mrp: 50, unit: '1 kg', img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', badge: 'Organic Grade A' },
  { id: 3, name: 'लाल टोमॅटो (Red Tomatoes)', category: 'VEGETABLE', farmer: 'सुभाष कांबळे', location: 'जुन्नर', price: 22, mrp: 35, unit: '1 kg', img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', badge: 'Direct Harvest' },
  { id: 4, name: 'नाशिक कांदा (Nashik Onion)', category: 'VEGETABLE', farmer: 'विठ्ठल जाधव', location: 'निफाड', price: 32, mrp: 45, unit: '1 kg', img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', badge: 'Kisan Market' }
];

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('agro_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('agro_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ORD-1001',
        date: 'आज, 11:30 AM',
        buyerName: 'Ayush Awatirak',
        buyerLocation: 'Koregaon Park, Pune',
        farmerName: 'रामचंद्र पाटील',
        farmerLocation: 'Niphad, Nashik',
        items: [{ name: 'ताजी भेंडी (Fresh Okra)', qty: 2, price: 28, unit: '500g' }],
        total: 56,
        status: 'Pending',
        farmerChat: [
          { id: '1', sender: 'transporter', text: 'नमस्कार शेतकरी दादा, पिकअप लोकेशन पाठवा.', time: '11:32 AM' },
          { id: '2', sender: 'farmer', text: 'राम मंदिर जवळ, मेन रोड निफाड, नाशिक.', time: '11:35 AM' }
        ],
        buyerChat: [
          { id: '1', sender: 'transporter', text: 'नमस्कार, मी माल घेऊन निघालो आहे. ड्रॉप पत्ता सांगा.', time: '11:36 AM' },
          { id: '2', sender: 'buyer', text: 'फ्लॅट ४०२, ग्रीन व्ह्यू अपार्टमेंट, पुणे.', time: '11:38 AM' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('agro_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('agro_orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const item: Product = { ...newProd, id: Date.now() };
    setProducts((prev) => [item, ...prev]);
  };

  // 🟢 शेतमाल डिलीट करण्याचे लॉजिक
  const deleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  const addOrder = (orderData: Omit<Order, 'farmerChat' | 'buyerChat'>) => {
    const newOrder: Order = {
      ...orderData,
      farmerChat: [{ id: '1', sender: 'transporter', text: `नमस्कार ${orderData.farmerName}जी, मी तुमची ऑर्डर पिकअप करण्यासाठी येत आहे. अचूक फार्म लोकेशन पाठवा.`, time: 'आत्ता' }],
      buyerChat: [{ id: '1', sender: 'transporter', text: `नमस्कार ${orderData.buyerName}जी, तुमची ताजी शेतमाल ऑर्डर पिकअप होत आहे. डिलिव्हरी लोकेशन कन्फर्म करा.`, time: 'आत्ता' }]
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const sendMessage = (orderId: string, type: 'farmer' | 'buyer', message: ChatMessage) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          if (type === 'farmer') {
            return { ...o, farmerChat: [...o.farmerChat, message] };
          } else {
            return { ...o, buyerChat: [...o.buyerChat, message] };
          }
        }
        return o;
      })
    );
  };

  const addReview = (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, review: { rating, comment } } : o))
    );
  };

  return (
    <MarketContext.Provider value={{ 
      products, 
      orders, 
      addProduct, 
      deleteProduct, 
      addOrder, 
      updateOrderStatus, 
      sendMessage, 
      addReview 
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within MarketProvider');
  return context;
};