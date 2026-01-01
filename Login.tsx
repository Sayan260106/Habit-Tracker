
import React, { useState, useEffect } from 'react';
import { BarChart3, Lock, Mail, ArrowRight, ShieldCheck, Zap, User, UserPlus, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onAuth: (identity: string, name?: string) => void;
  darkMode: boolean;
}

const Auth: React.FC<AuthProps> = ({ onAuth, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load remembered details on mount
  useEffect(() => {
    const saved = localStorage.getItem('ascend_remembered_identity');
    if (saved) {
      const { identity: savedId, password: savedPassword } = JSON.parse(saved);
      setIdentity(savedId);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Protocols do not match: Passwords must be identical.");
      return;
    }

    setIsLoading(true);

    // Protocol for remembering details
    if (rememberMe && isLogin) {
      localStorage.setItem('ascend_remembered_identity', JSON.stringify({ identity, password }));
    } else if (isLogin) {
      localStorage.removeItem('ascend_remembered_identity');
    }

    // Simulate authentication/registration delay
    setTimeout(() => {
      onAuth(identity, !isLogin ? name : undefined);
      setIsLoading(false);
    }, 1200);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-700 ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-blue-200'}`} />
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-500 ${isLoading ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
        <div className="text-center mb-10">
          <div className={`inline-flex p-4 rounded-2xl text-white shadow-2xl mb-6 bg-emerald-600 shadow-emerald-500/20`}>
            <BarChart3 size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">ASCEND <span className="text-emerald-500">SYSTEMS</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
            {isLogin ? 'Elite Performance Protocol v3.0' : 'Register New Operative Identity'}
          </p>
        </div>

        <div className={`p-8 rounded-3xl border shadow-2xl ${darkMode ? 'bg-slate-900/50 border-slate-800 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${
                      darkMode 
                      ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Identity (Email or Username)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="text"
                  placeholder="agent_007"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${
                    darkMode 
                    ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Secure Protocol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${
                    darkMode 
                    ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Confirm Protocol</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${
                      darkMode 
                      ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white' 
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between px-1">
                <button 
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 group outline-none"
                >
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-700 group-hover:border-emerald-500'}`}>
                    {rememberMe && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Remember Me</span>
                </button>
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400">Forget Access?</button>
              </div>
            )}

            {error && (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center mt-2 px-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg mt-4 ${
                darkMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Initiate Session' : 'Register Identity'}
                  {isLogin ? <ArrowRight size={16} /> : <UserPlus size={16} />}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-blue-500" />
              <span>Edge Ready</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isLogin ? "New operative?" : "Already verified?"}
            <button 
              onClick={toggleMode}
              className="text-emerald-500 hover:underline ml-2 outline-none"
            >
              {isLogin ? "Request Access" : "Secure Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
