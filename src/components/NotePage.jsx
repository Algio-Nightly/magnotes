import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes } from '../context/NoteContext';
import { useAI } from '../context/AIContext';
import { toast } from 'react-toastify';
import ScholarlySpinner from './ScholarlySpinner';
import ScholarlyConfirm from './ScholarlyConfirm';

const NotePage = () => {
    const { noteId } = useParams();
    const navigate = useNavigate();
    const titleRef = useRef(null);
    const { state, updateNote, deleteNote } = useNotes();

    const [noteData, setNoteData] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState('preview');

    // AI Scribe Hub States
    const { refineNoteAI } = useAI();
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiOption, setAiOption] = useState('generate');
    const [isAILoading, setIsAILoading] = useState(false);
    const [history, setHistory] = useState([]); // Undo Vault

    const note = state.notes[noteId];

    useEffect(() => {
        if (note) {
            setNoteData({ title: note.title || '', content: note.content || '' });
        }
    }, [note]);

    // Dedicated auto-resize effect for the title
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
    }, [noteData.title]);

    if (!note) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 font-serif text-[#8C7A6B] italic">
                <div className="text-6xl mb-8 opacity-20">📜</div>
                <p>This scroll appears to be missing from the archives.</p>
                <Link to="/" className="mt-8 text-sm font-bold uppercase tracking-widest text-[#5D2E2E] hover:underline underline-offset-8 transition-all">Return to Dashboard</Link>
            </div>
        );
    }

    const handleAutoSave = (updates) => {
        setIsSaving(true);
        updateNote(noteId, updates);
        setTimeout(() => setIsSaving(false), 1000);
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setNoteData(prev => ({ ...prev, title: newTitle }));
        handleAutoSave({ title: newTitle });
    };

    const handleContentChange = (e) => {
        const newContent = e.target.value;
        setNoteData(prev => ({ ...prev, content: newContent }));
        handleAutoSave({ content: newContent });
    };

    const handleAIAction = async () => {
        if (!aiPrompt.trim() && aiOption !== 'summarize') {
            toast.warn("Please provide a prompt for the AI Scribe.");
            return;
        }

        setIsAILoading(true);
        try {
            // Save to Undo Vault before destructive actions
            if (aiOption === 'summarize' || aiOption === 'transcript') {
                setHistory(prev => [noteData.content, ...prev].slice(0, 5));
            }

            const result = await refineNoteAI(aiPrompt, noteData.content, aiOption);

            let finalContent = '';
            if (aiOption === 'generate') {
                finalContent = noteData.content + "\n\n" + result;
                toast.success("Manuscript extended.");
            } else if (aiOption === 'summarize') {
                finalContent = result;
                toast.success("Content distilled.");
            } else if (aiOption === 'transcript') {
                finalContent = noteData.content + "\n\n---\n\n" + result;
                toast.success("Transcript memorialized.");
            }

            setNoteData(prev => ({ ...prev, content: finalContent }));
            handleAutoSave({ content: finalContent });
            setAiPrompt('');
        } catch (error) {
            toast.error(`The AI Scribe encountered an error: ${error.message}`);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previousState = history[0];
        setNoteData(prev => ({ ...prev, content: previousState }));
        handleAutoSave({ content: previousState });
        setHistory(prev => prev.slice(1));
        toast.info("Previous archival state restored.");
    };

    const handleDispose = () => {
        toast.warn(
            <ScholarlyConfirm 
                title="Archival Disposal?"
                message="Are you certain you wish to permanently remove this entry from the active scriptorium? This action cannot be reversed."
                actionLabel="Dispose"
                onConfirm={() => {
                    const note = state.notes[noteId];
                    const notebookId = note?.notebookId;
                    const subjectId = state.notebooks[notebookId]?.subjectId;
                    
                    deleteNote(noteId);
                    
                    if (subjectId && notebookId) {
                        navigate(`/notebooks/${subjectId}/${notebookId}`);
                    } else {
                        navigate('/notebooks');
                    }
                    toast.info("Entry purged from active records.");
                }}
            />,
            {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                icon: false
            }
        );
    };

    return (
        <div className="flex-1 h-full w-full flex flex-col font-serif text-[#3C2A21] animate-in fade-in duration-700 overflow-hidden relative">

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/src/assets/white-parchment-paper.jpg')] mix-blend-multiply"></div>

            {/* Header / Navigation Bar */}
            <header className="flex items-center justify-between py-5 px-10 border-b border-[#3C2A21]/10 bg-white/5 backdrop-blur-sm z-20 shrink-0">
                <div className="flex items-center gap-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-[0.3em] text-[#8C7A6B] hover:text-[#5D2E2E] transition-all"
                    >
                        <div className="w-8 h-8 rounded-full bg-[#5D2E2E]/5 group-hover:bg-[#5D2E2E]/10 flex items-center justify-center transition-all border border-[#5D2E2E]/5 group-hover:border-[#5D2E2E]/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                            </svg>
                        </div>
                        Return to Archives
                    </button>

                    <div className="h-8 w-px bg-[#3C2A21]/10"></div>

                    <div className="flex flex-col">
                        <span className="text-[0.6rem] font-bold text-[#5D2E2E] italic opacity-80">
                            {isSaving ? "Inscribing..." : `Last modified ${new Date(note.lastUpdated || note.createdAt).toLocaleDateString()}`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[0.55rem] font-black uppercase tracking-[0.4em] text-[#8C7A6B]">Magistrate's Decree</span>
                        <div className="h-[2px] w-12 bg-[#5D2E2E]/30 mt-1"></div>
                    </div>
                </div>
            </header>

            {/* Main Editor Body */}
            <main className="flex-1 overflow-hidden z-10 relative">

                {/* Scrollable Container for Workspace */}
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar bg-[#F4EFE6]/20 py-16 px-8 md:px-16 lg:px-24">

                    {/* Integrated Workspace Layout (Side-by-Side) */}
                    <div className="w-full max-w-[100rem] mx-auto flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

                        {/* Manuscript Side */}
                        <div className="flex-1 w-full flex flex-col items-center">
                            <div className="w-full bg-[#F4EFE6]/40 backdrop-blur-[1px] shadow-[0_10px_40px_rgba(60,42,33,0.08)] rounded-sm border border-white/40 p-12 md:p-20 space-y-12 mb-24 min-h-[120vh]">
                                {/* Heading Input */}
                                <textarea
                                    ref={titleRef}
                                    value={noteData.title}
                                    onChange={handleTitleChange}
                                    placeholder="Untitled Scribe..."
                                    rows={1}
                                    className="w-full bg-transparent text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#3C2A21] uppercase placeholder:text-[#3C2A21]/10 focus:outline-none border-none py-4 leading-snug text-center font-serif italic resize-none overflow-hidden transition-all duration-300"
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />

                                {/* Elegant Divider */}
                                <div className="flex items-center gap-10 px-20 opacity-20">
                                    <div className="h-px bg-[#3C2A21] flex-1"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#3C2A21] rotate-45"></div>
                                    <div className="h-px bg-[#3C2A21] flex-1"></div>
                                </div>

                                {/* Main Body Input */}
                                {viewMode === 'edit' ? (
                                    <textarea
                                        value={noteData.content}
                                        onChange={handleContentChange}
                                        placeholder="Begin your inscription here..."
                                        className="w-full min-h-[60vh] bg-transparent text-2xl font-serif leading-[1.8] text-[#3C2A21]/90 placeholder:text-[#3C2A21]/10 focus:outline-none border-none resize-none pb-40"
                                    />
                                ) : (
                                    <div className="w-full min-h-[60vh] prose prose-stone lg:prose-xl max-w-none text-[#3C2A21]/90 pb-40 font-serif">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {noteData.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Floating Integrated Toolbar (Sticky on the right side) */}
                        <div className="hidden lg:flex sticky top-8 w-[380px] shrink-0 flex-col gap-10 bg-[#F4EFE6]/70 backdrop-blur-xl rounded-xl border border-white/30 px-10 py-12 shadow-2xl animate-in slide-in-from-right-8 duration-700 z-30">

                            <div className="w-full flex flex-col gap-8">
                                <div className="text-xs font-black text-[#8C7A6B] uppercase tracking-[0.4em] mb-2 px-2 opacity-60">AI Scribe Hub</div>

                                <div className="w-full">
                                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#8C7A6B] mb-2 px-2">Scholarly Prompt</label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder={aiOption === 'summarize' ? "Define summary focus (optional)..." : "Command the scribe..."}
                                        className="w-full bg-white/50 border border-[#3C2A21]/15 rounded-sm px-4 py-3 text-sm font-serif focus:outline-none focus:border-[#5D2E2E]/40 transition-all placeholder:text-[#8C7A6B]/40 shadow-sm min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="w-full">
                                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#8C7A6B] mb-2 px-2">Transcription Mode</label>
                                    <div className="relative">
                                        <select
                                            value={aiOption}
                                            onChange={(e) => setAiOption(e.target.value)}
                                            className="w-full bg-white/50 border border-[#3C2A21]/15 rounded-sm px-4 py-3 text-[0.65rem] font-bold uppercase tracking-widest focus:outline-none focus:border-[#5D2E2E]/40 appearance-none cursor-pointer shadow-sm text-[#3C2A21]"
                                        >
                                            <option value="generate">Option 1: Generate Notes (Append)</option>
                                            <option value="summarize">Option 2: Summarize Content (Replace)</option>
                                            <option value="transcript">Option 3: Format from Transcript (Append)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 relative">
                                    {isAILoading && (
                                        <div className="absolute inset-0 z-50 bg-[#F4EFE6]/90 backdrop-blur-sm flex items-center justify-center rounded-sm animate-in fade-in duration-300">
                                            <ScholarlySpinner size="sm" label="Consulting Scribes..." />
                                        </div>
                                    )}
                                    <button
                                        onClick={handleAIAction}
                                        disabled={isAILoading}
                                        className="flex-1 bg-[#5D2E2E] text-[#F4EFE6] text-[0.65rem] font-black uppercase tracking-[0.2em] py-4 rounded-sm hover:bg-[#3C2A21] transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                                    >
                                        Execute Command
                                    </button>
                                    {history.length > 0 && (
                                        <button
                                            onClick={handleUndo}
                                            title="Restore Previous Archival State"
                                            className="px-6 bg-white border border-[#3C2A21]/10 text-[#3C2A21] hover:bg-[#F4EFE6] transition-all rounded-sm shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1zm0-1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 0-1H8.5a4.5 4.5 0 1 1-3.66 2.086.5.5 0 0 0-.84-.543A5.5 5.5 0 1 0 8 3v-1z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="w-full h-px bg-[#3C2A21]/10 my-2"></div>

                            <div className="w-full space-y-4">
                                <div className="text-xs font-black text-[#8C7A6B] uppercase tracking-[0.4em] mb-2 px-2 opacity-60">View Mode</div>

                                <div className="flex bg-[#F4EFE6]/50 rounded-lg p-1 border border-[#3C2A21]/10 w-full">
                                    <button
                                        onClick={() => setViewMode('edit')}
                                        className={`flex-1 py-3 text-[0.6rem] font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'edit' ? 'bg-[#5D2E2E] text-white shadow-sm' : 'text-[#8C7A6B] hover:text-[#5D2E2E]'}`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={`flex-1 py-3 text-[0.6rem] font-bold uppercase tracking-widest rounded-md transition-all ${viewMode === 'preview' ? 'bg-[#5D2E2E] text-white shadow-sm' : 'text-[#8C7A6B] hover:text-[#5D2E2E]'}`}
                                    >
                                        Preview
                                    </button>
                                </div>

                                {viewMode === 'edit' && (
                                    <div className="px-2 py-4 bg-emerald-800/5 border border-emerald-800/10 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <p className="text-[0.65rem] text-emerald-900 leading-relaxed italic">
                                            💡 <span className="font-bold">Scholar's Note:</span> Universal Markdown syntax and LaTeX mathematical symbols are active in Edit Mode.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto border-t border-[#3C2A21]/10 pt-8">
                                <button onClick={handleDispose} title="Archival Disposal" className="w-full flex items-center justify-center gap-3 py-4 text-[#8C7A6B]/50 hover:text-red-800 transition-all border border-dashed border-[#3C2A21]/20 rounded-sm hover:border-red-800/30 group bg-red-50/0 hover:bg-red-50/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                                    </svg>
                                    <span className="text-[0.65rem] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Archival Disposal</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotePage;
