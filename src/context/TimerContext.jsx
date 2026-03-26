import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
    // Basic Timer State
    const [timeLeft, setTimeLeft] = useState(45 * 60); 
    const [isActive, setIsActive] = useState(false);
    const [initialTime, setInitialTime] = useState(45 * 60);
    const timerRef = useRef(null);

    // Scholarly Stats State
    const [totalSecondsStudied, setTotalSecondsStudied] = useState(() => {
        const saved = localStorage.getItem('magnotes_total_seconds');
        return saved ? parseInt(saved) : 0;
    });

    const [dailyStats, setDailyStats] = useState(() => {
        const saved = localStorage.getItem('magnotes_daily_stats');
        return saved ? JSON.parse(saved) : {};
    });

    // Persistence Effect
    useEffect(() => {
        localStorage.setItem('magnotes_total_seconds', totalSecondsStudied.toString());
        localStorage.setItem('magnotes_daily_stats', JSON.stringify(dailyStats));
    }, [totalSecondsStudied, dailyStats]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
                
                // Track Progress
                const today = new Date().toISOString().split('T')[0];
                setTotalSecondsStudied(prev => prev + 1);
                setDailyStats(prev => {
                    const newStats = { ...prev };
                    newStats[today] = (newStats[today] || 0) + 1;
                    
                    // Prune old records (keep last 7 days)
                    const dates = Object.keys(newStats).sort();
                    if (dates.length > 7) {
                        const oldest = dates[0];
                        delete newStats[oldest];
                    }
                    return newStats;
                });

            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const startTimer = () => setIsActive(true);
    const pauseTimer = () => setIsActive(false);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(initialTime);
    };

    const setDuration = (minutes) => {
        const seconds = minutes * 60;
        setInitialTime(seconds);
        setTimeLeft(seconds);
        setIsActive(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Helper to get total hours as floating point
    const getTotalHours = () => (totalSecondsStudied / 3600).toFixed(2);

    return (
        <TimerContext.Provider value={{
            timeLeft,
            isActive,
            initialTime,
            totalSecondsStudied,
            dailyStats,
            startTimer,
            pauseTimer,
            resetTimer,
            setDuration,
            formatTime,
            getTotalHours
        }}>
            {children}
        </TimerContext.Provider>
    );
};

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
};
