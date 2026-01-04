import React from 'react';
import { Bell, User, Shield, Thermometer, Save } from 'lucide-react';

interface SettingsProps {
  isDarkMode?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ isDarkMode }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Settings</h2>
           <p className="text-zinc-500 text-sm">System configuration.</p>
        </div>
        <button className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-sm">
            <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
             <User size={20} className="text-zinc-400"/> Profile
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
               <input type="text" defaultValue="John Doe" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white font-medium" />
             </div>
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
               <input type="email" defaultValue="john.doe@health.tn.gov.in" className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-white font-medium" />
             </div>
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Department</label>
               <select className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-zinc-900 dark:text-white font-medium">
                 <option>Public Health</option>
                 <option>Disaster Management</option>
                 <option>Municipal Administration</option>
               </select>
             </div>
             <div>
               <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Role</label>
               <input type="text" defaultValue="Health Officer" disabled className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-400 rounded-xl font-medium cursor-not-allowed" />
             </div>
           </div>
        </div>

        {/* Notifications */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
             <Bell size={20} className="text-zinc-400"/> Notifications
           </h3>
           <div className="space-y-4">
             <label className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
               <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-zinc-300 dark:border-zinc-600" />
               <div>
                 <p className="font-bold text-zinc-900 dark:text-white">Email Alerts</p>
                 <p className="text-sm text-zinc-500">Receive daily summary reports and red alert notifications.</p>
               </div>
             </label>
             <label className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors">
               <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-zinc-300 dark:border-zinc-600" />
               <div>
                 <p className="font-bold text-zinc-900 dark:text-white">SMS Alerts</p>
                 <p className="text-sm text-zinc-500">Get instant SMS for Extreme Risk protocol activation.</p>
               </div>
             </label>
           </div>
        </div>

        {/* Threshold Configuration */}
        <div className="p-6">
           <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
             <Thermometer size={20} className="text-zinc-400"/> Thresholds
           </h3>
           <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-4 rounded-xl mb-8 text-sm text-yellow-800 dark:text-yellow-400 flex items-start gap-3 font-medium">
             <Shield className="shrink-0 mt-0.5" size={16}/>
             <p>Changing these thresholds will affect the risk calculation algorithm for all districts. Only proceed if authorized.</p>
           </div>
           
           <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">Extreme Risk Temperature Threshold</label>
                  <span className="font-black text-red-500 text-lg">40°C</span>
                </div>
                <input type="range" min="35" max="45" defaultValue="40" className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
                <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono">
                  <span>35°C</span>
                  <span>45°C</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-3">
                  <label className="font-bold text-zinc-700 dark:text-zinc-300">High Humidity Penalty Threshold</label>
                  <span className="font-black text-yellow-500 text-lg">70%</span>
                </div>
                <input type="range" min="50" max="90" defaultValue="70" className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                 <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono">
                  <span>50%</span>
                  <span>90%</span>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};