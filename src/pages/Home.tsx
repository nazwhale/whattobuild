import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { RiceEntry } from '../lib/models';
import { useLocalRice } from '../hooks/useLocalRice';
import { RiceCard } from '../components/card/RiceCard';
import { RankTable } from '../components/table/RankTable';
import { Button } from '../components/common/Button';
import { sampleEntries } from '../lib/sampleData';
import { validateImportData, type ExportData } from '../lib/dataValidation';

export const Home = () => {
    const [entries, setEntries] = useLocalRice();
    const [editingEntry, setEditingEntry] = useState<RiceEntry | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Track current form data for auto-save
    const currentFormData = useRef<Omit<RiceEntry, 'id' | 'createdAt' | 'updatedAt'> | null>(null);

    const handleFormDataChange = useCallback((data: Omit<RiceEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
        currentFormData.current = data;
    }, []);

    const autoSaveCurrentEntry = useCallback(() => {
        if (editingEntry && currentFormData.current) {
            // Only auto-save if there's meaningful data (e.g., title is not empty)
            if (currentFormData.current.title.trim()) {
                const now = new Date().toISOString();
                const updatedEntry: RiceEntry = {
                    ...currentFormData.current,
                    id: editingEntry.id,
                    createdAt: editingEntry.createdAt,
                    updatedAt: now,
                };

                setEntries(prev => prev.map(entry =>
                    entry.id === editingEntry.id ? updatedEntry : entry
                ));
            }
        }
    }, [editingEntry, setEntries]);

    const handleSaveEntry = (data: Omit<RiceEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();

        if (editingEntry) {
            // Update existing entry
            const updatedEntry: RiceEntry = {
                ...data,
                id: editingEntry.id,
                createdAt: editingEntry.createdAt,
                updatedAt: now,
            };

            setEntries(prev => prev.map(entry =>
                entry.id === editingEntry.id ? updatedEntry : entry
            ));
            setEditingEntry(null);
        } else {
            // Create new entry
            const newEntry: RiceEntry = {
                ...data,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };

            setEntries(prev => [...prev, newEntry]);
            setShowCreateForm(false);
        }

        // Clear the form data ref since we've manually saved
        currentFormData.current = null;
    };

    const handleEditEntry = (entry: RiceEntry) => {
        // Auto-save current entry before switching
        autoSaveCurrentEntry();

        setEditingEntry(entry);
        setShowCreateForm(false);

        // Clear the form data ref for the new entry
        currentFormData.current = null;
    };

    const handleDeleteEntry = () => {
        if (editingEntry) {
            setEntries(prev => prev.filter(entry => entry.id !== editingEntry.id));
            setEditingEntry(null);

            // Clear the form data ref since the entry is deleted
            currentFormData.current = null;
        }
    };

    const handleCreateNew = () => {
        // Auto-save current entry before creating new
        autoSaveCurrentEntry();

        setEditingEntry(null);
        setShowCreateForm(true);

        // Clear the form data ref for the new entry
        currentFormData.current = null;
    };

    const handleCancel = () => {
        // Auto-save current entry before canceling
        autoSaveCurrentEntry();

        setEditingEntry(null);
        setShowCreateForm(false);

        // Clear the form data ref
        currentFormData.current = null;
    };

    const handleLoadSampleData = () => {
        setEntries(sampleEntries);
    };

    const handleClearData = () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            setEntries([]);
            setEditingEntry(null);
            setShowCreateForm(false);
        }
    };

    const handleExportData = () => {
        try {
            const dataToExport: ExportData = {
                entries,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const dataStr = JSON.stringify(dataToExport, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rice-app-export-${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    const handleImportData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const rawData = JSON.parse(content);
                    const validatedData = validateImportData(rawData);

                    if (validatedData.entries.length < rawData.entries?.length) {
                        const skipped = rawData.entries.length - validatedData.entries.length;
                        if (!confirm(`${skipped} invalid entries will be skipped. Continue with importing ${validatedData.entries.length} valid entries?`)) {
                            return;
                        }
                    }

                    // Ask user whether to replace or merge
                    const shouldReplace = entries.length > 0 ?
                        confirm(`You have ${entries.length} existing entries. Click OK to replace them, or Cancel to merge with imported data.`) :
                        true;

                    if (shouldReplace) {
                        setEntries(validatedData.entries);
                    } else {
                        // Merge: add imported entries with new IDs to avoid conflicts
                        const mergedEntries = validatedData.entries.map(entry => ({
                            ...entry,
                            id: uuidv4(), // Generate new ID to avoid conflicts
                            updatedAt: new Date().toISOString()
                        }));
                        setEntries(prev => [...prev, ...mergedEntries]);
                    }

                    // Clear any editing state
                    setEditingEntry(null);
                    setShowCreateForm(false);
                    currentFormData.current = null;

                    alert(`Successfully imported ${validatedData.entries.length} entries!`);
                } catch (error) {
                    console.error('Error importing data:', error);
                    alert('Failed to import data. Please check the file format and try again.');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🫘 RICE App
                    </h1>
                    <p className="text-xl text-gray-600">
                        A local‑first scoring playground for product managers
                    </p>

                    {/* Demo buttons */}
                    {entries.length === 0 && (
                        <div className="mt-6 space-x-4">
                            <Button onClick={handleLoadSampleData} variant="primary">
                                📊 Load Sample Data
                            </Button>
                            <Button onClick={handleCreateNew} variant="secondary">
                                + Create First Initiative
                            </Button>
                        </div>
                    )}

                    {entries.length > 0 && (
                        <div className="mt-4 space-x-3">
                            <Button onClick={handleExportData} variant="secondary" className="text-sm">
                                💾 Export Data
                            </Button>
                            <Button onClick={handleImportData} variant="secondary" className="text-sm">
                                📂 Import Data
                            </Button>
                            <Button onClick={handleClearData} variant="secondary" className="text-sm">
                                🗑️ Clear All Data
                            </Button>
                        </div>
                    )}

                    {/* Export/Import buttons available even when no entries exist */}
                    {entries.length === 0 && (
                        <div className="mt-4">
                            <Button onClick={handleImportData} variant="secondary" className="text-sm">
                                📂 Import Data
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Entry Form */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editingEntry ? 'Edit Initiative' : 'Create Initiative'}
                            </h2>
                            <div className="space-x-2">
                                {!showCreateForm && !editingEntry && entries.length > 0 && (
                                    <Button onClick={handleCreateNew}>
                                        + New Initiative
                                    </Button>
                                )}
                                {(showCreateForm || editingEntry) && (
                                    <Button variant="secondary" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>

                        {(showCreateForm || editingEntry) && (
                            <RiceCard
                                entry={editingEntry || undefined}
                                onSave={handleSaveEntry}
                                onDelete={editingEntry ? handleDeleteEntry : undefined}
                                onFormDataChange={handleFormDataChange}
                            />
                        )}

                        {!showCreateForm && !editingEntry && entries.length > 0 && (
                            <div className="card p-8 text-center text-gray-500">
                                <p className="mb-4">Ready to create or edit an initiative?</p>
                                <Button onClick={handleCreateNew}>
                                    + Create New Initiative
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Rankings Table */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Rankings</h2>
                        <RankTable
                            entries={entries}
                            onEditEntry={handleEditEntry}
                            editingEntryId={editingEntry?.id || null}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-500">
                    <p>
                        Enter <strong>Reach</strong> / <strong>Impact</strong> / <strong>Confidence</strong> / <strong>Effort</strong>,
                        see an auto‑ranked stack of ideas 🌯
                    </p>
                </div>
            </div>
        </div>
    );
}; 