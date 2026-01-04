import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, FileText, Megaphone, Printer, Share2 } from 'lucide-react';
import { HEAT_ACTION_PLANS } from '../constants';
import { RiskLevel } from '../types';

interface ActionPlansProps {
  isDarkMode?: boolean;
}

export const ActionPlans: React.FC<ActionPlansProps> = ({ isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<RiskLevel>(RiskLevel.EXTREME);
  const [broadcastStatus, setBroadcastStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleBroadcast = () => {
    setBroadcastStatus('sending');
    setTimeout(() => {
      setBroadcastStatus('sent');
      setTimeout(() => setBroadcastStatus('idle'), 3000);
    }, 1500);
  };

  const tabs = [
    { id: RiskLevel.EXTREME, color: 'red', label: 'Extreme' },
    { id: RiskLevel.HIGH, color: 'orange', label: 'High' },
    { id: RiskLevel.MODERATE, color: 'yellow', label: 'Moderate' },
    { id: RiskLevel.LOW, color: 'emerald', label: 'Low' },
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center shrink-0">
        <div>
           <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Action Protocols</h2>
           <p className="text-zinc-500 text-sm">Standard Operating Procedures (SOPs)</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-bold">
                <Printer size={16} /> Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-bold shadow-lg shadow-red-500/20">
                <Share2 size={16} /> Share
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            let activeClass = '';
            if (isActive) {
                if (tab.id === RiskLevel.EXTREME) activeClass = 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/30';
                else if (tab.id === RiskLevel.HIGH) activeClass = 'bg-orange-500 text-white border-orange-500';
                else if (tab.id === RiskLevel.MODERATE) activeClass = 'bg-yellow-500 text-white border-yellow-500';
                else activeClass = 'bg-emerald-600 text-white border-emerald-600';
            } else {
                activeClass = 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700';
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group ${activeClass}`}
              >
                <div className="font-black text-lg mb-0.5 tracking-tight">{tab.label}</div>
                <div className={`text-xs font-medium uppercase tracking-widest ${isActive ? 'opacity-80' : 'opacity-60'}`}>Level {tab.id === RiskLevel.EXTREME ? '4' : tab.id === RiskLevel.HIGH ? '3' : tab.id === RiskLevel.MODERATE ? '2' : '1'}</div>
                {isActive && (
                    <div className="absolute top-4 right-4 animate-in zoom-in">
                        <CheckCircle size={20} />
                    </div>
                )}
              </button>
            );
        })}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-zinc-400" />
                {activeTab} Risk Plan
            </h3>
            { (activeTab === RiskLevel.EXTREME || activeTab === RiskLevel.HIGH) && (
                <button 
                    onClick={handleBroadcast}
                    disabled={broadcastStatus !== 'idle'}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md ${
                        broadcastStatus === 'sent' ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30'
                    }`}
                >
                    {broadcastStatus === 'idle' && <><Megaphone size={16} /> Broadcast System Alert</>}
                    {broadcastStatus === 'sending' && "Transmitting..."}
                    {broadcastStatus === 'sent' && <><CheckCircle size={16} /> Sent Successfully</>}
                </button>
            )}
        </div>
        
        <div className="overflow-y-auto p-0">
            {HEAT_ACTION_PLANS[activeTab].map((action, index) => (
                <div key={index} className="flex gap-5 p-6 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group items-start">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm mt-0.5
                        ${activeTab === RiskLevel.EXTREME ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' : 
                          activeTab === RiskLevel.HIGH ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' :
                          activeTab === RiskLevel.MODERATE ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' :
                          'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'
                        }
                    `}>
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <p className="text-zinc-800 dark:text-zinc-200 font-medium text-lg mb-1 leading-snug">{action}</p>
                        <p className="text-zinc-500 text-sm">
                            Assigned to: <span className="font-semibold text-zinc-600 dark:text-zinc-400">District Collectors, Health Officers</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};