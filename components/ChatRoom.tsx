
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Message } from '../types';
import { getFairTradeSuggestion } from '../services/geminiService';
import { Card } from './ui/Card';

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

  // Load persistent messages
  useEffect(() => {
    const chatId = [currentUser.id, otherUser.id].sort().join('_');
    const stored = localStorage.getItem(`chat_${chatId}`);
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, [currentUser.id, otherUser.id]);

  // Save messages
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

    // Simulate real neighbor reply for demo
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: otherUser.id,
        receiverId: currentUser.id,
        text: `Hey ${currentUser.name.split(' ')[0]}! I'd love to swap skills. I can help with ${otherUser.teachSkills[0]} if you show me some ${currentUser.teachSkills[0]}!`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, reply]);
      onNewMessage(`New message from ${otherUser.name}`);
    }, 2000);
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
    <div className="fixed inset-0 bg-white z-[60] flex flex-col md:max-w-xl md:mx-auto md:shadow-2xl">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-900 text-white shadow-lg">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center flex-1 pr-8">
          <h2 className="font-black tracking-tight">{otherUser.name}</h2>
          <p className="text-[9px] opacity-70 uppercase tracking-widest font-bold">Local in {otherUser.city}</p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
      >
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            {m.isAiSuggestion ? (
              <div className="w-full my-4">
                <Card className="bg-gradient-to-br from-slate-900 to-indigo-900 border-none p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <span className="text-[10px] font-black text-indigo-300 tracking-widest uppercase">AI Trade Plan</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed font-medium">"{m.text}"</p>
                </Card>
              </div>
            ) : (
              <div 
                className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm shadow-sm ${
                  m.senderId === currentUser.id 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gemini Suggestion Button */}
      <div className="p-3 px-4 bg-white border-t border-slate-50">
        <button 
          onClick={getAiProposal}
          disabled={isAiThinking}
          className="w-full py-3 flex items-center justify-center gap-2 bg-slate-50 border border-indigo-100 rounded-2xl text-indigo-700 text-[11px] font-black hover:bg-indigo-50 transition-all uppercase tracking-wider disabled:opacity-50"
        >
          {isAiThinking ? (
            <span className="animate-pulse">Generating Expert Suggestion...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Ask Gemini for a Fair Trade
            </>
          )}
        </button>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
        <input 
          className="flex-1 px-5 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
          placeholder={`Message ${otherUser.name.split(' ')[0]}...`}
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all active:scale-90 shadow-lg"
        >
          <svg className="w-6 h-6 rotate-45 -mt-0.5 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
