
import React, { useState } from 'react';
import { X, User, Mail, Shield, Check, Camera, Image as ImageIcon } from 'lucide-react';

interface SettingsModalProps {
  user: { email: string; name?: string; avatar?: string };
  onClose: () => void;
  onUpdate: (data: { email: string; name: string; avatar: string }) => void;
  darkMode: boolean;
}

const AVATARS = [
  '⚡', '🛡️', '🎯', '🔥', '💎', '🚀', '🧠', '🦾', '🏆', '🌟', '🕶️', '👑', '🎗️', '📈', '🥇'
];

const SettingsModal: React.FC<SettingsModalProps> = ({ user, onClose, onUpdate, darkMode }) => {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '⚡');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = () => {
    setIsUpdating(true);
    // Simulate system update
    setTimeout(() => {
      onUpdate({ email, name, avatar: selectedAvatar });
      setIsUpdating(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-1 uppercase">Profile <span className="text-emerald-500">Settings</span></h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Configure Operative Identity</p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pt-2 space-y-8">
          {/* Avatar Selection */}
          <section>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-1">Visual Avatar Identity</label>
            <div className="flex flex-wrap gap-3">
              {AVATARS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === emoji 
                    ? 'bg-emerald-600 text-white scale-110 shadow-lg shadow-emerald-500/20' 
                    : `${darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <button className={`w-12 h-12 rounded-2xl border-2 border-dashed flex items-center justify-center transition-colors ${
                darkMode ? 'border-slate-800 text-slate-600 hover:border-slate-600' : 'border-slate-200 text-slate-400 hover:border-slate-400'
              }`}>
                <Camera size={18} />
              </button>
            </div>
          </section>

          {/* Identity Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Operative Alias</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
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

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Access Protocol (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border outline-none transition-all font-bold text-sm ${
                    darkMode 
                    ? 'bg-slate-800/50 border-slate-700 focus:border-emerald-500 text-white' 
                    : 'bg-slate-50 border-slate-200 focus:border-emerald-500 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${
                darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                darkMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
              }`}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Update Protocol <Check size={16} /></>
              )}
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className={`px-8 py-4 flex items-center gap-2 border-t ${
          darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <Shield size={12} className="text-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">End-to-end encrypted identity synchronization active.</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
