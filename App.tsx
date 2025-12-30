
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, LineChart, Line
} from 'recharts';
import { 
  ChevronLeft, ChevronRight, Plus, Trash2, CheckCircle2, 
  Target, BarChart3, Download, Share2,
  Calendar, TrendingUp, Award, Zap, ArrowUpRight, ArrowDownRight,
  Sun, Moon
} from 'lucide-react';
import { Habit, CompletionData } from './types';
import { INITIAL_HABITS, MONTHS, DAYS_OF_WEEK } from './constants';

type ViewMode = 'daily' | 'analysis';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewMode>('daily');
  const [currentMonthIdx, setCurrentMonthIdx] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('ascend_theme');
    return saved === 'dark';
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('ascend_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });
  
  const [completions, setCompletions] = useState<Record<string, CompletionData>>(() => {
    const saved = localStorage.getItem('ascend_completions');
    return saved ? JSON.parse(saved) : {};
  });

  // Persist data
  useEffect(() => {
    localStorage.setItem('ascend_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('ascend_completions', JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    localStorage.setItem('ascend_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculations for current month
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const monthKey = `${currentYear}-${currentMonthIdx}`;
  const currentMonthCompletions = completions[monthKey] || {};

  const getDayOfWeek = (day: number) => {
    return DAYS_OF_WEEK[new Date(currentYear, currentMonthIdx, day).getDay()];
  };

  const toggleHabit = useCallback((habitId: string, dayIdx: number) => {
    setCompletions(prev => {
      const monthData = { ...(prev[monthKey] || {}) };
      const habitDays = [...(monthData[habitId] || new Array(31).fill(false))];
      habitDays[dayIdx] = !habitDays[dayIdx];
      monthData[habitId] = habitDays;
      return { ...prev, [monthKey]: monthData };
    });
  }, [monthKey]);

  // Stats for the current month
  const currentMonthStats = useMemo(() => {
    let completed = 0;
    habits.forEach(h => {
      const days = currentMonthCompletions[h.id] || [];
      completed += days.filter((d, idx) => d && idx < daysInMonth).length;
    });
    const totalPossible = habits.length * daysInMonth;
    const percent = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
    return { completed, percent };
  }, [habits, currentMonthCompletions, daysInMonth]);

  // Stats for the previous month (for comparison)
  const prevMonthStats = useMemo(() => {
    const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
    const prevYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;
    const prevKey = `${prevYear}-${prevMonthIdx}`;
    const prevCompletions = completions[prevKey] || {};
    const prevDaysInMonth = new Date(prevYear, prevMonthIdx + 1, 0).getDate();
    
    let completed = 0;
    habits.forEach(h => {
      const days = prevCompletions[h.id] || [];
      completed += days.filter((d, idx) => d && idx < prevDaysInMonth).length;
    });
    const totalPossible = habits.length * prevDaysInMonth;
    return totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
  }, [habits, completions, currentMonthIdx, currentYear]);

  const monthImprovement = currentMonthStats.percent - prevMonthStats;

  // Yearly data for the Analysis View
  const yearlyData = useMemo(() => {
    return MONTHS.map((month, idx) => {
      const key = `${currentYear}-${idx}`;
      const monthComps = completions[key] || {};
      const dim = new Date(currentYear, idx + 1, 0).getDate();
      let completed = 0;
      habits.forEach(h => {
        const days = monthComps[h.id] || [];
        completed += days.filter((d, dayIdx) => d && dayIdx < dim).length;
      });
      const totalPossible = habits.length * dim;
      const progress = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;
      return { month: month.substring(0, 3), progress, completed };
    });
  }, [habits, completions, currentYear]);

  const dailyProgressData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      let count = 0;
      habits.forEach(h => {
        if (currentMonthCompletions[h.id]?.[i]) count++;
      });
      return {
        day: i + 1,
        progress: habits.length > 0 ? Math.round((count / habits.length) * 100) : 0,
        count
      };
    });
  }, [habits, currentMonthCompletions, daysInMonth]);

  const addHabit = () => {
    const name = prompt("Enter habit name:");
    if (name) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name,
        emoji: '✨',
        goal: 30
      };
      setHabits([...habits, newHabit]);
    }
  };

  const removeHabit = (id: string) => {
    if (confirm("Delete this habit?")) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const themeClasses = darkMode 
    ? "bg-slate-950 text-slate-100" 
    : "bg-[#F7F8FA] text-slate-800";

  const cardClasses = darkMode
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";

  const navClasses = darkMode
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses}`}>
      {/* Top Navbar */}
      <nav className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300 ${navClasses}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>ASCEND <span className="text-emerald-600">HABITS</span></h1>
            <p className={`text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>ANNUAL HABIT TRACKER PRO</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className={`hidden md:flex items-center p-1 rounded-xl transition-colors duration-300 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button 
            onClick={() => setView('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'daily' ? (darkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
          >
            <Calendar size={16} />
            Daily Log
          </button>
          <button 
            onClick={() => setView('analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'analysis' ? (darkMode ? 'bg-slate-700 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
          >
            <TrendingUp size={16} />
            Yearly Analysis
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        
        {view === 'daily' ? (
          <>
            {/* Dashboard Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className={`md:col-span-1 p-6 rounded-2xl border shadow-sm flex flex-col justify-center items-center transition-colors duration-300 ${cardClasses}`}>
                <div className="flex items-center justify-between w-full mb-4">
                  <button 
                    onClick={() => {
                      if (currentMonthIdx === 0) {
                        setCurrentMonthIdx(11);
                        setCurrentYear(y => y - 1);
                      } else {
                        setCurrentMonthIdx(m => m - 1);
                      }
                    }}
                    className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{MONTHS[currentMonthIdx]} {currentYear}</h2>
                  <button 
                    onClick={() => {
                      if (currentMonthIdx === 11) {
                        setCurrentMonthIdx(0);
                        setCurrentYear(y => y + 1);
                      } else {
                        setCurrentMonthIdx(m => m + 1);
                      }
                    }}
                    className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Selected Month</p>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center transition-colors duration-300 ${cardClasses}`}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}><Target size={20} /></div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Active Habits</span>
                </div>
                <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{habits.length}</div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center transition-colors duration-300 ${cardClasses}`}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><CheckCircle2 size={20} /></div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Month Success</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentMonthStats.completed}</div>
                  <span className="text-sm font-bold text-slate-400">Total Check-ins</span>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-center relative overflow-hidden transition-colors duration-300 ${cardClasses}`}>
                <div className="z-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600'}`}><BarChart3 size={20} /></div>
                      <span className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Overall Progress</span>
                    </div>
                    <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${monthImprovement >= 0 ? (darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')}`}>
                      {monthImprovement >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {Math.abs(monthImprovement)}%
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentMonthStats.percent}%</div>
                </div>
                <div className={`absolute bottom-0 right-0 left-0 h-1.5 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${currentMonthStats.percent}%` }} />
                </div>
              </div>
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Habits Grid */}
              <div className={`lg:col-span-3 rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors duration-300 ${cardClasses}`}>
                <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                  <span className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Daily Habit Log</span>
                  <button 
                    onClick={addHabit}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${darkMode ? 'text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50' : 'text-emerald-600 hover:text-emerald-700 bg-emerald-50'}`}
                  >
                    <Plus size={14} /> Add Habit
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className={darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}>
                        <th className={`sticky left-0 z-20 p-4 text-left border-b border-r min-w-[220px] transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-xs font-bold text-slate-400 uppercase">My Habits</span>
                        </th>
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <th key={i} className={`p-2 border-b min-w-[40px] text-center ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                            <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                              {getDayOfWeek(i + 1)}
                            </div>
                            <div className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              {i + 1}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {habits.map((habit) => {
                        const habitCompletions = currentMonthCompletions[habit.id] || [];
                        return (
                          <tr key={habit.id} className={`group ${darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                            <td className={`sticky left-0 z-20 p-4 border-b border-r flex items-center justify-between transition-colors ${darkMode ? 'bg-slate-900 border-slate-800 group-hover:bg-slate-800' : 'bg-white border-slate-200 group-hover:bg-slate-50'}`}>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{habit.emoji}</span>
                                <span className={`text-sm font-semibold truncate max-w-[140px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{habit.name}</span>
                              </div>
                              <button 
                                onClick={() => removeHabit(habit.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                            {Array.from({ length: daysInMonth }, (_, dayIdx) => (
                              <td key={dayIdx} className={`p-0 border-b text-center ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div 
                                  onClick={() => toggleHabit(habit.id, dayIdx)}
                                  className={`w-full h-12 flex items-center justify-center cursor-pointer transition-all ${
                                    habitCompletions[dayIdx] 
                                    ? (darkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600') 
                                    : 'text-slate-200 hover:text-slate-300'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                                    habitCompletions[dayIdx]
                                    ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                                    : (darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')
                                  }`}>
                                    {habitCompletions[dayIdx] && <CheckCircle2 size={14} strokeWidth={3} />}
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className={darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}>
                      <tr>
                        <td className={`sticky left-0 z-20 p-4 border-r transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Daily Progress</span>
                        </td>
                        {dailyProgressData.map((d, i) => (
                          <td key={i} className="p-2 text-center align-middle">
                            <div className={`text-[10px] font-extrabold leading-none ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              {d.progress}%
                            </div>
                            <div className={`w-full h-1 rounded-full mt-1 overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div 
                                className="h-full bg-emerald-400" 
                                style={{ width: `${d.progress}%` }}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Sidebar Analysis */}
              <div className="lg:col-span-1 space-y-6">
                <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${cardClasses}`}>
                  <div className={`p-4 border-b ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                    <span className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Analysis</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {habits.slice(0, 10).map(habit => {
                      const habitCompletions = currentMonthCompletions[habit.id] || [];
                      const actual = habitCompletions.filter((c, i) => c && i < daysInMonth).length;
                      const progress = Math.min(100, Math.round((actual / habit.goal) * 100));
                      return (
                        <div key={habit.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className={`truncate max-w-[120px] ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{habit.emoji} {habit.name}</span>
                            <span className="text-slate-400">{actual} / {habit.goal}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <div 
                                className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-emerald-500' : (darkMode ? 'bg-blue-600' : 'bg-blue-500')}`} 
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{progress}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 size={80} />
                  </div>
                  <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-2">Quote of the Month</p>
                  <h3 className="text-xl font-bold leading-tight mb-4">"Inspiration comes only during work."</h3>
                  <p className="text-emerald-400 text-sm italic">— Gabriel Garcia Marquez</p>
                </div>
              </div>
            </div>

            {/* Daily Trend Chart */}
            <div className={`rounded-2xl border shadow-sm p-6 transition-colors duration-300 ${cardClasses}`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Month Consistency Trend</h3>
                  <p className="text-sm text-slate-500 font-medium">Tracking daily completion rates</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyProgressData}>
                    <defs>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 600, fill: darkMode ? '#64748b' : '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fontWeight: 600, fill: darkMode ? '#64748b' : '#94a3b8' }}
                      dx={-10}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                        fontSize: '12px',
                        backgroundColor: darkMode ? '#1e293b' : '#fff',
                        color: darkMode ? '#fff' : '#000'
                      }} 
                      cursor={{ stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="progress" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorProgress)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          /* YEARLY ANALYSIS VIEW */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Year Summary Cards */}
              <div className={`p-8 rounded-2xl border shadow-sm relative overflow-hidden transition-colors duration-300 ${cardClasses}`}>
                <div className="flex items-center gap-4 mb-4">
                   <div className={`p-3 rounded-xl ${darkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}><Award size={24} /></div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Yearly Average</p>
                     <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {Math.round(yearlyData.reduce((acc, curr) => acc + curr.progress, 0) / 12)}%
                     </h3>
                   </div>
                </div>
                <p className="text-sm text-slate-500">Global completion rate across all habits and months.</p>
              </div>

              <div className={`p-8 rounded-2xl border shadow-sm relative overflow-hidden transition-colors duration-300 ${cardClasses}`}>
                <div className="flex items-center gap-4 mb-4">
                   <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}><Zap size={24} /></div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Best Month</p>
                     <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {MONTHS[yearlyData.reduce((prev, curr, idx) => curr.progress > yearlyData[prev].progress ? idx : prev, 0)]}
                     </h3>
                   </div>
                </div>
                <p className="text-sm text-slate-500">Your highest peak of productivity this year.</p>
              </div>

              <div className={`p-8 rounded-2xl border shadow-sm relative overflow-hidden transition-colors duration-300 ${cardClasses}`}>
                 <div className="flex items-center gap-4 mb-4">
                   <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}><Calendar size={24} /></div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Year Focus</p>
                     <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentYear}</h3>
                   </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentYear(y => y - 1)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">PREVIOUS</button>
                  <span className="text-slate-200">|</span>
                  <button onClick={() => setCurrentYear(y => y + 1)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">NEXT</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Performance Comparison */}
              <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${cardClasses}`}>
                <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Yearly Momentum</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: darkMode ? '#64748b' : '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: darkMode ? '#64748b' : '#94a3b8' }} domain={[0, 100]} />
                      <Tooltip 
                        cursor={{ fill: darkMode ? '#334155' : '#f8fafc' }}
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                          fontWeight: 'bold',
                          backgroundColor: darkMode ? '#1e293b' : '#fff',
                          color: darkMode ? '#fff' : '#000'
                        }}
                      />
                      <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                        {yearlyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.progress > 70 ? '#10b981' : entry.progress > 40 ? '#3b82f6' : '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progress Stability Line */}
              <div className={`p-6 rounded-2xl border shadow-sm transition-colors duration-300 ${cardClasses}`}>
                <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Improvement Analysis</h3>
                <div className="h-[350px]">
                   <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#f1f5f9"} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: darkMode ? '#64748b' : '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: darkMode ? '#64748b' : '#94a3b8' }} hide />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                          fontWeight: 'bold',
                          backgroundColor: darkMode ? '#1e293b' : '#fff',
                          color: darkMode ? '#fff' : '#000'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="progress" 
                        stroke="#10b981" 
                        strokeWidth={4} 
                        dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: darkMode ? '#1e293b' : '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className={`mt-4 p-4 rounded-xl border ${darkMode ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>Coach Insight</p>
                  <p className={`text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    {yearlyData[11].progress > yearlyData[0].progress 
                      ? "You've shown a positive trend since January. Keep up the compounding growth!"
                      : "Mid-year fluctuations detected. Focus on restoring your primary morning routines to stabilize performance."}
                  </p>
                </div>
              </div>
            </div>

            {/* Habit Leaderboard */}
            <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${cardClasses}`}>
               <div className={`p-4 border-b ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                  <span className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Top Performing Habits (Full Year)</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                 {habits.slice().sort((a, b) => {
                    let aComp = 0, bComp = 0;
                    Object.values(completions).forEach(month => {
                       aComp += (month[a.id] || []).filter(v => v).length;
                       bComp += (month[b.id] || []).filter(v => v).length;
                    });
                    return bComp - aComp;
                 }).slice(0, 6).map((habit, i) => {
                    let totalComp = 0;
                    Object.values(completions).forEach(month => {
                      totalComp += (month[habit.id] || []).filter(v => v).length;
                    });
                    return (
                      <div key={habit.id} className={`flex items-center gap-4 p-4 border rounded-2xl transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>{habit.emoji}</div>
                        <div>
                          <p className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{habit.name}</p>
                          <p className={`text-xs font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalComp} completions this year</p>
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-8 px-6 text-center transition-colors duration-300 ${navClasses}`}>
         <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-sm">
               <button onClick={() => setView('daily')} className={`hover:text-emerald-500 transition-colors ${view === 'daily' ? 'text-emerald-600' : 'text-slate-400'}`}>DASHBOARD</button>
               <span className="text-slate-400">•</span>
               <button onClick={() => setView('analysis')} className={`hover:text-emerald-500 transition-colors ${view === 'analysis' ? 'text-emerald-600' : 'text-slate-400'}`}>ANALYSIS</button>
            </div>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">© 2025 ASCEND HABITS • HIGH PERFORMANCE TRACKING</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
