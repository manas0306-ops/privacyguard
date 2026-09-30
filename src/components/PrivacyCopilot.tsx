import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Shield,
  HelpCircle,
  MapPin,
  Ban,
  Database,
  ArrowRight,
  Sliders,
  Calculator,
  Cpu,
  Key,
  Globe,
  Trash2,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';
import {
  processCopilotQuery,
  CopilotAppContext
} from '../engine/copilotEngine';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  isAction?: boolean;
}

export const PrivacyCopilot: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    scoreBreakdown,
    consents,
    dataAssets,
    auditLogs,
    isLockdownActive,
    toggleLockdown,
    withdrawConsent,
    submitErasureRequest,
    resetDemoState,
    setActiveTab
  } = usePrivacy();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<'local' | 'gemini'>('local');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-0',
      sender: 'copilot',
      text: "👋 **Hello! I'm your PrivacyGuard Global AI Copilot.**\n\nI can answer **any question about the world**, perform **mathematical calculations**, explain **cybersecurity & privacy**, draft legal requests, and **control this application live**:\n\n• 🌍 **World Knowledge:** *\"Who is Alan Turing?\"*, *\"Capital of Peru\"*, *\"What is quantum computing?\"*\n• 🧮 **Calculations:** *\"Calculate 15% of 850\"*, *\"Square root of 256\"*, *\"50 miles to km\"*\n• 🛡️ **Privacy Laws:** *\"Explain GDPR Article 17\"*, *\"What is Zero Knowledge Proof?\"*\n• 🚨 **Firewall Actions:** *\"Activate Privacy Lockdown\"*, *\"What is my privacy score?\"*\n\nAsk me anything below!",
      timestamp: 'Just now'
    }
  ]);

  // Load saved API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('privacyguard_gemini_key');
    if (savedKey) {
      setGeminiApiKey(savedKey);
      setModelMode('gemini');
    }
  }, []);

  const saveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('privacyguard_gemini_key', key);
    if (key.trim()) {
      setModelMode('gemini');
    } else {
      setModelMode('local');
    }
    setShowKeyModal(false);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isCopilotOpen) return null;

  const quickPrompts = [
    'Who is Alan Turing?',
    'Calculate 18% of 2,450',
    'What is the capital of Peru?',
    'Explain Zero Knowledge Proofs',
    'Activate Privacy Lockdown',
    'Draft an erasure request email'
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    const appContext: CopilotAppContext = {
      scoreBreakdown,
      consents,
      dataAssets,
      auditLogs,
      isLockdownActive,
      toggleLockdown,
      withdrawConsent,
      submitErasureRequest,
      resetDemoState,
      setActiveTab
    };

    const history = messages.slice(-6).map(m => ({
      role: m.sender,
      text: m.text
    }));

    try {
      const result = await processCopilotQuery(text, history, appContext, modelMode, geminiApiKey);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'copilot',
          text: result.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAction: result.isAction
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'copilot',
          text: "I encountered an error retrieving that information. Please try rephrasing your question.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'copilot',
        text: "🧹 Conversation history cleared. Ask me any world knowledge, calculation, or privacy question!",
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[92vh] max-h-[740px] glass-panel rounded-3xl border border-indigo-500/40 bg-[#0b1120]/95 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/30 border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  PrivacyGuard Copilot
                </h3>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase border ${
                  modelMode === 'gemini'
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                }`}>
                  {modelMode === 'gemini' ? 'GEMINI 1.5 LLM' : 'GLOBAL AI ENGINE'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                World Knowledge • Calculations • Real-time Firewall
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Model mode settings button */}
            <button
              onClick={() => setShowKeyModal(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Configure Gemini Cloud LLM or Global AI Engine"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Clear chat */}
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear Chat History"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close drawer */}
            <button
              onClick={() => setIsCopilotOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Modal / Drawer */}
        {showKeyModal && (
          <div className="p-4 bg-slate-900 border-b border-indigo-500/30 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Select AI Engine Mode
              </span>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setModelMode('local');
                  setShowKeyModal(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  modelMode === 'local'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-white">⚡ Global AI Engine</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Live world knowledge, math &amp; privacy (zero API key needed)</div>
              </button>

              <button
                type="button"
                onClick={() => setModelMode('gemini')}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  modelMode === 'gemini'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-white">🚀 Gemini Cloud LLM</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Connect your free Google Gemini API Key</div>
              </button>
            </div>

            {modelMode === 'gemini' && (
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-mono text-slate-300 block">
                  Gemini API Key (stored in local browser storage):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    onClick={() => saveGeminiKey(geminiApiKey)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm'
                    : m.isAction
                    ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-500/40 rounded-tl-none font-mono text-[11px]'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none font-sans'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-start">
              <div className="bg-slate-800/90 text-slate-300 border border-slate-700/80 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[10px] text-slate-400 font-mono ml-2">Searching knowledge network...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-500">
            <span>Ask anything:</span>
            <span>World Knowledge • Math • Privacy</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition-colors cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputQuery)}
            placeholder="Ask any world knowledge, calculation, or privacy command..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend(inputQuery)}
            disabled={!inputQuery.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
