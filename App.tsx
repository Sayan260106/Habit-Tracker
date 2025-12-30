
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, LineChart, Line
} from 'recharts';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, 
  Target, BarChart3, Download, 
  Calendar, TrendingUp, Award, Zap, ArrowUpRight, ArrowDownRight,
  Sun, Moon, Flame, X, Check, Activity, ShieldAlert
} from 'lucide-react';
import { Habit, CompletionData } from './types';
import { INITIAL_HABITS, MONTHS, DAYS_OF_WEEK } from './constants';

type ViewMode = 'daily' | 'analysis';

const App: React.FC = () => {
  // --- STATE & PERSISTENCE ---
  const [view, setView] = useState<ViewMode>('daily');
  const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ascend_theme') === 'dark');

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('ascend_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  
  const [completions, setCompletions] = useState<Record<string, CompletionData>>(() => {
    const saved = localStorage.getItem('ascend_completions');
    return saved ? JSON.parse(saved) : {};
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitGoal, setNewHabitGoal] = useState('30');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('ascend_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('ascend_completions', JSON.stringify(completions)); }, [completions]);
  useEffect(() => {
    localStorage.setItem('ascend_theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // --- CALENDAR HELPERS ---
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const monthKey = `${currentYear}-${currentMonthIdx}`;
  const currentMonthCompletions = completions[monthKey] || {};

  const toggleHabit = useCallback((habitId: string, dayIdx: number) => {
    setCompletions(prev => {
      const monthData = { ...(prev[monthKey] || {}) };
      const habitDays = [...(monthData[habitId] || new Array(31).fill(false))];
      habitDays[dayIdx] = !habitDays[dayIdx];
      monthData[habitId] = habitDays;
      return { ...prev, [monthKey]: monthData };
    });
  }, [monthKey]);

  // --- PERFORMANCE CALCULATIONS ---
  const perfectStreak = useMemo(() => {
    const today = new Date();
    let currentStreak = 0;
    let foundBreak = false;
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const y = d.getFullYear(), m = d.getMonth(), dayIdx = d.getDate() - 1;
      const key = `${y}-${m}`;
      const monthData = completions[key] || {};
      if (habits.length === 0) break;
      const isPerfect = habits.every(h => monthData[h.id]?.[dayIdx] === true);
      if (isPerfect) { if (!foundBreak) currentStreak++; }
      else { if (i === 0) continue; foundBreak = true; }
      if (foundBreak) break;
    }
    return currentStreak;
  }, [completions, habits]);

  const aura = useMemo(() => {
    if (perfectStreak >= 15) return { name: 'Mastery', color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/20' };
    if (perfectStreak >= 7) return { name: 'Flow', color: '#8b5cf6', bg: 'bg-violet-600', text: 'text-violet-500', border: 'border-violet-500/20' };
    if (perfectStreak >= 3) return { name: 'Momentum', color: '#3b82f6', bg: 'bg-blue-600', text: 'text-blue-500', border: 'border-blue-500/20' };
    return { name: 'Growth', color: '#10b981', bg: 'bg-emerald-600', text: 'text-emerald-500', border: 'border-emerald-500/20' };
  }, [perfectStreak]);

  const currentMonthStats = useMemo(() => {
    let completed = 0;
    habits.forEach(h => {
      const days = currentMonthCompletions[h.id] || [];
      completed += days.filter((d, idx) => d && idx < daysInMonth).length;
    });
    const totalPossible = habits.length * daysInMonth;
    const percent = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
    return { percent, projection: Math.min(100, Math.round(percent * 1.05)) };
  }, [habits, currentMonthCompletions, daysInMonth]);

  const stabilityIndex = useMemo(() => {
    const index: Record<string, { status: string, color: string, bg: string }> = {};
    const today = new Date().getDate();
    habits.forEach(h => {
      const days = currentMonthCompletions[h.id] || [];
      const last7 = days.slice(Math.max(0, today - 7), today).filter(v => v).length;
      if (last7 >= 6) index[h.id] = { status: 'Stable', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      else if (last7 >= 3) index[h.id] = { status: 'Fragile', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      else index[h.id] = { status: 'At Risk', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    });
    return index;
  }, [habits, currentMonthCompletions]);

  const dailyProgressData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      let count = 0;
      habits.forEach(h => { if (currentMonthCompletions[h.id]?.[i]) count++; });
      return { day: i + 1, progress: habits.length > 0 ? Math.round((count / habits.length) * 100) : 0 };
    });
  }, [habits, currentMonthCompletions, daysInMonth]);

  const yearlyData = useMemo(() => {
    return MONTHS.map((month, idx) => {
      const mKey = `${currentYear}-${idx}`;
      const monthData = completions[mKey] || {};
      const dInMonth = new Date(currentYear, idx + 1, 0).getDate();
      let totalCompleted = 0;
      habits.forEach(h => {
        const days = monthData[h.id] || [];
        totalCompleted += days.filter((d, dIdx) => d && dIdx < dInMonth).length;
      });
      const possible = habits.length * dInMonth;
      return { month: month.substring(0, 3), progress: possible > 0 ? Math.round((totalCompleted / possible) * 100) : 0 };
    });
  }, [habits, completions, currentYear]);

  const groupedHabits = useMemo(() => {
    const groups: Record<string, Habit[]> = { Core: [], Physical: [], Mindset: [], Lifestyle: [] };
    habits.forEach(h => { const cat = h.category || 'Core'; if (!groups[cat]) groups[cat] = []; groups[cat].push(h); });
    return groups;
  }, [habits]);

  // --- HANDLERS ---
  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits(prev => [...prev, { id: Date.now().toString(), name: newHabitName.trim(), emoji: '✨', goal: parseInt(newHabitGoal) || 30, category: 'Core' }]);
    setNewHabitName(''); setIsAdding(false);
  };

  const handleRemoveHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setConfirmDeleteId(null);
  };

  const cardBase = `rounded-2xl border transition-all duration-300 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;

  return (
    <div className={`min-h-screen flex flex-col font-medium ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      {/* Header */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl text-white shadow-lg shadow-black/5 ${aura.bg}`}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ASCEND <span className={aura.text}>HABITS</span></h1>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              <Activity size={10} /> Protocol v3.0 • {aura.name}
            </div>
          </div>
        </div>

        <div className={`flex items-center gap-1 p-1 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button onClick={() => setView('daily')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'daily' ? (darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>DAILY</button>
          <button onClick={() => setView('analysis')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'analysis' ? (darkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-900 shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}>ANALYSIS</button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Download size={16} /> EXPORT
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-[1500px] mx-auto w-full p-6 space-y-8">
        {view === 'daily' ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`${cardBase} p-6 flex flex-col items-center justify-center`}>
                <div className="flex items-center gap-4 mb-2">
                  <button onClick={() => currentMonthIdx === 0 ? (setCurrentMonthIdx(11), setCurrentYear(y => y-1)) : setCurrentMonthIdx(m => m-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronLeft size={20}/></button>
                  <span className="text-sm font-bold uppercase tracking-wider">{MONTHS[currentMonthIdx]} {currentYear}</span>
                  <button onClick={() => currentMonthIdx === 11 ? (setCurrentMonthIdx(0), setCurrentYear(y => y+1)) : setCurrentMonthIdx(m => m+1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronRight size={20}/></button>
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temporal Vector</div>
              </div>

              <div className={`${cardBase} p-6`}>
                <div className="flex items-center gap-3 mb-1">
                  <Target size={18} className="text-blue-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Objectives</span>
                </div>
                <div className="text-3xl font-bold">{habits.length}</div>
              </div>

              <div className={`${cardBase} p-6 relative overflow-hidden group`}>
                <div className="flex items-center gap-3 mb-1">
                  <Flame size={18} className={aura.text} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">True Streak</span>
                </div>
                <div className="flex items-baseline gap-2 relative z-10">
                  <div className={`text-3xl font-bold ${aura.text}`}>{perfectStreak}</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Days Perfect</span>
                </div>
                <div className={`absolute -right-4 -bottom-4 opacity-5 ${aura.text} transition-transform group-hover:scale-110 duration-500`}>
                  <Award size={100} />
                </div>
              </div>

              <div className={`${cardBase} p-6`}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Protocol Yield</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md">PROJ {currentMonthStats.projection}%</span>
                </div>
                <div className="text-3xl font-bold">{currentMonthStats.percent}%</div>
                <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${aura.bg} transition-all duration-1000`} style={{ width: `${currentMonthStats.percent}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Matrix Card */}
              <div className={`${cardBase} lg:col-span-3 overflow-hidden flex flex-col`}>
                <div className="p-5 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Daily Objective Matrix</h3>
                  {isAdding ? (
                    <div className="flex items-center gap-2 p-1 pl-3 rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
                      <input 
                        type="text" placeholder="Objective..." 
                        value={newHabitName} onChange={e => setNewHabitName(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
                        className="bg-transparent text-[10px] font-bold uppercase outline-none w-32" autoFocus 
                      />
                      <button onClick={handleAddHabit} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                      <button onClick={() => setIsAdding(false)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-[10px] font-bold uppercase px-4 py-2 bg-slate-900 text-white dark:bg-emerald-600 rounded-xl hover:opacity-90 active:scale-95 transition-all">
                      <Plus size={14} /> New Objective
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/10">
                        <th className={`sticky left-0 z-30 p-5 text-left border-b border-r min-w-[240px] ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Habit Architecture</span>
                        </th>
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <th key={i} className={`p-2 border-b min-w-[45px] text-center border-slate-200/50 dark:border-slate-800/50`}>
                            <div className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">{DAYS_OF_WEEK[new Date(currentYear, currentMonthIdx, i+1).getDay()].substring(0, 3)}</div>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{i + 1}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(Object.entries(groupedHabits) as [string, Habit[]][]).map(([category, items]) => items.length > 0 && (
                        <React.Fragment key={category}>
                          <tr className="bg-slate-50/30 dark:bg-slate-800/5">
                            <td colSpan={daysInMonth + 1} className="p-3 px-6 border-b text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500/70">{category} Domain</td>
                          </tr>
                          {items.map(habit => {
                            const habitComps = currentMonthCompletions[habit.id] || [];
                            const isConfirming = confirmDeleteId === habit.id;
                            return (
                              <tr key={habit.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                                <td className={`sticky left-0 z-20 p-4 px-6 border-b border-r flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900 group-hover:bg-slate-800' : 'bg-white group-hover:bg-slate-50'}`}>
                                  <div className="flex items-center gap-4">
                                    <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">{habit.emoji}</span>
                                    <span className="text-[11px] font-bold uppercase tracking-tight truncate max-w-[150px]">{habit.name}</span>
                                  </div>
                                  <div className="flex items-center">
                                    {isConfirming ? (
                                      <div className="flex gap-1 animate-in slide-in-from-right-2">
                                        <button onClick={() => handleRemoveHabit(habit.id)} className="p-1.5 bg-rose-500 text-white rounded-lg"><Check size={12}/></button>
                                        <button onClick={() => setConfirmDeleteId(null)} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"><X size={12}/></button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setConfirmDeleteId(habit.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={16} /></button>
                                    )}
                                  </div>
                                </td>
                                {Array.from({ length: daysInMonth }, (_, d) => (
                                  <td key={d} className="p-0 border-b border-slate-100 dark:border-slate-800/50 text-center">
                                    <div onClick={() => toggleHabit(habit.id, d)} className="w-full h-12 flex items-center justify-center cursor-pointer">
                                      <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${habitComps[d] ? `${aura.bg} border-transparent text-white scale-110 shadow-lg shadow-black/5` : 'border-slate-200 dark:border-slate-800 group-hover:border-slate-300 dark:group-hover:border-slate-700'}`}>
                                        {habitComps[d] && <Check size={12} strokeWidth={4} />}
                                      </div>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar Insights */}
              <div className="lg:col-span-1 space-y-6">
                <div className={`${cardBase} overflow-hidden`}>
                  <div className="p-4 border-b flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
                    <Activity size={16} className={aura.text} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stability Index</span>
                  </div>
                  <div className="p-5 space-y-5">
                    {habits.slice(0, 10).map(habit => {
                      const stability = stabilityIndex[habit.id] || { status: 'New', color: 'text-slate-400', bg: 'bg-slate-100' };
                      const comp = (currentMonthCompletions[habit.id] || []).filter(v => v).length;
                      const progress = Math.min(100, Math.round((comp / habit.goal) * 100));
                      return (
                        <div key={habit.id}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{habit.name}</span>
                            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${stability.bg} ${stability.color}`}>{stability.status}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className={`h-full ${aura.bg} transition-all duration-700`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`${aura.bg} rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-black/10`}>
                  <ShieldAlert size={80} className="absolute -right-6 -top-6 opacity-10 rotate-12" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Protocol Note</p>
                  <h3 className="text-xl font-bold leading-tight mb-4">"Structure is the scaffolding of creative genius."</h3>
                  <div className="h-0.5 w-10 bg-white/30 rounded-full mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Elite Mindset Division</p>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className={`${cardBase} p-8`}>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Consistency Dynamics</h3>
                  <p className="text-xs text-slate-400">Momentum Velocity Index (MVI)</p>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyProgressData}>
                    <defs>
                      <linearGradient id="auraGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={aura.color} stopOpacity={0.15}/>
                        <stop offset="95%" stopColor={aura.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: 'bold', backgroundColor: darkMode ? '#0f172a' : '#fff' }} />
                    <Area type="monotone" dataKey="progress" stroke={aura.color} strokeWidth={3} fill="url(#auraGradient)" animationDuration={1000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Success Velocity', val: `${Math.round(yearlyData.reduce((acc, c) => acc + c.progress, 0) / 12)}%`, icon: Award, accent: aura.bg },
                { label: 'Peak Alignment', val: MONTHS[yearlyData.reduce((prev, curr, idx) => curr.progress > yearlyData[prev].progress ? idx : prev, 0)].substring(0, 3), icon: Zap, accent: 'bg-blue-600' },
                { label: 'Vector Focus', val: currentYear, icon: Calendar, accent: 'bg-slate-900', controls: true },
              ].map((item, i) => (
                <div key={i} className={`${cardBase} p-8 flex items-center gap-6`}>
                  <div className={`p-4 rounded-2xl text-white shadow-xl shadow-black/5 ${item.accent}`}><item.icon size={32}/></div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    <h3 className="text-4xl font-bold tracking-tighter">{item.val}</h3>
                  </div>
                  {item.controls && (
                    <div className="flex flex-col gap-2">
                       <button onClick={() => setCurrentYear(y => y - 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><ChevronLeft size={20}/></button>
                       <button onClick={() => setCurrentYear(y => y + 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><ChevronRight size={20}/></button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`${cardBase} p-8`}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Annual Performance Map</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} domain={[0, 100]} />
                      <Tooltip cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }} />
                      <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                        {yearlyData.map((e, i) => (
                          <Cell key={i} fill={e.progress > 80 ? '#10b981' : e.progress > 50 ? '#3b82f6' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={`${cardBase} p-8`}>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-8">Trajectory Projections</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="progress" stroke={aura.color} strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 border-t mt-12 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
        © 2025 ASCEND • ARCHITECTED FOR DISCIPLINE
      </footer>
    </div>
  );
};

export default App;
