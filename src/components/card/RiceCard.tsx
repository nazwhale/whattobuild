import { useForm } from 'react-hook-form';
import { useMemo, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import type { RiceEntry } from '../../lib/models';
import { Accordion } from '../common/Accordion';
import { Button } from '../common/Button';
import { NumberInput } from '../common/NumberInput';
import { EffortBreakdownForm } from './EffortBreakdownForm';
import { reachScore, impactScore, confidenceScore, effortHours, riceScore } from '../../lib/riceMath';
import { formatNumberForDisplay } from '../../lib/numberUtils';
import { Slider } from '../ui/slider';
import { SliderField } from '../common/SliderField';

interface RiceCardProps {
    entry?: RiceEntry;
    onSave: (data: Omit<RiceEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onDelete?: () => void;
    onFormDataChange?: (data: Omit<RiceEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const RiceCard = ({ entry, onSave, onDelete, onFormDataChange }: RiceCardProps) => {
    const { control, handleSubmit, watch, register, reset } = useForm({
        defaultValues: entry || {
            title: '',
            reach: {
                eligibleToday: 0,
                monthlyGrowth: 0,
                adoptionRatePercentage: 0,
                context: '',
            },
            impactDrivers: {
                userValue: 1,
                businessValue: 1,
                strategicFit: 1,
                context: '',
            },
            confidenceDrivers: {
                dataQuality: 0,
                precedentSimilarity: 0,
                deliveryConfidence: 0,
                context: '',
            },
            effort: {
                frontend: 0,
                backend: 0,
                design: 0,
                pm: 0,
                context: '',
            },
        },
    });

    const formData = watch();

    // Reset form when entry prop changes - this fixes the bug where initiatives were being overwritten
    useEffect(() => {
        const defaultValues = entry || {
            title: '',
            reach: {
                eligibleToday: 0,
                monthlyGrowth: 0,
                adoptionRatePercentage: 0,
                context: '',
            },
            impactDrivers: {
                userValue: 1,
                businessValue: 1,
                strategicFit: 1,
                context: '',
            },
            confidenceDrivers: {
                dataQuality: 0,
                precedentSimilarity: 0,
                deliveryConfidence: 0,
                context: '',
            },
            effort: {
                frontend: 0,
                backend: 0,
                design: 0,
                pm: 0,
                context: '',
            },
        };
        reset(defaultValues);
    }, [entry, reset]);

    // Calculate live scores
    const scores = useMemo(() => {
        const reach = reachScore(formData.reach);
        const impact = impactScore(formData.impactDrivers);
        const confidence = confidenceScore(formData.confidenceDrivers);
        const effort = effortHours(formData.effort);
        const rice = effort > 0 ? riceScore(reach, impact, confidence, effort) : 0;

        return { reach, impact, confidence, effort, rice };
    }, [formData]);

    const onSubmit = (data: any) => {
        onSave(data);
    };

    useEffect(() => {
        if (onFormDataChange) {
            onFormDataChange(formData);
        }
    }, [formData, onFormDataChange]);

    return (
        <div className="card p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Header with title and score */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 mr-4">
                        <input
                            {...register('title', { required: true })}
                            className="text-xl font-semibold bg-transparent border-none outline-none w-full placeholder-gray-400"
                            placeholder="Initiative title..."
                        />
                        {entry && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                Changes auto-saved when switching initiatives
                            </div>
                        )}
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold text-lg">
                        RICE: {scores.rice.toFixed(1)}
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Reach Section */}
                    <Accordion title="Reach" defaultOpen>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="label">Eligible Today</label>
                                <Controller
                                    control={control}
                                    name="reach.eligibleToday"
                                    render={({ field }) => (
                                        <NumberInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="10k"
                                            displayInThousands={true}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <label className="label">Monthly Growth</label>
                                <Controller
                                    control={control}
                                    name="reach.monthlyGrowth"
                                    render={({ field }) => (
                                        <NumberInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="500"
                                            displayInThousands={true}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <label className="label">Adoption Rate (%)</label>
                                <Controller
                                    control={control}
                                    name="reach.adoptionRatePercentage"
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                className="input-field"
                                                placeholder="25"
                                                min="0"
                                                max="100"
                                                value={field.value}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                            <Slider
                                                value={[field.value]}
                                                onValueChange={(value) => field.onChange(value[0])}
                                                max={100}
                                                min={0}
                                                step={1}
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="label">Additional Context</label>
                            <textarea
                                {...register('reach.context')}
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Add details about your reach assumptions, data sources, or methodology..."
                            />
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            Reach Score: {formatNumberForDisplay(scores.reach)} users (expected 12-month total)
                        </div>
                    </Accordion>

                    {/* Impact Section */}
                    <Accordion title="Impact">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="label">User Value (1-5)</label>
                                <input
                                    {...register('impactDrivers.userValue', { valueAsNumber: true })}
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="5"
                                />
                            </div>
                            <div>
                                <label className="label">Business Value (1-5)</label>
                                <input
                                    {...register('impactDrivers.businessValue', { valueAsNumber: true })}
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="5"
                                />
                            </div>
                            <div>
                                <label className="label">Strategic Fit (1-5)</label>
                                <input
                                    {...register('impactDrivers.strategicFit', { valueAsNumber: true })}
                                    type="number"
                                    className="input-field"
                                    min="1"
                                    max="5"
                                />
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            💡 <strong>Weighted formula:</strong> User Value (40%) + Business Value (40%) + Strategic Fit (20%)
                        </div>
                        <div className="mt-4">
                            <label className="label">Additional Context</label>
                            <textarea
                                {...register('impactDrivers.context')}
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Explain your impact assessment, success metrics, or specific user/business benefits..."
                            />
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                            Impact Score: {scores.impact.toFixed(2)}
                        </div>
                    </Accordion>

                    {/* Confidence Section */}
                    <Accordion title="Confidence">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SliderField
                                control={control}
                                name="confidenceDrivers.dataQuality"
                                label="Data Quality"
                                helpText="How reliable and accurate is the underlying data supporting this feature's expected impact?"
                            />

                            <SliderField
                                control={control}
                                name="confidenceDrivers.precedentSimilarity"
                                label="Precedent"
                                helpText="How similar is this feature to past successful implementations you've built or observed?"
                            />

                            <SliderField
                                control={control}
                                name="confidenceDrivers.deliveryConfidence"
                                label="Delivery"
                                helpText="How confident are you in the team's ability to deliver this feature as scoped and on time?"
                            />
                        </div>
                        <div className="mt-4">
                            <label className="label">Additional Context</label>
                            <textarea
                                {...register('confidenceDrivers.context')}
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Note any risks, dependencies, or additional factors affecting your confidence level..."
                            />
                        </div>
                        <div className="text-sm text-gray-600 mt-4">
                            Confidence Score: {scores.confidence.toFixed(0)}%
                        </div>
                    </Accordion>

                    {/* Effort Section */}
                    <Accordion title="Effort">
                        <EffortBreakdownForm control={control} name="effort" />
                        <div className="text-sm text-gray-600 mt-2">
                            Total Effort: {(scores.effort / 40).toFixed(1)} weeks ({scores.effort} hours)
                        </div>
                    </Accordion>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6">
                    <div>
                        {onDelete && (
                            <Button variant="secondary" onClick={onDelete} type="button">
                                Delete
                            </Button>
                        )}
                    </div>
                    <Button type="submit">
                        {entry ? 'Update' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}; 