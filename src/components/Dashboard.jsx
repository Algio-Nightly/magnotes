import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import { useTimer } from '../context/TimerContext';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import ScholarlyCalendar from './ScholarlyCalendar';

// Import Tile Assets
import TileBrown from '../assets/Tiles/LeatherCard.png';
import TileBlack from '../assets/Tiles/LeatherCard_Black.png';
import TileBlue from '../assets/Tiles/LeatherCard_Blue.png';
import TileGreen from '../assets/Tiles/LeatherCard_Green.png';
import TilePink from '../assets/Tiles/LeatherCard_Pink.png';
import TilePurple from '../assets/Tiles/LeatherCard_Purple.png';
import TileRed from '../assets/Tiles/LeatherCard_Red.png';
import TileWhite from '../assets/Tiles/LeatherCard_White.png';

const tileMap = {
  Brown: TileBrown,
  Black: TileBlack,
  Blue: TileBlue,
  Green: TileGreen,
  Pink: TilePink,
  Purple: TilePurple,
  Red: TileRed,
  White: TileWhite
};

const Dashboard = () => {
  const { state, toggleTask, toggleTaskRevision, getRelativeTime } = useNotes();
  const { timeLeft, isActive, startTimer, pauseTimer, resetTimer, setDuration, formatTime, getTotalHours, dailyStats } = useTimer();
  
  // Daily Stats Calculation
  const today = new Date().toISOString().split('T')[0];
  const hoursToday = ((dailyStats[today] || 0) / 3600).toFixed(2);
  const tasksToday = Object.values(state.tasks).filter(t => 
    t.completedAt && t.completedAt.startsWith(today)
  ).length;
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [customMins, setCustomMins] = useState(45);
  
  const basePanel = "bg-gradient-to-br from-[#DCE4D7]/70 via-[#E8ECE1]/50 to-[#DCE4D7]/20 backdrop-blur-sm p-8 rounded-xl border border-white/40 flex flex-col shadow-lg transition-all duration-500 hover:shadow-xl";
  const darkPanel = "bg-[#5D2E2E] p-8 rounded-xl border border-[#F4EFE6]/10 flex flex-col shadow-xl transition-all duration-500 hover:shadow-2xl text-[#F4EFE6]";

  const handleSetTime = (e) => {
    e.preventDefault();
    const mins = parseInt(customMins);
    if (mins > 0) setDuration(mins);
  };

  // Filter tasks and notebook revisions based on selected calendar date
  const filteredTasks = Object.values(state.tasks).filter(task => {
    if (!task.deadline) return false;
    const taskDate = new Date(task.deadline);
    return taskDate.toDateString() === selectedDate.toDateString();
  }).map(t => ({ ...t, displayType: 'Deadline', isDone: t.isComplete }));

  const filteredRevisions = [
    ...Object.values(state.notebooks).filter(nb => {
      if (!nb.revisionDate) return false;
      const revDate = new Date(nb.revisionDate);
      return revDate.toDateString() === selectedDate.toDateString();
    }).map(nb => ({ ...nb, displayType: 'Revision', isDone: nb.isRevisionComplete, itemType: 'notebook' })),
    ...Object.values(state.tasks).filter(task => {
      if (!task.revisionDate) return false;
      const revDate = new Date(task.revisionDate);
      return revDate.toDateString() === selectedDate.toDateString();
    }).map(task => ({ ...task, displayType: 'Revision', isDone: task.isRevisionComplete, itemType: 'task' }))
  ];

  const mixedItems = [...filteredTasks, ...filteredRevisions];

  // Get 10 most recently updated notes
  const recentNotes = Object.values(state.notes)
    .sort((a, b) => new Date(b.lastUpdated || b.createdAt || 0) - new Date(a.lastUpdated || a.createdAt || 0))
    .slice(0, 10);

  // --- Analytics Data Logic ---
  const [momentumData, setMomentumData] = useState([]);

  const generateMomentumData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
      
      // Calculate Hours
      const seconds = dailyStats[dateStr] || 0;
      const hours = parseFloat((seconds / 3600).toFixed(2));
      
      // Calculate Tasks Accomplished
      const completedTasks = Object.values(state.tasks).filter(task => 
        task.isComplete && 
        task.completedAt && 
        task.completedAt.startsWith(dateStr)
      ).length;
      
      data.push({
        name: dayLabel,
        hours: hours,
        tasks: completedTasks
      });
    }
    setMomentumData(data);
  };

  useEffect(() => {
    generateMomentumData();
    const interval = setInterval(generateMomentumData, 300000); // 5-minute heartbeat
    return () => clearInterval(interval);
  }, [dailyStats, state.tasks]);
  // ----------------------------

  return (
    // Outer container
    <div className="w-full h-full font-serif text-[#3C2A21] box-border overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
      
      {/* Main Layout: Divided 3fr (Left) and 2fr (Right) */}
      <div className="grid grid-cols-[3fr_2fr] gap-8 min-h-max">
        
        {/* ================= LEFT SECTION (3fr) ================= */}
        <div className="flex flex-col gap-8">
          
          {/* Top: Session Timer -> Restored */}
          <div className={`${basePanel} min-h-[500px] items-center justify-center text-center shrink-0 relative overflow-hidden`}>
            {/* Background Grain/Detail */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
            
            <div className="text-sm font-bold uppercase tracking-[0.4em] text-[#8C7A6B] mb-6 flex items-center gap-4">
              <span className="w-8 h-px bg-[#8C7A6B]/30"></span>
              Focus Session
              <span className="w-8 h-px bg-[#8C7A6B]/30"></span>
            </div>
            
            <div className="text-9xl font-light tracking-tighter mb-10 text-[#5D2E2E] uppercase animate-in fade-in duration-1000 drop-shadow-sm font-serif">
              {formatTime(timeLeft)}
            </div>

            <div className="flex flex-col items-center gap-8 w-full max-w-sm">
              <div className="flex items-center gap-4 w-full">
                <button 
                  onClick={isActive ? pauseTimer : startTimer}
                  className="flex-1 py-4 bg-[#5D2E2E] text-[#F4EFE6] hover:bg-[#3C2A21] transition-all duration-300 font-bold tracking-widest uppercase text-sm rounded-sm shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  {isActive ? (
                    <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
                    </svg>
                    PAUSE SESSION
                    </>
                  ) : (
                    <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                    </svg>
                    COMMENCE
                    </>
                  )}
                </button>
                <button 
                  onClick={resetTimer}
                  className="p-4 border border-[#5D2E2E]/20 text-[#5D2E2E] hover:bg-[#5D2E2E]/5 transition-all rounded-sm shadow-sm active:scale-90"
                  title="Reset Chronology"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                  </svg>
                </button>
              </div>

              {/* Set Timer Form */}
              <form onSubmit={handleSetTime} className="w-full flex items-center gap-3 bg-white/30 p-2 rounded-sm border border-[#3C2A21]/5 shadow-inner">
                <input 
                  type="number" 
                  min="1" 
                  max="180"
                  value={customMins}
                  onChange={(e) => setCustomMins(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-stone-700 placeholder:text-stone-400 placeholder:italic placeholder:font-normal"
                  placeholder="Set Minutes..."
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#8C7A6B]/20 text-[#3C2A21] text-[0.6rem] font-bold uppercase tracking-widest hover:bg-[#8C7A6B]/30 transition-all rounded-sm whitespace-nowrap"
                >
                  Set Mandate
                </button>
              </form>
            </div>
          </div>

          {/* Bottom: Recent & Revision -> Variations in subtle background tints */}
          <div className="grid grid-cols-2 gap-8 items-start">
            
            {/* Column 1: Calendar & Tasks vertical stack */}
            <div className="flex flex-col gap-8">
              {/* Chronicle of Revision -> Now at the top of the left stack */}
              <div className={`${basePanel} min-h-[480px] overflow-hidden`}>
                <div className="flex items-center justify-between mb-8 border-b border-[#3C2A21]/10 pb-4 text-[#5D2E2E]">
                  <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.4em]">Chronicle of Revision</h2>
                  <span className="text-[0.6rem] font-bold text-[#8C7A6B]/40 uppercase tracking-[0.2em] italic">Knowledge Timeline</span>
                </div>
                <div className="flex-1 min-h-0">
                  <ScholarlyCalendar value={selectedDate} onChange={setSelectedDate} />
                </div>
              </div>

              {/* Mandates Feed (Synced with Calendar) */}
              <div className={`${darkPanel} min-h-[400px]`}>
                <div className="flex items-center justify-between mb-6 border-b border-[#F4EFE6]/10 pb-3">
                  <h2 className="text-xl font-serif font-black uppercase tracking-[0.2em]">Mandates</h2>
                  <div className="px-3 py-1.5 bg-[#F4EFE6]/10 border border-[#F4EFE6]/20 rounded-full shadow-sm">
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-[#F4EFE6]/70">
                      {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar-light">
                  {mixedItems.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-sm text-[#F4EFE6]/40 italic">No active mandates inscribed for this solstice.</p>
                    </div>
                  ) : (
                    mixedItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          if (item.displayType === 'Deadline') {
                            toggleTask(item.id);
                          } else if (item.displayType === 'Revision') {
                            if (item.itemType === 'task') {
                              toggleTaskRevision(item.id);
                            }
                          }
                        }}
                        className="p-5 bg-white/5 border border-white/10 rounded-lg shadow-sm hover:bg-white/10 transition-all cursor-pointer group flex flex-col gap-3 relative"
                      >
                        <h4 className="font-serif font-black text-lg text-[#F4EFE6] leading-tight group-hover:text-white transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#F4EFE6]/60">
                            {item.displayType} {item.isDone && "• ACCOMPLISHED"}
                          </span>
                          {item.isDone && (
                            <svg className="text-emerald-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                            </svg>
                          )}
                        </div>
                        {!item.isDone && (
                          <div className="absolute top-5 right-5 w-1 h-1 rounded-full bg-[#F4EFE6] animate-pulse"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Recent Archives Feed */}
            <div className="flex flex-col gap-8">
              <div className={`${darkPanel} min-h-[910px]`}>
                <h2 className="text-xl font-serif font-bold mb-8 border-b border-[#F4EFE6]/10 pb-4 uppercase tracking-[0.2em]">Recent Archives</h2>
                <div className="flex-1 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar-light">
                  {recentNotes.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-sm text-[#F4EFE6]/40 italic tracking-widest uppercase">The archives are currently empty.</p>
                    </div>
                  ) : (
                    recentNotes.map(note => (
                      <Link 
                        to={`/notes/${note.id}`}
                        key={note.id}
                        className="p-6 bg-white/5 hover:bg-white/10 transition-all cursor-pointer border border-[#F4EFE6]/10 rounded-sm group block shadow-sm"
                      >
                        <span className="font-serif font-bold block text-lg group-hover:text-white transition-colors">{note.title || "Untitled Scroll"}</span>
                        <span className="text-[0.6rem] font-sub text-[#F4EFE6]/50 mt-3 block italic uppercase tracking-[0.2em]">
                          Last inscribed {getRelativeTime(note.lastUpdated || note.createdAt)}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================= RIGHT SECTION (2fr) ================= */}
        <div className="flex flex-col gap-8">
          
          {/* Top: Subjects Tabs - Flexible Height - Minimum height to show content */}
          <div className={`${basePanel} flex flex-col min-h-[500px]`}>
            <h2 className="text-2xl font-bold mb-6 text-[#3C2A21] border-b border-[#3C2A21]/[0.08] pb-4 uppercase tracking-wider text-sm shrink-0">Recent Subjects</h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[600px]">
              {Object.values(state.subjects).length === 0 ? (
                <div className="text-sm text-[#8C7A6B] italic p-4 text-center">No subjects created yet.</div>
              ) : (
                Object.values(state.subjects)
                  .sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0))
                  .slice(0, 10)
                  .map((subject) => {
                  const bgImage = tileMap[subject.color] || TileBrown;
                  
                  return (
                    <Link 
                      to={`/notebooks/${subject.id}`}
                      key={subject.id} 
                      className="relative flex items-center justify-center p-6 overflow-hidden transition-all duration-500 ease-in-out cursor-pointer rounded-sm border border-[#3C2A21]/[0.2] shadow-md hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.02] group min-h-[5rem]"
                    >
                      {/* Background Tile */}
                      <div 
                        className="absolute inset-0 z-0 bg-cover bg-center opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        style={{ backgroundImage: `url(${bgImage})` }}
                      />
                      
                      {/* Calibrated Overlay for Depth - reduced for better texture visibility */}
                      <div className="absolute inset-0 z-10 bg-black/20 group-hover:bg-black/5 transition-colors duration-300" />
                      
                      {/* Content */}
                      <span className="relative z-20 font-bold tracking-tight text-[#F4EFE6] drop-shadow-md text-lg text-center">{subject.title}</span>
                    </Link>
                  )
                })
              )}
            </div>
          </div>

          {/* Unified Scholarly Stats Pill */}
          <div className="bg-[#5D2E2E] rounded-2xl border border-[#F4EFE6]/10 p-6 shadow-xl flex flex-col gap-6 text-center transition-all duration-500 hover:shadow-2xl">
            {/* Top Row: Aggregate Archives */}
            <div className="flex flex-row items-center justify-around">
              <div className="flex flex-col">
                <span className="text-3xl font-light text-[#F4EFE6]">{getTotalHours()}</span>
                <span className="text-[0.6rem] font-bold text-[#F4EFE6]/70 uppercase tracking-widest mt-1">Total Hours</span>
              </div>
              <div className="w-[1px] h-8 bg-[#F4EFE6]/20"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-light text-[#F4EFE6]">{Object.values(state.notebooks).length}</span>
                <span className="text-[0.6rem] font-bold text-[#F4EFE6]/70 uppercase tracking-widest mt-1">Notebooks</span>
              </div>
              <div className="w-[1px] h-8 bg-[#F4EFE6]/20"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-light text-[#F4EFE6]">{Object.values(state.notes).length}</span>
                <span className="text-[0.6rem] font-bold text-[#F4EFE6]/70 uppercase tracking-widest mt-1">Notes</span>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="h-px bg-[#F4EFE6]/10 w-full"></div>

            {/* Bottom Row: Daily Solstice */}
            <div className="flex flex-row items-center justify-around">
              <div className="flex flex-col flex-1">
                <span className="text-2xl font-serif text-[#F4EFE6]">{hoursToday}</span>
                <span className="text-[0.5rem] font-black text-[#F4EFE6]/50 uppercase tracking-[0.2em] mt-1">Hours Today</span>
              </div>
              <div className="w-[1px] h-6 bg-[#F4EFE6]/15"></div>
              <div className="flex flex-col flex-1">
                <span className="text-2xl font-serif text-[#F4EFE6]">{tasksToday}</span>
                <span className="text-[0.5rem] font-black text-[#F4EFE6]/50 uppercase tracking-[0.2em] mt-1">Mandates Today</span>
              </div>
            </div>
          </div>

          {/* Dual Analytics: Hours and Tasks separated for clarity */}
          <div className="flex flex-col gap-8 flex-1">
            {/* Chart 1: Hours Trend */}
            <div className={`${basePanel} min-h-[300px]`}>
              <div className="flex items-center justify-between mb-6 border-b border-[#3C2A21]/10 pb-3">
                <div>
                  <h2 className="text-sm font-serif font-black uppercase tracking-[0.2em] text-[#5D2E2E]">Inscribed Hours</h2>
                  <p className="text-[0.55rem] font-sub text-[#8C7A6B] uppercase tracking-widest mt-1">Focus Projection</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#5D2E2E]"></div>
              </div>
              <div className="h-[180px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={momentumData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(60, 42, 33, 0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#3C2A21" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                      className="font-sub font-black uppercase opacity-60"
                    />
                    <YAxis 
                      stroke="#3C2A21" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      className="font-sub font-black opacity-60"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F4EFE6', 
                        border: '2px solid #5D2E2E', 
                        borderRadius: '0px', 
                        fontSize: '11px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ color: '#5D2E2E', fontWeight: 'bold' }}
                      labelStyle={{ color: '#3C2A21', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                      cursor={{ stroke: '#5D2E2E', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#5D2E2E" 
                      strokeWidth={3} 
                      dot={{ fill: '#5D2E2E', r: 3 }}
                      activeDot={{ r: 5 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Tasks Trend */}
            <div className={`${basePanel} min-h-[300px]`}>
              <div className="flex items-center justify-between mb-6 border-b border-[#3C2A21]/10 pb-3">
                <div>
                  <h2 className="text-sm font-serif font-black uppercase tracking-[0.2em] text-[#5D2E2E]">Accomplished Mandates</h2>
                  <p className="text-[0.55rem] font-sub text-[#8C7A6B] uppercase tracking-widest mt-1">Completion Velocity</p>
                </div>
                <div className="w-2 h-2 rounded-full border border-[#5D2E2E]/40"></div>
              </div>
              <div className="h-[180px] w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={momentumData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(60, 42, 33, 0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#3C2A21" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                      className="font-sub font-black uppercase opacity-60"
                    />
                    <YAxis 
                      stroke="#3C2A21" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      className="font-sub font-black opacity-60"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F4EFE6', 
                        border: '2px solid #8C7A6B', 
                        borderRadius: '0px', 
                        fontSize: '11px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ color: '#8C7A6B', fontWeight: 'bold' }}
                      labelStyle={{ color: '#3C2A21', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}
                      cursor={{ stroke: '#8C7A6B', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#8C7A6B" 
                      strokeWidth={2} 
                      strokeDasharray="4 4"
                      dot={{ fill: 'rgba(140, 122, 107, 0.2)', r: 3, stroke: '#8C7A6B' }}
                      activeDot={{ r: 5 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard; 