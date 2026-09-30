/**
 * PRIVACYGUARD VOICE ASSISTANT - UI COMPONENT
 * Floating interactive bar adhering strictly to Section 10 UI/UX rules.
 * 
 * - State indicator: maps canonical states to labels. Never uses the word NAVIGATING.
 * - Shows spoken output as text in transcript (accessibility).
 * - Ambiguity and refusal messages show tappable & keyboard-operable chips that call navigate().
 * - Respects spoken output setting (speech synthesis on/off).
 * - Connected live to PrivacyContext router.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Radio,
  Sliders,
  Database,
  Share2,
  FileText,
  ShieldAlert,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import {
  VoiceAssistantStateMachine,
  AssistantContext,
  RouterInterface,
  PageId,
  NavParams,
  NavFilters,
  navigate,
  voiceoverBus,
  CANONICAL_PAGES
} from '../index';

export const VoiceAssistantBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    consents,
    dataAssets,
    services,
    isLandingModalOpen,
    currentTheme
  } = usePrivacy();

  const isCosmic = currentTheme === 'cosmic';
  const isBurgundy = currentTheme === 'burgundy';
  const isDarkRed = isCosmic || isBurgundy;
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputUtterance, setInputUtterance] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [transcriptHistory, setTranscriptHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; tid?: string; chips?: Array<{ label: string; page: PageId }> }>>([
    { role: 'assistant', text: 'PrivacyGuard Voice Assistant ready. Say "Open Data Flow" or "सहमति केंद्र खोलो".' }
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<string | null>(null);

  // Map activeTab from PrivacyContext into typed canonical PageId
  const canonicalPage: PageId = useMemo(() => {
    switch (activeTab) {
      case 'inventory':
        return 'my_data';
      case 'consent':
        return 'consent_center';
      case 'simulator':
        return 'request_simulator';
      case 'flow':
        return 'data_flow';
      case 'audit':
        return 'audit_log';
      default:
        return 'dashboard';
    }
  }, [activeTab]);

  // Create live RouterInterface connected to React state
  const routerRef = useRef<RouterInterface>({
    currentPage: canonicalPage,
    navigate: (page: PageId, params?: NavParams, filters?: NavFilters) => {
      // Map canonical PageId to React app tab
      let targetTab = 'dashboard';
      if (page === 'my_data') targetTab = 'inventory';
      else if (page === 'consent_center') targetTab = 'consent';
      else if (page === 'request_simulator') targetTab = 'simulator';
      else if (page === 'data_flow') targetTab = 'flow';
      else if (page === 'audit_log') targetTab = 'audit';
      else targetTab = 'dashboard';

      setActiveTab(targetTab);
      routerRef.current.currentPage = page;
      routerRef.current.currentParams = params;
      routerRef.current.currentFilters = filters;
      return true;
    }
  });

  // Keep router currentPage synchronized
  useEffect(() => {
    routerRef.current.currentPage = canonicalPage;
  }, [canonicalPage]);

  // Initialize State Machine with current application state
  const assistantContext = useMemo<AssistantContext>(() => ({
    router: routerRef.current,
    language,
    spokenOutputEnabled: speechEnabled,
    historyStack: [{ page: canonicalPage, timestamp: Date.now() }],
    selectedObject: null,
    activeFilters: null,
    lastNavigatedAt: null,
    lastRecommendation: null,
    lastAnswer: null,
    pendingAction: null,
    clarificationAttempts: 0,
    uiEventLog: [],
    consents: consents as any,
    dataAssets: dataAssets as any,
    services: services as any,
    isVoiceCaptureEnabled: true,
  }), [canonicalPage, language, speechEnabled, consents, dataAssets, services]);

  const stateMachine = useMemo(() => new VoiceAssistantStateMachine(assistantContext), [assistantContext]);

  // Speech Synthesis helper
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Fallback gracefully
    }
  };

  // State label mapper (Strictly canonical states, NEVER "NAVIGATING")
  const getStateLabel = (state: string) => {
    switch (state) {
      case 'LISTENING':
        return 'Listening...';
      case 'PROCESSING_SPEECH':
        return 'Transcribing...';
      case 'RESOLVING_CONTEXT':
        return 'Understanding...';
      case 'AWAITING_CONFIRMATION':
        return 'Confirm Pending Action';
      case 'CLARIFICATION_REQUIRED':
        return 'Clarification Required';
      case 'EXECUTING_ACTION':
        return 'Executing Action...';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Notice';
      case 'REFUSED':
        return 'Unsupported Command';
      default:
        return 'Ask PrivacyGuard';
    }
  };

  const handleExecuteVoiceCommand = (command: string) => {
    if (!command.trim()) return;

    // Add user utterance to transcript
    setTranscriptHistory(prev => [...prev.slice(-8), { role: 'user', text: command }]);

    // Execute through formal state machine
    try {
      const res = stateMachine.handleUtterance(command);

      // Transient Toast if navigation succeeded
      if (res.spokenText) {
        setToastMessage(res.spokenText);
        setTimeout(() => setToastMessage(null), 3500);
        speakText(res.spokenText);
      }

      setTranscriptHistory(prev => [
        ...prev.slice(-8),
        {
          role: 'assistant',
          text: res.spokenText || res.transcriptText || 'Action processed.',
          tid: res.transitionId,
          chips: res.optionsChips,
        }
      ]);
    } catch (err: any) {
      setTranscriptHistory(prev => [
        ...prev.slice(-8),
        { role: 'assistant', text: `Notice: ${err.message}` }
      ]);
    }

    setInputUtterance('');
  };

  // Web Speech API Voice Recognition
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        handleExecuteVoiceCommand(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch {
        setIsListening(false);
      }
    } else {
      // Fallback simulation for unsupported browsers
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        handleExecuteVoiceCommand('Open Data Flow');
      }, 1200);
    }
  };

  const currentAssistantState = stateMachine.getState();

  // Guard: Do not display Voice Assistant while the initial Landing Modal is active to avoid visual clash
  if (isLandingModalOpen) {
    return null;
  }

  // Minimized Pill view
  if (isMinimized) {
    return (
      <aside aria-label="Voice Assistant Minimized Pill" className="fixed bottom-4 right-4 sm:right-8 z-30 animate-in fade-in duration-200">
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl transition-all cursor-pointer backdrop-blur-md group border ${
            isDarkRed
              ? 'bg-[#1a0309]/95 hover:bg-[#27050e]/95 border-red-500/50 text-[#fff8e7] shadow-[0_4px_24px_rgba(220,38,38,0.25)]'
              : 'bg-slate-900/95 hover:bg-slate-800/95 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white'
          }`}
          title="Open Voice Assistant Bar"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <Mic className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isDarkRed ? 'text-red-400' : 'text-cyan-400'
          }`} />
          <span className="text-xs font-semibold tracking-wide">Voice Assistant</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
            isDarkRed ? 'bg-red-950 text-[#fff8e7]/85 border border-red-500/30' : 'text-slate-400 bg-slate-800'
          }`}>
            {currentAssistantState}
          </span>
          <ChevronUp className={`w-3.5 h-3.5 transition-colors ${
            isDarkRed ? 'text-[#fff8e7]/60 group-hover:text-[#fff8e7]' : 'text-slate-400 group-hover:text-cyan-300'
          }`} />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Voice Assistant Control Bar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`mb-2 mx-auto w-fit px-4 py-1.5 rounded-full text-xs font-mono shadow-lg flex items-center gap-2 animate-bounce border ${
          isDarkRed
            ? 'bg-red-950/90 border-red-500/50 text-[#fff8e7]'
            : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${isDarkRed ? 'text-red-400' : 'text-cyan-400'}`} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Floating Voice Bar */}
      <div className={`rounded-2xl border backdrop-blur-xl shadow-2xl p-3 sm:p-4 transition-all ${
        isDarkRed
          ? 'border-red-500/35 bg-[#1a0309]/95 text-[#fff8e7] shadow-[0_8px_32px_rgba(220,38,38,0.22)]'
          : 'border-slate-700/80 bg-slate-900/95 text-slate-100 shadow-2xl'
      }`}>
        {/* Top Header: State Indicator & Controls */}
        <div className={`flex items-center justify-between gap-2 pb-2 border-b text-xs ${
          isDarkRed ? 'border-[#fff8e7]/15' : 'border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              isListening ? 'bg-red-500 animate-ping' :
              currentAssistantState === 'RESOLVING_CONTEXT' ? 'bg-amber-400 animate-pulse' :
              currentAssistantState === 'CLARIFICATION_REQUIRED' ? 'bg-orange-400' :
              'bg-emerald-500'
            }`} />
            <span className={`font-semibold ${
              isDarkRed ? 'text-[#fff8e7]' : 'text-slate-300'
            }`}>
              {getStateLabel(currentAssistantState)}
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              isDarkRed ? 'bg-red-950 text-[#fff8e7]/85 border border-red-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {currentAssistantState}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded border transition-colors cursor-pointer ${
                isDarkRed
                  ? 'border-[#fff8e7]/20 hover:border-red-500/50 bg-red-950/60 text-[#fff8e7]'
                  : 'border-slate-700 hover:border-cyan-500/50 bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
              title="Toggle Voice Assistant Language (English / Hindi)"
            >
              {language === 'en' ? 'EN 🇬🇧' : 'HI 🇮🇳'}
            </button>

            {/* Audio Speech Output Toggle */}
            <button
              onClick={() => setSpeechEnabled(s => !s)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDarkRed ? 'text-red-400 hover:text-[#fff8e7]' : 'text-slate-400 hover:text-cyan-400'
              }`}
              title={speechEnabled ? 'Mute Speech Synthesis' : 'Unmute Speech Synthesis'}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className={`w-4 h-4 ${isDarkRed ? 'text-[#fff8e7]/40' : 'text-slate-500'}`} />}
            </button>

            {/* Minimize Bar */}
            <button
              onClick={() => setIsMinimized(true)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDarkRed ? 'text-[#fff8e7]/60 hover:text-[#fff8e7]' : 'text-slate-400 hover:text-white'
              }`}
              title="Minimize Voice Assistant"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent Transcript Line */}
        <div className="py-2 text-xs flex flex-col gap-1 max-h-24 overflow-y-auto font-sans">
          {transcriptHistory.slice(-2).map((item, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${
              item.role === 'user' 
                ? (isDarkRed ? 'text-[#fff8e7]/70' : 'text-slate-400') 
                : (isDarkRed ? 'text-[#fff8e7] font-medium' : 'text-cyan-300')
            }`}>
              <span className="font-bold shrink-0">{item.role === 'user' ? 'You:' : 'Assistant:'}</span>
              <span>{item.text}</span>
              {item.tid && (
                <span className={`ml-auto font-mono text-[9px] px-1 py-0.2 rounded border ${
                  isDarkRed ? 'bg-red-950 text-[#fff8e7] border-red-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {item.tid}
                </span>
              )}
            </div>
          ))}

          {/* Option Chips for Ambiguous / Clarification */}
          {transcriptHistory[transcriptHistory.length - 1]?.chips && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {transcriptHistory[transcriptHistory.length - 1].chips!.map((chip, cIdx) => (
                <button
                  key={cIdx}
                  onClick={() => {
                    const navRes = navigate({ page: chip.page }, assistantContext);
                    setToastMessage(navRes.spokenText || null);
                    speakText(navRes.spokenText || '');
                    setTranscriptHistory(prev => [
                      ...prev,
                      { role: 'assistant', text: navRes.spokenText || 'Navigated.', tid: navRes.transitionId }
                    ]);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                    isDarkRed
                      ? 'bg-red-950/80 hover:bg-red-900 border-red-500/40 text-[#fff8e7]'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Bar & Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteVoiceCommand(inputUtterance);
          }}
          className={`flex items-center gap-2 pt-2 border-t ${
            isDarkRed ? 'border-[#fff8e7]/15' : 'border-slate-800/80'
          }`}
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
                : isDarkRed
                  ? 'bg-red-950/80 hover:bg-red-900 border-red-500/40 text-[#fff8e7]'
                  : 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40 text-cyan-300 hover:text-white'
            }`}
            title={isListening ? 'Stop listening' : 'Start speaking command'}
          >
            {isListening ? <MicOff className="w-4 h-4 text-rose-500" /> : <Mic className={`w-4 h-4 ${isDarkRed ? 'text-red-400' : 'text-cyan-400'}`} />}
          </button>

          {/* Text Input Fallback */}
          <input
            type="text"
            value={inputUtterance}
            onChange={(e) => setInputUtterance(e.target.value)}
            placeholder={language === 'hi' ? 'बोलें या टाइप करें: "सहमति केंद्र खोलो"...' : 'Speak or type: "Open Data Flow", "Go to Audit Log"...'}
            className={`flex-1 border rounded-xl px-3 py-1.5 text-xs outline-none transition-colors ${
              isDarkRed
                ? 'bg-red-950/40 border-red-500/30 focus:border-red-400 text-[#fff8e7] placeholder-[#fff8e7]/40'
                : 'bg-slate-950/60 border border-slate-700/80 focus:border-cyan-500 text-white placeholder-slate-500'
            }`}
          />

          <button
            type="submit"
            disabled={!inputUtterance.trim()}
            className={`p-2 rounded-xl disabled:opacity-40 transition-colors cursor-pointer ${
              isDarkRed
                ? 'bg-red-600 hover:bg-red-500 text-[#fff8e7]'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
            title="Send command"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className={`text-[10px] uppercase tracking-wider shrink-0 ${isDarkRed ? 'text-[#fff8e7]/60' : 'text-slate-500'}`}>Try:</span>
          <button
            onClick={() => handleExecuteVoiceCommand('Open Data Flow')}
            className={`px-2 py-0.5 rounded transition-colors shrink-0 cursor-pointer ${
              isDarkRed ? 'bg-red-950/60 hover:bg-red-900/80 text-[#fff8e7]/85 hover:text-[#fff8e7] border border-red-500/30' : 'bg-slate-800/70 hover:bg-slate-700 hover:text-cyan-300'
            }`}
          >
            "Open Data Flow"
          </button>
          <button
            onClick={() => handleExecuteVoiceCommand('Show high-risk permissions')}
            className={`px-2 py-0.5 rounded transition-colors shrink-0 cursor-pointer ${
              isDarkRed ? 'bg-red-950/60 hover:bg-red-900/80 text-[#fff8e7]/85 hover:text-[#fff8e7] border border-red-500/30' : 'bg-slate-800/70 hover:bg-slate-700 hover:text-cyan-300'
            }`}
          >
            "Show high-risk permissions"
          </button>
          <button
            onClick={() => handleExecuteVoiceCommand('Open the analytics consent')}
            className={`px-2 py-0.5 rounded transition-colors shrink-0 cursor-pointer ${
              isDarkRed ? 'bg-red-950/60 hover:bg-red-900/80 text-[#fff8e7]/85 hover:text-[#fff8e7] border border-red-500/30' : 'bg-slate-800/70 hover:bg-slate-700 hover:text-cyan-300'
            }`}
          >
            "Open the analytics consent"
          </button>
          <button
            onClick={() => handleExecuteVoiceCommand('Go back')}
            className={`px-2 py-0.5 rounded transition-colors shrink-0 cursor-pointer ${
              isDarkRed ? 'bg-red-950/60 hover:bg-red-900/80 text-[#fff8e7]/85 hover:text-[#fff8e7] border border-red-500/30' : 'bg-slate-800/70 hover:bg-slate-700 hover:text-cyan-300'
            }`}
          >
            "Go back"
          </button>
          <button
            onClick={() => {
              setLanguage('hi');
              handleExecuteVoiceCommand('सहमति केंद्र खोलो');
            }}
            className={`px-2 py-0.5 rounded transition-colors shrink-0 cursor-pointer ${
              isDarkRed ? 'bg-red-950/60 hover:bg-red-900/80 text-[#fff8e7]/85 hover:text-[#fff8e7] border border-red-500/30' : 'bg-slate-800/70 hover:bg-slate-700 hover:text-cyan-300'
            }`}
          >
            "सहमति केंद्र खोलो"
          </button>
        </div>
      </div>
    </aside>
  );
};
