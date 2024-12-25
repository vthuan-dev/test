import { useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender_id: number;
  message: string;
  created_at: string;
}

export const ChatMessages = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Tin nhắn chào mừng */}
      <div className="flex items-start space-x-2">
        <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
          <p className="text-sm">
            Xin chào! Tôi có thể giúp gì cho bạn?
          </p>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};