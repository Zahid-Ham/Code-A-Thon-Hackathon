import { SCENARIOS } from './data/scenarios';

export const getScenarioById = (id) => {
    return SCENARIOS.find(s => s.id === id);
};

export const getFirstScenario = () => {
    return SCENARIOS[0];
};

export const getNextScenario = (currentScenarioId) => {
    const currentIndex = SCENARIOS.findIndex(s => s.id === currentScenarioId);
    if (currentIndex >= 0 && currentIndex < SCENARIOS.length - 1) {
        return SCENARIOS[currentIndex + 1];
    }
    return null; // No more scenarios
};
