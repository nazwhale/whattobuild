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
                mode: 'optimise', // Default to optimise mode
                adoptionRatePercentage: 0,
                context: '',
                // Optimise mode fields
                eligibleToday: 0,
                currentAdoptionPercentage: 0,
                monthlyGrowth: 0,
                // Acquire mode fields  
                monthlyNewEligible: 0,
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

    // 🚨 CRITICAL: MODE-AWARE FORM RESET TO PREVENT DATA CONTAMINATION
    // This useEffect handles form reset when switching between initiatives.
    // 
    // ⚠️  IMPORTANT FOR AI ASSISTANTS: 
    // - Do NOT set all reach fields regardless of mode - this causes data bleeding
    // - MUST use mode-specific field setting with explicit clearing of other mode's fields
    // - Each mode has exclusive fields that should be undefined for the other mode
    //
    // Bug context: When switching between "optimise" and "acquire" initiatives,
    // phantom values were appearing because all fields were always set to defaults,
    // allowing form state to leak between different modes.
    useEffect(() => {
        const currentMode = entry?.reach?.mode || 'optimise';

        const defaultValues = {
            title: entry?.title || '',
            reach: {
                mode: currentMode,
                adoptionRatePercentage: entry?.reach?.adoptionRatePercentage || 0,
                context: entry?.reach?.context || '',

                // 🎯 MODE-EXCLUSIVE FIELD MANAGEMENT
                // Only populate fields relevant to the current mode.
                // Explicitly set other mode's fields to undefined to clear form state.
                ...(currentMode === 'optimise' ? {
                    // ✅ OPTIMISE MODE: Set optimise-specific fields
                    eligibleToday: entry?.reach?.eligibleToday || 0,
                    currentAdoptionPercentage: entry?.reach?.currentAdoptionPercentage || 0,
                    monthlyGrowth: entry?.reach?.monthlyGrowth || 0,

                    // 🧹 CLEAR ACQUIRE MODE FIELDS to prevent contamination
                    monthlyNewEligible: undefined,
                } : {
                    // ✅ ACQUIRE MODE: Set acquire-specific fields  
                    monthlyNewEligible: entry?.reach?.monthlyNewEligible || 0,

                    // 🧹 CLEAR OPTIMISE MODE FIELDS to prevent contamination
                    eligibleToday: undefined,
                    currentAdoptionPercentage: undefined,
                    monthlyGrowth: undefined,
                }),
            },
            impactDrivers: {
                userValue: entry?.impactDrivers?.userValue || 1,
                businessValue: entry?.impactDrivers?.businessValue || 1,
                strategicFit: entry?.impactDrivers?.strategicFit || 1,
                context: entry?.impactDrivers?.context || '',
            },
            confidenceDrivers: {
                dataQuality: entry?.confidenceDrivers?.dataQuality || 0,
                precedentSimilarity: entry?.confidenceDrivers?.precedentSimilarity || 0,
                deliveryConfidence: entry?.confidenceDrivers?.deliveryConfidence || 0,
                context: entry?.confidenceDrivers?.context || '',
            },
            effort: {
                frontend: entry?.effort?.frontend || 0,
                backend: entry?.effort?.backend || 0,
                design: entry?.effort?.design || 0,
                pm: entry?.effort?.pm || 0,
                context: entry?.effort?.context || '',
            },
        };

        // Apply the mode-aware reset
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

    // Helper function to generate the math explanation badge
    const getReachMathExplanation = () => {
        const { reach } = formData;
        const reachValue = scores.reach;

        if (reach.mode === 'optimise') {
            const { eligibleToday = 0, monthlyGrowth = 0, adoptionRatePercentage = 0, currentAdoptionPercentage = 0 } = reach;
            const totalEligible = eligibleToday + (monthlyGrowth * 12);
            const adoptionUplift = adoptionRatePercentage - currentAdoptionPercentage;
            return `+${formatNumberForDisplay(reachValue)} users from ${adoptionUplift}% uplift (${currentAdoptionPercentage}% → ${adoptionRatePercentage}%) across ${formatNumberForDisplay(totalEligible)} total eligible (${formatNumberForDisplay(eligibleToday)} today + ${formatNumberForDisplay(monthlyGrowth * 12)} from 12 months growth)`;
        } else {
            const { monthlyNewEligible = 0, adoptionRatePercentage = 0 } = reach;
            const annualEligible = monthlyNewEligible * 12;
            return `+${formatNumberForDisplay(reachValue)} users (${formatNumberForDisplay(annualEligible)} new eligible × ${adoptionRatePercentage}%)`;
        }
    };

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
                        {/* Radio toggle for Optimise vs Acquire */}
                        <div className="mb-6">
                            <div className="flex space-x-4">
                                <Controller
                                    control={control}
                                    name="reach.mode"
                                    render={({ field }) => (
                                        <>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="optimise"
                                                    checked={field.value === 'optimise'}
                                                    onChange={() => field.onChange('optimise')}
                                                    className="form-radio h-4 w-4 text-blue-600"
                                                />
                                                <span className="text-sm font-medium">Optimise existing cohort</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="acquire"
                                                    checked={field.value === 'acquire'}
                                                    onChange={() => field.onChange('acquire')}
                                                    className="form-radio h-4 w-4 text-blue-600"
                                                />
                                                <span className="text-sm font-medium">Acquire new cohort</span>
                                            </label>
                                        </>
                                    )}
                                />
                            </div>

                            {/* Explanation text for each mode */}
                            <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                {formData.reach.mode === 'optimise' ? (
                                    <>
                                        <strong>Optimise mode:</strong> How many extra people will succeed because of the uplift across today's base and 12 months of new sign-ups?
                                        <br />
                                        <em>Formula: (eligibleToday + monthlyGrowth×12) × (adoptionTargetPct – adoptionNowPct) / 100</em>
                                    </>
                                ) : (
                                    <>
                                        <strong>Acquire mode:</strong> How many of the fresh faces will we win next year?
                                        <br />
                                        <em>Formula: (Monthly new eligible × 12) × Adoption % of newcomers = new users reached</em>
                                        <br />
                                        <span className="text-amber-600">💡 Monthly new eligible should reference SOM (Serviceable Obtainable Market), not TAM or SAM</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Dynamic fields based on selected mode */}
                        {formData.reach.mode === 'optimise' ? (
                            // Optimise mode fields
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="label">Current Eligible Users</label>
                                    <div className="text-xs text-gray-500 mb-2">Total users <strong>today</strong> who <em>could</em> adopt.</div>
                                    <Controller
                                        control={control}
                                        name="reach.eligibleToday"
                                        render={({ field }) => (
                                            <NumberInput
                                                value={field.value || 0}
                                                onChange={field.onChange}
                                                placeholder="600"
                                                displayInThousands={true}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="label">Monthly New Eligible Users</label>
                                    <div className="text-xs text-gray-500 mb-2">Fresh cohort entering this funnel each month.</div>
                                    <Controller
                                        control={control}
                                        name="reach.monthlyGrowth"
                                        render={({ field }) => (
                                            <NumberInput
                                                value={field.value || 0}
                                                onChange={field.onChange}
                                                placeholder="100"
                                                displayInThousands={true}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="label">Current Adoption %</label>
                                    <div className="text-xs text-gray-500 mb-2">What share of the cohort adopts today.</div>
                                    <Controller
                                        control={control}
                                        name="reach.currentAdoptionPercentage"
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="17"
                                                    min="0"
                                                    max="100"
                                                    value={field.value || 0}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                />
                                                <Slider
                                                    value={[field.value || 0]}
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
                                <div>
                                    <label className="label">Target Adoption %</label>
                                    <div className="text-xs text-gray-500 mb-2">Expected share after improvement.</div>
                                    <Controller
                                        control={control}
                                        name="reach.adoptionRatePercentage"
                                        render={({ field }) => (
                                            <div className="space-y-2">
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    placeholder="43"
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
                        ) : (
                            // Acquire mode fields
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Monthly New Eligible (SOM)</label>
                                    <div className="text-xs text-gray-500 mb-2">New users per month you can actually reach via your channel (Serviceable Obtainable Market)</div>
                                    <Controller
                                        control={control}
                                        name="reach.monthlyNewEligible"
                                        render={({ field }) => (
                                            <NumberInput
                                                value={field.value || 0}
                                                onChange={field.onChange}
                                                placeholder="500"
                                                displayInThousands={true}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="label">Adoption Rate (%)</label>
                                    <div className="text-xs text-gray-500 mb-2">What percentage of newcomers will adopt this feature</div>
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
                        )}

                        <div className="mt-4">
                            <label className="label">Additional Context</label>
                            <textarea
                                {...register('reach.context')}
                                className="input-field resize-none"
                                rows={3}
                                placeholder="Add details about your reach assumptions, data sources, or methodology..."
                            />
                        </div>

                        {/* Helper badge showing the math */}
                        <div className="mt-4 flex flex-col space-y-2">
                            <div className="text-sm text-gray-600">
                                Reach Score: {formatNumberForDisplay(scores.reach)} users
                            </div>
                            <div className="text-xs bg-blue-50 text-blue-800 px-3 py-2 rounded-md border border-blue-200">
                                💡 <strong>Math:</strong> {getReachMathExplanation()}
                            </div>
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