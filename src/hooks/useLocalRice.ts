import useLocalStorageState from 'use-local-storage-state';
import type { RiceEntry } from '../lib/models';

export const useLocalRice = () =>
    useLocalStorageState<RiceEntry[]>('riceEntries', {
        defaultValue: [],
    }); 