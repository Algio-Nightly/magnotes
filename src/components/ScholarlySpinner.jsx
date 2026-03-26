import React, { useState, useEffect } from 'react';

// Import frames
import frame1 from '../assets/spinner/frame1.png';
import frame2 from '../assets/spinner/frame2.png';
import frame3 from '../assets/spinner/frame3.png';
import frame4 from '../assets/spinner/frame4.png';
import frame5 from '../assets/spinner/frame5.png';

const frames = [frame1, frame2, frame3, frame4, frame5];

/**
 * ScholarlySpinner - A sequential flip-book style animation 
 * for AI-powered scholarly inquiries.
 * 
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} label - Optional text label
 */
const ScholarlySpinner = ({ size = 'md' }) => {
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % frames.length);
        }, 150);

        return () => clearInterval(interval);
    }, []);

    const sizes = {
        sm: 'w-24 h-24',
        md: 'w-48 h-48',
        lg: 'w-64 h-64'
    };

    return (
        <div className="flex items-center justify-center animate-in fade-in duration-500">
            <div className={`${sizes[size]} relative overflow-hidden`}>
                {frames.map((src, index) => (
                    <img 
                        key={index}
                        src={src}
                        alt=""
                        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-75 ${
                            currentFrame === index ? 'opacity-100 animate-in zoom-in-95' : 'opacity-0'
                        }`}
                        loading="eager"
                    />
                ))}
            </div>
        </div>
    );
};

export default ScholarlySpinner;
