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
import { usePrivacy } from './context/PrivacyContext';
import { Shield } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { activeTab } = usePrivacy();

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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation & Status Bar */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderActiveTab()}
      </main>

      {/* Global Interactive Modals & Drawers */}
      <LandingModal />
      <ErasureModal />
      <PrivacyScoreModal />
      <AssetDetailModal />
      <PrivacyCopilot />
      <GuidedDemoModal />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span className="font-semibold text-slate-400">PRIVACYGUARD</span>
            <span>—</span>
            <span className="text-slate-400 italic">"Privacy is not a checkbox. It is a continuous control system."</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>Cybersecurity &amp; Privacy-Preserving Technology</span>
            <span>•</span>
            <span className="text-cyan-400">Hackathon MVP</span>
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
