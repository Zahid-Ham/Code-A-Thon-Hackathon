import { OUTCOMES } from './data/scenarios';

/**
 * Evaluates the result of a user's decision based on probabilistic risk.
 * @param {Object} choice The choice object selected by the user
 * @returns {Object} The outcome result including message, stats, and education info
 */
export const evaluateDecision = (choice) => {
    const randomValue = Math.random();
    const isSuccess = randomValue <= choice.risk.successChance;

    const outcomeId = isSuccess ? choice.outcomeIds.success : choice.outcomeIds.failure;

    // Fallback if no failure outcome is defined but we failed (shouldn't happen with correct data)
    const finalOutcomeId = outcomeId || choice.outcomeIds.success;

    const outcomeData = OUTCOMES[finalOutcomeId];

    return {
        success: isSuccess,
        outcomeId: finalOutcomeId,
        ...outcomeData
    };
};

/**
 * Calculates the score based on accumulated stats.
 * @param {Object} currentStats Current accumulated stats
 * @param {Object} outcomeStats Stats from the latest outcome
 * @returns {Object} Updated stats
 */
export const calculateScore = (currentStats, outcomeStats) => {
    return {
        cost: currentStats.cost + outcomeStats.cost,
        science: currentStats.science + outcomeStats.science,
        safety: (currentStats.safety + outcomeStats.safety) / 2 // Average safety rating
    };
};
