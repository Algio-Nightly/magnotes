import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { useNotes } from '../context/NoteContext';

const ScholarlyCalendar = ({ value, onChange }) => {
    const { state } = useNotes();

    // Filter notebooks for revisions
    const revisionNotebooks = Object.values(state.notebooks).filter(nb => 
        nb.status === 'Completed' && nb.revisionDate && !nb.isRevisionComplete
    );

    // Helper to check if a date has revisions
    const getRevisionsForDate = (date) => {
        const dStr = date.toDateString();
        return revisionNotebooks.filter(nb => {
            if (!nb.revisionDate) return false;
            return new Date(nb.revisionDate).toDateString() === dStr;
        });
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const revisions = getRevisionsForDate(date);
            if (revisions.length > 0) {
                return (
                    <div className="flex justify-center mt-1">
                        {/* Premium Wax Seal Marker */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-2.5 h-2.5 bg-[#5D2E2E]/20 rounded-full animate-ping"></div>
                            <div className="w-1.5 h-1.5 bg-[#5D2E2E] rounded-full shadow-[0_0_8px_rgba(93,46,46,0.5)]"></div>
                        </div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full font-serif bg-transparent" id="scholarly-chronicle">
            <div className="scholarly-calendar-container">
                <Calendar 
                    onChange={onChange} 
                    value={value} 
                    tileContent={tileContent}
                    className="scribe-calendar"
                    calendarType="gregory"
                    prevLabel={<span className="text-xl font-light">‹</span>}
                    nextLabel={<span className="text-xl font-light">›</span>}
                    prev2Label={null}
                    next2Label={null}
                />
            </div>
        </div>
    );
};

export default ScholarlyCalendar;
