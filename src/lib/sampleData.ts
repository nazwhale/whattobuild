import { v4 as uuidv4 } from 'uuid';
import type { RiceEntry } from './models';

export const sampleEntries: RiceEntry[] = [
    {
        id: uuidv4(),
        title: "Mobile App Push Notifications",
        reach: {
            eligibleToday: 45000,
            monthlyGrowth: 1000,
            adoptionRatePercentage: 80,
            context: "Based on current mobile app user base analysis with 1k new users monthly",
        },
        impactDrivers: {
            userValue: 4,
            businessValue: 5,
            strategicFit: 4,
            context: "Push notifications will increase user engagement and retention significantly",
        },
        confidenceDrivers: {
            dataQuality: 85,
            precedentSimilarity: 90,
            deliveryConfidence: 75,
            context: "Similar implementation done for web platform with great success",
        },
        effort: {
            frontend: 80,
            backend: 120,
            design: 40,
            pm: 20,
            context: "Mobile push infrastructure already exists, mainly UI work needed",
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: uuidv4(),
        title: "Advanced Search Filters",
        reach: {
            eligibleToday: 4500,
            monthlyGrowth: 100,
            adoptionRatePercentage: 60,
            context: "Power users who frequently search and filter content, growing slowly",
        },
        impactDrivers: {
            userValue: 3,
            businessValue: 3,
            strategicFit: 5,
            context: "Addresses top user request from support tickets and surveys",
        },
        confidenceDrivers: {
            dataQuality: 70,
            precedentSimilarity: 80,
            deliveryConfidence: 85,
            context: "Search infrastructure is solid, but complex UI patterns needed",
        },
        effort: {
            frontend: 160,
            backend: 200,
            design: 80,
            pm: 40,
            context: "Complex filter logic and UI states require careful planning",
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
        id: uuidv4(),
        title: "Dark Mode Theme",
        reach: {
            eligibleToday: 2200,
            monthlyGrowth: 50,
            adoptionRatePercentage: 40,
            context: "Users who prefer dark interfaces, mostly power users with modest growth",
        },
        impactDrivers: {
            userValue: 2,
            businessValue: 2,
            strategicFit: 3,
            context: "Nice-to-have feature that improves user experience for some segments",
        },
        confidenceDrivers: {
            dataQuality: 95,
            precedentSimilarity: 95,
            deliveryConfidence: 90,
            context: "Well-established pattern with clear implementation path",
        },
        effort: {
            frontend: 120,
            backend: 40,
            design: 160,
            pm: 20,
            context: "Design system needs comprehensive theming, minimal backend changes",
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
    {
        id: uuidv4(),
        title: "AI-Powered Recommendations",
        reach: {
            eligibleToday: 85000,
            monthlyGrowth: 2500,
            adoptionRatePercentage: 30,
            context: "All active users with strong user acquisition growth, adoption depends on ML quality",
        },
        impactDrivers: {
            userValue: 5,
            businessValue: 5,
            strategicFit: 5,
            context: "Game-changing feature that could significantly increase engagement and revenue",
        },
        confidenceDrivers: {
            dataQuality: 60,
            precedentSimilarity: 40,
            deliveryConfidence: 50,
            context: "High-risk project with uncertain ML performance and complex data pipeline requirements",
        },
        effort: {
            frontend: 200,
            backend: 400,
            design: 80,
            pm: 80,
            context: "Requires ML infrastructure, data pipeline, and extensive testing",
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
]; 