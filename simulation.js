/**
 * simulation.js
 * Pure simulation engine for mate choice dynamics
 * No DOM dependencies; returns state/metrics only
 */

class SimulationEngine {
  constructor(canvasSize = 500) {
    this.canvasSize = canvasSize;
  }

  /**
   * Create initial population of agents on the grid
   */
  createAgents(count) {
    const agents = [];
    const padding = AGENT_RADIUS + 2;
    for (let i = 0; i < count; i += 1) {
      agents.push({
        id: i,
        attractiveness: this.randomInt(1, 10),
        x: this.randomFloat(padding, this.canvasSize - padding),
        y: this.randomFloat(padding, this.canvasSize - padding),
        matched: false,
        partnerId: null,
        matchedAtStep: null,
        searchSteps: 0,
      });
    }
    return agents;
  }

  /**
   * Create a synthetic agent for batch runs
   */
  createSyntheticAgent(id, size, padding) {
    return {
      id,
      attractiveness: this.randomInt(1, 10),
      x: this.randomFloat(padding, size - padding),
      y: this.randomFloat(padding, size - padding),
      matched: false,
      partnerId: null,
      matchedAtStep: null,
      searchSteps: 0,
    };
  }

  /**
   * Execute one simulation step: move, encounter, match
   */
  stepSimulation(state, preferenceRule, mobilityLevel, selectivityLevel, patienceLevel) {
    const movement = (mobilitySizes[mobilityLevel] || mobilitySizes.Medium);
    const padding = AGENT_RADIUS + 2;

    state.agents.forEach((agent) => {
      if (agent.matched) return;
      agent.x = this.clamp(
        agent.x + this.randomFloat(-movement, movement),
        padding,
        this.canvasSize - padding
      );
      agent.y = this.clamp(
        agent.y + this.randomFloat(-movement, movement),
        padding,
        this.canvasSize - padding
      );
    });

    this.resolveEncounters(state, preferenceRule, selectivityLevel, patienceLevel, state.step);

    state.agents.forEach((agent) => {
      if (!agent.matched) agent.searchSteps += 1;
    });
  }

  /**
   * Resolve all potential encounters in this step
   */
  resolveEncounters(state, preferenceRule, selectivityLevel, patienceLevel, currentStep) {
    const unmatchedAgents = this.shuffle(state.agents.filter((agent) => !agent.matched));

    for (let index = 0; index < unmatchedAgents.length; index += 1) {
      const agent = unmatchedAgents[index];

      if (agent.matched) continue;

      for (let otherIndex = index + 1; otherIndex < unmatchedAgents.length; otherIndex += 1) {
        const candidate = unmatchedAgents[otherIndex];

        if (candidate.matched) continue;
        if (this.getDistance(agent, candidate) > ENCOUNTER_DISTANCE) continue;

        if (this.mutuallyAccept(agent, candidate, preferenceRule, selectivityLevel, patienceLevel)) {
          this.matchAgents(agent, candidate, currentStep);
          break;
        }
      }
    }
  }

  /**
   * Check if two agents mutually accept each other
   */
  mutuallyAccept(agent, candidate, preferenceRule, selectivityLevel, patienceLevel) {
    const agentAcceptance = this.getAcceptanceScoreWithSettings(
      agent,
      candidate,
      preferenceRule,
      selectivityLevel,
      patienceLevel
    );
    const candidateAcceptance = this.getAcceptanceScoreWithSettings(
      candidate,
      agent,
      preferenceRule,
      selectivityLevel,
      patienceLevel
    );

    return Math.random() < agentAcceptance && Math.random() < candidateAcceptance;
  }

  /**
   * Get acceptance score with full settings
   */
  getAcceptanceScoreWithSettings(agent, candidate, preferenceRule, selectivityLevel, patienceLevel) {
    const selectivity = selectivityMultipliers[selectivityLevel || "Medium"] || 1;
    const patienceRate = patienceRates[patienceLevel || "Normal"] || 0.01;
    const patienceBoost = agent.searchSteps * patienceRate;

    if (preferenceRule === "Similarity-based") {
      const difference = Math.abs(agent.attractiveness - candidate.attractiveness);
      return this.clamp((1 - difference / 9) * selectivity + patienceBoost, 0.1, 1);
    }

    return this.clamp((candidate.attractiveness / 10) * selectivity + patienceBoost, 0.1, 1);
  }

  /**
   * Mark two agents as matched
   */
  matchAgents(agent, candidate, stepNumber) {
    agent.matched = true;
    candidate.matched = true;
    agent.partnerId = candidate.id;
    candidate.partnerId = agent.id;
    agent.matchedAtStep = stepNumber;
    candidate.matchedAtStep = stepNumber;
  }

  /**
   * Get Euclidean distance between two agents
   */
  getDistance(first, second) {
    return Math.hypot(first.x - second.x, first.y - second.y);
  }

  /**
   * Get population count for a given density level relative to canvas size
   */
  getDensityCount(densityLevel) {
    const area = this.canvasSize * this.canvasSize;
    const multiplier = densityMultipliers[densityLevel] || 1;
    const count = Math.max(10, Math.round(area * baseDensityFactor * multiplier));
    return count;
  }

  /**
   * Compute metrics for a completed simulation
   */
  getSimulationMetrics(agents, pairs) {
    const matchedCount = agents.filter((agent) => agent.matched).length;
    const pairCount = pairs.length;

    // Inter-pair correlation
    const correlation = this.computeInterPairCorrelation(agents, pairs);

    // Mean date to mate
    const matchedSteps = agents
      .filter((agent) => agent.matchedAtStep)
      .map((agent) => agent.matchedAtStep);
    const meanDateToMate =
      matchedSteps.length > 0 ? matchedSteps.reduce((sum, s) => sum + s, 0) / matchedSteps.length : STEP_COUNT;

    // Average search steps
    const searchSteps = agents.map((agent) => agent.searchSteps);
    const averageSearchSteps =
      searchSteps.length > 0 ? searchSteps.reduce((sum, s) => sum + s, 0) / searchSteps.length : STEP_COUNT;

    // Hazard series (early matching pressure)
    const hazardSeries = this.computeHazardSeries(agents);

    return {
      pairCount,
      matchedCount,
      matchingStrength: correlation,
      averageSearchSteps,
      meanDateToMate,
      hazardSeries,
    };
  }

  /**
   * Compute Pearson correlation between matched partner attractiveness
   */
  computeInterPairCorrelation(agents, pairs) {
    if (!pairs.length) return 0;

    const xs = [];
    const ys = [];
    pairs.forEach((pair) => {
      const first = agents[pair.agent1];
      const second = agents[pair.agent2];
      if (!first || !second) return;
      xs.push(first.attractiveness);
      ys.push(second.attractiveness);
    });

    if (xs.length < 2) return 0;

    const n = xs.length;
    const sumX = xs.reduce((sum, value) => sum + value, 0);
    const sumY = ys.reduce((sum, value) => sum + value, 0);
    const sumXX = xs.reduce((sum, value) => sum + value * value, 0);
    const sumYY = ys.reduce((sum, value) => sum + value * value, 0);
    const sumXY = xs.reduce((sum, value, index) => sum + value * ys[index], 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Compute hazard series from agents (non-replacement)
   */
  computeHazardSeries(agents) {
    const hazardSeries = new Array(STEP_COUNT).fill(0);
    const atRisk = new Array(STEP_COUNT + 1).fill(0);
    atRisk[0] = agents.length;

    for (let step = 1; step <= STEP_COUNT; step += 1) {
      const matchedAtStep = agents.filter((a) => a.matchedAtStep === step).length;
      hazardSeries[step - 1] = matchedAtStep > 0 && atRisk[step - 1] > 0 ? matchedAtStep / atRisk[step - 1] : 0;
      atRisk[step] = atRisk[step - 1] - matchedAtStep;
    }

    return hazardSeries;
  }

  /**
   * Compute hazard from matched event steps (with-replacement)
   */
  computeHazardSeriesFromEvents(matchedEventSteps, totalAgents) {
    const hazardSeries = new Array(STEP_COUNT).fill(0);

    for (let step = 1; step <= STEP_COUNT; step += 1) {
      const matchesAtStep = matchedEventSteps.filter((s) => s === step).length / 2;
      hazardSeries[step - 1] = matchesAtStep > 0 ? matchesAtStep / totalAgents : 0;
    }

    return hazardSeries;
  }

  /**
   * Compute correlation from matched pair values (with-replacement)
   */
  computeInterPairCorrelationFromPairs(pairValues) {
    if (!pairValues.length) return 0;

    const xs = pairValues.map((p) => p[0]);
    const ys = pairValues.map((p) => p[1]);

    if (xs.length < 2) return 0;

    const n = xs.length;
    const sumX = xs.reduce((sum, value) => sum + value, 0);
    const sumY = ys.reduce((sum, value) => sum + value, 0);
    const sumXX = xs.reduce((sum, value) => sum + value * value, 0);
    const sumYY = ys.reduce((sum, value) => sum + value * value, 0);
    const sumXY = xs.reduce((sum, value, index) => sum + value * ys[index], 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Run a complete synthetic simulation (for batch analytics)
   */
  runSyntheticSimulation(settings) {
    const padding = AGENT_RADIUS + 2;
    const densityMultiplier = densityMultipliers[settings.densityLevel] || 1;
    const agentCount = Math.max(10, Math.round(this.canvasSize * this.canvasSize * baseDensityFactor * densityMultiplier));

    const agents = [];
    const pairs = [];
    const matchedEventSteps = [];
    const matchedPairValues = [];
    
    for (let i = 0; i < agentCount; i += 1) {
      agents.push(this.createSyntheticAgent(i, this.canvasSize, padding));
    }

    const movement =
      (mobilitySizes[settings.mobilityLevel] || mobilitySizes.Medium) *
      (explorationMultipliers[settings.movementLevel] || explorationMultipliers.Balanced);

    for (let step = 1; step <= STEP_COUNT; step += 1) {
      agents.forEach((agent) => {
        if (agent.matched) return;
        agent.x = this.clamp(agent.x + this.randomFloat(-movement, movement), padding, this.canvasSize - padding);
        agent.y = this.clamp(agent.y + this.randomFloat(-movement, movement), padding, this.canvasSize - padding);
      });

      const unmatched = this.shuffle(agents.filter((agent) => !agent.matched));
      for (let i = 0; i < unmatched.length; i += 1) {
        const first = unmatched[i];
        if (first.matched) continue;

        for (let j = i + 1; j < unmatched.length; j += 1) {
          const second = unmatched[j];
          if (second.matched) continue;
          if (this.getDistance(first, second) > ENCOUNTER_DISTANCE) continue;

          const acceptFirst = this.getAcceptanceScoreWithSettings(
            first,
            second,
            settings.preferenceRule,
            settings.selectivityLevel,
            settings.patienceLevel
          );
          const acceptSecond = this.getAcceptanceScoreWithSettings(
            second,
            first,
            settings.preferenceRule,
            settings.selectivityLevel,
            settings.patienceLevel
          );

          if (Math.random() < acceptFirst && Math.random() < acceptSecond) {
            matchedPairValues.push([first.attractiveness, second.attractiveness]);
            matchedEventSteps.push(step, step);

            if (settings.withReplacement) {
              first.matched = true;
              second.matched = true;
              agents[first.id] = this.createSyntheticAgent(first.id, this.canvasSize, padding);
              agents[second.id] = this.createSyntheticAgent(second.id, this.canvasSize, padding);
              break;
            }

            first.matched = true;
            second.matched = true;
            first.partnerId = second.id;
            second.partnerId = first.id;
            first.matchedAtStep = step;
            second.matchedAtStep = step;
            pairs.push({ agent1: first.id, agent2: second.id });
            break;
          }
        }
      }

      agents.forEach((agent) => {
        if (!agent.matched) agent.searchSteps += 1;
      });
    }

    const interPairCorrelation = settings.withReplacement
      ? this.computeInterPairCorrelationFromPairs(matchedPairValues)
      : this.computeInterPairCorrelation(agents, pairs);
    const meanDateToMate =
      matchedEventSteps.length ? matchedEventSteps.reduce((sum, value) => sum + value, 0) / matchedEventSteps.length : STEP_COUNT;
    const hazardSeries = settings.withReplacement
      ? this.computeHazardSeriesFromEvents(matchedEventSteps, agentCount)
      : this.computeHazardSeries(agents);
    const meanHazard = hazardSeries.reduce((sum, value) => sum + value, 0) / hazardSeries.length;

    return {
      interPairCorrelation,
      meanDateToMate,
      meanHazard,
      hazardSeries,
    };
  }

  /**
   * Compute batch statistics (mean, CI)
   */
  computeBatchStats(values) {
    if (!values.length) return { mean: 0, ciLow: 0, ciHigh: 0 };

    const sorted = [...values].sort((a, b) => a - b);
    const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
    const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sorted.length;
    const stdDev = Math.sqrt(variance);
    const stdErr = stdDev / Math.sqrt(sorted.length);
    const ciValue = 1.96 * stdErr; // 95% CI

    return {
      mean,
      stdDev,
      ciLow: Math.max(0, mean - ciValue),
      ciHigh: mean + ciValue,
    };
  }

  // ===== Utility methods =====

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
}
