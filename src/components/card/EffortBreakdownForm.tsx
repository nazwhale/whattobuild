import { Controller } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { EffortBreakdown } from '../../lib/models';

interface EffortBreakdownFormProps {
    control: Control<any>;
    name: string;
}

const safeEval = (expression: string): number => {
    // Simple arithmetic eval guard - only allow numbers, +, -, *, /, (, ), and whitespace
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    if (sanitized !== expression) {
        return NaN;
    }

    try {
        // Use Function constructor as safer alternative to eval
        return new Function('return ' + sanitized)();
    } catch {
        return NaN;
    }
};

const EffortInput = ({ label, value, onChange }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) => {
    // Convert hours to weeks for display (40 hours = 1 week)
    const weeksValue = value / 40;

    return (
        <div>
            <label className="label">{label}</label>
            <input
                type="text"
                className="input-field"
                placeholder="e.g., 1.5 or 2"
                value={weeksValue || ''}
                onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                        onChange(0);
                        return;
                    }

                    // Try to parse as number first
                    const numValue = parseFloat(inputValue);
                    if (!isNaN(numValue)) {
                        // Convert weeks to hours for storage
                        onChange(numValue * 40);
                        return;
                    }

                    // Try to evaluate as expression
                    const evalResult = safeEval(inputValue);
                    if (!isNaN(evalResult)) {
                        // Convert weeks to hours for storage
                        onChange(evalResult * 40);
                    }
                }}
            />
        </div>
    );
};

export const EffortBreakdownForm = ({ control, name }: EffortBreakdownFormProps) => {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const effort = field.value as EffortBreakdown;

                const updateField = (field_name: keyof EffortBreakdown, value: number | string) => {
                    field.onChange({
                        ...effort,
                        [field_name]: value,
                    });
                };

                const totalHours = effort.frontend + effort.backend + effort.design + effort.pm;
                const totalWeeks = totalHours / 40;

                return (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700">Effort Breakdown (weeks)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <EffortInput
                                label="Frontend"
                                value={effort.frontend}
                                onChange={(value) => updateField('frontend', value)}
                            />
                            <EffortInput
                                label="Backend"
                                value={effort.backend}
                                onChange={(value) => updateField('backend', value)}
                            />
                            <EffortInput
                                label="Design"
                                value={effort.design}
                                onChange={(value) => updateField('design', value)}
                            />
                            <EffortInput
                                label="PM"
                                value={effort.pm}
                                onChange={(value) => updateField('pm', value)}
                            />
                        </div>
                        <div>
                            <label className="label">Additional Context</label>
                            <textarea
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Describe estimation methodology, assumptions, or dependencies affecting effort..."
                                value={effort.context || ''}
                                onChange={(e) => updateField('context', e.target.value)}
                            />
                        </div>
                        <div className="text-sm text-gray-600">
                            Total: {totalWeeks.toFixed(1)} weeks ({totalHours} hours)
                        </div>
                    </div>
                );
            }}
        />
    );
}; 