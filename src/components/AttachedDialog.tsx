import { ReactNode, useEffect, useRef, useState } from 'react';

type AttachedDialogProps = {
    children: ReactNode;
    dialogContent: ReactNode;
    dialogClass?: string;
    open: boolean
};

export default function AttachedDialog({ children, dialogContent, dialogClass, open }: AttachedDialogProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const [dialogLeftOffset, setDialogLeftOffset] = useState(0);

    useEffect(() => {
        if (open && triggerRef.current && dialogRef.current) {
            const triggerWidth = triggerRef.current.offsetWidth;
            const dialogWidth = dialogRef.current.offsetWidth;
            const newLeftOffset = (triggerWidth - dialogWidth) / 2;
            setDialogLeftOffset(newLeftOffset);
        }
    }, [open, dialogRef.current, triggerRef.current]);

    return (
        <div className="relative" ref={triggerRef}>
            {children}
            {open && (
                <div
                    ref={dialogRef}
                    style={{
                        transform: `translateX(${dialogLeftOffset}px)`,
                    }}
                    className={`absolute z-50 mt-1 bg-white dark:bg-gray-700 p-2 shadow rounded-lg ${dialogClass}`}>
                    {dialogContent}
                </div>
            )}
        </div>
    );
}
