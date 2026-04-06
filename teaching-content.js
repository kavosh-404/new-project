/**
 * teaching-content.js
 * All teaching narratives and explanations grounded in Smaldino & Schank (2012)
 * Provides content for teaching panel and chat system
 */

class TeachingContent {
  /**
   * Get placeholder text before first run
   */
  static getTeachingPlaceholderText(simpleMode = false) {
    if (simpleMode) {
      return "Run the simulation, and this panel will explain the result in plain language using everyday terms.";
    }
    return "Run the simulation to generate a teaching explanation about how mobility, density, and preference rules shape assortative matching in this model.";
  }

  /**
   * Build main teaching panel narrative after run
   */
  static buildTeachingPanelNarrative(
    metrics,
    mobilityLevel,
    densityLevel,
    preferenceRule,
    selectivityLevel,
    patienceLevel,
    explorationLevel,
    simpleMode = false
  ) {
    let narrative = "";

    if (simpleMode) {
      // Simple mode: 3-sentence plain-language summary
      narrative = `Plain-language summary: In this run, movement was ${this.getLevelLabel(mobilityLevel, "mobility")}, the crowd was ${this.getLevelLabel(densityLevel, "density")}, and the decision rule was ${preferenceRule}.

The simulation formed ${metrics.pairs.length} pairs. The similarity score was ${metrics.matchingStrength.toFixed(2)} (${this.getStrengthLabel(metrics.matchingStrength)} similarity), and people needed about ${Math.round(metrics.averageSearchSteps)} steps on average to find a partner.

How to read this: density and mobility decide who meets whom first, and the rule decides who says yes once two people meet.`;
    } else {
      // Technical mode: 7-sentence breakdown
      narrative = `This run used ${this.getLevelLabel(mobilityLevel, "mobility")}, ${this.getLevelLabel(densityLevel, "density")}, selectivity=${selectivityLevel}, patience=${patienceLevel}, exploration=${explorationLevel}, and a ${preferenceRule} rule, producing ${metrics.pairs.length} pairs with matching strength ${metrics.matchingStrength.toFixed(2)}.

${this.getMobilityCommentary(mobilityLevel)}

${this.getDensityCommentary(densityLevel)}

${this.getPreferenceCommentary(preferenceRule)}

${this.getBehaviorCommentary(selectivityLevel, patienceLevel, explorationLevel)}

${this.getStrengthCommentary(metrics.matchingStrength)}

${this.getSearchCommentary(metrics.averageSearchSteps)}`;
    }

    return narrative;
  }

  /**
   * Get level label (low/high/medium)
   */
  static getLevelLabel(level, type) {
    const labelMap = {
      "Low Density": "sparse",
      "High Density": "dense",
      "Normal Density": "normal",
      "Low Mobility": "low",
      "High Mobility": "high",
      "Medium Mobility": "medium",
    };
    return labelMap[level] || level.toLowerCase();
  }

  /**
   * Get strength label based on value
   */
  static getStrengthLabel(strength) {
    if (strength < 0.15) return "very low";
    if (strength > 0.30) return "high";
    return "moderate";
  }

  /**
   * Mobility commentary
   */
  static getMobilityCommentary(mobilityLevel) {
    const map = {
      "Low Mobility":
        "With low mobility, agents cover little space, so they experience fewer encounters and weaker matching because many potential partners never come into range.",
      "High Mobility":
        "High mobility improves search because agents sweep through more of the grid, creating better opportunities to find acceptable partners and strengthening the resulting matches.",
      "Medium Mobility":
        "Medium mobility creates an intermediate search environment in which agents encounter enough alternatives to improve matching, but not as efficiently as in the high-mobility case.",
    };
    return map[mobilityLevel] || "Unknown mobility setting.";
  }

  /**
   * Density commentary
   */
  static getDensityCommentary(densityLevel) {
    const map = {
      "Low Density":
        "In a sparse population, search is slow and pair formation is limited because agents spend more time moving without encountering nearby partners (Smaldino & Schank 2012, pp. 17–18).",
      "High Density":
        "In a dense population, encounter rates rise quickly, so matching happens faster and agents have more chances to sort into compatible pairs (Smaldino & Schank 2012, pp. 17–18).",
      "Normal Density":
        "At normal density, encounter opportunities are steady, which supports pair formation without the extreme search difficulty of sparse settings or the rapid contact of dense ones (Smaldino & Schank 2012, pp. 17–18).",
    };
    return map[densityLevel] || "Unknown density setting.";
  }

  /**
   * Preference rule commentary
   */
  static getPreferenceCommentary(preferenceRule) {
    const map = {
      "Attractiveness-based":
        "Under attractiveness-based choice, highly attractive agents can afford to wait longer, and matching tends to strengthen when mobility and density give everyone broader access to alternatives (Smaldino & Schank 2012, p. 16).",
      "Similarity-based":
        "Under similarity-based choice, pairing tends to happen faster because agents can accept locally similar partners, so outcomes depend strongly on who is actually available in each neighborhood (Smaldino & Schank 2012, pp. 11–13).",
    };
    return map[preferenceRule] || "Unknown preference rule.";
  }

  /**
   * Behavior settings commentary
   */
  static getBehaviorCommentary(selectivityLevel, patienceLevel, explorationLevel) {
    const selectivityMap = {
      Low: "Low selectivity raises acceptance probability and usually speeds up matching.",
      Medium: "Medium selectivity keeps acceptance criteria near baseline.",
      High: "High selectivity lowers acceptance probability and usually raises search difficulty.",
    };
    const patienceMap = {
      Fast: "Fast patience relaxation increases acceptance quickly as search continues.",
      Normal: "Normal patience relaxation gradually broadens acceptance over search time.",
      Slow: "Slow patience relaxation keeps standards tighter for longer.",
    };
    const explorationMap = {
      Local: "Local exploration limits per-step movement and concentrates encounters nearby.",
      Balanced: "Balanced exploration keeps movement near the default range.",
      Wide: "Wide exploration expands per-step movement, increasing contact opportunities.",
    };

    const selectivityText = selectivityMap[selectivityLevel] || "";
    const patienceText = patienceMap[patienceLevel] || "";
    const explorationText = explorationMap[explorationLevel] || "";

    return `${selectivityText} ${patienceText} ${explorationText}`;
  }

  /**
   * Matching strength commentary
   */
  static getStrengthCommentary(matchingStrength) {
    if (matchingStrength < 0.15) {
      return `Because matching strength is below 0.15, this run shows weak assortative mating, meaning the final pairs are only weakly sorted by attractiveness (Smaldino & Schank 2012, pp. 11–13).`;
    }
    if (matchingStrength > 0.30) {
      return `Because matching strength is above 0.30, this run shows strong assortative patterns, with partners ending up noticeably similar in attractiveness (Smaldino & Schank 2012, pp. 11–13).`;
    }
    return `The middle-range matching strength suggests moderate assortment, where some sorting is visible but the environment still limits how cleanly agents can match with similar partners (Smaldino & Schank 2012, pp. 11–13).`;
  }

  /**
   * Search time commentary
   */
  static getSearchCommentary(averageSearchSteps) {
    const threshold = STEP_COUNT * 0.65; // 65% of horizon
    if (averageSearchSteps > threshold) {
      return `The high average search time of ${Math.round(averageSearchSteps)} steps indicates substantial search difficulty, so many agents had to wait a long time before finding an acceptable partner or failed to match at all (Smaldino & Schank 2012, p. 16).`;
    }
    return `The average search time of ${Math.round(averageSearchSteps)} steps suggests that the search environment was comparatively manageable for this population (Smaldino & Schank 2012, p. 16).`;
  }

  /**
   * Build explain message for chat (simple version)
   */
  static buildSimpleExplainMessage(metrics, density, mobility, preference) {
    return `In plain terms: We formed ${metrics.pairs.length} pairs in this run. The space was ${this.getLevelLabel(density, "density")}, movement was ${this.getLevelLabel(mobility, "mobility")}, and people used a ${preference} decision rule. Matching strength is ${metrics.matchingStrength.toFixed(2)}, and it took about ${Math.round(metrics.averageSearchSteps)} steps per person to find a partner. That's how density and mobility shape who meets, and how the rule shapes who pairs up (Smaldino & Schank 2012, pp. 11–18).`;
  }

  /**
   * Build run citation message (comprehensive summary)
   */
  static buildRunCitationMessage(
    metrics,
    mobilityLevel,
    densityLevel,
    preferenceRule,
    selectivityLevel,
    patienceLevel,
    explorationLevel
  ) {
    const patternLabel =
      metrics.matchingStrength < 0.15
        ? "weak assortative pattern"
        : metrics.matchingStrength > 0.30
          ? "strong assortative pattern"
          : "moderate assortative pattern";

    const mobilityDesc =
      mobilityLevel === "Low Mobility" ? "lower mobility" : "higher mobility (mobility)";
    const densityDesc =
      densityLevel === "Low Density"
        ? "lower density"
        : densityLevel === "High Density"
          ? "higher density"
          : "normal density";

    return `Run result: ${metrics.pairs.length} pairs formed. Matching strength is ${metrics.matchingStrength.toFixed(2)}, suggesting a ${patternLabel}. Under ${mobilityDesc} (Smaldino & Schank 2012, p. 16) and ${densityDesc} (pp. 17–18), the ${preferenceRule} preference rule produced these outcomes with selectivity=${selectivityLevel}, patience=${patienceLevel}, exploration=${explorationLevel}. This result is consistent with Smaldino & Schank (2012): environment and space shape who meets and matches.`;
  }

  /**
   * Build capability/scope explanation
   */
  static buildCapabilityMessage(hasRun = false) {
    if (!hasRun) {
      return "This website is built with HTML, CSS, and vanilla JavaScript—no backend, no downloads. The assistant is lightweight NLP: it detects your question intent and topic, then generates explanations grounded in Smaldino & Schank (2012).";
    }
    return "I can explain this specific simulation: density, mobility, preference rules, selectivity, patience, exploration, matching strength, search time, results, and citations from Smaldino & Schank (2012). I use lightweight NLP to detect your intent (causal, comparative, clarifying, etc.) and route to relevant explanations. No ML backend—all logic is in JavaScript.";
  }

  /**
   * Build out-of-scope message
   */
  static buildOutOfScopeReply() {
    return "I can only help with this simulation right now. Run a scenario and ask me about density, mobility, preference rules, matching, search time, results, how they connect to Smaldino & Schank (2012), or request a citation.";
  }
}

// Export for use in other modules
window.TeachingContent = TeachingContent;
