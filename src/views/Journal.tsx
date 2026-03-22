import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, MapPin } from 'lucide-react';
import { ChatMessage } from '../hooks/useTripSocket';

interface JournalProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: { id: string; name: string };
}

export function Journal({ messages, onSendMessage, currentUser }: JournalProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="pt-20 pb-24 px-4 h-full flex flex-col">
      <h2 className="text-3xl font-bold font-headline text-primary mb-4 px-2">Trip Journal</h2>
      
      <div className="flex-1 bg-white/60 backdrop-blur-md rounded-2xl pixel-border-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-white/80 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-stone-800">Kyoto Planning Group</h3>
            <p className="text-xs text-stone-500">3 members online</p>
          </div>
          <div className="flex -space-x-2">
            <img src="https://picsum.photos/seed/alice/100/100" className="w-8 h-8 rounded-full border-2 border-white" alt="Alice" referrerPolicy="no-referrer" />
            <img src="https://picsum.photos/seed/bob/100/100" className="w-8 h-8 rounded-full border-2 border-white" alt="Bob" referrerPolicy="no-referrer" />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-xs font-bold text-primary">
              +1
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-center text-xs text-stone-400 my-4">Today</div>
          
          {messages.map((msg) => {
            const isMe = msg.userId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isMe ? 'bg-primary text-white rounded-l-2xl rounded-tr-2xl' : 'bg-stone-100 text-stone-800 rounded-r-2xl rounded-tl-2xl'} p-3 shadow-sm`}>
                  {!isMe && <div className="text-[10px] font-bold text-stone-500 mb-1">{msg.userName}</div>}
                  <p className="text-sm">{msg.text}</p>
                  <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-container' : 'text-stone-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <button type="button" className="p-2 text-stone-400 hover:text-primary transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <button type="button" className="p-2 text-stone-400 hover:text-primary transition-colors">
            <MapPin className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-stone-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
