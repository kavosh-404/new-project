/**
 * analytics.js
 * Analytics and metrics computation for batch runs
 * Rule comparisons, statistical analysis
 */

class AnalyticsEngine {
  /**
   * Compute batch statistics (mean, confidence interval)
   */
  static computeBatchStats(values) {
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

  /**
   * Compute rule analytics rows for batch comparison
   * Returns metrics for each rule/movement condition
   */
  static computeRuleAnalyticsRows(engine, settings, runCount) {
    const combinations = [
      {
        ruleLabel: "Rule 1",
        ruleShort: "R1",
        preferenceRule: "Attractiveness-based",
        movement: "NS",
        explorationLevel: "Local",
      },
      {
        ruleLabel: "Rule 1",
        ruleShort: "R1",
        preferenceRule: "Attractiveness-based",
        movement: "ZZ",
        explorationLevel: "Balanced",
      },
      {
        ruleLabel: "Rule 1",
        ruleShort: "R1",
        preferenceRule: "Attractiveness-based",
        movement: "BR",
        explorationLevel: "Wide",
      },
      {
        ruleLabel: "Rule 2",
        ruleShort: "R2",
        preferenceRule: "Similarity-based",
        movement: "NS",
        explorationLevel: "Local",
      },
      {
        ruleLabel: "Rule 2",
        ruleShort: "R2",
        preferenceRule: "Similarity-based",
        movement: "ZZ",
        explorationLevel: "Balanced",
      },
      {
        ruleLabel: "Rule 2",
        ruleShort: "R2",
        preferenceRule: "Similarity-based",
        movement: "BR",
        explorationLevel: "Wide",
      },
    ];

    return combinations.map((combo) => {
      const pairCorrValues = [];
      const meanDateValues = [];
      const meanHazardValues = [];
      const pairCorrReplacementValues = [];
      const meanDateReplacementValues = [];
      const hazardSum = new Array(STEP_COUNT).fill(0);

      for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
        const result = engine.runSyntheticSimulation({
          preferenceRule: combo.preferenceRule,
          movementLevel: combo.explorationLevel,
          densityLevel: settings.densityLevel,
          mobilityLevel: settings.mobilityLevel,
          selectivityLevel: settings.selectivityLevel,
          patienceLevel: settings.patienceLevel,
        });
        const replacementResult = engine.runSyntheticSimulation({
          preferenceRule: combo.preferenceRule,
          movementLevel: combo.explorationLevel,
          densityLevel: settings.densityLevel,
          mobilityLevel: settings.mobilityLevel,
          selectivityLevel: settings.selectivityLevel,
          patienceLevel: settings.patienceLevel,
          withReplacement: true,
        });

        pairCorrValues.push(result.interPairCorrelation);
        meanDateValues.push(result.meanDateToMate);
        meanHazardValues.push(result.meanHazard);
        pairCorrReplacementValues.push(replacementResult.interPairCorrelation);
        meanDateReplacementValues.push(replacementResult.meanDateToMate);
        result.hazardSeries.forEach((value, index) => {
          hazardSum[index] += value;
        });
      }

      const corrStats = this.computeBatchStats(pairCorrValues);
      const dateStats = this.computeBatchStats(meanDateValues);
      const hazardStats = this.computeBatchStats(meanHazardValues);
      const corrReplacementStats = this.computeBatchStats(pairCorrReplacementValues);
      const dateReplacementStats = this.computeBatchStats(meanDateReplacementValues);

      return {
        ...combo,
        interPairCorrelation: corrStats.mean,
        interPairCorrelationCiLow: corrStats.ciLow,
        interPairCorrelationCiHigh: corrStats.ciHigh,
        meanDateToMate: dateStats.mean,
        meanDateToMateCiLow: dateStats.ciLow,
        meanDateToMateCiHigh: dateStats.ciHigh,
        meanHazard: hazardStats.mean,
        meanHazardCiLow: hazardStats.ciLow,
        meanHazardCiHigh: hazardStats.ciHigh,
        interPairCorrelationReplacement: corrReplacementStats.mean,
        meanDateToMateReplacement: dateReplacementStats.mean,
        hazardSeries: hazardSum.map((value) => value / runCount),
      };
    });
  }

  /**
   * Determine CI styling (tight, medium, wide)
   */
  static getCiClass(metricType, ciLow, ciHigh) {
    const width = Math.max(0, ciHigh - ciLow);

    if (metricType === "correlation") {
      if (width <= 0.1) return "ci-tight";
      if (width <= 0.2) return "ci-medium";
      return "ci-wide";
    }

    if (metricType === "date") {
      if (width <= 6) return "ci-tight";
      if (width <= 12) return "ci-medium";
      return "ci-wide";
    }

    if (metricType === "hazard") {
      if (width <= 0.05) return "ci-tight";
      if (width <= 0.12) return "ci-medium";
      return "ci-wide";
    }

    return "";
  }

  /**
   * Generate insights from recreated figures
   */
  static generateFigure5Insight(rows) {
    const avg = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const labelFor = (row) => row.ruleShort + "-" + row.movement;
    const signed = (value, digits = 2) => (value >= 0 ? "+" : "") + value.toFixed(digits);

    const topCorrRow = rows.reduce(
      (best, row) => (row.interPairCorrelation > best.interPairCorrelation ? row : best),
      rows[0]
    );
    const meanNoReplCorr = avg(rows.map((row) => row.interPairCorrelation));
    const meanReplCorr = avg(rows.map((row) => row.interPairCorrelationReplacement));
    const gap = meanNoReplCorr - meanReplCorr;
    const topGap = topCorrRow.interPairCorrelation - topCorrRow.interPairCorrelationReplacement;

    return (
      "Insight: Highest inter-pair correlation is " +
      labelFor(topCorrRow) +
      " at r=" +
      topCorrRow.interPairCorrelation.toFixed(2) +
      " (replacement=" +
      topCorrRow.interPairCorrelationReplacement.toFixed(2) +
      ", delta=" +
      signed(topGap) +
      "). Across all six conditions, mean r is " +
      meanNoReplCorr.toFixed(2) +
      " vs " +
      meanReplCorr.toFixed(2) +
      " with replacement (overall delta " +
      signed(gap) +
      ")."
    );
  }

  /**
   * Generate insights from Figure 6
   */
  static generateFigure6Insight(rows) {
    const avg = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
    const labelFor = (row) => row.ruleShort + "-" + row.movement;
    const signed = (value, digits = 2) => (value >= 0 ? "+" : "") + value.toFixed(digits);

    const fastestRow = rows.reduce(
      (best, row) => (row.meanDateToMate < best.meanDateToMate ? row : best),
      rows[0]
    );
    const slowestRow = rows.reduce(
      (best, row) => (row.meanDateToMate > best.meanDateToMate ? row : best),
      rows[0]
    );
    const meanNoReplDate = avg(rows.map((row) => row.meanDateToMate));
    const meanReplDate = avg(rows.map((row) => row.meanDateToMateReplacement));

    return (
      "Insight: Fastest matching is " +
      labelFor(fastestRow) +
      " at t_m=" +
      fastestRow.meanDateToMate.toFixed(2) +
      "; slowest is " +
      labelFor(slowestRow) +
      " at t_m=" +
      slowestRow.meanDateToMate.toFixed(2) +
      ". Mean t_m across all conditions is " +
      meanNoReplDate.toFixed(2) +
      " vs " +
      meanReplDate.toFixed(2) +
      " with replacement (delta " +
      signed(meanNoReplDate - meanReplDate) +
      "). Lower t_m indicates quicker pair formation."
    );
  }

  /**
   * Generate insights from Figure 7
   */
  static generateFigure7Insight(rows) {
    const maxStep = 15;
    const hazardSummaries = rows.map((row) => {
      const early = row.hazardSeries.slice(0, maxStep);
      let peakIndex = 0;
      for (let i = 1; i < early.length; i += 1) {
        if (early[i] > early[peakIndex]) peakIndex = i;
      }
      const earlyMean = early.reduce((sum, value) => sum + value, 0) / Math.max(1, early.length);
      return {
        row,
        peakHazard: early[peakIndex] || 0,
        peakStep: peakIndex + 1,
        earlyMean,
      };
    });

    const topPeak = hazardSummaries.reduce(
      (best, item) => (item.peakHazard > best.peakHazard ? item : best),
      hazardSummaries[0]
    );
    const topEarlyMean = hazardSummaries.reduce(
      (best, item) => (item.earlyMean > best.earlyMean ? item : best),
      hazardSummaries[0]
    );

    return (
      "Insight: The earliest hazard spike is highest for " +
      (topPeak.row.ruleShort + "-" + topPeak.row.movement) +
      " at h(" +
      topPeak.peakStep +
      ")=" +
      topPeak.peakHazard.toFixed(3) +
      ". Over steps 1-15, the highest average hazard is " +
      (topEarlyMean.row.ruleShort + "-" + topEarlyMean.row.movement) +
      " at " +
      topEarlyMean.earlyMean.toFixed(3) +
      ", indicating the strongest early-phase matching pressure."
    );
  }
}
