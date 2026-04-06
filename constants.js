/**
 * constants.js
 * Configuration and constants for the mate choice simulation
 * Exports globally so all modules can access
 */

var CONFIG = {
  // Simulation parameters
  simulation: {
    STEP_COUNT: 50,
    ENCOUNTER_DISTANCE: 28,
    AGENT_RADIUS: 6,
    RULE_ANALYTICS_RUNS: 20,
  },

  // Density settings: multiplier on base population
  density: {
    Sparse: 0.8,
    Normal: 1.6,
    Dense: 2.6,
    baseFactor: 0.00045, // scaled by canvas area
  },

  // Mobility settings: pixels per step
  mobility: {
    Low: 6,
    Medium: 14,
    High: 24,
  },

  // Selectivity settings: acceptance threshold multiplier
  selectivity: {
    Low: 1.15,
    Medium: 1,
    High: 0.85,
  },

  // Patience settings: how fast to relax standards (per search step)
  patience: {
    Fast: 0.02,
    Normal: 0.01,
    Slow: 0.004,
  },

  // Exploration settings: movement scope multiplier
  exploration: {
    Local: 0.75,
    Balanced: 1,
    Wide: 1.35,
  },
};

// Export as globals for backward compatibility
var STEP_COUNT = CONFIG.simulation.STEP_COUNT;
var ENCOUNTER_DISTANCE = CONFIG.simulation.ENCOUNTER_DISTANCE;
var AGENT_RADIUS = CONFIG.simulation.AGENT_RADIUS;
var RULE_ANALYTICS_RUNS = CONFIG.simulation.RULE_ANALYTICS_RUNS;

var densityMultipliers = CONFIG.density;
var baseDensityFactor = CONFIG.density.baseFactor;
var mobilitySizes = CONFIG.mobility;
var selectivityMultipliers = CONFIG.selectivity;
var patienceRates = CONFIG.patience;
var explorationMultipliers = CONFIG.exploration;
