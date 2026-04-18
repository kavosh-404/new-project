/**
 * chat.js
 * Retrieval-grounded conversational interface for simulation + paper interpretation
 */

class ChatEngine {
  static normalizeUserText(text) {
    if (window.PaperKnowledgeBase && typeof window.PaperKnowledgeBase.normalizeQuery === "function") {
      return window.PaperKnowledgeBase.normalizeQuery(text || "");
    }
    return (text || "").toLowerCase();
  }

  /**
   * Detect question intent using pattern matching
   */
  static detectIntent(text) {
    const lower = this.normalizeUserText(text);

    if (/reliable|reliability|statistical|confidence interval|ci|significant|noise|uncertain|replicate|repeat/.test(lower)) return "reliability";
    if (/compare|vs|different|between|versus|change|changed|trend|previous|before|after|delta/.test(lower)) return "comparative";
    if (/why|because|cause|driver|led to|reason/.test(lower)) return "causal";
    if (/don't|do not|confused|simpler|again|unclear|lost|not understand|rephrase/.test(lower)) return "clarification";
    if (/explain|how does|mechanism|how come|walk me through/.test(lower)) return "explanatory";
    if (/what|when|where|which|who/.test(lower)) return "factual";

    return "general";
  }

  /**
   * Detect question topic
   */
  static detectTopic(text) {
    const lower = this.normalizeUserText(text);

    if (/density|grid|population|sparse|dense|crowded|encounter/.test(lower)) return "density";
    if (/mobility|move|speed|distance|roam|movement/.test(lower)) return "mobility";
    if (/select|choosy|picky|accept|threshold/.test(lower)) return "selectivity";
    if (/patience|wait|relax|criteria/.test(lower)) return "patience";
    if (/explor|search|wander/.test(lower)) return "exploration";
    if (/match|pair|couple|partner|assort|strength|correlation/.test(lower)) return "matching";
    if (/prefer|attract|similar|rule/.test(lower)) return "preference";

    return null;
  }

  static isClarificationRequest(text) {
    const lower = this.normalizeUserText(text);
    return /don't|do not|confused|simpler|explain again|unclear|lost|not understand|rephrase/.test(lower);
  }

  static isCapabilityQuestion(text) {
    const lower = this.normalizeUserText(text);
    return /nlp|llm|capability|capabilities|what can you do|what can this assistant do|how do you work|how are you built|backend|architecture|local or cloud/.test(lower);
  }

  static isComparisonQuestion(text) {
    const lower = this.normalizeUserText(text);
    return /compare|vs|different|between|versus|change|changed|trend|previous|before|after|last run|earlier|delta/.test(lower);
  }

  static isPaperQuestion(text) {
    const lower = this.normalizeUserText(text);
    return /paper|smaldino|schank|model|theory|mechanism|finding|result|assortative|encounter/.test(lower);
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

  static getGroundingEvidence(text, topicHint = null) {
    if (!window.PaperKnowledgeBase || typeof window.PaperKnowledgeBase.search !== "function") {
      return { snippets: [], citation: "Smaldino & Schank (2012).", strong: false };
    }

    const hits = window.PaperKnowledgeBase.search(text, topicHint, 2);
    const snippets = hits.map((hit) => `${hit.title} (${hit.pages}): ${hit.snippet}`);
    const citation = window.PaperKnowledgeBase.composeCitation(hits);
    const strongest = hits.length > 0 ? hits[0].score : 0;

    return {
      snippets,
      citation,
      strong: strongest >= 4,
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
      ". Treat this as directional evidence unless other parameters are held constant across repeated runs.";

    return this.buildStructuredReply({
      claim,
      evidence,
      interpretation,
      citation: "Smaldino & Schank (2012), pp. 11-18.",
      confidence: "High",
      nextStep: "Repeat each condition 5-10 times (or use batch mode) before drawing strong causal conclusions.",
    });
  }

  static getProgressiveExplanation(topic, depth, metrics, densityLevel, mobilityLevel, preferenceRule) {
    if (depth === 1) {
      if (topic === "density") {
        return "Density changes encounter frequency. With " + densityLevel.toLowerCase() + " density, partner meetings happen at a different rate.";
      }
      if (topic === "mobility") {
        return "Mobility changes movement range per step. With " + mobilityLevel.toLowerCase() + " mobility, agents explore more or less of the grid.";
      }
      if (topic === "matching") {
        return "Matching occurs when two agents meet and both accept. Final pairing patterns reflect environment and rule interactions.";
      }
      return "This asks about a core mechanism in the simulation.";
    }

    if (depth === 2) {
      if (topic === "density" && metrics) {
        return "In your run, " + densityLevel.toLowerCase() + " density produced " + metrics.pairs.length + " pairs and matching strength " + metrics.matchingStrength.toFixed(2) + ".";
      }
      if (topic === "mobility" && metrics) {
        return "In your run, " + mobilityLevel.toLowerCase() + " mobility produced average search " + metrics.averageSearchSteps.toFixed(1) + " steps.";
      }
      return "This mechanism can be connected directly to your run outcomes.";
    }

    if (topic === "density") {
      return "Deep dive: density and mobility jointly control who can be encountered in local neighborhoods, shaping search bottlenecks and final pair patterns.";
    }
    if (topic === "mobility") {
      return "Deep dive: low mobility traps search in local pockets, while high mobility broadens alternatives and can increase assortative structure.";
    }

    return "Deep dive: this mechanism depends on interactions among environment, search, and acceptance criteria.";
  }

  static buildDensityCausalReply(metrics, densityLevel) {
    return "Density changes encounter opportunities. With " + densityLevel.toLowerCase() + " density, your run produced " + metrics.pairs.length + " pairs, consistent with the idea that sparse settings increase search friction while dense settings increase opportunities.";
  }

  static buildDensitySearchReply(metrics, densityLevel) {
    return "In " + densityLevel.toLowerCase() + " density, average search time was " + Math.round(metrics.averageSearchSteps) + " steps. Sparse populations generally prolong search; denser populations typically compress the timeline.";
  }

  static buildPreferenceReply(preferenceRule) {
    if (preferenceRule === "Attractiveness-based") {
      return "Attractiveness-based choice prioritizes partner attractiveness and often creates stronger sorting under good encounter conditions.";
    }
    return "Similarity-based choice prioritizes closeness in attractiveness and can support faster acceptance under local availability.";
  }

  static getInsightQuestionSet(scenario, lastTopic = null) {
    const densityQuestions = [
      "Why did density affect pairing?",
      "Does higher density always mean more pairs?",
      "How do density and mobility interact?",
      "What does Smaldino & Schank say about density?",
    ];

    const mobilityQuestions = [
      "Why does mobility change search time?",
      "High mobility vs. low mobility: which forms more pairs?",
      "How does mobility differ from density?",
      "Can I improve results by changing mobility?",
    ];

    const matchingQuestions = [
      "What does matching strength mean?",
      "Why did some agents not pair?",
      "Can I make pairs stronger?",
      "How does the rule affect pairing?",
    ];

    const preferenceQuestions = [
      "What is the difference between the rules?",
      "Does attractiveness-based work better?",
      "How does the rule affect search time?",
      "Can I test both rules?",
    ];

    const defaultQuestions = [
      "Why did density affect pairing?",
      "I do not understand the result.",
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
    const normalizedText = this.normalizeUserText(text);

    if (this.isCapabilityQuestion(normalizedText)) {
      return this.buildStructuredReply({
        claim: "This assistant interprets simulation outcomes and paper mechanisms in a grounded format.",
        evidence: TeachingContent.buildCapabilityMessage(hasRun),
        interpretation: "It is optimized for this simulation and Smaldino & Schank (2012), including evidence-based comparisons and confidence labels.",
        citation: "Smaldino & Schank (2012).",
        confidence: "High",
        nextStep: hasRun ? "Ask: 'Compare my last two runs.'" : "Ask: 'What does the paper predict about density?'",
      });
    }

    const intent = this.detectIntent(normalizedText);
    const topic = this.detectTopic(normalizedText) || lastTopic;
    const grounding = this.getGroundingEvidence(normalizedText, topic);

    if (intent === "comparative" || this.isComparisonQuestion(normalizedText)) {
      const comparisonReply = this.buildComparisonFromHistory(runHistory, topic);
      if (comparisonReply) return comparisonReply;
    }

    if (intent === "reliability") {
      const runCount = Array.isArray(runHistory) ? runHistory.length : 0;
      return this.buildStructuredReply({
        claim: "Single-run conclusions are directional, not definitive.",
        evidence:
          "Tracked runs=" + runCount +
          (metrics
            ? "; latest metrics: pairs=" + metrics.pairs.length + ", strength=" + metrics.matchingStrength.toFixed(2) + ", avg search=" + metrics.averageSearchSteps.toFixed(1)
            : "; no run metrics currently loaded"),
        interpretation: "Reliability rises with repeated runs per condition and controlled one-parameter changes.",
        citation: grounding.citation,
        confidence: runCount >= 5 ? "Medium" : "Low",
        nextStep: "Run batch experiments (n>=10) per condition and compare mean differences with confidence intervals.",
      });
    }

    if (this.isClarificationRequest(normalizedText)) {
      if (topic) {
        return this.buildStructuredReply({
          claim: "Here is a simpler explanation of the same mechanism.",
          evidence: metrics
            ? "Run metrics: pairs=" + metrics.pairs.length + ", strength=" + metrics.matchingStrength.toFixed(2) + ", avg search=" + metrics.averageSearchSteps.toFixed(1) + "."
            : "No run-specific metrics yet; explanation is paper-grounded.",
          interpretation: this.getProgressiveExplanation(topic, Math.min((topicDepth || 0) + 1, 3), metrics, densityLevel, mobilityLevel, preferenceRule),
          citation: grounding.citation,
          confidence: topic && grounding.snippets.length > 0 ? "Medium" : "Low",
          nextStep: "If needed, ask: 'Give one concrete example from the run plus one paper claim.'",
        });
      }

      return this.buildStructuredReply({
        claim: "I can simplify it, but I need a target concept.",
        evidence: "Available concepts: density, mobility, preference rule, matching strength, and search time.",
        interpretation: "Pick one variable and I will map it to paper mechanism and run evidence.",
        citation: grounding.citation,
        confidence: "Medium",
        nextStep: "Ask: 'Explain mobility in this run in simple terms.'",
      });
    }

    // Allow paper-grounded conceptual Q&A even without a completed run.
    if (!hasRun && (topic || this.isPaperQuestion(normalizedText))) {
      const topSnippet = grounding.snippets[0] || "No direct snippet match found; ask with a clearer concept like density, mobility, or preference rule.";
      return this.buildStructuredReply({
        claim: "I can answer this conceptually from the paper even without a completed run.",
        evidence: topSnippet,
        interpretation: topic
          ? this.getProgressiveExplanation(topic, 1, null, densityLevel, mobilityLevel, preferenceRule)
          : "This question maps to paper-level mechanism claims about spatial constraints and encounter structure.",
        citation: grounding.citation,
        confidence: grounding.strong ? "Medium" : "Low",
        nextStep: "Run one scenario and ask the same question again for run-specific evidence.",
      });
    }

    if (!hasRun) {
      return this.buildStructuredReply({
        claim: "No simulation evidence is available yet.",
        evidence: "I cannot reference run metrics because no completed run exists in this session.",
        interpretation: "I can still answer conceptual paper questions if you ask about density, mobility, matching, or preference rules.",
        citation: grounding.citation,
        confidence: "Low",
        nextStep: "Click 'Start Simulation', then ask about a variable or mechanism.",
      });
    }

    let answerText = null;
    let topicUsed = topic;

    if (topic === "density") {
      if (intent === "causal") answerText = this.buildDensityCausalReply(metrics, densityLevel);
      else if (intent === "explanatory") answerText = this.getProgressiveExplanation(topic, 1, metrics, densityLevel, mobilityLevel, preferenceRule);
      else answerText = this.buildDensitySearchReply(metrics, densityLevel);
    }

    if (topic === "preference" && !answerText) {
      answerText = this.buildPreferenceReply(preferenceRule);
    }

    if (topic === "matching" && !answerText) {
      answerText =
        "Matching occurs when both agents accept. This run produced " + metrics.pairs.length +
        " pairs with strength " + metrics.matchingStrength.toFixed(2) +
        ", indicating the degree of assortative sorting.";
    }

    if (topic === "mobility" && !answerText) {
      answerText = this.getProgressiveExplanation("mobility", 2, metrics, densityLevel, mobilityLevel, preferenceRule);
    }

    if (!answerText && grounding.snippets.length > 0) {
      answerText = "From the paper: " + grounding.snippets[0];
      topicUsed = topicUsed || "paper";
    }

    if (!answerText) {
      return this.buildStructuredReply({
        claim: "This question is outside the assistant's current analysis scope.",
        evidence: TeachingContent.buildOutOfScopeReply(),
        interpretation: "I can still help if you ask about simulation variables, run metrics, or the paper's core mechanisms.",
        citation: "Smaldino & Schank (2012).",
        confidence: "Low",
        nextStep: "Ask: 'What in this run explains matching strength?'",
      });
    }

    const combinedEvidence =
      "Run evidence: pairs=" + metrics.pairs.length +
      ", matching strength=" + metrics.matchingStrength.toFixed(2) +
      ", avg search=" + metrics.averageSearchSteps.toFixed(1) +
      ". " +
      (grounding.snippets[0] ? "Paper evidence: " + grounding.snippets[0] : "");

    const confidence = this.getConfidenceLabel(grounding.strong || !!metrics, intent === "comparative", !!topicUsed);

    return this.buildStructuredReply({
      claim: "Your question maps to the " + (topicUsed || "current") + " mechanism in this model.",
      evidence: combinedEvidence,
      interpretation: answerText,
      citation: grounding.citation,
      confidence,
      nextStep: "For stronger evidence, compare this with another run where only one parameter changes.",
    });
  }
}

window.ChatEngine = ChatEngine;
