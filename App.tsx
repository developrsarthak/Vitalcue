import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  BrainCircuit, 
  Lock, 
  Mic, 
  Moon, 
  Shield, 
  Wind,
  Droplets,
  Zap,
  Flame,
  Clock,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

// Types & Services
import { ActionCard, ViewState, UserStats, ChallengeType, MoodAnalysis, UserProfile } from './types';
import { COLORS, NAV_ITEMS, MOCK_INITIAL_ACTIONS } from './constants';
import { generateDailyActions, analyzeMoodFromText, getCrisisGrounding } from './services/geminiService';

// Components
import { HealthScoreRing } from './components/HealthScoreRing';
import { ActionCard as ActionCardComponent } from './components/ActionCard';
import { ChallengeModal } from './components/ChallengeModal';
import { Onboarding } from './components/Onboarding';

const App = () => {
  // --- State ---
  // User Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vitalcue_profile');
    return saved ? JSON.parse(saved) : { name: '', onboardingComplete: false };
  });

  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [actions, setActions] = useState<ActionCard[]>(MOCK_INITIAL_ACTIONS);
  const [stats, setStats] = useState<UserStats>({ healthScore: 64, streak: 3, completedActions: 0 });
  const [activeChallenge, setActiveChallenge] = useState<ActionCard | null>(null);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  
  // Gemini/AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [moodText, setMoodText] = useState('');
  const [moodResult, setMoodResult] = useState<MoodAnalysis | null>(null);
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
  const [crisisAdvice, setCrisisAdvice] = useState('');

  // Detox State
  const [detoxTimeLeft, setDetoxTimeLeft] = useState(0);
  const [detoxActive, setDetoxActive] = useState(false);

  // --- Effects ---

  useEffect(() => {
    localStorage.setItem('vitalcue_profile', JSON.stringify(profile));
  }, [profile]);

  // Load fresh AI actions on mount if onboarding done
  useEffect(() => {
    if (!profile.onboardingComplete) return;

    const fetchAI = async () => {
      setIsGenerating(true);
      const hour = new Date().getHours();
      let timeDesc = 'Morning';
      if(hour > 11) timeDesc = 'Afternoon';
      if(hour > 17) timeDesc = 'Evening';

      const newActions = await generateDailyActions('Neutral', timeDesc);
      if (newActions.length > 0) {
        setActions(prev => {
           return newActions.map(a => ({...a, completed: false, type: (a.type as ChallengeType) || ChallengeType.SIMPLE_CONFIRM}));
        });
      }
      setIsGenerating(false);
    };
    
    if (process.env.API_KEY) {
      fetchAI();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.onboardingComplete]); 

  // Detox Timer
  useEffect(() => {
    let interval: number;
    if (detoxActive && detoxTimeLeft > 0) {
      interval = window.setInterval(() => {
        setDetoxTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (detoxTimeLeft === 0 && detoxActive) {
      setDetoxActive(false);
      alert("Detox Complete! Well done.");
      setStats(s => ({ ...s, healthScore: Math.min(100, s.healthScore + 10) }));
    }
    return () => clearInterval(interval);
  }, [detoxActive, detoxTimeLeft]);

  // --- Handlers ---

  const handleOnboardingComplete = (name: string) => {
    setProfile({ name, onboardingComplete: true });
  };

  const handleStartAction = (action: ActionCard) => {
    setActiveChallenge(action);
  };

  const handleCompleteChallenge = () => {
    if (!activeChallenge) return;

    setActions(prev => prev.map(a => 
      a.id === activeChallenge.id ? { ...a, completed: true } : a
    ));
    
    setStats(prev => ({
      healthScore: Math.min(100, prev.healthScore + activeChallenge.scoreImpact),
      completedActions: prev.completedActions + 1,
      streak: prev.streak
    }));
    
    addToHistory(`Completed: ${activeChallenge.title}`);
    setActiveChallenge(null);
  };

  const addToHistory = (text: string) => {
    setRecentLogs(prev => [text, ...prev].slice(0, 5));
  };

  const handleQuickLog = (type: 'water' | 'stretch') => {
    if (type === 'water') {
      addToHistory('Drank 250ml Water');
      setStats(s => ({...s, healthScore: Math.min(100, s.healthScore + 2)}));
    } else {
      addToHistory('Quick Stretch Break');
      setStats(s => ({...s, healthScore: Math.min(100, s.healthScore + 3)}));
    }
  };

  const handleMoodAnalysis = async () => {
    if (!moodText.trim()) return;
    setIsAnalyzingMood(true);
    const result = await analyzeMoodFromText(moodText);
    setMoodResult(result);
    setIsAnalyzingMood(false);
    addToHistory(`Mood Check: ${result.label}`);
  };

  const startDetox = (minutes: number) => {
    setDetoxTimeLeft(minutes * 60);
    setDetoxActive(true);
  };

  const enterCrisisMode = async () => {
      setView(ViewState.CRISIS);
      const advice = await getCrisisGrounding();
      setCrisisAdvice(advice);
  }

  // --- Render Views ---

  if (!profile.onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const renderHome = () => (
    <div className="space-y-8 pb-32 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            Hi, {profile.name}
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-1 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
          <Flame size={16} className="text-orange-500 fill-orange-500" />
          <span className="text-orange-700 font-bold text-sm">{stats.streak} Day Streak</span>
        </div>
      </header>

      {/* Main Stats */}
      <HealthScoreRing score={stats.healthScore} />

      {/* Quick Logs */}
      <section className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleQuickLog('water')}
          className="bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all p-4 rounded-2xl flex items-center space-x-3 border border-blue-100"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
            <Droplets size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold text-blue-900 text-sm">Log Water</p>
            <p className="text-blue-400 text-xs">+2 pts</p>
          </div>
        </button>
        <button 
          onClick={() => handleQuickLog('stretch')}
          className="bg-purple-50 hover:bg-purple-100 active:scale-95 transition-all p-4 rounded-2xl flex items-center space-x-3 border border-purple-100"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-500">
            <Wind size={20} />
          </div>
          <div className="text-left">
            <p className="font-bold text-purple-900 text-sm">Stretch</p>
            <p className="text-purple-400 text-xs">+3 pts</p>
          </div>
        </button>
      </section>

      {/* AI Actions */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Zap className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" />
            AI Daily Cues
          </h2>
          {isGenerating && <span className="text-xs text-blue-500 animate-pulse font-medium">Generating...</span>}
        </div>
        
        <div className="flex overflow-x-auto space-x-4 pb-6 pt-2 px-2 hide-scrollbar snap-x">
          {actions.map(action => (
            <div key={action.id} className="min-w-[85%] snap-center">
              <ActionCardComponent action={action} onStart={handleStartAction} />
            </div>
          ))}
        </div>
      </section>

      {/* Trends & History */}
      <section className="space-y-4">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center justify-between">
            <span>Weekly Vitality</span>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500">Last 7 Days</span>
          </h2>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                {name: 'M', score: 40}, {name: 'T', score: 60}, {name: 'W', score: 55}, 
                {name: 'T', score: stats.healthScore}, {name: 'F', score: 0}, {name: 'S', score: 0}, {name: 'S', score: 0}
              ]}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#9CA3AF', fontWeight: 600}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="score" fill={COLORS.primary} radius={[6, 6, 6, 6]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {recentLogs.length > 0 && (
          <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700 font-medium">{log}</span>
                  <span className="text-gray-400 text-xs ml-auto">Just now</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderDetox = () => (
    <div className="flex flex-col items-center justify-center h-full pb-32 px-6 space-y-10 animate-in slide-in-from-right duration-300">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <Lock size={32} className="text-blue-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">Digital Detox</h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          Disconnect to reconnect.<br/>Block distractions and reclaim your focus.
        </p>
      </div>

      {detoxActive ? (
        <div className="flex flex-col items-center w-full max-w-xs bg-white p-8 rounded-3xl shadow-xl border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
          <div className="text-7xl font-mono font-bold text-gray-800 tabular-nums tracking-tighter mb-4">
             {Math.floor(detoxTimeLeft / 60)}:{(detoxTimeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-bold text-sm">Focus Mode Active</span>
          </div>
          <button 
             onClick={() => setDetoxActive(false)} 
             className="text-gray-400 text-xs mt-8 hover:text-red-500 transition-colors"
          >
            Emergency Stop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 w-full">
          {[1, 15, 30, 60].map(min => (
             <button
               key={min}
               onClick={() => startDetox(min)}
               className="group relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 transition-all active:scale-95"
             >
               <span className="text-3xl font-black text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{min}</span>
               <span className="text-xs font-bold text-gray-400 tracking-wider">MINUTES</span>
               <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Clock size={16} className="text-blue-400" />
               </div>
             </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderMood = () => (
    <div className="h-full pb-32 px-4 pt-6 animate-in slide-in-from-right duration-300">
      <h2 className="text-3xl font-black text-gray-900 mb-8">Mood Check</h2>
      
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center space-y-8 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 z-0"></div>

         <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 z-10">
            <Mic size={40} className="text-white" />
         </div>
         
         <div className="w-full z-10">
            <label className="block text-center text-lg font-bold text-gray-700 mb-4">How are you feeling right now?</label>
            <textarea 
               className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none resize-none text-gray-800"
               rows={4}
               placeholder="I feel a bit overwhelmed because..."
               value={moodText}
               onChange={(e) => setMoodText(e.target.value)}
            />
         </div>

         <button 
           onClick={handleMoodAnalysis}
           disabled={isAnalyzingMood || !moodText}
           className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:scale-95 transition-all flex justify-center items-center shadow-lg z-10"
         >
           {isAnalyzingMood ? <span className="animate-spin mr-2">⏳</span> : <BrainCircuit size={20} className="mr-2" />}
           Analyze My Mood
         </button>
      </div>

      {moodResult && (
        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-[2rem] p-8 border border-green-200 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
           <div className="flex justify-between items-start mb-4">
              <div>
                <span className="block text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Detected Mood</span>
                <span className="text-2xl font-black text-green-900">{moodResult.label}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl text-lg font-bold text-green-700 shadow-sm">
                {moodResult.score} <span className="text-xs font-normal">/ 100</span>
              </div>
           </div>
           <div className="h-px w-full bg-green-200 my-4"></div>
           <p className="text-green-800 font-medium leading-relaxed">{moodResult.advice}</p>
        </div>
      )}
    </div>
  );

  const renderCrisis = () => (
    <div className="fixed inset-0 bg-[#0F1724] z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <Shield size={64} className="text-blue-400 mb-8" />
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Crisis Mode</h2>
        <p className="text-blue-200 mb-12 text-lg">You are safe. Let's ground yourself.</p>
        
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 max-w-md w-full mb-12">
           <p className="text-2xl text-white leading-relaxed font-medium font-serif italic">
             "{crisisAdvice || "Breathe in deeply..."}"
           </p>
        </div>

        <div className="w-32 h-32 rounded-full bg-blue-500/20 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
           <div className="w-20 h-20 rounded-full bg-blue-500/40 flex items-center justify-center">
             <span className="text-blue-100 font-bold">Inhale</span>
           </div>
        </div>

        <button 
          onClick={() => setView(ViewState.HOME)}
          className="mt-16 py-3 px-8 rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all font-medium"
        >
          I'm feeling better now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-[#0F1724] font-sans selection:bg-blue-100">
      <main className="max-w-md mx-auto h-screen relative bg-white sm:h-[95vh] sm:mt-[2.5vh] sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-gray-900 overflow-hidden flex flex-col">
        {view === ViewState.CRISIS ? renderCrisis() : (
          <>
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gradient-to-b from-white to-[#F7FAFF]">
               {view === ViewState.HOME && renderHome()}
               {view === ViewState.DETOX && renderDetox()}
               {view === ViewState.MOOD && renderMood()}
            </div>

            {/* Glassmorphism Navigation */}
            <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/50 px-6 py-4 flex justify-between items-center z-40 pb-8 sm:pb-6">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.id === 'CRISIS' ? enterCrisisMode() : setView(item.id as ViewState)}
                    className={`relative flex flex-col items-center space-y-1 transition-all duration-300 ${
                      isActive ? 'text-blue-600 -translate-y-1' : item.id === 'CRISIS' ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-10 w-8 h-8 bg-blue-100 rounded-full blur-md opacity-50"></div>
                    )}
                    <Icon size={isActive ? 26 : 24} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity absolute -bottom-3`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {activeChallenge && (
          <ChallengeModal 
            action={activeChallenge} 
            onComplete={handleCompleteChallenge}
            onClose={() => setActiveChallenge(null)}
          />
        )}
      </main>
    </div>
  );
};

export default App;