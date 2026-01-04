import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, FileText, Settings, Bell, Menu, Bot, Moon, Sun, Activity, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { HeatwaveAssistant } from './components/HeatwaveAssistant';
import { VulnerabilityAnalysis } from './components/VulnerabilityAnalysis';
import { ActionPlans } from './components/ActionPlans';
import { Settings as SettingsPage } from './components/Settings';
import { Login } from './components/Login';

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-brand-red text-white shadow-md shadow-red-500/20' 
        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white'
    }`}
  >
    <Icon size={20} strokeWidth={2.5} />
    {label}
  </button>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAssistant, setShowAssistant] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard'); // Reset tab
  };

  if (!isLoggedIn) {
    return (
      <Login 
        onLogin={() => setIsLoggedIn(true)} 
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  const renderContent = () => {
    const props = { isDarkMode };
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenAssistant={() => setShowAssistant(true)} isDarkMode={isDarkMode} />;
      case 'vulnerability':
        return <VulnerabilityAnalysis isDarkMode={isDarkMode} />;
      case 'plans':
        return <ActionPlans isDarkMode={isDarkMode} />;
      case 'settings':
        return <SettingsPage isDarkMode={isDarkMode} />;
      default:
        return <Dashboard onOpenAssistant={() => setShowAssistant(true)} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col md:flex-row bg-zinc-50 dark:bg-black transition-colors duration-300 text-zinc-900 dark:text-zinc-100 font-sans`}>
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-red rounded flex items-center justify-center text-white font-black">H</div>
          <span className="font-bold text-lg tracking-tight">HeatGuard</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="text-zinc-600 dark:text-zinc-300" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-40 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/30">
              <Activity size={24} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block leading-none">HeatGuard</span>
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">AI Monitor</span>
            </div>
          </div>
          
          <nav className="space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'dashboard'} 
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={Users} 
              label="Vulnerability" 
              active={activeTab === 'vulnerability'} 
              onClick={() => { setActiveTab('vulnerability'); setIsMobileMenuOpen(false); }} 
            />
            <SidebarItem 
              icon={FileText} 
              label="Action Protocols" 
              active={activeTab === 'plans'} 
              onClick={() => { setActiveTab('plans'); setIsMobileMenuOpen(false); }} 
            />
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
              <SidebarItem 
                icon={Settings} 
                label="Configuration" 
                active={activeTab === 'settings'} 
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} 
              />
            </div>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
           <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer group relative">
             <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold border-2 border-white dark:border-zinc-600">JD</div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold truncate">John Doe</p>
               <p className="text-xs text-zinc-500 truncate">Senior Health Officer</p>
             </div>
             
             {/* Logout Button Overlay on Hover */}
             <div className="absolute inset-0 bg-red-600/90 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleLogout}>
                <span className="text-white text-xs font-bold flex items-center gap-2"><LogOut size={14}/> Sign Out</span>
             </div>
           </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area - Full viewport height, no global scroll */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md flex justify-between items-center px-6 shrink-0 z-20">
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold tracking-tight">
              {activeTab === 'dashboard' && 'Risk Overview'}
              {activeTab === 'vulnerability' && 'Demographic Analysis'}
              {activeTab === 'plans' && 'Standard Operating Procedures'}
              {activeTab === 'settings' && 'System Settings'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
             >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

             <button className="p-2 text-zinc-400 hover:text-red-500 transition-colors relative">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-black"></span>
             </button>
             <button 
               onClick={() => setShowAssistant(true)}
               className="bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
              >
                <Bot size={18} />
                <span className="hidden sm:inline">AI Assistant</span>
             </button>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-zinc-50 dark:bg-black">
          {renderContent()}
        </div>

      </main>

      {/* Assistant Modal/Sidebar */}
      {showAssistant && <HeatwaveAssistant onClose={() => setShowAssistant(false)} isDarkMode={isDarkMode} />}
      
    </div>
  );
};

export default App;