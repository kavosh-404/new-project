/**
 * chat.js
 * NLP-driven conversational interface with progressive explanations
 */

class ChatEngine {
  /**
   * Detect question intent using pattern matching
   */
  static detectIntent(text) {
    const lower = text.toLowerCase();

    if (/reliable|reliability|statistical|confidence interval|ci|significant|noise|uncertain/.test(lower)) return "reliability";
    if (/compare|vs|different|between|versus|change|changed|trend|previous|before|after/.test(lower)) return "comparative";
    if (/why|because|cause/.test(lower)) return "causal";
    if (/don't|don't|confused|simpler|again|unclear/.test(lower)) return "clarification";
    if (/explain|how does|mechanism/.test(lower)) return "explanatory";
    if (/what|when|where|which/.test(lower)) return "factual";

    return "general";
  }

  /**
   * Detect question topic
   */
  static detectTopic(text) {
    const lower = text.toLowerCase();

    if (/density|grid|population|sparse|dense|crowded|encounter/.test(lower)) return "density";
    if (/mobility|move|speed|distance|roam|movement/.test(lower)) return "mobility";
    if (/select|choosy|picky|accept|threshold/.test(lower)) return "selectivity";
    if (/patience|wait|relax|criteria/.test(lower)) return "patience";
    if (/explor|search|wander/.test(lower)) return "exploration";
    if (/match|pair|couple|partner|assort|strength/.test(lower)) return "matching";
    if (/prefer|attract|similar|rule/.test(lower)) return "preference";

    return null;
  }

  /**
   * Detect if user wants simpler explanation
   */
  static isClarificationRequest(text) {
    const lower = text.toLowerCase();
    return /don't|don't|confused|simpler|explain again|unclear|lost|not understand/.test(lower);
  }

  /**
   * Check if question is about capabilities
   */
  static isCapabilityQuestion(text) {
    const lower = text.toLowerCase();
    return /nlp|llm|capability|capabilities|what can you do|what can this assistant do|how do you work|how are you built|backend|architecture|local or cloud/.test(lower);
  }

  static isComparisonQuestion(text) {
    const lower = text.toLowerCase();
    return /compare|vs|different|between|versus|change|changed|trend|previous|before|after|last run|earlier/.test(lower);
  }

  static getConfidenceLabel(hasStrongEvidence, isComparative, topicKnown) {
    if (hasStrongEvidence && isComparative) return "High";
    if (hasStrongEvidence && topicKnown) return "High";
    if (hasStrongEvidence || topicKnown) return "Medium";
    return "Low";
  }

  static buildStructuredReply({ claim, evidence, interpretation, citation, confidence, nextStep }) {
    return {
      type: "research-structured",
      claim,
      evidence,
      interpretation,
      citation,
      confidence,
      nextStep,
    };
  }

  static buildComparisonFromHistory(runHistory, topic) {
    if (!Array.isArray(runHistory) || runHistory.length < 2) return null;

    const current = runHistory[runHistory.length - 1];
    const previous = runHistory[runHistory.length - 2];
    const pairDelta = current.pairCount - previous.pairCount;
    const strengthDelta = current.strength - previous.strength;
    const searchDelta = current.search - previous.search;

    const dominantDriver = (() => {
      if (current.density !== previous.density) return "density";
      if (current.mobility !== previous.mobility) return "mobility";
      if (current.preference !== previous.preference) return "preference rule";
      return "mixed or untracked factors";
    })();

    let claim = "Recent runs show measurable outcome changes across scenarios.";
    if (topic === "density" && current.density !== previous.density) {
      claim = "Density changes are associated with differences in pair formation and search effort in your last two runs.";
    } else if (topic === "mobility" && current.mobility !== previous.mobility) {
      claim = "Mobility shifts changed search dynamics and matching outcomes across your last two runs.";
    } else if (topic === "preference" && current.preference !== previous.preference) {
      claim = "Switching preference rules altered pairing outcomes in your recent runs.";
    }

    const evidence =
      "Run #" + previous.id + " -> #" + current.id +
      ": pairs " + previous.pairCount.toFixed(1) + " to " + current.pairCount.toFixed(1) +
      " (delta " + (pairDelta >= 0 ? "+" : "") + pairDelta.toFixed(1) + "), " +
      "matching strength " + previous.strength.toFixed(2) + " to " + current.strength.toFixed(2) +
      " (delta " + (strengthDelta >= 0 ? "+" : "") + strengthDelta.toFixed(2) + "), " +
      "avg search " + previous.search.toFixed(1) + " to " + current.search.toFixed(1) +
      " (delta " + (searchDelta >= 0 ? "+" : "") + searchDelta.toFixed(1) + ").";

    const interpretation =
      "Most plausible driver in this comparison: " + dominantDriver +
      ". This should be treated as directional evidence rather than a controlled causal estimate unless other parameters are held constant across repeated runs.";

    return this.buildStructuredReply({
      claim,
      evidence,
      interpretation,
      citation: "Smaldino & Schank (2012), especially pp. 11-18 on spatial constraints, encounter dynamics, and emergent matching patterns.",
      confidence: "High",
      nextStep: "Repeat each condition at least 5-10 times (or use batch mode) to reduce run-to-run noise before drawing stronger conclusions.",
    });
  }

  /**
   * Get progressive explanation based on depth
   */
  static getProgressiveExplanation(
    topic,
    depth,
    metrics,
    densityLevel,
    mobilityLevel,
    preferenceRule
  ) {
    if (depth === 1) {
      // First mention: basic definition
      if (topic === "density") {
        return "Density affects how often agents meet. With a " +
          densityLevel.toLowerCase() +
          " density, agents encounter potential partners at different rates.";
      }
      if (topic === "mobility") {
        return "Mobility affects how far agents travel per step. With " +
          mobilityLevel.toLowerCase() +
          " mobility, agents cover more or less space when searching.";
      }
      if (topic === "matching") {
        return "Matching happens when two agents meet and both accept each other. The final set of pairs reflects the interaction of density, mobility, and the decision rule.";
      }
      return "That's a good question about the simulation.";
    }

    if (depth === 2) {
      // Second mention: connect to results
      if (topic === "density" && metrics) {
        return `Your run shows this: with ${densityLevel.toLowerCase()} density, ${metrics.pairs.length} pairs formed and matching strength is ${metrics.matchingStrength.toFixed(2)}. Smaldino & Schank (2012, pp. 17–18) found that density controls encounter frequency, which shapes final outcomes.`;
      }
      if (topic === "mobility" && metrics) {
        return `In this run, ${mobilityLevel.toLowerCase()} mobility produced ${metrics.averageSearchSteps.toFixed(0)} average search steps. Higher mobility generally gives agents more opportunities to find partners (Smaldino & Schank 2012, p. 16).`;
      }
      return "Let me explain how that connects to your results.";
    }

    // Depth >= 3: mechanistic deep dive
    if (topic === "density") {
      return `Deep dive on density: With ${densityLevel.toLowerCase()} density and ${mobilityLevel.toLowerCase()} mobility, agents operate in local neighborhoods. Sparse settings force longer searches; dense ones compress encounters. This is a core finding in Smaldino & Schank (2012, pp. 11–18): environment constrains the structure of matching.`;
    }
    if (topic === "mobility") {
      return `Deep dive on mobility: When mobility is low, agents stay local and only contact nearby potential partners. High mobility lets agents sweep broader areas, increasing assortative strength (Smaldino & Schank 2012, p. 16). The effect interacts with density and the decision rule.`;
    }

    return "That's a complex mechanism. Here's what we know from the model.";
  }

  /**
   * Topic-specific reply builder for density
   */
  static buildDensityCausalReply(metrics, densityLevel) {
    return `Density changes how often agents meet. With ${densityLevel.toLowerCase()} density, encounter frequency is ${metrics.pairs.length} pairs per simulation. Smaldino & Schank (2012, pp. 17–18) show that population density acts as an environmental constraint on matching opportunities. Your run confirms this: denser settings generally produce faster pairing and stronger assortment.`;
  }

  /**
   * Topic-specific reply: density and search time
   */
  static buildDensitySearchReply(metrics, densityLevel) {
    return `Density affects search time. In your run with ${densityLevel.toLowerCase()} density, agents needed an average of ${Math.round(metrics.averageSearchSteps)} steps to find a partner. Sparse populations force longer searches; denser ones compress the timeline. Smaldino & Schank (2012) found this is a robust effect across parameter spaces.`;
  }

  /**
   * Topic-specific reply: preference rule
   */
  static buildPreferenceReply(preferenceRule) {
    if (preferenceRule === "Attractiveness-based") {
      return `Attractiveness-based choice means agents prioritize a partner's attractiveness score. Agents are more selective if they are highly attractive, and less selective as time passes. This creates stronger assortative patterns (Smaldino & Schank 2012, pp. 13–16).`;
    }
    return `Similarity-based choice means agents prioritize a partner with a similar attractiveness score. This can lead to faster pairing because the acceptance threshold is easier to meet. Smaldino & Schank (2012, pp. 11–13) show this rule produces different dynamics than attractiveness-based choice.`;
  }

  /**
   * Build comparison between two conditions
   */
  static buildComparisonReply(topic, value1, value2, label1, label2) {
    if (topic === "density") {
      return `Comparing ${label1} and ${label2}: with ${label1}, you see ${Math.round(value1)} pairs. With ${label2}, you see ${Math.round(value2)} pairs. That's a difference of ${Math.abs(value1 - value2).toFixed(0)} pairs, showing how population spacing shapes encounter frequency (Smaldino & Schank 2012, pp. 17–18).`;
    }
    if (topic === "mobility") {
      return `Comparing ${label1} and ${label2}: with ${label1}, you see ${Math.round(value1)} average search steps. With ${label2}, you see ${Math.round(value2)} search steps. Movement range directly affects how long it takes to find a partner (Smaldino & Schank 2012, p. 16).`;
    }
    return `Comparing these two settings shows how the parameters interact to shape outcomes.`;
  }

  /**
   * Get suggested follow-up questions context
   */
  static getInsightQuestionSet(scenario, lastTopic = null) {
    const densityQuestions = [
      "Why did density affect pairing?",
      "Does higher density always mean more pairs?",
      "How do density and mobility interact?",
      "What does Smaldino & Schank say about density?",
    ];

    const mobilityQuestions = [
      "Why does mobility change search time?",
      "High mobility vs. low mobility—which forms more pairs?",
      "How does mobility differ from density?",
      "Can I improve results by changing mobility?",
    ];

    const matchingQuestions = [
      "What does 'matching strength' mean?",
      "Why did some agents not pair?",
      "Can I make pairs stronger?",
      "How does the rule affect pairing?",
    ];

    const preferenceQuestions = [
      "What's the difference between the rules?",
      "Does attractiveness-based work better?",
      "How does the rule affect search time?",
      "Can I test both rules?",
    ];

    const defaultQuestions = [
      "Why did density affect pairing?",
      "I don't understand the result.",
      "How do mobility and density differ?",
      "What does matching strength mean?",
      "How do I use the decision rules?",
    ];

    if (lastTopic === "density") return densityQuestions;
    if (lastTopic === "mobility") return mobilityQuestions;
    if (lastTopic === "matching") return matchingQuestions;
    if (lastTopic === "preference") return preferenceQuestions;

    return defaultQuestions;
  }

  /**
   * Main reply builder
   */
  static buildChatReply(
    text,
    metrics,
    hasRun,
    densityLevel,
    mobilityLevel,
    preferenceRule,
    lastTopic,
    topicDepth,
    runHistory
  ) {
    // Check if it's asking about capabilities
    if (this.isCapabilityQuestion(text)) {
      return this.buildStructuredReply({
        claim: "This assistant can interpret simulation results and connect them to the paper.",
        evidence: TeachingContent.buildCapabilityMessage(hasRun),
        interpretation: "Use it for explanation, comparison, and citation-grounded interpretation rather than open-ended domain chat.",
        citation: "Smaldino & Schank (2012).",
        confidence: "High",
        nextStep: hasRun ? "Ask: 'Compare my last two runs.'" : "Run a simulation first, then ask: 'What explains this result?'",
      });
    }

    // If no run exists, prompt user to run
    if (!hasRun) {
      return this.buildStructuredReply({
        claim: "No simulation evidence is available yet.",
        evidence: "I cannot reference run metrics because no completed run exists in this session.",
        interpretation: "Any explanation now would be generic, not evidence-grounded.",
        citation: "Smaldino & Schank (2012).",
        confidence: "Low",
        nextStep: "Click 'Start Simulation', then ask about density, mobility, preference rule, or matching strength.",
      });
    }

    // Detect intent and topic
    const intent = this.detectIntent(text);
    const topic = this.detectTopic(text);

    if (intent === "reliability") {
      const runCount = Array.isArray(runHistory) ? runHistory.length : 0;
      const evidence = "Current evidence is based on " + runCount + " tracked run(s). Latest run metrics: pairs=" + metrics.pairs.length + ", strength=" + metrics.matchingStrength.toFixed(2) + ", avg search=" + metrics.averageSearchSteps.toFixed(1) + ".";
      return this.buildStructuredReply({
        claim: "Single-run conclusions are directionally useful but not statistically strong.",
        evidence,
        interpretation: "Reliability improves when you replicate the same condition multiple times and compare distributions rather than one-point outcomes. Batch mode with confidence intervals is the preferred path for stronger inference.",
        citation: "Smaldino & Schank (2012) emphasize parameter-space exploration over single trajectories.",
        confidence: runCount >= 5 ? "Medium" : "Low",
        nextStep: "Run batch experiments (n>=10) for each condition and compare mean differences with 95% confidence intervals.",
      });
    }

    if (intent === "comparative" || this.isComparisonQuestion(text)) {
      const comparisonReply = this.buildComparisonFromHistory(runHistory, topic || lastTopic);
      if (comparisonReply) return comparisonReply;
    }

    // Check for clarification request
    if (this.isClarificationRequest(text)) {
      if (lastTopic) {
        const clarification = this.getProgressiveExplanation(
          lastTopic,
          Math.min(topicDepth + 1, 3),
          metrics,
          densityLevel,
          mobilityLevel,
          preferenceRule
        );
        return this.buildStructuredReply({
          claim: "Here is a simpler explanation of the same mechanism.",
          evidence: "Run metrics: pairs=" + metrics.pairs.length + ", strength=" + metrics.matchingStrength.toFixed(2) + ", avg search=" + metrics.averageSearchSteps.toFixed(1) + ".",
          interpretation: clarification,
          citation: "Smaldino & Schank (2012).",
          confidence: "Medium",
          nextStep: "If this is still unclear, ask: 'Explain with one concrete run example.'",
        });
      }
      return this.buildStructuredReply({
        claim: "I can simplify this, but I need a specific topic.",
        evidence: "Available topics: density, mobility, preference rule, matching strength, and search time.",
        interpretation: "Choose one variable and I will map it to your exact run metrics.",
        citation: "Smaldino & Schank (2012).",
        confidence: "Medium",
        nextStep: "Ask: 'Explain mobility in this run in simple terms.'",
      });
    }

    let answerText = null;
    let topicUsed = topic;

    // Route by topic
    if (topic === "density") {
      if (intent === "causal") answerText = this.buildDensityCausalReply(metrics, densityLevel);
      else if (intent === "explanatory") {
        answerText = this.getProgressiveExplanation(
          topic,
          1,
          metrics,
          densityLevel,
          mobilityLevel,
          preferenceRule
        );
      } else {
        answerText = this.buildDensitySearchReply(metrics, densityLevel);
      }
    }

    if (topic === "preference" && !answerText) {
      answerText = this.buildPreferenceReply(preferenceRule);
    }

    if (topic === "matching" && !answerText) {
      answerText = `Matching is when two agents meet and both accept each other. Your run shows ${metrics.pairs.length} matches with strength ${metrics.matchingStrength.toFixed(2)}. The strength reflects how similar matched pairs are in attractiveness.`;
    }

    if (!answerText && topic === "mobility") {
      topicUsed = "mobility";
      answerText = this.getProgressiveExplanation("mobility", 2, metrics, densityLevel, mobilityLevel, preferenceRule);
    }

    if (!answerText) {
      return this.buildStructuredReply({
        claim: "This question is outside the assistant's current analysis scope.",
        evidence: TeachingContent.buildOutOfScopeReply(),
        interpretation: "I can still help if you ask about simulation variables and run metrics.",
        citation: "Smaldino & Schank (2012).",
        confidence: "Low",
        nextStep: "Ask: 'What in this run explains matching strength?'",
      });
    }

    const confidence = this.getConfidenceLabel(!!metrics, false, !!topicUsed);
    return this.buildStructuredReply({
      claim: "Your question maps to the " + (topicUsed || "current") + " mechanism in this model.",
      evidence: "Run evidence: pairs=" + metrics.pairs.length + ", matching strength=" + metrics.matchingStrength.toFixed(2) + ", avg search=" + metrics.averageSearchSteps.toFixed(1) + ".",
      interpretation: answerText,
      citation: topicUsed === "matching"
        ? "Smaldino & Schank (2012), pp. 11-13."
        : topicUsed === "mobility"
        ? "Smaldino & Schank (2012), p. 16."
        : "Smaldino & Schank (2012), pp. 11-18.",
      confidence,
      nextStep: "For stronger evidence, compare this with another run where only one parameter changes.",
    });
  }
}

// Export for use in other modules
window.ChatEngine = ChatEngine;
