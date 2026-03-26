import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotes } from '../context/NoteContext';
import { toast } from 'react-toastify';
import ScholarlyConfirm from './ScholarlyConfirm';

const TaskCard = ({ task, onToggle, onDelete, onToggleObjective, onDeleteObjective, onToggleRevision, state }) => {
    return (
        <div className={`bg-[#F4EFE6]/40 border border-[#3C2A21]/10 rounded-xl p-8 shadow-inner transition-all group relative animate-in fade-in slide-in-from-bottom-2 duration-500 mb-8 ${task.isComplete ? 'opacity-70 grayscale-[0.3]' : ''}`}>
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4 flex-1">
                    <input 
                        type="checkbox" 
                        checked={task.isComplete} 
                        onChange={() => onToggle(task.id)}
                        className="mt-1.5 w-5 h-5 border-2 border-[#5D2E2E] rounded-sm bg-transparent cursor-pointer accent-[#5D2E2E]" 
                    />
                    <div>
                        <h4 className={`text-xl font-serif font-bold transition-all ${task.isComplete ? 'line-through text-[#8C7A6B]' : 'text-[#3C2A21]'}`}>
                            {task.title}
                        </h4>
                        {task.deadline && !task.isComplete && (
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[#8C7A6B] mt-1 block font-sub">
                                Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                        )}
                        {task.isComplete && task.revisionDate && (
                            <div className="flex items-center gap-3 mt-2">
                                <span className="text-[0.6rem] font-bold uppercase tracking-widest text-emerald-800/70 block">
                                    Revision Solstice: {new Date(task.revisionDate).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-800/5 border border-emerald-800/10 rounded-full">
                                    <input 
                                        type="checkbox" 
                                        checked={task.isRevisionComplete}
                                        onChange={() => onToggleRevision(task.id)}
                                        className="w-3.5 h-3.5 accent-emerald-800 cursor-pointer"
                                    />
                                    <span className="text-[0.5rem] font-black uppercase tracking-tighter text-emerald-800">Revised</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest font-sub ${task.difficulty > 7 ? 'bg-red-900/10 text-red-900' : 'bg-[#5D2E2E]/10 text-[#5D2E2E]'}`}>
                        LVL {task.difficulty}
                    </span>
                    <button 
                        onClick={() => {
                            toast.warn(
                                <ScholarlyConfirm 
                                    title="Relinquish Mandate?"
                                    message={`Are you certain you wish to purge the mandate "${task.title}"? This cannot be undone.`}
                                    actionLabel="Relinquish"
                                    onConfirm={() => {
                                        onDelete(task.id);
                                        toast.info("Mandate relinquished.");
                                    }}
                                />,
                                { position: "bottom-center", autoClose: false, closeOnClick: false, draggable: false, icon: false }
                            );
                        }}
                        className="text-[#8C7A6B]/40 hover:text-red-800 transition-colors p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Objectives / Milestones */}
            <div className="space-y-4 pl-9">
                {task.objectiveIds && task.objectiveIds.map((objId) => {
                    const obj = state.objectives[objId];
                    if (!obj) return null;
                    return (
                        <div key={objId} className="flex items-center justify-between group/obj">
                            <div className="flex items-center gap-4 flex-1">
                                <input 
                                    type="checkbox" 
                                    checked={obj.isDone} 
                                    onChange={() => onToggleObjective(objId)}
                                    className="w-4 h-4 border border-[#8C7A6B] rounded-full bg-transparent cursor-pointer accent-emerald-800" 
                                />
                                <span className={`text-[0.8rem] font-serif font-medium tracking-wide transition-all ${obj.isDone ? 'line-through text-[#8C7A6B]/50 italic' : 'text-[#3C2A21]'}`}>
                                    {obj.text}
                                </span>
                            </div>
                            <button 
                                onClick={() => onDeleteObjective(task.id, objId)}
                                className="opacity-0 group-hover/obj:opacity-100 text-[#8C7A6B]/30 hover:text-red-800 transition-all p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const NoteCard = ({ note, onDelete }) => {
    return (
        <div className="bg-[#F4EFE6]/60 border border-[#3C2A21]/10 rounded-sm p-6 shadow-sm hover:shadow-md transition-all group animate-in fade-in slide-in-from-right-4 duration-500 mb-6 cursor-pointer relative">
            <Link to={`/notes/${note.id}`} className="block">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-serif font-bold text-[#5D2E2E] tracking-tight group-hover:underline underline-offset-4">{note.title}</h4>
                    <div className="flex items-center gap-3">
                        <span className="text-[0.55rem] font-bold uppercase tracking-widest text-[#8C7A6B] opacity-60">
                            {new Date(note.lastUpdated || note.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <p className="text-[#3C2A21] text-sm font-serif leading-relaxed line-clamp-4 whitespace-pre-wrap italic">
                    {note.content}
                </p>
            </Link>
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.warn(
                        <ScholarlyConfirm 
                            title="Purge Research?"
                            message={`Are you certain you wish to permanently erase the note "${note.title}" from the archives?`}
                            actionLabel="Purge"
                            onConfirm={() => {
                                onDelete(note.id);
                                toast.info("Research purged.");
                            }}
                        />,
                        { position: "bottom-center", autoClose: false, closeOnClick: false, draggable: false, icon: false }
                    );
                }}
                className="absolute top-6 right-6 text-[#8C7A6B]/40 hover:text-red-800 transition-colors p-1 z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
            </button>
        </div>
    );
};

const TaskBoardandNotes = () => {
    const { subjectId, notebookId } = useParams();
    const { 
        state, 
        addTask, 
        deleteTask, 
        toggleTask, 
        toggleObjective, 
        deleteObjective,
        addNote,
        deleteNote,
        toggleTaskRevision,
        getNotebookLevelingData
    } = useNotes();

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [noteDraft, setNoteDraft] = useState({ title: '', content: '' });
    
    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [taskSort, setTaskSort] = useState("difficulty-desc"); // difficulty-desc, difficulty-asc, deadline-soon
    const [noteSort, setNoteSort] = useState("newest"); // newest, oldest, alpha

    // Task Form State
    const [taskDraft, setTaskDraft] = useState({ title: '', deadline: '', difficulty: 3 });
    const [objectives, setObjectives] = useState([]);
    const [currentObj, setCurrentObj] = useState("");

    // Filter and Sort Logic
    const notebook = state.notebooks[notebookId];
    const subject = state.subjects[subjectId];
    const lvlData = getNotebookLevelingData(notebookId);

    if (!notebook || !subject) {
        return (
            <div className="flex-1 flex items-center justify-center p-20 text-stone-500 italic font-serif">
                The requested ledger could not be retrieved from the archives.
            </div>
        );
    }

    // Process Tasks
    const notebookTasks = Object.values(state.tasks)
        .filter(task => task.notebookId === notebookId)
        .filter(task => {
            const query = searchQuery.toLowerCase();
            const matchesTitle = task.title.toLowerCase().includes(query);
            const matchesObjectives = (task.objectiveIds || []).some(id => 
                state.objectives[id]?.text.toLowerCase().includes(query)
            );
            return matchesTitle || matchesObjectives;
        });

    const sortTasks = (tasks) => {
        return [...tasks].sort((a, b) => {
            if (taskSort === "difficulty-desc") return b.difficulty - a.difficulty;
            if (taskSort === "difficulty-asc") return a.difficulty - b.difficulty;
            if (taskSort === "deadline-soon") {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            }
            return 0;
        });
    };

    const activeTasks = sortTasks(notebookTasks.filter(t => !t.isComplete));
    const accomplishedTasks = sortTasks(notebookTasks.filter(t => t.isComplete));

    // Process Notes
    const notebookNotes = Object.values(state.notes)
        .filter(note => note.notebookId === notebookId)
        .filter(note => {
            const query = searchQuery.toLowerCase();
            return note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
        })
        .sort((a, b) => {
            if (noteSort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (noteSort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (noteSort === "alpha") return a.title.localeCompare(b.title);
            return 0;
        });

    const handleSaveNote = (e) => {
        e.preventDefault();
        if (!noteDraft.title || !noteDraft.content) return;
        addNote(notebookId, noteDraft.title, noteDraft.content);
        setNoteDraft({ title: '', content: '' });
        setIsNoteModalOpen(false);
        toast.success("Research memorialized.");
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!taskDraft.title) return;
        
        const finalObjectives = [...objectives];
        if (currentObj.trim()) finalObjectives.push(currentObj.trim());

        addTask(notebookId, {
            ...taskDraft,
            objectives: finalObjectives
        });

        setTaskDraft({ title: '', deadline: '', difficulty: 3 });
        setObjectives([]);
        setCurrentObj("");
        setIsTaskModalOpen(false);
        toast.success("New mandate active.");
    };

    const confirmObjective = () => {
        if (!currentObj.trim()) return;
        setObjectives([...objectives, currentObj.trim()]);
        setCurrentObj("");
    };

    return (
        <div className="w-full h-full flex flex-col font-serif text-[#3C2A21] box-border space-y-6 overflow-hidden">
            <div className="bg-gradient-to-br from-[#DCE4D7]/70 via-[#E8ECE1]/50 to-[#DCE4D7]/20 backdrop-blur-sm p-8 rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden border border-white/40">
                
                {/* Header Section */}
                <div className="flex justify-between items-center border-b border-[#3C2A21]/20 pb-6 mb-8 shrink-0">
                    <div className="flex items-center gap-6">
                        <Link to={`/notebooks/${subjectId}`} className="w-10 h-10 rounded-full bg-[#5D2E2E]/10 hover:bg-[#5D2E2E]/20 flex items-center justify-center text-[#5D2E2E] transition-colors border border-[#5D2E2E]/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                            </svg>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <Link to="/notebooks" className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#8C7A6B] hover:text-[#5D2E2E] transition-colors">Scholar's Index</Link>
                                <span className="text-[#3C2A21]/20 text-xs">/</span>
                                <Link to={`/notebooks/${subjectId}`} className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#8C7A6B] hover:text-[#5D2E2E] transition-colors font-sub">{subject.title}</Link>
                                <span className="text-[#3C2A21]/20 text-xs">/</span>
                                <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-[#5D2E2E] font-sub">Level {lvlData.level}</span>
                            </div>
                            <h1 className="text-4xl font-serif font-black tracking-tight text-[#3C2A21] uppercase drop-shadow-sm">{notebook.title}</h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-end min-w-[200px] justify-center">
                        <div className="w-full space-y-1.5">
                            <div className="flex justify-between text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#8C7A6B] font-sub">
                                <span>Knowledge Exp</span>
                                <span>{Math.floor(lvlData.currentExp)} / {lvlData.nextLevelExp}</span>
                            </div>
                            <div className="w-full bg-[#3C2A21]/10 h-2 rounded-full overflow-hidden border border-[#3C2A21]/5 shadow-inner relative group/xp">
                                <div
                                    className="bg-emerald-800 h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(6,78,59,0.4)]"
                                    style={{ width: `${lvlData.progress}%` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/xp:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Unified Search Bar */}
                <div className="px-4 mb-4">
                    <div className="relative group max-w-2xl mx-auto">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]/50 group-focus-within:text-[#5D2E2E] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search the scholarly archives..."
                            className="w-full bg-[#F4EFE6]/60 border border-[#3C2A21]/10 rounded-full py-3 pl-12 pr-4 text-sm font-serif italic focus:outline-none focus:border-[#5D2E2E] focus:bg-[#F4EFE6] transition-all shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7A6B]/50 hover:text-[#5D2E2E] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Shared Content Area (Tasks + Notes) */}
                <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-16 py-4">
                        
                        {/* LEFT COLUMN: TASKS */}
                        <div className="space-y-12 animate-in fade-in slide-in-from-left-6 duration-700">
                            <div className="flex items-center justify-between border-b border-[#3C2A21]/15 pb-5">
                                <h2 className="text-2xl font-serif font-black tracking-[0.2em] text-[#5D2E2E] uppercase flex items-center gap-4">
                                    <span className="w-10 h-px bg-[#5D2E2E]/30"></span>
                                    TASKS
                                </h2>
                                <div className="flex items-center gap-4">
                                    <select 
                                        value={taskSort}
                                        onChange={(e) => setTaskSort(e.target.value)}
                                        className="bg-transparent border-none text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#8C7A6B] focus:outline-none cursor-pointer hover:text-[#5D2E2E] transition-colors text-right"
                                    >
                                        <option value="difficulty-desc">Lv ↓</option>
                                        <option value="difficulty-asc">Lv ↑</option>
                                        <option value="deadline-soon">Soon</option>
                                    </select>
                                    <div className="w-px h-4 bg-[#3C2A21]/10"></div>
                                    <span className="text-[0.6rem] font-black text-[#8C7A6B]/60 uppercase tracking-[0.2em]">
                                        {accomplishedTasks.length}/{notebookTasks.length}
                                    </span>
                                    <button 
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="text-[0.6rem] font-black text-[#5D2E2E] uppercase tracking-[0.2em] hover:text-[#3C2A21] transition-colors flex items-center gap-1 border border-[#5D2E2E]/20 px-2 py-1 rounded-sm bg-[#5D2E2E]/5"
                                    >
                                        + ADD
                                    </button>
                                </div>
                            </div>

                            {/* Active Mandates */}
                            <div className="space-y-6">
                                <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.4em] text-[#8C7A6B] flex items-center gap-3 mb-6">
                                    Active Mandates
                                    <div className="flex-1 h-px bg-[#3C2A21]/5"></div>
                                </h3>
                                {activeTasks.length === 0 ? (
                                    <div className="py-12 text-center font-serif text-[#8C7A6B]/30 italic text-sm border-2 border-dashed border-[#3C2A21]/5 rounded-xl">
                                        {searchQuery ? "No matching mandates found." : "All current mandates have been fulfilled."}
                                    </div>
                                ) : (
                                    activeTasks.map(task => (
                                        <TaskCard 
                                            key={task.id} 
                                            task={task} 
                                            onToggle={toggleTask}
                                            onDelete={deleteTask}
                                            onToggleObjective={toggleObjective}
                                            onDeleteObjective={deleteObjective}
                                            onToggleRevision={toggleTaskRevision}
                                            state={state}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Accomplished Deeds */}
                            {accomplishedTasks.length > 0 && (
                                <div className="space-y-6 pt-8">
                                    <h3 className="text-[0.6rem] font-bold uppercase tracking-[0.4em] text-emerald-800 flex items-center gap-3 mb-6">
                                        Accomplished Deeds
                                        <div className="flex-1 h-px bg-[#3C2A21]/5"></div>
                                    </h3>
                                    <div className="space-y-4">
                                        {accomplishedTasks.map(task => (
                                            <TaskCard 
                                                key={task.id} 
                                                task={task} 
                                                onToggle={toggleTask}
                                                onDelete={deleteTask}
                                                onToggleObjective={toggleObjective}
                                                onDeleteObjective={deleteObjective}
                                                state={state}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: NOTES */}
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-700 border-l border-[#3C2A21]/10 pl-0 xl:pl-16">
                            <div className="flex items-center justify-between border-b border-[#3C2A21]/15 pb-5">
                                <h2 className="text-2xl font-serif font-black tracking-[0.2em] text-[#5D2E2E] uppercase flex items-center gap-4">
                                    <span className="w-10 h-px bg-[#5D2E2E]/30"></span>
                                    Notes
                                </h2>
                                <div className="flex items-center gap-4">
                                    <select 
                                        value={noteSort}
                                        onChange={(e) => setNoteSort(e.target.value)}
                                        className="bg-transparent border-none text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#8C7A6B] focus:outline-none cursor-pointer hover:text-[#5D2E2E] transition-colors text-right"
                                    >
                                        <option value="newest">Recent</option>
                                        <option value="oldest">Ancient</option>
                                        <option value="alpha">A-Z</option>
                                    </select>
                                    <div className="w-px h-4 bg-[#3C2A21]/10"></div>
                                    <button 
                                        onClick={() => setIsNoteModalOpen(true)}
                                        className="text-[0.6rem] font-black text-[#5D2E2E] uppercase tracking-[0.2em] hover:text-[#3C2A21] transition-colors flex items-center gap-1 border border-[#5D2E2E]/20 px-2 py-1 rounded-sm bg-[#5D2E2E]/5"
                                    >
                                        + ADD
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {notebookNotes.length === 0 ? (
                                    <div className="py-20 text-center font-serif text-[#8C7A6B]/40 italic text-lg border-2 border-dashed border-[#3C2A21]/5 rounded-xl">
                                        {searchQuery ? "No scholarly records match your query." : "The research archive is currently vacant."}
                                    </div>
                                ) : (
                                    notebookNotes.map(note => (
                                        <NoteCard 
                                            key={note.id} 
                                            note={note} 
                                            onDelete={deleteNote}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Note Entry Modal */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3C2A21]/40 backdrop-blur-sm p-4">
                    <div className="bg-[#F4EFE6] border-2 border-[#3C2A21]/20 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in duration-300">
                        <div className="bg-[#5D2E2E] p-6 text-[#F4EFE6] flex justify-between items-center">
                            <h2 className="text-xl font-serif font-black tracking-widest uppercase">Inscribe Memorial</h2>
                            <button onClick={() => setIsNoteModalOpen(false)} className="hover:rotate-90 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveNote} className="p-8 space-y-6 font-serif">
                            <div>
                                <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-2">Entry Heading</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-4 text-xl font-bold italic focus:outline-none focus:border-[#5D2E2E] transition-colors"
                                    placeholder="The Nature of the Discovery..."
                                    value={noteDraft.title}
                                    onChange={e => setNoteDraft({...noteDraft, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-2">Detailed Observations</label>
                                <textarea 
                                    rows="8"
                                    required
                                    className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-4 text-sm font-serif leading-relaxed focus:outline-none focus:border-[#5D2E2E] transition-colors resize-none"
                                    placeholder="Memorialize your findings here..."
                                    value={noteDraft.content}
                                    onChange={e => setNoteDraft({...noteDraft, content: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="px-12 py-3 bg-[#5D2E2E] text-[#F4EFE6] font-bold uppercase tracking-widest text-[0.7rem] rounded-sm hover:bg-[#3C2A21] transition-all shadow-md active:scale-95">
                                    Seal in Archive
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Task Entry Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3C2A21]/40 backdrop-blur-sm p-4">
                    <div className="bg-[#F4EFE6] border-2 border-[#3C2A21]/20 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in duration-300">
                        <div className="bg-[#5D2E2E] p-6 text-[#F4EFE6] flex justify-between items-center">
                            <h2 className="text-xl font-serif font-black tracking-widest uppercase">Ordain New Task</h2>
                            <button onClick={() => setIsTaskModalOpen(false)} className="hover:rotate-90 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddTask} className="p-8 space-y-6 font-serif">
                            {/* Title */}
                            <div>
                                <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-2">Mandate Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-4 text-xl font-bold italic focus:outline-none focus:border-[#5D2E2E] transition-colors"
                                    placeholder="Task Title..."
                                    value={taskDraft.title}
                                    onChange={e => setTaskDraft({...taskDraft, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Deadline */}
                                <div>
                                    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-2">Deadline</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-3 text-sm focus:outline-none focus:border-[#5D2E2E] transition-colors"
                                        value={taskDraft.deadline}
                                        onChange={e => setTaskDraft({...taskDraft, deadline: e.target.value})}
                                    />
                                </div>

                                {/* Difficulty Slider */}
                                <div>
                                    <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-2">Difficulty: {taskDraft.difficulty}</label>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="10"
                                        className="w-full h-1.5 bg-[#3C2A21]/10 rounded-lg appearance-none cursor-pointer accent-[#5D2E2E] mt-3"
                                        value={taskDraft.difficulty}
                                        onChange={e => setTaskDraft({...taskDraft, difficulty: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>

                            {/* Dynamic Objectives Header */}
                            <div className="pt-2">
                                <label className="block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#8C7A6B] mb-4">Milestones & Objectives</label>
                                
                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar mb-4 pr-2">
                                    {objectives.map((obj, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-[#5D2E2E]/5 p-3 rounded-sm border border-[#5D2E2E]/10 animate-in slide-in-from-left-2 duration-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#5D2E2E]/40 shrink-0"></div>
                                            <span className="text-xs text-[#3C2A21]">{obj}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Dynamic Input Field with + Icon on LEFT */}
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5D2E2E]/40 group-focus-within:text-[#5D2E2E] transition-colors">
                                        <button 
                                            type="button"
                                            onClick={confirmObjective}
                                            className="hover:scale-125 transition-transform"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                            </svg>
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Add specific objective..."
                                        value={currentObj}
                                        onChange={e => setCurrentObj(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                confirmObjective();
                                            }
                                        }}
                                        className="w-full bg-white/50 border border-[#3C2A21]/10 rounded-sm p-4 pl-12 text-sm italic focus:outline-none focus:border-[#5D2E2E] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="px-12 py-3 bg-[#5D2E2E] text-[#F4EFE6] font-bold uppercase tracking-widest text-[0.7rem] rounded-sm hover:bg-[#3C2A21] transition-all shadow-md active:scale-95">
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskBoardandNotes;
