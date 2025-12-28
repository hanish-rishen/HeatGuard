import React, { useState } from 'react';
import { LayoutDashboard, Users, FileText, Settings, Bell, Menu, Bot } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { HeatwaveAssistant } from './components/HeatwaveAssistant';
import { VulnerabilityAnalysis } from './components/VulnerabilityAnalysis';
import { ActionPlans } from './components/ActionPlans';
import { Settings as SettingsPage } from './components/Settings';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAssistant, setShowAssistant] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenAssistant={() => setShowAssistant(true)} />;
      case 'vulnerability':
        return <VulnerabilityAnalysis />;
      case 'plans':
        return <ActionPlans />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onOpenAssistant={() => setShowAssistant(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
          <span className="font-bold text-slate-800">HeatGuard</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="text-slate-600" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">H</div>
            <span className="text-xl font-bold text-slate-800">HeatGuard</span>
          </div>
          
          <nav className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={Users} 
              label="Vulnerability Map" 
              active={activeTab === 'vulnerability'} 
              onClick={() => { setActiveTab('vulnerability'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={FileText} 
              label="Action Plans" 
              active={activeTab === 'plans'} 
              onClick={() => { setActiveTab('plans'); setIsMobileMenuOpen(false); }} 
            />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <SidebarItem 
                icon={Settings} 
                label="Settings" 
                active={activeTab === 'settings'} 
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
              />
            </div>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">JD</div>
                 <div>
                   <p className="text-sm font-bold text-slate-800">John Doe</p>
                   <p className="text-xs text-slate-500">Health Officer</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'vulnerability' && 'Vulnerability Analysis'}
              {activeTab === 'plans' && 'Action Plans'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-slate-500">
              {activeTab === 'dashboard' && 'Real-time heat risk monitoring & prediction.'}
              {activeTab === 'vulnerability' && 'Assess demographic risks across districts.'}
              {activeTab === 'plans' && 'Manage protocols and emergency broadcasts.'}
              {activeTab === 'settings' && 'Configure preferences and thresholds.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
             <button 
               onClick={() => setShowAssistant(true)}
               className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                <Bot size={18} />
                Ask AI Assistant
             </button>
          </div>
        </header>

        {renderContent()}

      </main>

      {/* Assistant Modal/Sidebar */}
      {showAssistant && <HeatwaveAssistant onClose={() => setShowAssistant(false)} />}
      
    </div>
  );
};

export default App;