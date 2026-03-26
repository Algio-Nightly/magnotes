import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../context/AIContext';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { messages, sendMessage, isLoading, clearChat } = useAI();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const currentInput = input;
        setInput('');
        await sendMessage(currentInput);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-serif">
            {/* Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-[#5D2E2E] rounded-full shadow-2xl flex items-center justify-center text-[#F4EFE6] hover:scale-110 active:scale-95 transition-all group border-4 border-[#F4EFE6]/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 12.293l-4.146 4.147A.5.5 0 0 1 3 16V1a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15a.5.5 0 0 1-.854.354L8 12.293z"/>
                    </svg>
                    <span className="absolute -top-12 right-0 bg-stone-900 border border-stone-800 text-stone-100 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Consult the Keeper</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[450px] h-[650px] bg-[#F4EFE6] border border-[#3C2A21]/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-6 bg-[#5D2E2E] text-[#F4EFE6] flex items-center justify-between border-b border-black/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5 8.5A.5.5 0 0 1 5.5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5.5 6h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm14-1H5.5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z"/>
                                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752a.5.5 0 0 1 0 .696c-.654.689-1.782.886-3.112.752-1.234-.124-2.503-.523-3.388-.893V2.828zm7.5.752c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v.796c-.885-.37-2.154-.769-3.388-.893-1.33-.134-2.458.063-3.112.752a.5.5 0 0 1 0-.696zM1 13.716c.885.37 2.154.769 3.388.893 1.33.134 2.458-.063 3.112-.752V5.131a.5.5 0 0 1 1 0v8.726c.654.689 1.782.886 3.112.752 1.234-.124 2.503-.523 3.388-.893V3.716c-.885.37-2.154.769-3.388.893-1.33.134-2.458-.063-3.112.752a.5.5 0 0 1-1 0c-.654-.689-1.782-.886-3.112-.752-1.234.124-2.503.523-3.388.893v9.21z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-widest text-[#F4EFE6]">KEEPER OF THE ARCHIVES</h3>
                                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#F4EFE6]/60">Scholarly AI Logic</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={clearChat} className="p-2 hover:bg-black/10 rounded-full transition-colors text-white/50 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5z"/>
                                </svg>
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/10 rounded-full transition-colors text-white/50 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#F4EFE6] custom-scrollbar"
                    >
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] p-5 rounded-3xl ${
                                    msg.role === 'user' 
                                        ? 'bg-[#3C2A21]/5 text-[#3C2A21] rounded-br-sm border border-[#3C2A21]/10' 
                                        : 'bg-white border border-[#3C2A21]/15 text-[#3C2A21] rounded-bl-sm shadow-sm'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <span className="text-[0.55rem] font-bold uppercase tracking-widest text-stone-400 mt-2 px-1">
                                    {msg.role === 'user' ? 'Scholar' : 'The Keeper'}
                                </span>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex flex-col items-start italic text-stone-400 text-xs gap-3 animate-pulse">
                                <div className="p-4 bg-white border border-[#3C2A21]/5 rounded-3xl rounded-bl-sm">
                                    Searching the scholarly scroll...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <form onSubmit={handleSubmit} className="p-6 bg-white border-t border-[#3C2A21]/10 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                        <div className="relative">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isLoading ? "The archives are speaking..." : "Consult the Library..."}
                                disabled={isLoading}
                                className="w-full bg-[#F4EFE6]/40 border border-[#3C2A21]/15 rounded-full py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-[#5D2E2E] focus:bg-white transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isLoading ? 'bg-stone-200 text-stone-400' : 'bg-[#5D2E2E] text-white hover:scale-110 active:scale-95 shadow-lg'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChatbot;
