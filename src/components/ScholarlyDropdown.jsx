import React, { useState, useRef, useEffect } from 'react';

const ScholarlyDropdown = ({ value, onChange, options, minWidth = "160px", fullWidth = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`} ref={dropdownRef} style={{ minWidth }}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/40 border border-[#3C2A21]/15 rounded-sm py-4 px-6 flex items-center justify-center focus:outline-none focus:border-[#5D2E2E] transition-all font-sans font-black text-[0.65rem] uppercase tracking-[0.2em] text-[#3C2A21] shadow-sm relative z-20"
            >
                <span className="truncate flex-1 text-center">{selectedOption.label}</span>
                <svg className={`transition-transform duration-300 text-[#8C7A6B] shrink-0 absolute right-4 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                </svg>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 z-50 bg-[#F4EFE6]/[0.98] backdrop-blur-xl border border-[#3C2A21]/15 rounded-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-[0.65rem] font-black uppercase tracking-[0.15em] transition-all hover:bg-[#5D2E2E]/[0.05] border-b border-[#3C2A21]/[0.05] last:border-none ${value === opt.value ? 'text-[#5D2E2E] bg-[#5D2E2E]/[0.03]' : 'text-[#8C7A6B]'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScholarlyDropdown;
