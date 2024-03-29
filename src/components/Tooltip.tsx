import { useState, ReactNode } from 'react';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    children: ReactNode;
    content: string;
    position?: TooltipPosition;
}

export default function Tooltip({ children, content, position = 'top' }: TooltipProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getPositionClasses = (position: TooltipPosition): string => {
        switch (position) {
            case 'top':
                return 'bottom-full mb-1';
            case 'bottom':
                return 'top-full mt-1';
            case 'left':
                return 'right-full mr-1 mb-1';
            case 'right':
                return 'left-full ml-2';
            default:
                return '';
        }
    };

    const positionClasses = getPositionClasses(position);

    return (
        <div
            className="relative flex items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {isHovered && (
                <div className={`absolute ${positionClasses} z-10 w-full flex justify-center`}>
                    <div className="px-2 py-1 bg-black text-white text-xs rounded-md border border-white whitespace-pre-wrap max-w-xs">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};
