import { Link, NavLink } from 'react-router-dom'
import { useTimer } from '../context/TimerContext'

const Navbar = () => {
  const { timeLeft, isActive, startTimer, pauseTimer, resetTimer, formatTime } = useTimer();
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Notebooks", path: "/notebooks" },
    { name: "Scriptorium Chat", path: "/chat" },
    { name: "Settings", path: "/settings" },
  ]

  return (
    <nav className="w-[17vw] fixed left-6 top-6 bottom-6 bg-[url('/src/assets/leather-texture-background.jpg')] bg-cover bg-center shadow-2xl shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] border border-stone-900/40 rounded-sm flex flex-col z-50 overflow-hidden">
      <div className="p-8 text-stone-200 flex items-center justify-center border-b border-black/10">
        <h2 className="text-3xl font-serif font-bold tracking-widest uppercase text-white shadow-sm">MagNotes Archive</h2>
      </div>
      
      <ul className="flex-grow py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <li key={item.path} className="group">
            <NavLink 
              to={item.path} 
              className={({ isActive }) => `flex items-center px-8 py-4 transition-all duration-300 tracking-wide border-l-4 ${
                isActive 
                  ? "text-white bg-white/10 border-white/60" 
                  : "text-stone-400 hover:text-white hover:bg-white/5 border-transparent"
              }`}
            >
              <span className="opacity-60 transition-opacity mr-3 font-serif">◈</span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto p-8 border-t border-black/10 bg-black/20 text-center">
        <div className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-stone-500 mb-2 font-sub">Focus Remaining</div>
        <div className="text-3xl font-serif text-white/90 font-light tracking-widest drop-shadow-md">
          {formatTime(timeLeft)}
        </div>
        <div className="mt-4 flex justify-center gap-4">
          <button 
            onClick={isActive ? pauseTimer : startTimer}
            className="text-stone-400 hover:text-white transition-colors"
          >
            {isActive ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
              </svg>
            )}
          </button>
          <button 
            onClick={resetTimer}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
