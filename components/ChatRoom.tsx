
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from '../types';
import { getFairTradeSuggestion } from '../services/geminiService';

interface ChatRoomProps {
  currentUser: UserProfile;
  otherUser: UserProfile;
  onBack: () => void;
  onNewMessage: (msg: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser, otherUser, onBack, onNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load persistent messages from localStorage
  useEffect(() => {
    const chatId = [currentUser.id, otherUser.id].sort().join('_');
    const stored = localStorage.getItem(`chat_${chatId}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, [currentUser.id, otherUser.id]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const chatId = [currentUser.id, otherUser.id].sort().join('_');
    if (messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
    }
  }, [messages, currentUser.id, otherUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: otherUser.id,
      text: inputText,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Removed automated reply as requested by user.
    // Chatting is now purely between the real users in the local storage database.
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAiProposal = async () => {
    setIsAiThinking(true);
    const suggestion = await getFairTradeSuggestion(currentUser, otherUser);
    setIsAiThinking(false);
    
    const aiMessage: Message = {
      id: 'ai-' + Date.now().toString(),
      senderId: 'ai',
      receiverId: currentUser.id,
      text: suggestion,
      timestamp: Date.now(),
      isAiSuggestion: true
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  return (
    <div className="fixed inset-0 bg-[#efe7de] z-[60] flex flex-col md:max-w-xl md:mx-auto shadow-2xl overflow-hidden">
      {/* WhatsApp-style Header */}
      <div className="px-3 py-2 flex items-center bg-[#075e54] text-white shadow-md z-10">
        <button onClick={onBack} className="p-1 rounded-full hover:bg-black/10 transition-colors mr-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center flex-1 cursor-pointer">
          <img 
            src={`https://picsum.photos/seed/${otherUser.id}/80/80`} 
            className="w-10 h-10 rounded-full border border-white/20 mr-3 object-cover" 
            alt={otherUser.name} 
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base truncate leading-tight">{otherUser.name}</h2>
            <p className="text-[11px] opacity-80 leading-tight">online</p>
          </div>
        </div>
        <div className="flex gap-4 px-2">
          <svg className="w-5 h-5 opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
          <svg className="w-5 h-5 opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.27.36-.67.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>
          <svg className="w-5 h-5 opacity-90" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </div>
      </div>

      {/* Messages Area with WhatsApp Background Pattern */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 relative"
        style={{ 
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundSize: '400px',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="flex justify-center mb-4">
          <span className="bg-[#dcf8c6]/80 text-[#4a4a4a] text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm uppercase tracking-wide">
            Messages are end-to-end encrypted
          </span>
        </div>

        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'} mb-1`}
          >
            {m.isAiSuggestion ? (
              <div className="w-full max-w-[85%] my-2 mx-auto">
                <div className="bg-[#075e54] text-white p-4 rounded-2xl shadow-lg border-l-4 border-[#128c7e]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-indigo-200">Gemini Proposal</span>
                  </div>
                  <p className="text-sm italic leading-relaxed font-medium">"{m.text}"</p>
                  <p className="text-[9px] text-right mt-1 opacity-60">{formatTime(m.timestamp)}</p>
                </div>
              </div>
            ) : (
              <div 
                className={`relative max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm text-sm ${
                  m.senderId === currentUser.id 
                    ? 'bg-[#dcf8c6] text-[#303030] rounded-tr-none' 
                    : 'bg-white text-[#303030] rounded-tl-none'
                }`}
              >
                <span className="pr-12 break-words block">{m.text}</span>
                <div className="absolute bottom-1 right-1 flex items-center gap-1">
                  <span className="text-[10px] text-[#8e8e8e] leading-none">{formatTime(m.timestamp)}</span>
                  {m.senderId === currentUser.id && (
                    <svg className="w-3.5 h-3.5 text-[#4fc3f7]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM1 12l4.24 4.24L6.66 14.83 2.41 10.59 1 12z"/>
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Suggestion & Input Panel */}
      <div className="bg-[#efefef] p-2 flex flex-col gap-2 shadow-inner">
        {/* Ask Gemini Button */}
        <button 
          onClick={getAiProposal}
          disabled={isAiThinking}
          className="mx-2 py-1.5 flex items-center justify-center gap-2 bg-white border border-slate-200 rounded-lg text-[#075e54] text-[11px] font-bold hover:bg-slate-50 transition-all uppercase tracking-wider disabled:opacity-50 shadow-sm"
        >
          {isAiThinking ? (
            <span className="animate-pulse">Gemini is thinking...</span>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Get AI Trade Plan
            </>
          )}
        </button>

        {/* WhatsApp-style Input Footer */}
        <div className="flex items-end gap-2 px-1">
          <div className="flex-1 bg-white rounded-3xl flex items-center px-3 py-1 shadow-sm border border-slate-200 min-h-[48px]">
            <button className="p-2 text-[#919191] hover:text-[#075e54]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
            </button>
            <input 
              className="flex-1 px-2 py-2 text-[15px] focus:outline-none bg-transparent placeholder:text-slate-400"
              placeholder="Type a message"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="p-2 text-[#919191] hover:text-[#075e54]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
            </button>
          </div>
          
          <button 
            onClick={handleSend}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#075e54] text-white rounded-full hover:bg-[#128c7e] transition-all active:scale-90 shadow-md"
          >
            {inputText.trim() ? (
              <svg className="w-6 h-6 -mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
