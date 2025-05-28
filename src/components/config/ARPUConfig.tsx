import { useState } from 'react';

interface ARPUConfigProps {
    arpu: number;
    onARPUChange: (arpu: number) => void;
}

export const ARPUConfig = ({ arpu, onARPUChange }: ARPUConfigProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(arpu.toString());

    const handleEdit = () => {
        setIsEditing(true);
        setInputValue(arpu.toString());
    };

    const handleSave = () => {
        const newArpu = parseFloat(inputValue);
        if (!isNaN(newArpu) && newArpu > 0) {
            onARPUChange(newArpu);
            setIsEditing(false);
        } else {
            alert('Please enter a valid positive number for ARPU');
        }
    };

    const handleCancel = () => {
        setInputValue(arpu.toString());
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        💰 Monthly ARPU Configuration
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Set your Average Revenue Per User per month for ARR uplift calculations
                    </p>

                    <div className="flex items-center space-x-3">
                        <span className="text-gray-700 font-medium">Monthly ARPU:</span>

                        {isEditing ? (
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-500">£</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    className="border border-gray-300 rounded px-2 py-1 w-24 text-right"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <span className="font-bold text-green-600 text-lg">
                                    £{arpu.toFixed(2)}
                                </span>
                                <button
                                    onClick={handleEdit}
                                    className="text-blue-500 hover:text-blue-700 text-sm underline"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                        ARR Uplift = Monthly ARPU × 12 × Customers Acquired
                    </div>
                </div>
            </div>
        </div>
    );
}; 