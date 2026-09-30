import React from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { DataInventory } from './components/DataInventory';
import { ConsentCenter } from './components/ConsentCenter';
import { RequestSimulator } from './components/RequestSimulator';
import { DataFlowMap } from './components/DataFlowMap';
import { AuditLog } from './components/AuditLog';
import { LandingModal } from './components/LandingModal';
import { ErasureModal } from './components/ErasureModal';
import { PrivacyScoreModal } from './components/PrivacyScoreModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { PrivacyCopilot } from './components/PrivacyCopilot';
import { GuidedDemoModal } from './components/GuidedDemoModal';
import { VoiceAssistantBar } from './voice/ui/VoiceAssistantBar';
import { WatermarkLayer } from './components/WatermarkLayer';
import { usePrivacy } from './context/PrivacyContext';
import { Shield } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab, currentTheme } = usePrivacy();
  const isBurgundy = currentTheme === 'burgundy';

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <DataInventory />;
      case 'consent':
        return <ConsentCenter />;
      case 'simulator':
        return <RequestSimulator />;
      case 'flow':
        return <DataFlowMap />;
      case 'audit':
        return <AuditLog />;
      default:
        return <Dashboard />;
    }
  };

  const getContainerClass = () => {
    switch (currentTheme) {
      case 'cosmic':
      case 'burgundy':
        return 'bg-[#180308] text-[#fff8e7] selection:bg-red-600/40 selection:text-[#fff8e7]';
      case 'blue':
      default:
        return 'bg-[#070b14] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200';
    }
  };

  const getFooterClass = () => {
    switch (currentTheme) {
      case 'cosmic':
      case 'burgundy':
        return 'border-[#fff8e7]/15 bg-[#140207]/90 text-[#fff8e7]/75';
      case 'blue':
      default:
        return 'border-slate-800/80 bg-slate-950/70 text-slate-500';
    }
  };

  return (
    <div className={`relative min-h-screen ${getContainerClass()} flex flex-col font-sans transition-colors duration-300`}>
      {/* Background Sacred Geometry Mandala Watermark & Ambient Gold Glow */}
      <WatermarkLayer />

      {/* Top Navigation & Status Bar */}
      <Header />

      {/* Main Page Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-32">
        {renderActiveTab()}
      </main>

      {/* Global Interactive Modals & Drawers */}
      <LandingModal />
      <ErasureModal />
      <PrivacyScoreModal />
      <AssetDetailModal />
      <PrivacyCopilot />
      <GuidedDemoModal />
      <VoiceAssistantBar />

      {/* Footer */}
      <footer className={`relative z-10 w-full border-t ${getFooterClass()} backdrop-blur-md py-6 text-xs transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${currentTheme === 'blue' ? 'text-amber-400' : 'text-red-400'}`} />
            <span className={`font-semibold ${currentTheme === 'blue' ? 'text-slate-300' : 'text-[#fff8e7]'}`}>PRIVACYGUARD</span>
            <span>—</span>
            <span className={`${currentTheme === 'blue' ? 'text-slate-400' : 'text-[#fff8e7]/85'} italic`}>"Privacy is not a checkbox. It is a continuous control system."</span>
          </div>
          <div className={`flex items-center gap-4 font-mono text-[11px] ${currentTheme === 'blue' ? 'text-slate-400' : 'text-[#fff8e7]/75'}`}>
            <span>Cybersecurity &amp; Privacy-Preserving Technology</span>
            <span>•</span>
            <span className={`${currentTheme === 'blue' ? 'text-amber-400' : 'text-[#fff8e7]'} font-semibold`}>Firewall MVP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
