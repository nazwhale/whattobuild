import { useMemo } from 'react';
import type { RiceEntry } from '../../lib/models';
import { reachScore, impactScore, confidenceScore, effortHours, riceScore } from '../../lib/riceMath';
import { formatNumberForDisplay } from '../../lib/numberUtils';

interface RankTableProps {
    entries: RiceEntry[];
    onEditEntry: (entry: RiceEntry) => void;
    editingEntryId?: string | null;
    arpu: number;
}

export const RankTable = ({ entries, onEditEntry, editingEntryId, arpu }: RankTableProps) => {
    const rankedEntries = useMemo(() => {
        return entries
            .map(entry => {
                const reach = reachScore(entry.reach);
                const impact = impactScore(entry.impactDrivers);
                const confidence = confidenceScore(entry.confidenceDrivers);
                const effort = effortHours(entry.effort);
                const rice = effort > 0 ? riceScore(reach, impact, confidence, effort) : 0;

                return {
                    ...entry,
                    scores: { reach, impact, confidence, effort, rice }
                };
            })
            .sort((a, b) => b.scores.rice - a.scores.rice);
    }, [entries]);

    // Calculate totals
    const totals = useMemo(() => {
        const totalReach = rankedEntries.reduce((sum, entry) => sum + entry.scores.reach, 0);
        const totalEffortHours = rankedEntries.reduce((sum, entry) => sum + entry.scores.effort, 0);
        const totalEffortMonths = totalEffortHours / (40 * 4.33); // Convert hours to months (40 hours/week * 4.33 weeks/month)
        const arrUplift = arpu * 12 * totalReach; // ARPU × 12 × customers acquired

        return {
            reach: totalReach,
            effortMonths: totalEffortMonths,
            arrUplift: arrUplift
        };
    }, [rankedEntries, arpu]);

    if (entries.length === 0) {
        return (
            <div className="card p-8 text-center text-gray-500">
                <p>No initiatives yet. Create your first RICE entry to get started!</p>
            </div>
        );
    }

    return (
        <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">📊 RICE Rankings</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-medium text-gray-700">Rank</th>
                            <th className="text-left py-3 px-2 font-medium text-gray-700">Initiative</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700">Score</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700">Reach /yr</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700">Impact</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700">Confidence</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700">Effort (weeks)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedEntries.map((entry, index) => (
                            <tr
                                key={entry.id}
                                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${editingEntryId === entry.id
                                    ? 'bg-blue-50 border-blue-200'
                                    : ''
                                    }`}
                                onClick={() => onEditEntry(entry)}
                            >
                                <td className="py-3 px-2">
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                        index === 1 ? 'bg-gray-400' :
                                            index === 2 ? 'bg-amber-600' :
                                                'bg-gray-300'
                                        }`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className="py-3 px-2">
                                    <div className="flex items-center">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {entry.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Updated {new Date(entry.updatedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-2 text-right">
                                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
                                        {entry.scores.rice.toFixed(1)}
                                    </span>
                                </td>
                                <td className="py-3 px-2 text-right text-gray-600">
                                    {formatNumberForDisplay(entry.scores.reach)}
                                </td>
                                <td className="py-3 px-2 text-right text-gray-600">
                                    {entry.scores.impact.toFixed(1)}
                                </td>
                                <td className="py-3 px-2 text-right text-gray-600">
                                    {entry.scores.confidence.toFixed(0)}%
                                </td>
                                <td className="py-3 px-2 text-right text-gray-600">
                                    {(entry.scores.effort / 40).toFixed(1)}
                                </td>
                            </tr>
                        ))}

                        {/* Totals Row */}
                        <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                            <td className="py-3 px-2"></td>
                            <td className="py-3 px-2 text-gray-700">
                                <div className="font-semibold">TOTALS</div>
                                <div className="text-xs text-gray-500 font-normal">
                                    12-month portfolio impact
                                </div>
                            </td>
                            <td className="py-3 px-2 text-right"></td>
                            <td className="py-3 px-2 text-right text-gray-700">
                                <div className="font-bold text-blue-700">
                                    {formatNumberForDisplay(totals.reach)}
                                </div>
                                <div className="text-xs text-gray-500 font-normal">
                                    customers acquired
                                </div>
                            </td>
                            <td className="py-3 px-2 text-right"></td>
                            <td className="py-3 px-2 text-right"></td>
                            <td className="py-3 px-2 text-right text-gray-700">
                                <div className="font-bold text-orange-700">
                                    {totals.effortMonths.toFixed(1)}
                                </div>
                                <div className="text-xs text-gray-500 font-normal">
                                    months
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ARR Uplift Summary */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-green-800">💰 Annual Recurring Revenue (ARR) Uplift</h3>
                        <p className="text-sm text-green-600">
                            £{arpu.toFixed(2)} ARPU × 12 months × {formatNumberForDisplay(totals.reach)} customers
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-green-800">
                            £{formatNumberForDisplay(totals.arrUplift)}
                        </div>
                        <div className="text-sm text-green-600">annual uplift</div>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                Click on any row to edit the initiative. Changes are auto-saved when switching between initiatives.
            </div>
        </div>
    );
}; 