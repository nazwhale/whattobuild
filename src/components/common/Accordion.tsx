import { useState } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface AccordionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
}

export const Accordion = ({ title, children, defaultOpen = false, className }: AccordionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={clsx('border border-gray-400 rounded-lg', className)}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
                <div className="flex justify-between items-center">
                    <span>{title}</span>
                    <span className={clsx('transform transition-transform duration-200', {
                        'rotate-180': isOpen
                    })}>
                        ↓
                    </span>
                </div>
            </button>
            {isOpen && (
                <div className="px-4 pb-4">
                    {children}
                </div>
            )}
        </div>
    );
}; 