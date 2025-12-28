import React from 'react';
import { Bell, User, Shield, Thermometer, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Settings</h2>
           <p className="text-slate-500">Manage your profile and system configurations.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 border-b border-slate-100">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <User size={20} className="text-indigo-600"/> Profile Information
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
               <input type="text" defaultValue="John Doe" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
               <input type="email" defaultValue="john.doe@health.tn.gov.in" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
               <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                 <option>Public Health</option>
                 <option>Disaster Management</option>
                 <option>Municipal Administration</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
               <input type="text" defaultValue="Health Officer" disabled className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg" />
             </div>
           </div>
        </div>

        {/* Notifications */}
        <div className="p-6 border-b border-slate-100">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <Bell size={20} className="text-indigo-600"/> Notification Preferences
           </h3>
           <div className="space-y-4">
             <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
               <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
               <div>
                 <p className="font-medium text-slate-800">Email Alerts</p>
                 <p className="text-sm text-slate-500">Receive daily summary reports and red alert notifications.</p>
               </div>
             </label>
             <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
               <input type="checkbox" defaultChecked className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
               <div>
                 <p className="font-medium text-slate-800">SMS Alerts</p>
                 <p className="text-sm text-slate-500">Get instant SMS for Extreme Risk protocol activation.</p>
               </div>
             </label>
           </div>
        </div>

        {/* Threshold Configuration */}
        <div className="p-6">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <Thermometer size={20} className="text-indigo-600"/> Threshold Configuration (Global)
           </h3>
           <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-sm text-yellow-800 flex items-start gap-3">
             <Shield className="shrink-0 mt-0.5" size={16}/>
             <p>Changing these thresholds will affect the risk calculation algorithm for all districts. Only proceed if authorized.</p>
           </div>
           
           <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-slate-700">Extreme Risk Temperature Threshold</label>
                  <span className="font-bold text-indigo-600">40°C</span>
                </div>
                <input type="range" min="35" max="45" defaultValue="40" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>35°C</span>
                  <span>45°C</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="font-medium text-slate-700">High Humidity Penalty Threshold</label>
                  <span className="font-bold text-indigo-600">70%</span>
                </div>
                <input type="range" min="50" max="90" defaultValue="70" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                 <div className="flex justify-between text-xs text-slate-400 mt-1">
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