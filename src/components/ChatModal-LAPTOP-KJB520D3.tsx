import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Send, User } from 'lucide-react';

interface ChatModalProps {
  receiverId?: string;
  receiverName?: string;
  otherUserId?: string;
  otherUserName?: string;
  orderId?: string;
  onClose: () => void;
}

export default function ChatModal(props: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // आयडी आणि नाव सुरक्षितपणे मिळवणे
  const targetId = String(props.receiverId || props.otherUserId || props.orderId || '');
  const targetName = props.receiverName || props.otherUserName || 'User';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // दर २ सेकंदांनी ऑटो-रिफ्रेश
    return () => clearInterval(interval);
  }, [targetId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (!res.ok) return;
      const data = await res.json();
      const allMessages = Array.isArray(data) ? data : [];

      const currentUserId = String(user?.id || '');

      // मेसेज फिल्टरिंग (दोघांमधील संभाषण)
      const conversation = allMessages.filter((m: any) => {
        const sId = String(m.senderId);
        const rId = String(m.receiverId);
        return (
          (sId === currentUserId && rId === targetId) ||
          (sId === targetId && rId === currentUserId)
        );
      });

      setMessages(conversation);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // चॅट विंडो बंद होण्यापासून थांबवणे

    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    const payload = {
      senderId: String(user.id),
      senderName: user.name || 'User',
      receiverId: targetId,
      receiverName: targetName,
      text: messageText,
      timestamp: new Date().toISOString()
    };

    // UI वर लगेच मेसेज दाखवणे (Instant Display)
    setMessages((prev) => [...prev, payload]);
    setNewMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={props.onClose} // फक्त बाहेर काळ्या भागावर क्लिक केल्यावरच बंद होईल
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full h-[520px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 relative"
        onClick={(e) => e.stopPropagation()} // बॉक्सच्या आत क्लिक केल्यावर विंडो बंद होणार नाही
      >
        {/* Header */}
        <div className="px-6 py-4 bg-green-600 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-md leading-tight">{targetName}</h3>
              <span className="text-[11px] text-green-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Direct Chat
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
              <p>No conversation yet.</p>
              <p className="mt-1">Send a message to start chatting with {targetName} 👋</p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = String(m.senderId) === String(user?.id);
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                      isMe
                        ? 'bg-green-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{m.text}</p>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-600 transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="bg-green-600 text-white p-3 rounded-2xl hover:bg-green-700 transition disabled:opacity-50 shadow-md shadow-green-100 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}