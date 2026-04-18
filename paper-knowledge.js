/**
 * paper-knowledge.js
 * Lightweight, in-browser knowledge base for Smaldino & Schank (2012)
 */

class PaperKnowledgeBase {
  static getChunks() {
    return [
      {
        id: "model-core",
        title: "Core Spatial Mechanism",
        pages: "pp. 11-13",
        topics: ["density", "mobility", "matching"],
        text:
          "The model places agents on a 2D space where local encounters constrain who can meet whom. Matching outcomes emerge from repeated local interactions rather than globally random encounters.",
      },
      {
        id: "assortment-mechanism",
        title: "Assortative Matching Emergence",
        pages: "pp. 11-13",
        topics: ["matching", "preference"],
        text:
          "Assortative matching can emerge from decentralized local processes. Partner similarity is not imposed directly; it appears from encounter constraints plus acceptance rules.",
      },
      {
        id: "preference-rules",
        title: "Attractiveness vs Similarity Rules",
        pages: "pp. 13-16",
        topics: ["preference", "matching"],
        text:
          "Different preference rules generate different mating dynamics. Attractiveness-based choice and similarity-based choice produce distinct search and pairing trajectories under the same spatial constraints.",
      },
      {
        id: "mobility-effect",
        title: "Mobility and Search",
        pages: "p. 16",
        topics: ["mobility", "search"],
        text:
          "Mobility changes how broadly agents sample potential partners. Higher movement increases exposure to alternatives and can strengthen assortative outcomes while reducing search bottlenecks.",
      },
      {
        id: "density-effect",
        title: "Density and Encounter Rates",
        pages: "pp. 17-18",
        topics: ["density", "search", "matching"],
        text:
          "Population density strongly influences encounter frequency. Sparse settings create longer search and more unmatched agents, while dense settings increase opportunities and speed pair formation.",
      },
      {
        id: "locality-constraint",
        title: "Environmental Constraint Logic",
        pages: "pp. 11-18",
        topics: ["density", "mobility", "matching", "search"],
        text:
          "A key conclusion is that environment constrains matching opportunity structure. Who meets first is not random globally; local opportunity sets shape eventual pair outcomes.",
      },
      {
        id: "parameter-exploration",
        title: "Parameter Space and Robustness",
        pages: "pp. 16-18",
        topics: ["reliability", "method"],
        text:
          "Interpretation is stronger when examining repeated runs and parameter-space trends rather than relying on one trajectory. Robust patterns should hold across nearby settings.",
      },
      {
        id: "teaching-implication",
        title: "Interpretation Implication",
        pages: "pp. 11-18",
        topics: ["teaching", "matching", "method"],
        text:
          "Observed outcomes should be read as interaction effects among environment, movement, and decision rules. Causal claims are strongest when one parameter changes at a time.",
      },
    ];
  }

  static normalizeQuery(text) {
    let normalized = (text || "").toLowerCase().trim();

    const typoMap = {
      undretand: "understand",
      secel5t: "select",
      fro: "for",
      apable: "capable",
      assitant: "assistant",
      reserch: "research",
      comparsion: "comparison",
      moblity: "mobility",
      densitiy: "density",
      assoratative: "assortative",
    };

    Object.keys(typoMap).forEach((bad) => {
      normalized = normalized.replace(new RegExp("\\b" + bad + "\\b", "g"), typoMap[bad]);
    });

    return normalized;
  }

  static tokenize(text) {
    return this.normalizeQuery(text)
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  static scoreChunk(chunk, queryTokens, topicHint) {
    const chunkTokens = this.tokenize(chunk.text + " " + chunk.title + " " + chunk.topics.join(" "));
    let score = 0;

    queryTokens.forEach((token) => {
      if (chunkTokens.includes(token)) score += 1;
    });

    if (topicHint && chunk.topics.includes(topicHint)) {
      score += 3;
    }

    return score;
  }

  static search(query, topicHint = null, maxResults = 2) {
    const queryTokens = this.tokenize(query);
    const chunks = this.getChunks();

    const ranked = chunks
      .map((chunk) => ({
        chunk,
        score: this.scoreChunk(chunk, queryTokens, topicHint),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return ranked.map((item) => ({
      title: item.chunk.title,
      pages: item.chunk.pages,
      snippet: item.chunk.text,
      score: item.score,
      topics: item.chunk.topics,
    }));
  }

  static composeCitation(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return "Smaldino & Schank (2012).";
    }

    const pages = Array.from(new Set(results.map((r) => r.pages))).join(", ");
    return "Smaldino & Schank (2012), " + pages + ".";
  }
}

window.PaperKnowledgeBase = PaperKnowledgeBase;
