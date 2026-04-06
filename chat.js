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

    if (/why|because|cause/.test(lower)) return "causal";
    if (/don't|don't|confused|simpler|again|unclear/.test(lower)) return "clarification";
    if (/compare|vs|different|between|versus/.test(lower)) return "comparative";
    if (/explain|how does|mechanism/.test(lower)) return "explanatory";
    if (/what|when|where|which/.test(lower)) return "factual";

    return "general";
  }

  /**
   * Detect question topic
   */
  static detectTopic(text) {
    const lower = text.toLowerCase();

    if (/density|grid|population|sparse|dense|crowded/.test(lower)) return "density";
    if (/mobility|move|speed|distance|roam/.test(lower)) return "mobility";
    if (/select|choosy|picky|accept|threshold/.test(lower)) return "selectivity";
    if (/patience|wait|relax|criteria/.test(lower)) return "patience";
    if (/explor|search|wander/.test(lower)) return "exploration";
    if (/match|pair|couple|partner|assort/.test(lower)) return "matching";
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
    return /nlp|llm|capability|what can you|how do you work|backend|built|how/.test(lower);
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
    topicDepth
  ) {
    // Check if it's asking about capabilities
    if (this.isCapabilityQuestion(text)) {
      return TeachingContent.buildCapabilityMessage(hasRun);
    }

    // If no run exists, prompt user to run
    if (!hasRun) {
      return "I can help you understand the results, but you'll need to run the simulation first. Click 'Run Simulation' to start, then ask me about what you see.";
    }

    // Detect intent and topic
    const intent = this.detectIntent(text);
    const topic = this.detectTopic(text);

    // Check for clarification request
    if (this.isClarificationRequest(text)) {
      if (lastTopic) {
        return this.getProgressiveExplanation(
          lastTopic,
          Math.min(topicDepth + 1, 3),
          metrics,
          densityLevel,
          mobilityLevel,
          preferenceRule
        );
      }
      return "I'd be happy to explain more clearly. Ask me about density, mobility, preference rules, matching strength, search time, or results.";
    }

    // Route by topic
    if (topic === "density") {
      if (intent === "causal") return this.buildDensityCausalReply(metrics, densityLevel);
      if (intent === "explanatory")
        return this.getProgressiveExplanation(
          topic,
          1,
          metrics,
          densityLevel,
          mobilityLevel,
          preferenceRule
        );
      return this.buildDensitySearchReply(metrics, densityLevel);
    }

    if (topic === "preference") {
      return this.buildPreferenceReply(preferenceRule);
    }

    if (topic === "matching") {
      return `Matching is when two agents meet and both accept each other. Your run shows ${metrics.pairs.length} matches with strength ${metrics.matchingStrength.toFixed(2)}. The strength reflects how similar matched pairs are in attractiveness. Smaldino & Schank (2012, pp. 11–13) found that space and movement shape these patterns.`;
    }

    // Default fallback
    return TeachingContent.buildOutOfScopeReply();
  }
}

// Export for use in other modules
window.ChatEngine = ChatEngine;
