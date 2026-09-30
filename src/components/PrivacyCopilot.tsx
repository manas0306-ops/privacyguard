import React, { useState } from 'react';
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
  Sliders
} from 'lucide-react';
import { usePrivacy } from '../context/PrivacyContext';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
}

export const PrivacyCopilot: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    scoreBreakdown,
    consents,
    dataAssets,
    auditLogs,
    isLockdownActive
  } = usePrivacy();

  const [inputQuery, setInputQuery] = useState<string>('');
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-0',
      sender: 'copilot',
      text: "Hello! I'm your PrivacyGuard Policy Assistant. I analyze your live firewall state, consent rules, and audit logs to answer questions about your data rights.",
      timestamp: 'Just now'
    }
  ]);

  if (!isCopilotOpen) return null;

  const quickPrompts = [
    'Why was my request blocked?',
    'What apps can access my location?',
    `Why is my privacy score ${scoreBreakdown.score}?`,
    'What data do I have stored?',
    'Which permission should I review?'
  ];

  const generateAnswer = (query: string): string => {
    const q = query.toLowerCase();

    // Question 1: "Why was my request blocked?"
    if (q.includes('blocked') || q.includes('why was my request')) {
      const lastBlock = auditLogs.find(a => a.decision === 'BLOCK');
      if (lastBlock) {
        return `Your most recent blocked request was from "${lastBlock.actor}" requesting [${lastBlock.data.join(', ')}] for purpose "${lastBlock.purpose}". Rationale: ${lastBlock.reason}`;
      }
      return "No incoming requests are currently blocked. To test request blocking, run Scenario 1 or 2 in the Request Simulator.";
    }

    // Question 2: "What apps can access my location?"
    if (q.includes('location') || q.includes('apps can access')) {
      const locationConsents = consents.filter(
        c => c.status === 'ACTIVE' && 
        (c.category.toLowerCase().includes('location') || c.dataRequired.some(d => d.toLowerCase().includes('location')))
      );
      if (locationConsents.length === 0) {
        return "Zero apps currently have active permission to access your location. All location egress is blocked.";
      }
      const services = locationConsents.map(c => `• ${c.service} (Purpose: ${c.purpose})`).join('\n');
      return `The following services have active consent for location:\n${services}\n\nNote: If any of these services attempt to use your location for unapproved purposes (like advertising), PrivacyGuard's firewall will immediately block them.`;
    }

    // Question 3: "Why is my privacy score XX?"
    if (q.includes('score') || q.includes('why is my privacy')) {
      const deductionSummary = scoreBreakdown.deductions.map(d => `• -${d.points} pts: ${d.label} (${d.description})`).join('\n');
      return `Your Privacy Score is ${scoreBreakdown.score}/100. It is calculated transparently:\nBase Score: 100\n${deductionSummary || '• Zero deductions! Optimal privacy posture.'}\n${isLockdownActive ? '• +12 pts: Privacy Lockdown Resilience Bonus\n' : ''}\nRecommendation: Review optional third-party marketing consents or erase expired telemetry to increase your score.`;
    }

    // Question 4: "What data do I have stored?"
    if (q.includes('stored') || q.includes('what data')) {
      const summary = dataAssets.map(a => `• ${a.category}: ${a.recordsCount.toLocaleString()} records held by ${a.service} (${a.retentionDays}d retention)`).join('\n');
      return `You currently have ${dataAssets.length} personal data categories in your inventory:\n${summary}\n\nYou can request permanent erasure of any category via the "Request Erasure" workflow.`;
    }

    // Question 5: "Which permission should I review?"
    if (q.includes('review') || q.includes('permission')) {
      const optionalActive = consents.filter(c => c.status === 'ACTIVE' && c.isOptional);
      if (optionalActive.length > 0) {
        const topReview = optionalActive[0];
        return `We recommend reviewing "${topReview.purpose}" for ${topReview.service}. It requests [${topReview.dataRequired.join(', ')}] which is classified as an optional non-essential permission. Withdrawing it will raise your privacy score!`;
      }
      return "All active consents are strictly essential. Your permissions are in an excellent state.";
    }

    // Default Fallback
    return `Based on your live state: You have ${consents.filter(c => c.status === 'ACTIVE').length} active consents across ${dataAssets.length} data categories, and your privacy score is ${scoreBreakdown.score}/100. Try asking one of the recommended prompts below.`;
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Instant realistic response grounded in state
    setTimeout(() => {
      const replyText = generateAnswer(text);
      const botMsg: CopilotMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        text: replyText,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, botMsg]);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-[580px] glass-panel rounded-2xl border border-indigo-500/40 bg-slate-900/95 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Privacy Copilot
                <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[9px] border border-indigo-500/30">
                  RULE-BASED
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Grounded in current live firewall telemetry
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCopilotOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
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
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">
            Suggested Inquiries:
          </span>
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
            placeholder="Ask anything about your privacy rules..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend(inputQuery)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
