import { useState, useEffect } from 'react';
import { formatNumberForDisplay, parseDisplayNumber, isValidDisplayNumber } from '../../lib/numberUtils';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    className?: string;
    displayInThousands?: boolean;
    min?: number;
    max?: number;
}

export const NumberInput = ({
    value,
    onChange,
    placeholder,
    className = "input-field",
    displayInThousands = false,
    min,
    max
}: NumberInputProps) => {
    const [displayValue, setDisplayValue] = useState<string>('');
    const [isValid, setIsValid] = useState(true);

    // Update display value when prop value changes
    useEffect(() => {
        if (displayInThousands) {
            setDisplayValue(value ? formatNumberForDisplay(value) : '');
        } else {
            setDisplayValue(value ? value.toString() : '');
        }
    }, [value, displayInThousands]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setDisplayValue(inputValue);

        if (displayInThousands) {
            const valid = isValidDisplayNumber(inputValue);
            setIsValid(valid);

            if (valid) {
                const numericValue = parseDisplayNumber(inputValue);
                // Apply min/max constraints if provided
                let constrainedValue = numericValue;
                if (min !== undefined && constrainedValue < min) constrainedValue = min;
                if (max !== undefined && constrainedValue > max) constrainedValue = max;

                onChange(constrainedValue);
            }
        } else {
            const numericValue = parseFloat(inputValue);
            if (!isNaN(numericValue) || inputValue === '') {
                const finalValue = isNaN(numericValue) ? 0 : numericValue;

                // Apply min/max constraints if provided
                let constrainedValue = finalValue;
                if (min !== undefined && constrainedValue < min) constrainedValue = min;
                if (max !== undefined && constrainedValue > max) constrainedValue = max;

                onChange(constrainedValue);
                setIsValid(true);
            } else {
                setIsValid(false);
            }
        }
    };

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={`${className} ${!isValid ? 'border-red-500' : ''}`}
            min={min}
            max={max}
        />
    );
}; 