import React, { useState } from 'react';
import { Activity, Lock, Mail, ArrowRight, Sun, Moon } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock network delay to simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-black font-sans transition-colors duration-300">
      
      {/* Theme Toggle (Absolute) */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Left Panel - Visual Branding */}
      <div className="hidden lg:flex w-1/2 bg-zinc-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-black/0 z-0"></div>
        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl shadow-red-900/50 mb-10 animate-in zoom-in duration-700">
            <Activity size={40} />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Predict Heat Risks.<br/>Protect Lives.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed font-medium">
            HeatGuard AI provides real-time predictive analytics and decision support protocols for district health officials to mitigate heatwave impacts.
          </p>
          
          <div className="mt-12 flex items-center gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                   {String.fromCharCode(64+i)}
                 </div>
               ))}
             </div>
             <div>
                <p className="text-sm font-bold text-white">Trusted by SDMA</p>
                <p className="text-xs text-zinc-500">State Disaster Management Authority</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 bg-white dark:bg-black relative">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Please sign in to access the command dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-red-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@health.tn.gov.in"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-red-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-zinc-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder:text-zinc-400"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 text-red-600 focus:ring-red-500 bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700" />
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-red-600 hover:text-red-700">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to Dashboard <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="pt-6 text-center text-sm text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
            Don't have an account? <span className="font-bold text-zinc-900 dark:text-white cursor-pointer hover:underline">Request Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};