import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, FileText, Megaphone, Printer, Share2 } from 'lucide-react';
import { HEAT_ACTION_PLANS } from '../constants';
import { RiskLevel } from '../types';

export const ActionPlans: React.FC = () => {
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
    { id: RiskLevel.EXTREME, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', active: 'bg-red-100 text-red-800 ring-2 ring-red-500' },
    { id: RiskLevel.HIGH, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', active: 'bg-orange-100 text-orange-800 ring-2 ring-orange-500' },
    { id: RiskLevel.MODERATE, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', active: 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-500' },
    { id: RiskLevel.LOW, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', active: 'bg-green-100 text-green-800 ring-2 ring-green-500' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Standard Operating Procedures</h2>
           <p className="text-slate-500">Heat Action Plan (HAP) protocols by risk level.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                <Printer size={16} /> Print Protocols
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
                <Share2 size={16} /> Share with Depts
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden ${
              activeTab === tab.id ? tab.active + ' border-transparent' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="font-bold mb-1">{tab.id} Risk</div>
            <div className="text-xs opacity-80">Protocol Level {tab.id === RiskLevel.EXTREME ? '4' : tab.id === RiskLevel.HIGH ? '3' : tab.id === RiskLevel.MODERATE ? '2' : '1'}</div>
            {activeTab === tab.id && (
                <div className="absolute top-2 right-2">
                    <CheckCircle size={16} className="opacity-50" />
                </div>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-slate-500" />
                {activeTab} Risk Action Plan
            </h3>
            { (activeTab === RiskLevel.EXTREME || activeTab === RiskLevel.HIGH) && (
                <button 
                    onClick={handleBroadcast}
                    disabled={broadcastStatus !== 'idle'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-md ${
                        broadcastStatus === 'sent' ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                    {broadcastStatus === 'idle' && <><Megaphone size={16} /> Broadcast Alert</>}
                    {broadcastStatus === 'sending' && "Broadcasting..."}
                    {broadcastStatus === 'sent' && <><CheckCircle size={16} /> Alert Sent</>}
                </button>
            )}
        </div>
        
        <div className="p-0">
            {HEAT_ACTION_PLANS[activeTab].map((action, index) => (
                <div key={index} className="flex gap-4 p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm
                        ${activeTab === RiskLevel.EXTREME ? 'bg-red-100 text-red-600' : 
                          activeTab === RiskLevel.HIGH ? 'bg-orange-100 text-orange-600' :
                          activeTab === RiskLevel.MODERATE ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }
                    `}>
                        {index + 1}
                    </div>
                    <div>
                        <p className="text-slate-800 font-medium text-lg mb-1">{action}</p>
                        <p className="text-slate-500 text-sm">
                            Assigned to: <span className="font-semibold text-slate-600">District Collectors, Health Officers</span>
                        </p>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity self-center">
                         <button className="text-xs font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded hover:bg-indigo-100">
                            View Details
                         </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
             <p className="text-sm text-slate-500 mb-2">Need to update these protocols?</p>
             <button className="text-indigo-600 font-medium text-sm hover:underline">Request Protocol Revision (Admin only)</button>
        </div>
      </div>
    </div>
  );
};