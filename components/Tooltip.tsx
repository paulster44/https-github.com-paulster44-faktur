
import React, { useState, useEffect, useRef } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const show = () => {
        setIsVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Auto hide after 1.5s
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 1500);
    };

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    const handleClick = () => {
        hide();
    };

    // Clean up
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="relative inline-flex items-center" onMouseEnter={show} onMouseLeave={hide} onClick={handleClick}>
            {children}
            {isVisible && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-slate-800 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none transition-opacity duration-200">
                    {content}
                    {/* Small arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            )}
        </div>
    );
};
export default Tooltip;
