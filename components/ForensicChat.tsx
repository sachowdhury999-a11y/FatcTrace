import React, { useState, useEffect, useRef } from 'react';
import { Chat } from "@google/genai";
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react';
import { ForensicReport, ChatMessage } from '../types';
import { startForensicChat } from '../services/geminiService';

interface ForensicChatProps {
  fileData: string;
  mimeType: string;
  report: ForensicReport;
}

export const ForensicChat: React.FC<ForensicChatProps> = ({ fileData, mimeType, report }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount
    try {
      const chat = startForensicChat(fileData, mimeType, report);
      setChatSession(chat);
      // Add initial greeting from AI
      setMessages([{
        role: 'model',
        text: "I've analyzed the media. Do you have specific questions about the visual evidence, location, or potential manipulation?",
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, [fileData, mimeType, report]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg });
      const text = result.text;
      
      setMessages(prev => [...prev, { role: 'model', text: text || "I couldn't generate a response.", timestamp: new Date() }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-slate-200">Forensic Analyst Chat</h3>
        <span className="text-xs text-slate-500 ml-auto bg-slate-900 px-2 py-1 rounded border border-slate-800">
          Gemini 3 Pro
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-900/50'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-blue-400" />}
            </div>
            <div className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-slate-200' 
                : 'bg-blue-900/20 text-blue-100 border border-blue-800/30'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center flex-shrink-0">
               <Bot className="w-4 h-4 text-blue-400" />
             </div>
             <div className="bg-blue-900/10 border border-blue-800/20 rounded-lg p-3 flex items-center gap-2">
               <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
               <span className="text-xs text-blue-300">Analyzing context...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask specific details about the analysis..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-slate-600"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};