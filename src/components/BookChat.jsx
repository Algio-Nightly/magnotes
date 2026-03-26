import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NoteContext';
import { useAI } from '../context/AIContext';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { toast } from 'react-toastify';
import ScholarlySpinner from './ScholarlySpinner';
import ScholarlyConfirm from './ScholarlyConfirm';

const BookChat = () => {
    const { state } = useNotes();
    const { messages, sendMessage, isLoading, clearChat, apiKey, setApiKey } = useAI();
    const [input, setInput] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [tempKey, setTempKey] = useState(apiKey);
    
    // Sidebar States
    const [taggedNoteIds, setTaggedNoteIds] = useState([]);
    const [contextQuery, setContextQuery] = useState('');
    const [notebookQuery, setNotebookQuery] = useState('');
    const [selectedNotebookId, setSelectedNotebookId] = useState(() => {
        const nbs = Object.values(state.notebooks);
        return nbs.length > 0 ? nbs[0].id : '';
    });
    
    const scrollRef = useRef(null);

    const handlePurge = () => {
        toast.warn(
            <ScholarlyConfirm 
                title="Purge Archives?"
                message="Are you certain, Scholar? This will permanently erase the entire chat history from the scholarly records."
                actionLabel="Purge"
                onConfirm={clearChat}
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

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Initial scroll
    useEffect(() => {
        const timeout = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeout);
    }, []);

    // Search Logic
    const contextResults = Object.values(state.notes).filter(n => 
        n.title.toLowerCase().includes(contextQuery.toLowerCase()) && !taggedNoteIds.includes(n.id)
    ).slice(0, 5);

    const notebookResults = Object.values(state.notebooks).filter(nb => 
        nb.title.toLowerCase().includes(notebookQuery.toLowerCase())
    ).slice(0, 5);

    const toggleTag = (id) => {
        setTaggedNoteIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        setContextQuery('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const taggedNotesContent = taggedNoteIds.map(id => state.notes[id]);
        const currentInput = input;
        setInput('');
        
        // Pass context + Target Notebook Hint
        await sendMessage(currentInput, taggedNotesContent, selectedNotebookId);
    };

    const getNoteTitle = (id) => state.notes[id]?.title || "Unknown Scroll";

    return (
        <div className="flex w-full h-full bg-[#F4EFE6] text-[#3C2A21] font-serif overflow-hidden">
            {/* Main Discourse Area */}
            <main className="flex-1 flex flex-col items-center overflow-y-auto px-4 py-12 custom-scrollbar">
                <div className="w-full max-w-2xl space-y-12 mb-32">
                    <header className="border-b border-[#3C2A21]/10 pb-8 mb-12">
                        <p className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-stone-500 mb-1">Research Intelligence</p>
                        <h1 className="text-3xl font-bold tracking-tight text-[#3C2A21]">Scriptorium Assistant</h1>
                    </header>

                    <div className="space-y-16">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {msg.role === 'user' ? (
                                    <div className="flex flex-col items-center text-center">
                                        <div className="max-w-xl px-6 py-4 bg-[#E8ECE1]/40 border border-[#3C2A21]/5 rounded-sm italic text-lg leading-relaxed text-[#5D2E2E]">
                                            "{msg.content}"
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-stone max-w-none text-[#3C2A21]">
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {isLoading && (
                        <div className="py-12 border-y border-[#3C2A21]/5 bg-[#5D2E2E]/5 backdrop-blur-sm rounded-sm my-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <ScholarlySpinner size="md" label="Synthesizing Discovery..." />
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </main>

            {/* Sidebar (Right) */}
            <aside className="w-[20vw] border-l border-[#3C2A21]/10 bg-[#F4EFE6]/50 p-6 flex flex-col gap-10 overflow-y-auto hidden xl:flex shrink-0">
                <div className="pb-4 border-b border-[#3C2A21]/5">
                    <h2 className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-stone-400">Research Console</h2>
                </div>

                {/* Section 1: Target Notebook */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm opacity-60">📁</span>
                        <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em]">Target Notebook</h3>
                    </div>
                    
                    <div className="relative">
                        <input 
                            type="text"
                            value={notebookQuery}
                            onChange={(e) => setNotebookQuery(e.target.value)}
                            placeholder="Search notebooks..."
                            className="w-full bg-white/40 border border-[#3C2A21]/10 rounded-sm py-2 px-3 text-[0.65rem] focus:outline-none focus:border-[#5D2E2E]/30"
                        />
                        {notebookQuery && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#3C2A21]/15 shadow-xl rounded-sm z-50 animate-in fade-in slide-in-from-top-1">
                                {notebookResults.map(nb => (
                                    <button 
                                        key={nb.id}
                                        onClick={() => {
                                            setSelectedNotebookId(nb.id);
                                            setNotebookQuery('');
                                        }}
                                        className="w-full text-left px-3 py-2 text-[0.65rem] hover:bg-[#F4EFE6] transition-colors"
                                    >
                                        {nb.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-[#5D2E2E]/5 border border-[#5D2E2E]/10 rounded-sm">
                        <p className="text-[0.5rem] font-bold text-[#5D2E2E] uppercase mb-1 opacity-60 font-sub">Active Archive Target</p>
                        {selectedNotebookId ? (
                            <Link 
                                to={`/notebooks/${state.notebooks[selectedNotebookId]?.subjectId}/${selectedNotebookId}`}
                                className="text-xs font-bold truncate hover:text-[#5D2E2E] hover:underline transition-all block"
                            >
                                {state.notebooks[selectedNotebookId]?.title}
                            </Link>
                        ) : (
                            <p className="text-xs font-bold truncate opacity-40 italic">No Notebook Selected</p>
                        )}
                    </div>
                </section>

                <div className="h-px bg-[#3C2A21]/5"></div>

                {/* Section 2: Reference Context */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm opacity-60">📜</span>
                        <h3 className="text-[0.6rem] font-black uppercase tracking-[0.2em] font-sub">Reference Context</h3>
                    </div>

                    <div className="relative">
                        <input 
                            type="text"
                            value={contextQuery}
                            onChange={(e) => setContextQuery(e.target.value)}
                            placeholder="Infer notes/memorials..."
                            className="w-full bg-white/40 border border-[#3C2A21]/10 rounded-sm py-2 px-3 text-[0.65rem] focus:outline-none focus:border-[#5D2E2E]/30"
                        />
                        {contextQuery && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#3C2A21]/15 shadow-xl rounded-sm z-50">
                                {contextResults.map(n => (
                                    <button 
                                        key={n.id}
                                        onClick={() => toggleTag(n.id)}
                                        className="w-full text-left px-3 py-2 text-[0.65rem] hover:bg-[#F4EFE6]"
                                    >
                                        {n.title}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {taggedNoteIds.map(id => (
                            <div key={id} className="flex items-center justify-between p-2 bg-white border border-[#3C2A21]/5 rounded-sm group">
                                <Link 
                                    to={`/notes/${id}`}
                                    className="text-[0.65rem] truncate max-w-[80%] hover:text-[#5D2E2E] hover:underline transition-all"
                                >
                                    {getNoteTitle(id)}
                                </Link>
                                <button onClick={() => toggleTag(id)} className="text-stone-400 hover:text-red-700 transition-colors">×</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* System Controls Decoupled at Bottom */}
                <div className="mt-auto pt-8 border-t border-[#3C2A21]/5 space-y-4">
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handlePurge}
                            className="w-full py-2.5 px-4 bg-[#5D2E2E]/5 hover:bg-red-700 hover:text-white border border-[#5D2E2E]/10 rounded-sm text-[0.6rem] font-black uppercase tracking-[0.2em] text-stone-500 transition-all text-center"
                        >
                            Purge Archives
                        </button>
                        <button 
                            onClick={() => setShowKeyInput(!showKeyInput)}
                            className={`w-full py-2.5 px-4 rounded-sm text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all text-center border ${
                                apiKey ? 'bg-[#5D2E2E] text-white' : 'bg-[#51b1f8]/10 text-stone-500 border-[#51b1f8]/20 hover:bg-[#51b1f8]/20'
                            }`}
                        >
                            {apiKey ? 'API KEY ACTIVE' : 'CONFIGURE API KEY'}
                        </button>
                    </div>

                    {showKeyInput && (
                        <div className="bg-white p-4 border border-[#3C2A21]/15 rounded-sm shadow-xl animate-in fade-in slide-in-from-top-2 relative z-50">
                             <input 
                                type="password"
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder="Paste API Key..."
                                className="w-full bg-[#F4EFE6] border border-[#3C2A21]/10 rounded-sm py-2 px-3 text-[0.6rem] mb-3 focus:outline-none"
                            />
                            <button 
                                onClick={() => { setApiKey(tempKey); setShowKeyInput(false); }} 
                                className="w-full bg-[#3C2A21] text-white py-2 rounded-sm text-[0.55rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                            >
                                Validate Scroll
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Input Fixed */}
            <div className="fixed bottom-12 left-[17vw] right-[20vw] flex justify-center z-50 px-8">
                <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-[#3C2A21]/15 shadow-2xl rounded-2xl overflow-hidden p-4 mx-auto">
                    <form onSubmit={handleSubmit} className="flex items-end gap-4">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                            placeholder="Command the archives..."
                            className="flex-1 bg-transparent border-none resize-none py-2 text-md focus:outline-none placeholder:text-stone-300 max-h-32"
                            rows={1}
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-10 h-10 rounded-xl bg-[#3C2A21] text-white flex items-center justify-center hover:bg-[#5D2E2E] transition-all disabled:opacity-30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.493-7.493Z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookChat;
