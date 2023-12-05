import { ReactNode, useEffect, useRef, useState } from 'react';

type AttachedDialogProps = {
    children: ReactNode;
    dialogContent: ReactNode;
    dialogClass?: string;
    defaultState?: boolean
};

export default function AttachedDialog({ children, dialogContent, dialogClass, defaultState }: AttachedDialogProps) {
    const [isOpen, setIsOpen] = useState(defaultState ? true : false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const [dialogLeftOffset, setDialogLeftOffset] = useState(0);

    useEffect(() => {
        if (isOpen && triggerRef.current && dialogRef.current) {
            const triggerWidth = triggerRef.current.offsetWidth;
            const dialogWidth = dialogRef.current.offsetWidth;
            const newLeftOffset = (triggerWidth - dialogWidth) / 2;
            setDialogLeftOffset(newLeftOffset);
        }
    }, [isOpen, dialogRef.current, triggerRef.current]);

    useEffect(() => {
        setIsOpen(defaultState ? true : false)
    }, [defaultState])
    
    return (
        <div className="relative" ref={triggerRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {children}
            </div>
            {isOpen && (
                <div
                    ref={dialogRef}
                    style={{
                        transform: `translateX(${dialogLeftOffset}px)`,
                    }}
                    className={`absolute z-10 mt-1 bg-white dark:bg-gray-700 p-2 shadow rounded-lg ${dialogClass}`}>
                    {dialogContent}
                </div>
            )}
        </div>
    );
}
