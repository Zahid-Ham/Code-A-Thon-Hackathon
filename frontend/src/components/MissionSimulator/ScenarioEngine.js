import { MISSIONS } from './data/scenarios';

export const getMissions = () => MISSIONS;

export const getMissionById = (id) => MISSIONS.find(m => m.id === id);

export const getFirstScenario = (missionId) => {
    const mission = MISSIONS.find(m => m.id === missionId);
    return mission ? mission.scenarios[0] : null;
};

export const getNextScenario = (currentScenarioId) => {
    // Find the mission that contains this scenario
    for (const mission of MISSIONS) {
        const idx = mission.scenarios.findIndex(s => s.id === currentScenarioId);
        if (idx !== -1 && idx < mission.scenarios.length - 1) {
            return mission.scenarios[idx + 1];
        }
    }
    return null; // No more scenarios
};

export const enrichScenarioWithConfig = (scenario, config) => {
    if (!scenario || !config) return scenario;

    // Deep copy to avoid mutating the original constant
    const enriched = JSON.parse(JSON.stringify(scenario));

    enriched.choices.forEach(choice => {
        // 1. VEHICLE IMPACT (Launch Scenarios)
        if (scenario.type === 'LAUNCH') {
            const reliability = parseFloat(config.vehicle.reliability || 90);
            if (reliability > 98) {
                // High reliability vehicle (e.g. Falcon 9) improves success odds
                choice.risk.successChance = Math.min(0.99, choice.risk.successChance + 0.10);
            } else if (reliability < 95) {
                // Low reliability vehicle decreases odds
                choice.risk.successChance = Math.max(0.10, choice.risk.successChance - 0.10);
            }
        }

        // 2. ORBIT IMPACT (Orbit Scenarios)
        if (scenario.type === 'ORBIT') {
            if (config.orbit.id === 'geo') {
                // GEO is harder/more expensive
                if (choice.risk.fuelCost) choice.risk.fuelCost += 20;
                choice.risk.successChance -= 0.05;
            } else if (config.orbit.id === 'leo') {
                // LEO is easier
                choice.risk.successChance += 0.05;
            }
        }

        // 3. PAYLOAD IMPACT (All Scenarios)
        // Heavier payloads might increase fuel costs or risk
        if (config.payload.risk === 'High') {
            choice.risk.successChance -= 0.05; // Sensitive instruments break easier
        }
    });

    return enriched;
};
