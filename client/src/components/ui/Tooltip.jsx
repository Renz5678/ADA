import { useState, useRef, useEffect } from 'react';

export default function Tooltip({ children, content, position = 'top' }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative flex items-center group cursor-help"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            
            {/* Tooltip Content */}
            <div className={`
                absolute z-50 px-3 py-2 text-xs font-medium text-white 
                bg-[#0F1D29]/95 backdrop-blur-sm rounded-lg shadow-xl
                pointer-events-none transition-all duration-200 ease-out
                w-max max-w-[220px] leading-relaxed
                ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom' : ''}
                ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2 origin-left' : ''}
                ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2 origin-top' : ''}
                ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2 origin-right' : ''}
                ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
            `}>
                {content}
                
                {/* Triangle Pointer */}
                <div className={`
                    absolute w-2 h-2 bg-[#0F1D29]/95 transform rotate-45
                    ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                    ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                `}></div>
            </div>
        </div>
    );
}
