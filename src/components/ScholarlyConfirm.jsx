import React from 'react';

/**
 * ScholarlyConfirm - A bespoke, parchment-themed confirmation UI 
 * for destructive archival actions.
 * 
 * @param {string} title - Prompt title (e.g., 'Purge Archive?')
 * @param {string} message - Descriptive warning message
 * @param {string} actionLabel - Text for the confirm button (e.g., 'Dispose')
 * @param {function} onConfirm - Callback for successful confirmation
 * @param {function} closeToast - Provided by react-toastify to dismiss the toast
 */
const ScholarlyConfirm = ({ 
    title = 'Confirm Disposal?', 
    message = 'This action will permanently alter the archives. Proceed, Scholar?', 
    actionLabel = 'Dispose',
    onConfirm, 
    closeToast 
}) => {
    return (
        <div className="font-serif text-[#3C2A21] px-1 py-2">
            <p className="text-sm font-black uppercase tracking-widest text-[#5D2E2E] mb-2">{title}</p>
            <p className="text-[0.7rem] leading-relaxed italic opacity-80 mb-6">{message}</p>
            
            <div className="flex gap-3 justify-end items-center">
                <button 
                    onClick={closeToast}
                    className="text-[0.6rem] font-bold uppercase tracking-widest text-[#8C7A6B] hover:text-[#3C2A21] transition-colors px-3 py-1.5"
                >
                    Stay Hand
                </button>
                <button 
                    onClick={() => {
                        onConfirm();
                        closeToast();
                    }}
                    className="bg-[#5D2E2E] hover:bg-[#3C2A21] text-[#F4EFE6] px-5 py-1.5 rounded-sm text-[0.6rem] font-black uppercase tracking-widest shadow-md transition-all active:scale-[0.98]"
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    );
};

export default ScholarlyConfirm;
