import { Controller } from 'react-hook-form';
import { Slider } from '../ui/slider';

interface SliderFieldProps {
    control: any;
    name: string;
    label: string;
    helpText: string;
    min?: number;
    max?: number;
    step?: number;
}

export const SliderField = ({
    control,
    name,
    label,
    helpText,
    min = 0,
    max = 100,
    step = 1
}: SliderFieldProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="label text-sm font-medium text-gray-700">
                    {label}
                </label>
                <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <input
                            type="number"
                            className="input-field w-16 text-center text-sm"
                            min={min}
                            max={max}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                    )}
                />
            </div>

            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={max}
                        min={min}
                        step={step}
                        className="w-full"
                    />
                )}
            />

            <p className="text-xs text-gray-500 leading-relaxed">
                {helpText}
            </p>
        </div>
    );
}; 