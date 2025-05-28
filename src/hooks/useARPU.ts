import { useState, useEffect } from 'react';

const ARPU_STORAGE_KEY = 'rice-app-arpu';
const DEFAULT_ARPU = 14; // Default monthly ARPU in pounds

export const useARPU = (): [number, (arpu: number) => void] => {
    const [arpu, setArpu] = useState<number>(DEFAULT_ARPU);

    // Load ARPU from localStorage on mount
    useEffect(() => {
        try {
            const storedArpu = localStorage.getItem(ARPU_STORAGE_KEY);
            if (storedArpu) {
                const parsedArpu = parseFloat(storedArpu);
                if (!isNaN(parsedArpu) && parsedArpu > 0) {
                    setArpu(parsedArpu);
                }
            }
        } catch (error) {
            console.warn('Failed to load ARPU from localStorage:', error);
        }
    }, []);

    // Save ARPU to localStorage whenever it changes
    const updateArpu = (newArpu: number) => {
        if (newArpu > 0) {
            setArpu(newArpu);
            try {
                localStorage.setItem(ARPU_STORAGE_KEY, newArpu.toString());
            } catch (error) {
                console.warn('Failed to save ARPU to localStorage:', error);
            }
        }
    };

    return [arpu, updateArpu];
}; 