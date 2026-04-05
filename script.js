(function () {
  const STEP_COUNT = 50;
  const ENCOUNTER_DISTANCE = 28;
  const AGENT_RADIUS = 6;

  const densityMultipliers = {
    Sparse: 0.8,
    Normal: 1.6,
    Dense: 2.6,
  };
  const baseDensityFactor = 0.00045; // scaled by canvas area to size populations

  const mobilitySizes = {
    Low: 6,
    Medium: 14,
    High: 24,
  };

  class MateChoiceSimulation {
    constructor() {
      this.canvas = document.getElementById("simulation-canvas");
      this.context = this.canvas.getContext("2d");
      this.preferenceSelect = document.getElementById("preference-rule");
      this.mobilitySelect = document.getElementById("mobility-level");
      this.densitySelect = document.getElementById("density-level");
      this.runButton = document.getElementById("run-simulation");
      this.status = document.getElementById("simulation-status");
      this.teachingExplanation = document.getElementById("teaching-explanation");
      this.chatLog = document.getElementById("chat-log");
      this.chatForm = document.getElementById("chat-form");
      this.chatInput = document.getElementById("chat-input");
      this.chatSimpleToggle = document.getElementById("chat-simple-toggle");
      this.downloadCsvButton = document.getElementById("download-csv");
      this.downloadPngButton = document.getElementById("download-png");
      this.copyCitationButton = document.getElementById("copy-citation");
      this.summaryPairs = document.getElementById("summary-pairs");
      this.summaryStrength = document.getElementById("summary-strength");
      this.summarySearch = document.getElementById("summary-search");
      this.runSummary = document.getElementById("run-summary");

      this.state = {
        agents: [],
        pairs: [],
        step: 0,
        isRunning: false,
        lastRun: null,
      };

      this.handleResize = this.handleResize.bind(this);
      this.handleRun = this.handleRun.bind(this);
      this.handleControlChange = this.handleControlChange.bind(this);
      this.handleChatSubmit = this.handleChatSubmit.bind(this);
      this.debounceTimer = null;

      this.bindEvents();
      this.handleResize();
      this.seedPreview();
      this.resetTeachingExplanation();
      this.initChat();
    }

    bindEvents() {
      window.addEventListener("resize", this.handleResize);
      this.runButton.addEventListener("click", this.handleRun);
      this.preferenceSelect.addEventListener("change", this.handleControlChange);
      this.mobilitySelect.addEventListener("change", this.handleControlChange);
      this.densitySelect.addEventListener("change", this.handleControlChange);
      this.chatForm.addEventListener("submit", this.handleChatSubmit);
      if (this.chatSimpleToggle) {
        this.chatSimpleToggle.addEventListener("change", () => {
          this.simpleMode = this.chatSimpleToggle.checked;
          this.addChatMessage(
            "Assistant",
            this.simpleMode
              ? "Simple mode on: I’ll explain runs in everyday language before citing the paper."
              : "Simple mode off: I’ll give fuller technical references."
          );
        });
      }
      if (this.downloadCsvButton) {
        this.downloadCsvButton.addEventListener("click", () => this.downloadCsv());
      }
      if (this.downloadPngButton) {
        this.downloadPngButton.addEventListener("click", () => this.downloadPng());
      }
      if (this.copyCitationButton) {
        this.copyCitationButton.addEventListener("click", () => this.copyCitation());
      }
      this.bindLessonPresets();
    }

    handleResize() {
      const rect = this.canvas.getBoundingClientRect();
      const size = Math.max(320, Math.floor(Math.min(rect.width || 0, rect.height || rect.width || 0)));
      const ratio = window.devicePixelRatio || 1;

      this.canvas.width = size * ratio;
      this.canvas.height = size * ratio;
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.scale(ratio, ratio);

      if (this.state.agents.length > 0) {
        this.draw();
      }
    }

    seedPreview() {
      this.state.agents = this.createAgents(this.getDensityCount(this.densitySelect.value));
      this.state.pairs = [];
      this.state.step = 0;
      this.draw();
    }

    handleRun() {
      if (this.state.isRunning) {
        return;
      }

      this.state = {
        agents: this.createAgents(this.getDensityCount(this.densitySelect.value)),
        pairs: [],
        step: 0,
        isRunning: true,
      };

      this.runButton.disabled = true;
      this.status.textContent = "Simulation started. Agents are moving into their first encounters.";
      this.draw();
      this.animate();
    }

    handleControlChange() {
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(() => {
        this.debounceTimer = null;

        if (!this.state.isRunning) {
          this.handleRun();
        }
      }, 400);
    }

    handleChatSubmit(event) {
      event.preventDefault();
      const text = (this.chatInput.value || "").trim();
      if (!text) return;

      this.addChatMessage("You", text);
      this.chatInput.value = "";

      const reply = this.buildChatReply(text);
      this.addChatMessage("Assistant", reply);
    }

    createAgents(count) {
      const size = this.getCanvasSize();
      const padding = AGENT_RADIUS + 4;
      const agents = [];

      for (let index = 0; index < count; index += 1) {
        agents.push({
          id: index,
          attractiveness: this.randomInt(1, 10),
          x: this.randomFloat(padding, size - padding),
          y: this.randomFloat(padding, size - padding),
          matched: false,
          partnerId: null,
          searchSteps: 0,
        });
      }

      return agents;
    }

    animate() {
      if (!this.state.isRunning) {
        return;
      }

      if (this.state.step >= STEP_COUNT) {
        this.finishRun();
        return;
      }

      this.stepSimulation();
      this.draw();
      this.state.step += 1;
      this.updateStatus();

      window.requestAnimationFrame(() => this.animate());
    }

    stepSimulation() {
      this.moveAgents();
      this.resolveEncounters();

      this.state.agents.forEach((agent) => {
        if (!agent.matched) {
          agent.searchSteps += 1;
        }
      });
    }

    moveAgents() {
      const movement = mobilitySizes[this.mobilitySelect.value];
      const size = this.getCanvasSize();
      const padding = AGENT_RADIUS + 2;

      this.state.agents.forEach((agent) => {
        if (agent.matched) {
          return;
        }

        agent.x = this.clamp(agent.x + this.randomFloat(-movement, movement), padding, size - padding);
        agent.y = this.clamp(agent.y + this.randomFloat(-movement, movement), padding, size - padding);
      });
    }

    resolveEncounters() {
      const unmatchedAgents = this.shuffle(this.state.agents.filter((agent) => !agent.matched));

      for (let index = 0; index < unmatchedAgents.length; index += 1) {
        const agent = unmatchedAgents[index];

        if (agent.matched) {
          continue;
        }

        for (let otherIndex = index + 1; otherIndex < unmatchedAgents.length; otherIndex += 1) {
          const candidate = unmatchedAgents[otherIndex];

          if (candidate.matched) {
            continue;
          }

          if (this.getDistance(agent, candidate) > ENCOUNTER_DISTANCE) {
            continue;
          }

          if (this.mutuallyAccept(agent, candidate)) {
            this.matchAgents(agent, candidate);
            break;
          }
        }
      }
    }

    mutuallyAccept(agent, candidate) {
      const preferenceRule = this.preferenceSelect.value;
      const agentAcceptance = this.getAcceptanceScore(agent, candidate, preferenceRule);
      const candidateAcceptance = this.getAcceptanceScore(candidate, agent, preferenceRule);

      return Math.random() < agentAcceptance && Math.random() < candidateAcceptance;
    }

    getAcceptanceScore(agent, candidate, preferenceRule) {
      if (preferenceRule === "Similarity-based") {
        const difference = Math.abs(agent.attractiveness - candidate.attractiveness);
        return this.clamp(1 - difference / 9, 0.1, 1);
      }

      return this.clamp(candidate.attractiveness / 10, 0.1, 1);
    }

    matchAgents(agent, candidate) {
      agent.matched = true;
      candidate.matched = true;
      agent.partnerId = candidate.id;
      candidate.partnerId = agent.id;

      this.state.pairs.push({ agent1: agent.id, agent2: candidate.id });
    }

    finishRun() {
      this.state.isRunning = false;
      this.runButton.disabled = false;
      this.updateStatus(true);
      this.updateTeachingExplanation();
      this.setExportEnabled(true);
      this.updateSummaryBar();
      this.scrollToTeaching();
      this.draw();
    }

    updateStatus(isComplete = false) {
      const matchedCount = this.state.agents.filter((agent) => agent.matched).length;
      const pairCount = this.state.pairs.length;

      if (isComplete) {
        this.status.textContent =
          "Simulation complete: " +
          pairCount +
          " pairs formed across " +
          STEP_COUNT +
          " steps with " +
          matchedCount +
          " matched agents.";
        return;
      }

      if (!this.state.isRunning) {
        this.status.textContent =
          "Ready to simulate density, mobility, and mate choice encounters.";
        return;
      }

      this.status.textContent =
        "Running step " +
        this.state.step +
        " of " +
        STEP_COUNT +
        ": " +
        pairCount +
        " pairs formed so far.";
    }

    draw() {
      const size = this.getCanvasSize();

      this.context.clearRect(0, 0, size, size);
      this.drawGrid(size);
      this.drawPairs();
      this.drawAgents();
    }

    drawGrid(size) {
      this.context.fillStyle = "rgba(255, 252, 246, 0.92)";
      this.context.fillRect(0, 0, size, size);

      this.context.strokeStyle = "rgba(15, 118, 110, 0.12)";
      this.context.lineWidth = 1;

      const spacing = Math.max(24, Math.floor(size / 18));

      for (let position = 0; position <= size; position += spacing) {
        this.context.beginPath();
        this.context.moveTo(position, 0);
        this.context.lineTo(position, size);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(0, position);
        this.context.lineTo(size, position);
        this.context.stroke();
      }
    }

    drawPairs() {
      this.context.strokeStyle = "#ff4d4d";
      this.context.lineWidth = 2.5;

      this.state.pairs.forEach((pair) => {
        const first = this.state.agents[pair.agent1];
        const second = this.state.agents[pair.agent2];

        this.context.beginPath();
        this.context.moveTo(first.x, first.y);
        this.context.lineTo(second.x, second.y);
        this.context.stroke();
      });
    }

    drawAgents() {
      this.state.agents.forEach((agent) => {
        this.context.beginPath();
        this.context.arc(agent.x, agent.y, AGENT_RADIUS, 0, Math.PI * 2);
        this.context.fillStyle = agent.matched
          ? "#22c55e"
          : this.getAgentColor(agent.attractiveness);
        this.context.fill();

        this.context.lineWidth = 1;
        this.context.strokeStyle = "rgba(31, 26, 23, 0.18)";
        this.context.stroke();
      });
    }

    getAgentColor(attractiveness) {
      const hue = 210 + attractiveness * 1.5;
      const saturation = 70;
      const lightness = 62 - attractiveness * 1.6;
      return "hsl(" + hue + " " + saturation + "% " + lightness + "%)";
    }

    getDistance(first, second) {
      return Math.hypot(first.x - second.x, first.y - second.y);
    }

    getCanvasSize() {
      return this.canvas.width / (window.devicePixelRatio || 1);
    }

    getDensityCount(densityLevel) {
      const size = this.getCanvasSize();
      const area = size * size;
      const multiplier = densityMultipliers[densityLevel] || 1;
      const count = Math.max(10, Math.round(area * baseDensityFactor * multiplier));
      return count;
    }

    initChat() {
      this.addChatMessage(
        "Assistant",
        "I can compare each run to Smaldino & Schank (2012). After a run, ask follow-ups like “How did density influence assortative matching?”"
      );
    }

    addChatMessage(author, text) {
      if (!this.chatLog) return;
      const p = document.createElement("p");
      p.className = "chat-message";
      p.innerHTML = "<strong>" + author + ":</strong> " + text;
      this.chatLog.appendChild(p);
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    buildChatReply(text) {
      const lower = text.toLowerCase();
      if (!this.state.lastRun) {
        return "No simulation run yet. Hit Run Simulation or change a control to auto-run, then ask about the results.";
      }

      const { metrics, mobilityLevel: mobility, densityLevel: density, preferenceRule: preference } = this.state.lastRun;

      if (lower.includes("explain") || lower.includes("result") || lower.includes("summary")) {
        return this.buildExplainMessage(metrics, mobility, density, preference);
      }

      if (lower.includes("citation")) {
        return this.buildRunCitationMessage(metrics, mobility, density, preference);
      }

      if (lower.includes("detail") || lower.includes("quote") || lower.includes("map")) {
        const refs = this.getReferenceNotes(mobility, density, preference);
        return (
          "Detailed pointers: " +
          refs.join("; ") +
          ". These map to the spatial locality, mobility, and density analyses in Smaldino & Schank (2012)."
        );
      }

      if (lower.trim() === "yes" || lower.trim() === "ok" || lower.trim() === "sure") {
        return (
          "Tell me what to dig into: density effects, mobility effects, or preference rule impacts? Quick recap: " +
          metrics.pairCount +
          " pairs, strength " +
          metrics.matchingStrength.toFixed(2) +
          ", avg search " +
          metrics.averageSearchSteps.toFixed(1) +
          "."
        );
      }

      if (lower.includes("density")) {
        return (
          "Density note: current level " +
          density +
          " yielded " +
          metrics.pairCount +
          " pairs and matching strength " +
          metrics.matchingStrength.toFixed(2) +
          ". This mirrors Smaldino & Schank (2012, pp. 17–18) where higher density accelerates encounters and boosts pairing."
        );
      }

      if (lower.includes("mobility")) {
        return (
          "Mobility note: with " +
          mobility +
          " mobility, avg search was " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps. Smaldino & Schank (2012, p. 16) report that limited movement prolongs search and weakens assortment; your run reflects that pattern."
        );
      }

      if (lower.includes("similarity")) {
        return (
          "Similarity rule: matching strength " +
          metrics.matchingStrength.toFixed(2) +
          " suggests how local availability shapes pair similarity (Smaldino & Schank 2012, pp. 11–13). In sparse settings similarity weakens because agents accept viable locals."
        );
      }

      if (lower.includes("attractiveness")) {
        return (
          "Attractiveness rule: highly attractive agents often wait longer; your avg search " +
          metrics.averageSearchSteps.toFixed(1) +
          " aligns with the slowdown described in Smaldino & Schank (2012, p. 16) under spatial constraints."
        );
      }

      return (
        "Pick a focus—density, mobility, or preference rule—and I'll link it to the run. Current run: " +
        metrics.pairCount +
        " pairs, strength " +
        metrics.matchingStrength.toFixed(2) +
        ", avg search " +
        metrics.averageSearchSteps.toFixed(1) +
        " (Smaldino & Schank 2012, pp. 11–18)."
      );
    }

    resetTeachingExplanation() {
      this.teachingExplanation.textContent =
        "Run the simulation to generate a teaching explanation about how mobility, density, and preference rules shape assortative matching in this model.";
      this.addChatMessage(
        "Assistant",
        "Ready to discuss results. Run the simulation or ask how mobility, density, and preference rules connect to Smaldino & Schank (2012)."
      );
      this.setExportEnabled(false);
    }

    updateTeachingExplanation() {
      const metrics = this.getSimulationMetrics();
      const preferenceRule = this.preferenceSelect.value;
      const mobilityLevel = this.mobilitySelect.value;
      const densityLevel = this.densitySelect.value;

      const sentences = [
        "This run used " +
          mobilityLevel.toLowerCase() +
          " mobility, " +
          densityLevel.toLowerCase() +
          " density, and a " +
          preferenceRule.toLowerCase() +
          " rule, producing " +
          metrics.pairCount +
          " pairs with a matching strength of " +
          metrics.matchingStrength.toFixed(2) +
          ".",
        this.getMobilityCommentary(mobilityLevel),
        this.getDensityCommentary(densityLevel),
        this.getPreferenceCommentary(preferenceRule),
        this.getStrengthCommentary(metrics.matchingStrength),
        this.getSearchCommentary(metrics.averageSearchSteps),
      ];

      this.teachingExplanation.textContent = sentences.join(" ");
      this.appendRunSummary(metrics, mobilityLevel, densityLevel, preferenceRule);
      this.addChatMessage("Assistant", this.buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule));
      this.state.lastRun = {
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
      };
    }

    getSimulationMetrics() {
      const matchedAgents = this.state.agents.filter((agent) => agent.matched);
      const totalSearchSteps = this.state.agents.reduce((sum, agent) => sum + agent.searchSteps, 0);
      const averageSearchSteps = this.state.agents.length === 0
        ? 0
        : totalSearchSteps / this.state.agents.length;

      const pairDifferences = this.state.pairs.map((pair) => {
        const first = this.state.agents[pair.agent1];
        const second = this.state.agents[pair.agent2];
        return Math.abs(first.attractiveness - second.attractiveness);
      });

      const averageDifference = pairDifferences.length === 0
        ? 9
        : pairDifferences.reduce((sum, difference) => sum + difference, 0) / pairDifferences.length;

      const matchingStrength = this.clamp(1 - averageDifference / 9, 0, 1);

      return {
        pairCount: this.state.pairs.length,
        matchedCount: matchedAgents.length,
        averageSearchSteps,
        matchingStrength,
      };
    }

    appendRunSummary(metrics, mobilityLevel, densityLevel, preferenceRule) {
      const today = new Date().toISOString().slice(0, 10);
      const summary =
        " Simulation (" +
        today +
        ", " +
        densityLevel +
        ", " +
        mobilityLevel +
        ", " +
        preferenceRule +
        "): " +
        metrics.pairCount +
        " pairs, matching strength " +
        metrics.matchingStrength.toFixed(2) +
        ", avg search " +
        metrics.averageSearchSteps.toFixed(1) +
        ".";

      this.teachingExplanation.textContent += summary;
    }

    buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule) {
      const assort =
        metrics.matchingStrength < 0.15
          ? "weak assortative pattern"
          : metrics.matchingStrength > 0.30
          ? "strong assortative pattern"
          : "moderate assortative pattern";

      const refs = this.getReferenceNotes(mobilityLevel, densityLevel, preferenceRule);
      const anchors = this.getParagraphAnchors(mobilityLevel, densityLevel, preferenceRule);

      return (
        "Run result: " +
        metrics.pairCount +
        " pairs, matching strength " +
        metrics.matchingStrength.toFixed(2) +
        " (" +
        assort +
        "), avg search " +
        metrics.averageSearchSteps.toFixed(1) +
        ". Key references: " +
        refs.join("; ") +
        ". Find it in the paper: " +
        anchors.join(" | ") +
        "."
      );
    }

    buildExplainMessage(metrics, mobility, density, preference) {
      const simple = !!this.simpleMode;
      const strengthLabel =
        metrics.matchingStrength < 0.15
          ? "very little similarity between partners"
          : metrics.matchingStrength > 0.30
          ? "partners are quite similar"
          : "partners are somewhat similar";

      if (simple) {
        return (
          "In plain terms: We formed " +
          metrics.pairCount +
          " pairs. Partners ended up " +
          strengthLabel +
          " (score " +
          metrics.matchingStrength.toFixed(2) +
          "). On average it took about " +
          metrics.averageSearchSteps.toFixed(1) +
          " moves to find someone. Because the grid was " +
          density.toLowerCase() +
          " and movement was " +
          mobility.toLowerCase() +
          ", people mostly met nearby others, which made matching depend on who was close. That’s exactly what Smaldino & Schank found: space and movement change who meets whom (pp. 11–18)."
        );
      }

      const refs = this.getReferenceNotes(mobility, density, preference);
      const anchors = this.getParagraphAnchors(mobility, density, preference);
      return (
        "Result recap: " +
        metrics.pairCount +
        " pairs; matching strength " +
        metrics.matchingStrength.toFixed(2) +
        " (" +
        strengthLabel +
        "); avg search " +
        metrics.averageSearchSteps.toFixed(1) +
        ". Interpretation: " +
        density.toLowerCase() +
        " density limited encounter options and " +
        mobility.toLowerCase() +
        " mobility set how far agents could search, so assortment reflects nearby availability more than global choice. Sources: " +
        refs.join("; ") +
        ". Locate in text: " +
        anchors.join(" | ") +
        "."
      );
    }

    getMobilityCommentary(mobilityLevel) {
      if (mobilityLevel === "Low") {
        return "With low mobility, agents cover little space, so they experience fewer encounters and weaker matching because many potential partners never come into range.";
      }

      if (mobilityLevel === "High") {
        return "High mobility improves search because agents sweep through more of the grid, creating better opportunities to find acceptable partners and strengthening the resulting matches.";
      }

      return "Medium mobility creates an intermediate search environment in which agents encounter enough alternatives to improve matching, but not as efficiently as in the high-mobility case.";
    }

    getDensityCommentary(densityLevel) {
      if (densityLevel === "Sparse") {
        return "In a sparse population, search is slow and pair formation is limited because agents spend more time moving without encountering nearby partners (Smaldino & Schank 2012, pp. 17–18).";
      }

      if (densityLevel === "Dense") {
        return "In a dense population, encounter rates rise quickly, so matching happens faster and agents have more chances to sort into compatible pairs (Smaldino & Schank 2012, pp. 17–18).";
      }

      return "At normal density, encounter opportunities are steady, which supports pair formation without the extreme search difficulty of sparse settings or the rapid contact of dense ones (Smaldino & Schank 2012, pp. 17–18).";
    }

    getPreferenceCommentary(preferenceRule) {
      if (preferenceRule === "Attractiveness-based") {
        return "Under attractiveness-based choice, highly attractive agents can afford to wait longer, and matching tends to strengthen when mobility and density give everyone broader access to alternatives (Smaldino & Schank 2012, p. 16).";
      }

      return "Under similarity-based choice, pairing tends to happen faster because agents can accept locally similar partners, so outcomes depend strongly on who is actually available in each neighborhood (Smaldino & Schank 2012, pp. 11–13).";
    }

    getStrengthCommentary(matchingStrength) {
      if (matchingStrength < 0.15) {
        return "Because matching strength is below 0.15, this run shows weak assortative mating, meaning the final pairs are only weakly sorted by attractiveness (Smaldino & Schank 2012, pp. 11–13).";
      }

      if (matchingStrength > 0.30) {
        return "Because matching strength is above 0.30, this run shows strong assortative patterns, with partners ending up noticeably similar in attractiveness (Smaldino & Schank 2012, pp. 11–13).";
      }

      return "The middle-range matching strength suggests moderate assortment, where some sorting is visible but the environment still limits how cleanly agents can match with similar partners (Smaldino & Schank 2012, pp. 11–13).";
    }

    getSearchCommentary(averageSearchSteps) {
      if (averageSearchSteps > STEP_COUNT * 0.65) {
        return "The high average search time of " +
          averageSearchSteps.toFixed(1) +
          " steps indicates substantial search difficulty, so many agents had to wait a long time before finding an acceptable partner or failed to match at all (Smaldino & Schank 2012, p. 16).";
      }

      return "The average search time of " +
        averageSearchSteps.toFixed(1) +
        " steps suggests that the search environment was comparatively manageable for this population (Smaldino & Schank 2012, p. 16).";
    }

    getReferenceNotes(mobilityLevel, densityLevel, preferenceRule) {
      const notes = [];

      // Spatial locality baseline
      notes.push("local neighborhoods constrain encounters (pp. 11–13)");

      if (mobilityLevel === "Low") {
        notes.push("low mobility slows search and weakens assortment (p. 16, mobility discussion)");
      } else if (mobilityLevel === "High") {
        notes.push("higher mobility improves partner search (p. 16, mobility effects)");
      } else {
        notes.push("medium mobility yields intermediate search efficiency (p. 16)");
      }

      if (densityLevel === "Sparse") {
        notes.push("sparse grids reduce matching, extend search time (pp. 17–18, density results)");
      } else if (densityLevel === "Dense") {
        notes.push("dense grids increase encounter rates, faster matching (pp. 17–18)");
      } else {
        notes.push("normal density produces steady encounters (pp. 17–18)");
      }

      if (preferenceRule === "Attractiveness-based") {
        notes.push("attractiveness priority raises wait times for high-attractiveness agents (p. 16)");
      } else {
        notes.push("similarity rule depends on local availability more than global sorting (pp. 11–13)");
      }

      return notes;
    }

    getParagraphAnchors(mobilityLevel, densityLevel, preferenceRule) {
      const anchors = [];

      anchors.push('pp. 11–13: early section noting that agents only meet near neighbors ("spatial locality")');

      if (mobilityLevel === "Low") {
        anchors.push('p. 16: paragraph discussing how limited movement slows search and weakens assortment');
      } else if (mobilityLevel === "High") {
        anchors.push('p. 16: paragraph showing higher movement boosts encounters and matching');
      } else {
        anchors.push('p. 16: mobility section, mid-paragraph on intermediate movement rates');
      }

      if (densityLevel === "Sparse") {
        anchors.push('pp. 17–18: results on sparse grids—few encounters and longer search');
      } else if (densityLevel === "Dense") {
        anchors.push('pp. 17–18: results on dense grids—more encounters and faster matching');
      } else {
        anchors.push('pp. 17–18: "normal density" case with steady encounters');
      }

      if (preferenceRule === "Attractiveness-based") {
        anchors.push('p. 16: note that prioritizing attractiveness makes highly attractive agents wait longer');
      } else {
        anchors.push('pp. 11–13: discussion of similarity choices depending on who is locally available');
      }

      return anchors;
    }

    setExportEnabled(isEnabled) {
      if (this.downloadCsvButton) this.downloadCsvButton.disabled = !isEnabled;
      if (this.downloadPngButton) this.downloadPngButton.disabled = !isEnabled;
      if (this.copyCitationButton) this.copyCitationButton.disabled = !isEnabled;
    }

    downloadCsv() {
      if (!this.state.lastRun) {
        this.addChatMessage("Assistant", "Run first, then download the summary.");
        return;
      }

      const { metrics, mobilityLevel, densityLevel, preferenceRule } = this.state.lastRun;
      const rows = [
        ["date", new Date().toISOString()],
        ["mobility", mobilityLevel],
        ["density", densityLevel],
        ["preferenceRule", preferenceRule],
        ["pairs", metrics.pairCount],
        ["matchingStrength", metrics.matchingStrength.toFixed(3)],
        ["averageSearchSteps", metrics.averageSearchSteps.toFixed(2)],
        ["matchedAgents", metrics.matchedCount],
        ["totalAgents", this.state.agents.length],
        [],
        ["pair_id", "a_id", "b_id", "a_attr", "b_attr"],
        ...this.state.pairs.map((pair, index) => {
          const a = this.state.agents[pair.agent1];
          const b = this.state.agents[pair.agent2];
          return [index, a.id, b.id, a.attractiveness, b.attractiveness];
        }),
      ];

      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, "simulation-summary.csv");
    }

    downloadPng() {
      const dataUrl = this.canvas.toDataURL("image/png");
      this.triggerDownload(dataUrl, "simulation-grid.png");
    }

    triggerDownload(url, filename) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }

    bindLessonPresets() {
      const buttons = document.querySelectorAll("[data-preset]");
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const preset = button.getAttribute("data-preset");
          this.applyPreset(preset);
          this.handleRun();
        });
      });
    }

    updateSummaryBar() {
      if (!this.state.lastRun || !this.summaryPairs) return;
      const { metrics } = this.state.lastRun;
      this.summaryPairs.textContent = metrics.pairCount + " pairs";
      this.summaryStrength.textContent = "Strength " + metrics.matchingStrength.toFixed(2);
      this.summarySearch.textContent = "Avg search " + metrics.averageSearchSteps.toFixed(1);
      this.runSummary.classList.add("is-visible");
    }

    copyCitation() {
      if (!this.lastCitation) {
        this.addChatMessage("Assistant", "Run first, then copy the citation.");
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.lastCitation).then(
          () => this.addChatMessage("Assistant", "Citation copied."),
          () => this.addChatMessage("Assistant", "Clipboard blocked—copy manually from the chat.")
        );
      } else {
        this.addChatMessage("Assistant", this.lastCitation);
      }
    }

    scrollToTeaching() {
      const teaching = document.querySelector(".panel-teaching");
      if (teaching && teaching.scrollIntoView) {
        teaching.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    applyPreset(preset) {
      const setSelect = (select, value) => {
        if (!select) return;
        select.value = value;
      };

      if (preset === "sparse-low-attractiveness") {
        setSelect(this.densitySelect, "Sparse");
        setSelect(this.mobilitySelect, "Low");
        setSelect(this.preferenceSelect, "Attractiveness-based");
      } else if (preset === "dense-high-attractiveness") {
        setSelect(this.densitySelect, "Dense");
        setSelect(this.mobilitySelect, "High");
        setSelect(this.preferenceSelect, "Attractiveness-based");
      } else if (preset === "normal-high-similarity") {
        setSelect(this.densitySelect, "Normal");
        setSelect(this.mobilitySelect, "High");
        setSelect(this.preferenceSelect, "Similarity-based");
      }

      // retain last citation text
      this.lastCitation = this.buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule);
    }

    shuffle(items) {
      const copy = [...items];

      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
      }

      return copy;
    }

    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
      return Math.random() * (max - min) + min;
    }

    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }
  }

  new MateChoiceSimulation();
})();
