import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAI } from '../context/AIContext';

const Settings = () => {
    const { fontFamily, setFontFamily, fontOptions } = useTheme();
    const { apiKey, setApiKey, selectedModel, setSelectedModel, MODEL_OPTIONS } = useAI();
    const [tempKey, setTempKey] = useState(apiKey || '');

    return (
        <div className="flex-1 h-full w-full flex flex-col font-serif text-[#3C2A21] animate-in fade-in duration-700 overflow-hidden relative p-12 lg:p-24 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full space-y-16">
                <header className="border-b border-[#3C2A21]/10 pb-8">
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-[#8C7A6B] mb-2 opacity-60">System Configuration</p>
                    <h1 className="text-5xl font-black italic tracking-tighter">Scriptorium Settings</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {/* Typography Section */}
                    <section className="space-y-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest mb-1">Typography</h3>
                            <p className="text-xs text-[#8C7A6B] italic">Select the manuscript font for your scholarly archives.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {fontOptions.map((opt) => (
                                <button
                                    key={opt.family}
                                    onClick={() => setFontFamily(opt.family)}
                                    className={`w-full text-left p-6 rounded-sm border transition-all flex items-center justify-between group ${
                                        fontFamily === opt.family 
                                        ? 'bg-[#5D2E2E] border-[#5D2E2E] text-[#F4EFE6] shadow-xl transform scale-[1.02]' 
                                        : 'bg-white/40 border-[#3C2A21]/10 hover:border-[#5D2E2E]/30 hover:bg-white/60'
                                    }`}
                                >
                                    <div>
                                        <p className="text-[0.6rem] font-bold uppercase tracking-widest opacity-60 mb-2 truncate">Manuscript Style</p>
                                        <p className="text-xl" style={{ fontFamily: opt.family }}>{opt.name}</p>
                                    </div>
                                    {fontFamily === opt.family && (
                                        <span className="text-xl">🖋️</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* AI & Infrastructure Section */}
                    <section className="space-y-8">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest mb-1">Intelligence</h3>
                            <p className="text-xs text-[#8C7A6B] italic">Configure the Key of Wisdom and select your scholarly scribe.</p>
                        </div>

                        {/* Model Selection */}
                        <div className="space-y-4">
                            <label className="text-[0.6rem] font-black uppercase tracking-widest block opacity-60 px-1">Scholarly Scribe (Model)</label>
                            <div className="grid grid-cols-1 gap-3">
                                {MODEL_OPTIONS.map((model) => (
                                    <button
                                        key={model}
                                        onClick={() => setSelectedModel(model)}
                                        className={`w-full text-left p-4 rounded-sm border transition-all flex items-center justify-between group ${
                                            selectedModel === model 
                                            ? 'bg-[#5D2E2E] border-[#5D2E2E] text-[#F4EFE6] shadow-md scale-[1.01]' 
                                            : 'bg-white/40 border-[#3C2A21]/10 hover:border-[#5D2E2E]/30 hover:bg-white/60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${selectedModel === model ? 'bg-[#F4EFE6]' : 'bg-[#5D2E2E]/20'}`}></div>
                                            <p className="text-[0.65rem] font-bold uppercase tracking-wider">{model}</p>
                                        </div>
                                        {selectedModel === model && (
                                            <span className="text-xs opacity-60 italic">Active Scribe</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/40 border border-[#3C2A21]/10 p-8 rounded-sm space-y-6 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-[0.6rem] font-black uppercase tracking-widest block opacity-60">Gemini API Key</label>
                                <input 
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="Enter your API key..."
                                    className="w-full bg-[#F4EFE6]/50 border border-[#3C2A21]/15 rounded-sm p-3 text-sm focus:outline-none focus:border-[#5D2E2E]/40"
                                />
                            </div>
                            <button 
                                onClick={() => {
                                    setApiKey(tempKey);
                                    alert("Archival key secured.");
                                }}
                                className="w-full bg-[#3C2A21] text-white py-4 rounded-sm text-[0.65rem] font-black uppercase tracking-[0.3em] hover:bg-[#5D2E2E] transition-all"
                            >
                                Secure Key
                            </button>
                            <p className="text-[0.6rem] text-center opacity-40 italic">Your key is stored locally in your browser's parchment (localStorage).</p>
                        </div>

                        <div className="h-px bg-[#3C2A21]/5 my-8"></div>

                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest mb-4">About the Scriptorium</h3>
                            <div className="space-y-4 text-xs leading-relaxed text-[#8C7A6B]">
                                <p>Version 2.5: Scholarly Intelligence Update.</p>
                                <p>This digital scribe was forged to harmonize modern research intelligence with the timeless aesthetic of classical scrolls.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;
