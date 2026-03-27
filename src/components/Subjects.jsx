import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotes } from '../context/NoteContext.jsx';
import ScholarlyDropdown from './ScholarlyDropdown';
import { toast } from 'react-toastify';
import ScholarlyConfirm from './ScholarlyConfirm';

// Import Tile Assets
import TileBrown from '../assets/Tiles/LeatherCard.png';
import TileBlack from '../assets/Tiles/LeatherCard_Black.png';
import TileBlue from '../assets/Tiles/LeatherCard_Blue.png';
import TileGreen from '../assets/Tiles/LeatherCard_Green.png';
import TilePink from '../assets/Tiles/LeatherCard_Pink.png';
import TilePurple from '../assets/Tiles/LeatherCard_Purple.png';
import TileRed from '../assets/Tiles/LeatherCard_Red.png';
import TileWhite from '../assets/Tiles/LeatherCard_White.png';
import EmptyIllus from '../assets/EmptyIllustration.png';

const colorData = {
  Brown: { hex: "#5D2E2E", tile: TileBrown },
  Black: { hex: "#1C1917", tile: TileBlack },
  Blue: { hex: "#1E3A8A", tile: TileBlue },
  Green: { hex: "#14532D", tile: TileGreen },
  Pink: { hex: "#BE185D", tile: TilePink },
  Purple: { hex: "#4C1D95", tile: TilePurple },
  Red: { hex: "#7F1D1D", tile: TileRed },
  White: { hex: "#A8A29E", tile: TileWhite },
};

const SubjectCard = ({ id, title, courseCode, colorName, lastModified }) => {
  const { getSubjectStats, getRelativeTime, deleteSubject } = useNotes();
  const stats = getSubjectStats(id);
  const colorInfo = colorData[colorName] || colorData.Brown;
  
  // Define if the leather is light-colored to adjust ink contrast
  const isLight = colorName === "Pink" || colorName === "White";
  const textColor = isLight ? "#2D1B14" : "#F4EFE6";
  const subTextColor = isLight ? "#3C2A21" : "rgba(244, 239, 230, 0.9)";
  
  // Vignette style for text clarity
  const vignetteStyle = {
    background: isLight 
      ? "radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 85%)"
      : "radial-gradient(circle, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 85%)"
  };

    const handleDelete = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toast.warn(
        <ScholarlyConfirm 
          title="Dispose Ledger?"
          message={`Are you certain you wish to permanently purge the Subject Ledger "${title}"? All internal notebooks and tasks will be erased.`}
          actionLabel="Dispose"
          onConfirm={() => {
            deleteSubject(id);
            toast.info(`The Subject "${title}" has been deleted.`);
          }} 
        />,
        {
          position: "bottom-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          icon: false
        }
      );
    };

  return (
    <div 
      className="relative rounded-md overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-[#3C2A21]/[0.2] aspect-square flex flex-col justify-between p-4"
      style={{ backgroundColor: colorInfo.hex }}
    >
      {/* Background Texture Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${colorInfo.tile})` }}
      />

      {/* Content */}
      <div className="relative z-20 flex justify-between items-start px-2 pt-2">
        <div 
          className="bg-[#F4EFE6] border border-[#3C2A21]/10 px-2.5 py-1 rounded-sm text-[0.65rem] font-black tracking-widest uppercase shadow-sm"
          style={{ color: isLight ? "#3C2A21" : colorInfo.hex }}
        >
          {courseCode || "N/A"}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-current/10 ${isLight ? 'text-[#3C2A21] bg-white/20' : 'text-[#F4EFE6] bg-[#F4EFE6]/10'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>
        </div>
      </div>

      {/* Center content with radial vignette - tightened with max-w to respect stitching */}
      <div className="relative z-20 my-auto flex flex-col items-center text-center transform transition-transform duration-500 group-hover:-translate-y-5 py-8 px-10 mx-auto max-w-[85%]" style={vignetteStyle}>
        <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight mb-4 drop-shadow-sm" style={{ color: textColor }}>
          {title}
        </h3>
        
        <div className="flex flex-col items-center text-[0.65rem] font-sans tracking-widest uppercase font-black space-y-1.5" style={{ color: subTextColor }}>
          <span className="opacity-90">{stats.notebooksCount} Notebooks Created</span>
          <span className="opacity-90">{stats.tasksCompleted}/{stats.tasksTotal} Tasks Completed</span>
          <div className={`pt-2 mt-2 border-t w-16 ${isLight ? 'border-[#3C2A21]/20' : 'border-[#F4EFE6]/30'}`}></div>
          <span className="text-[0.55rem] tracking-[0.2em] font-extrabold uppercase opacity-80 scale-90 origin-center truncate w-full">Last Active: {getRelativeTime(lastModified)}</span>
        </div>
      </div>

      {/* Hover action: Delete Ledger */}
      <div className="relative z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 px-4 pb-2">
        <button 
          onClick={handleDelete}
          className={`w-full py-1.5 text-[0.55rem] font-bold tracking-[0.3em] uppercase rounded-sm border transition-all active:scale-95 flex items-center justify-center gap-2 ${isLight ? 'bg-red-500/10 border-red-500/20 text-red-700 hover:bg-red-500/20' : 'bg-red-900/40 border-red-500/20 text-red-200 hover:bg-red-900/60'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
          Dispose Ledger
        </button>
      </div>

    </div>
  );
};

const AddSubjectForm = ({ onClose }) => {
  const { addSubject } = useNotes();
  const [formData, setFormData] = useState({
    title: '',
    courseCode: '',
    color: 'Brown'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;
    addSubject(formData.title, formData.courseCode, formData.color);
    toast.success(`Successfully added "${formData.title}" to archives!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3C2A21]/40 backdrop-blur-sm p-4">
      <div className="bg-[#F4EFE6] border-2 border-[#3C2A21]/20 rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="bg-[#5D2E2E] p-6 text-[#F4EFE6] flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-widest uppercase">New Subject Ledger</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 font-serif">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2">Subject Title</label>
            <input 
              type="text" 
              required
              className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-3 focus:outline-none focus:border-[#5D2E2E] transition-colors"
              placeholder="e.g. Metaphysical Studies"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2">Course Code</label>
            <input 
              type="text" 
              className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-3 focus:outline-none focus:border-[#5D2E2E] transition-colors"
              placeholder="e.g. ARCH-101"
              value={formData.courseCode}
              onChange={e => setFormData({...formData, courseCode: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2">Cover Texture</label>
            <div className="grid grid-cols-4 gap-3">
              {Object.keys(colorData).map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`h-10 rounded-sm border-2 transition-all ${formData.color === color ? 'border-[#5D2E2E] scale-110 shadow-md' : 'border-transparent'}`}
                  style={{ backgroundColor: colorData[color].hex }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-[#5D2E2E] text-[#F4EFE6] font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-[#3C2A21] transition-all shadow-md active:scale-95">
              Append to Archives
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Subjects = () => {
  const { state, getSubjectStats } = useNotes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("recency");
  const basePanel = "bg-[#F4EFE6]/[0.85] backdrop-blur-sm border border-[#3C2A21]/[0.1] rounded-md p-8 shadow-lg transition-all duration-500";

  // Debouncing Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 100);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Sorting Logic
  const getSortedSubjects = () => {
    let subjects = Object.values(state.subjects).filter(s => 
      s.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      s.courseCode.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    return subjects.sort((a, b) => {
      const statsA = getSubjectStats(a.id);
      const statsB = getSubjectStats(b.id);

      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title);
        case "notebooks":
          return statsB.notebooksCount - statsA.notebooksCount;
        case "completed":
          return statsB.tasksCompleted - statsA.tasksCompleted;
        case "total":
          return statsB.tasksTotal - statsA.tasksTotal;
        case "recency":
        default:
          return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col font-serif text-[#3C2A21] box-border space-y-8">
      
      {/* Header Section */}
      <div className={`${basePanel} relative z-[60] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shrink-0`}>
        <div className="min-w-fit">
          <h1 className="text-4xl font-bold tracking-tight text-[#5D2E2E] mb-2">Your Subjects</h1>
          <p className="text-[#8C7A6B] text-lg italic">Select a subject to review your notebooks and tasks.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
          {/* Search Box - Expanded for better scholarly discovery */}
          <div className="relative group xl:w-[480px] flex-grow">
            <input 
              type="text" 
              placeholder="Search scholarly subjects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/40 border border-[#3C2A21]/10 rounded-sm py-4 pl-12 pr-4 focus:outline-none focus:border-[#5D2E2E] focus:bg-white/60 transition-all font-sans font-bold text-xs uppercase tracking-widest placeholder:text-[#8C7A6B]/50 shadow-inner"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]/60 group-focus-within:text-[#5D2E2E]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </div>

          {/* Unified Scholarly Sort Dropdown - Refined width */}
          <ScholarlyDropdown 
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "recency", label: "Last Active" },
              { value: "name", label: "Subject Name" },
              { value: "notebooks", label: "Notebook Count" },
              { value: "completed", label: "Tasks Completed" },
              { value: "total", label: "Total Tasks" }
            ]}
            minWidth="180px"
          />

          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-8 py-4 bg-[#5D2E2E] text-[#F4EFE6] hover:bg-[#3C2A21] transition-all duration-300 font-bold tracking-widest uppercase text-sm rounded-sm shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-3 whitespace-nowrap min-w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            New Subject
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className={`${basePanel} flex-1 overflow-y-auto custom-scrollbar`}>
        {getSortedSubjects().length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="relative">
              <img 
                src={EmptyIllus} 
                alt="Empty Archives" 
                className="w-64 h-64 object-contain opacity-40 grayscale sepia hover:grayscale-0 hover:sepia-0 hover:opacity-100 transition-all duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F4EFE6] via-transparent to-transparent opacity-60"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-serif font-bold text-[#5D2E2E] tracking-tight">The Archives are Vacant</h3>
              <p className="text-[#8C7A6B] italic max-w-sm mx-auto text-lg leading-relaxed"> No ledgers have been bound to this section of the library yet. Begin your scholarship by adding a new Subject.</p>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="mt-4 px-10 py-3 border-2 border-[#5D2E2E]/30 text-[#5D2E2E] font-bold uppercase tracking-[0.3em] text-[0.6rem] rounded-sm hover:bg-[#5D2E2E] hover:text-[#F4EFE6] transition-all duration-500 shadow-sm"
            >
              Inscribe New Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-4">
            {getSortedSubjects().map((subject) => (
              <Link 
                to={`/notebooks/${subject.id}`} 
                key={subject.id} 
                className="block no-underline"
              >
                <SubjectCard 
                  id={subject.id}
                  title={subject.title}
                  courseCode={subject.courseCode}
                  colorName={subject.color}
                  lastModified={subject.lastModified}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && <AddSubjectForm onClose={() => setIsFormOpen(false)} />}

    </div>
  );
};

export default Subjects;
