import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotes } from '../context/NoteContext';
import { toast } from 'react-toastify';
import ScholarlyConfirm from './ScholarlyConfirm';
import EmptyIllus from '../assets/EmptyIllustration.png';

const AddNotebookForm = ({ subjectId, onClose }) => {
    const { addNotebook } = useNotes();
    const [title, setTitle] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title) return;
        addNotebook(subjectId, title);
        toast.success(`New Ledger "${title}" bound successfully!`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3C2A21]/40 backdrop-blur-sm p-4">
            <div className="bg-[#F4EFE6] border-2 border-[#3C2A21]/20 rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-[#5D2E2E] p-6 text-[#F4EFE6] flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-widest uppercase">New Notebook</h2>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 font-serif">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#8C7A6B] mb-2">Notebook Title</label>
                        <input
                            type="text"
                            autoFocus
                            required
                            className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-4 focus:outline-none focus:border-[#5D2E2E] transition-colors font-serif italic text-lg shadow-inner"
                            placeholder="e.g. Synthesis of Mercury"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-4 bg-[#5D2E2E] text-[#F4EFE6] font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-[#3C2A21] transition-all shadow-md active:scale-95 flex items-center justify-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                            Add Notebook
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Notebooks = () => {
    const { subjectId } = useParams();
    const { state, getNotebookStats, getNotebookLevelingData, getRelativeTime, updateNotebookStatus, deleteNotebook, availableStatuses } = useNotes();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [openStatusMenu, setOpenStatusMenu] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const subject = state.subjects[subjectId];
    const subjectName = subject ? subject.title : "THE SCHOLAR'S INDEX";

    const notebooks = subject
        ? subject.notebookIds
            .map(id => state.notebooks[id])
            .filter(Boolean)
            .filter(nb => nb.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        // It sits on top of our existing global white-parchment background
        <div className="w-full h-full flex flex-col font-serif text-[#3C2A21] box-border space-y-6">

            <div className="bg-gradient-to-br from-[#DCE4D7]/70 via-[#E8ECE1]/50 to-[#DCE4D7]/20 backdrop-blur-sm p-10 rounded-xl shadow-lg flex-1 overflow-y-auto custom-scrollbar border border-white/40">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-[#3C2A21]/20 pb-6 mb-8">
                    <div className="flex items-center gap-6">
                        <Link to="/notebooks" className="w-10 h-10 rounded-full bg-[#5D2E2E]/10 hover:bg-[#5D2E2E]/20 flex items-center justify-center text-[#5D2E2E] transition-colors border border-[#5D2E2E]/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-5xl font-bold tracking-tighter text-[#3C2A21] mb-1">{subjectName}</h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#8C7A6B] font-sub">
                                <span className="text-[#5D2E2E] mr-2 text-[0.75rem] font-sub">{notebooks.length} Active Notebooks</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap xl:flex-nowrap">
                        {/* Search Bar consistent with Subjects.jsx */}
                        <div className="relative group flex-1 xl:w-72">
                            <input
                                type="text"
                                placeholder="SEARCH NOTEBOOKS..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/40 border border-[#3C2A21]/10 rounded-sm py-4 pl-12 pr-4 focus:outline-none focus:border-[#5D2E2E] focus:bg-white/60 transition-all font-sans font-bold text-[0.65rem] uppercase tracking-[0.2em] placeholder:text-[#8C7A6B]/50 shadow-inner"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]/60 group-focus-within:text-[#5D2E2E]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </div>

                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="px-8 py-4 bg-[#5D2E2E] text-[#F4EFE6] hover:bg-[#3C2A21] transition-all duration-300 font-bold tracking-widest uppercase text-sm rounded-sm shadow-md hover:shadow-lg active:scale-95 flex items-center gap-3 border border-[#3C2A21]/20 whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                            Add Notebook
                        </button>
                    </div>
                </div>

                {/* Grid Content */}
                {notebooks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="relative">
                            <img 
                                src={EmptyIllus} 
                                alt="Empty Archives" 
                                className="w-64 h-64 object-contain opacity-40 grayscale sepia hover:grayscale-0 hover:sepia-0 hover:opacity-100 transition-all duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#DCE4D7] via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-serif font-bold text-[#5D2E2E] tracking-tight">Archives are Empty</h3>
                            <p className="text-[#8C7A6B] italic max-w-sm mx-auto text-lg leading-relaxed">No research journals have been bound to this subject yet. Start your inquiry by creating a new Ledger.</p>
                        </div>
                        <button 
                            onClick={() => setIsFormOpen(true)}
                            className="mt-4 px-10 py-3 border-2 border-[#5D2E2E]/30 text-[#5D2E2E] font-bold uppercase tracking-[0.3em] text-[0.6rem] rounded-sm hover:bg-[#5D2E2E] hover:text-[#F4EFE6] transition-all duration-500 shadow-sm"
                        >
                            Inscribe New Ledger
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10 pr-2">
                        {notebooks.map((nb, idx) => {
                            const stats = getNotebookStats(nb.id);
                            const lvlData = getNotebookLevelingData(nb.id);

                            const handleDelete = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toast.warn(
                                    <ScholarlyConfirm 
                                        title="Purge Journal?"
                                        message={`Are you certain you wish to permanently purge the journal "${nb.title}"? This action cannot be undone.`}
                                        actionLabel="Purge"
                                        onConfirm={() => {
                                            deleteNotebook(nb.id);
                                            toast.info(`The Journal "${nb.title}" has been purged.`);
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
                                <Link to={`/notebooks/${subjectId}/${nb.id}`} key={nb.id} className="relative flex flex-col justify-between border border-[#3C2A21]/[0.15] p-8 group cursor-pointer hover:bg-white/40 hover:shadow-xl transition-all duration-300 rounded-md no-underline text-[#3C2A21] bg-[#DCE4D7]/30 aspect-square overflow-hidden">

                                    {/* Level Badge */}
                                    <div className="absolute top-4 right-4 bg-[#5D2E2E] text-[#F4EFE6] px-2 py-1 rounded-sm text-[0.6rem] font-bold tracking-wider uppercase shadow-sm z-10 font-sub">
                                        LVL {lvlData.level}
                                    </div>

                                    <div className="relative z-0">
                                        <h3 className="text-2xl font-serif font-bold text-[#3C2A21] group-hover:text-[#5D2E2E] transition-colors mb-2 leading-tight pr-12">{nb.title}</h3>
                                    </div>

                                    <div className="mt-auto space-y-4 relative z-0">
                                        {/* XP Bar */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[0.55rem] font-bold uppercase tracking-widest text-[#8C7A6B] font-sub">
                                                <span>Knowledge Exp</span>
                                                <span>{Math.floor(lvlData.currentExp)} / {lvlData.nextLevelExp}</span>
                                            </div>
                                            <div className="w-full bg-[#3C2A21]/10 h-1.5 rounded-full overflow-hidden border border-[#3C2A21]/5 shadow-inner">
                                                <div
                                                    className="bg-emerald-800 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(6,78,59,0.3)]"
                                                    style={{ width: `${lvlData.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm font-serif text-[#3C2A21]/80 border-b border-[#3C2A21]/10 pb-2">
                                            <span>Last Edit:</span>
                                            <span>{getRelativeTime(nb.lastModified)}</span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            {/* Status & Delete Column */}
                                            <div className="flex flex-col gap-2 items-start">
                                                {/* Status Selector */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setOpenStatusMenu(openStatusMenu === nb.id ? null : nb.id);
                                                        }}
                                                        className={`px-3 py-1 text-[0.6rem] font-bold tracking-[0.2em] uppercase rounded-sm border transition-all duration-300 flex items-center gap-2
                                                            ${nb.status === 'Completed' ? 'bg-emerald-800/10 border-emerald-800/20 text-emerald-800' :
                                                                nb.status === 'Archived' ? 'bg-[#3C2A21]/10 border-[#3C2A21]/20 text-[#3C2A21]/70' :
                                                                    'bg-[#5D2E2E]/10 border-[#5D2E2E]/20 text-[#5D2E2E]'}`}
                                                    >
                                                        {nb.status || "In Progress"}
                                                        <svg className={`transition-transform duration-300 ${openStatusMenu === nb.id ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="8" height="8" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                                        </svg>
                                                    </button>

                                                    {openStatusMenu === nb.id && (
                                                        <div className="absolute bottom-full left-0 mb-2 z-20 w-32 bg-[#F4EFE6] border border-[#3C2A21]/20 rounded-sm shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                            {availableStatuses.map((s) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        updateNotebookStatus(nb.id, s);
                                                                        setOpenStatusMenu(null);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2 text-[0.55rem] font-bold uppercase tracking-widest transition-all hover:bg-[#3C2A21]/5 
                                                                        ${nb.status === s ? 'text-[#5D2E2E] bg-[#5D2E2E]/5' : 'text-[#8C7A6B]'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Small Delete Button Below Status */}
                                                <button
                                                    onClick={handleDelete}
                                                    className="flex items-center gap-1.5 text-[0.55rem] font-bold uppercase tracking-widest text-red-800/60 hover:text-red-700 transition-colors pl-1 active:scale-95"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                                    </svg>
                                                    Purge Journal
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-[#8C7A6B] mb-1 font-sub">Notes</div>
                                                <div className="text-4xl font-serif italic text-[#3C2A21] font-bold drop-shadow-sm group-hover:-translate-y-1 transition-transform leading-none text-right">
                                                    {stats.notesCount}
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Footer Link */}
                <div className="mt-4 text-center pb-8 border-t border-[#3C2A21]/10 pt-12 mx-2">
                    
                </div>
            </div>

            {/* Modal */}
            {isFormOpen && <AddNotebookForm subjectId={subjectId} onClose={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default Notebooks;
