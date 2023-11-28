import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import Tooltip from './Tooltip';
import { SpeedDialOption } from '../interface';

export default function SpeedDial({ speedDialOptions }: { speedDialOptions: SpeedDialOption[] }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSpeedDial = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className="fixed bottom-8 right-8"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {isOpen && (
                <div className="flex flex-col">
                    {speedDialOptions.map(speedDialOption => <Tooltip key={speedDialOption.tootip} content={speedDialOption.tootip} position='left'>
                        <button
                            className="bg-blue-500 text-white w-11 p-3 m-auto mb-2 rounded-full shadow-lg transition-opacity duration-1000 ease-in-out opacity-100 hover:opacity-75"
                            onClick={speedDialOption.action}
                        >
                            {speedDialOption.icon('w-5 h-5')}
                        </button>
                    </Tooltip>)}
                </div>
            )}
            <button
                onClick={toggleSpeedDial}
                className="bg-blue-500 text-white p-4 rounded-full shadow-lg focus:outline-none"
            >
                {isOpen ? <XMarkIcon className='w-6 h-6' /> : <PlusIcon className='w-6 h-6' />}
            </button>
        </div>
    );
};
