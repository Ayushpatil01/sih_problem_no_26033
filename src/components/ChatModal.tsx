import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Send } from 'lucide-react';

interface ChatModalProps {
  otherUserId: string;
  otherUserName: string;
  onClose: () => void;
}

export default function ChatModal({ otherUserId, otherUserName, onClose }: ChatModalProps) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling for simplicity
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const res = await fetch(`/api/chat/${otherUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ receiverId: otherUserId, text: newMessage }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchMessages();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full flex flex-col h-[500px]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-green-600 text-white rounded-t-lg">
          <h2 className="text-lg font-bold">Chat with {otherUserName}</h2>
          <button onClick={onClose} className="hover:bg-green-700 p-1 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 my-auto">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.senderId === user?.id 
                    ? 'bg-green-600 text-white self-end rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-900 self-start rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.senderId === user?.id ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition"
              disabled={!newMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
