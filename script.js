(function () {
  const STEP_COUNT = 50;
  const ENCOUNTER_DISTANCE = 28;
  const AGENT_RADIUS = 6;
  const RULE_ANALYTICS_RUNS = 20;

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

  const selectivityMultipliers = {
    Low: 1.15,
    Medium: 1,
    High: 0.85,
  };

  const patienceRates = {
    Fast: 0.02,
    Normal: 0.01,
    Slow: 0.004,
  };

  const explorationMultipliers = {
    Local: 0.75,
    Balanced: 1,
    Wide: 1.35,
  };

  class MateChoiceSimulation {
    constructor() {
      this.canvas = document.getElementById("simulation-canvas");
      this.context = this.canvas.getContext("2d");
      this.preferenceSelect = document.getElementById("preference-rule");
      this.mobilitySelect = document.getElementById("mobility-level");
      this.densitySelect = document.getElementById("density-level");
      this.selectivitySelect = document.getElementById("selectivity-level");
      this.patienceSelect = document.getElementById("patience-level");
      this.explorationSelect = document.getElementById("exploration-level");
      this.runButton = document.getElementById("run-simulation");
      this.status = document.getElementById("simulation-status");
      this.teachingExplanation = document.getElementById("teaching-explanation");
      this.chatLog = document.getElementById("chat-log");
      this.chatSuggestions = document.getElementById("chat-suggestions");
      this.chatForm = document.getElementById("chat-form");
      this.chatInput = document.getElementById("chat-input");
      this.chatSimpleToggle = document.getElementById("chat-simple-toggle");
      this.chatCapabilitiesButton = document.getElementById("chat-capabilities");
      this.chatResetButton = document.getElementById("chat-reset");
      this.previewCsvButton = document.getElementById("preview-csv");
      this.downloadCsvButton = document.getElementById("download-csv");
      this.downloadPngButton = document.getElementById("download-png");
      this.copyCitationButton = document.getElementById("copy-citation");
      this.batchRunCountSelect = document.getElementById("batch-run-count");
      this.runBatchButton = document.getElementById("run-batch");
      this.batchSummary = document.getElementById("batch-summary");
      this.csvPreview = document.getElementById("csv-preview");
      this.csvPreviewContent = document.getElementById("csv-preview-content");
      this.previewIntroText = document.getElementById("preview-intro-text");
      this.previewBodyText = document.getElementById("preview-body-text");
      this.previewConclusionText = document.getElementById("preview-conclusion-text");
      this.previewKpiPairs = document.getElementById("preview-kpi-pairs");
      this.previewKpiStrength = document.getElementById("preview-kpi-strength");
      this.previewKpiSearch = document.getElementById("preview-kpi-search");
      this.previewMetricsChart = document.getElementById("preview-metrics-chart");
      this.previewDifferenceChart = document.getElementById("preview-difference-chart");
      this.previewMetricsInsight = document.getElementById("preview-metrics-insight");
      this.previewDifferenceInsight = document.getElementById("preview-difference-insight");
      this.ruleAnalyticsDefinitions = document.getElementById("rule-analytics-definitions");
      this.ruleCodeExplainer = document.getElementById("rule-code-explainer");
      this.ruleAnalyticsBody = document.getElementById("rule-analytics-body");
      this.ruleHazardChart = document.getElementById("rule-hazard-chart");
      this.ruleHazardZoomChart = document.getElementById("rule-hazard-zoom-chart");
      this.ruleHazardInsight = document.getElementById("rule-hazard-insight");
      this.ruleHazardTooltip = document.getElementById("rule-hazard-tooltip");
      this.ruleHazardZoomTooltip = document.getElementById("rule-hazard-zoom-tooltip");
      this.hazardChartMode = document.getElementById("hazard-chart-mode");
      this.hazardSeriesToggles = document.getElementById("hazard-series-toggles");
      this.hazardSelectAllButton = document.getElementById("hazard-select-all");
      this.hazardClearAllButton = document.getElementById("hazard-clear-all");
      this.hazardAutoTop2 = document.getElementById("hazard-auto-top2");
      this.hazardAutoTopN = document.getElementById("hazard-auto-topn");
      this.hazardDynamicExplainer = document.getElementById("hazard-dynamic-explainer");
      this.recreatedFigure5Chart = document.getElementById("recreated-figure5-chart");
      this.recreatedFigure6Chart = document.getElementById("recreated-figure6-chart");
      this.recreatedFigure7Chart = document.getElementById("recreated-figure7-chart");
      this.summaryPairs = document.getElementById("summary-pairs");
      this.summaryStrength = document.getElementById("summary-strength");
      this.summarySearch = document.getElementById("summary-search");
      this.runSummary = document.getElementById("run-summary");
      this.controlHelpButtons = Array.from(document.querySelectorAll(".control-help"));

      this.state = {
        agents: [],
        pairs: [],
        step: 0,
        isRunning: false,
        lastRun: null,
      };

      this.lastCitation = null;
      this.simpleMode = false; // Default to technical mode
      this.conversationHistory = []; // Track all questions/answers
      this.lastTopic = null; // Remember what user last asked about
      this.lastQuestionType = null; // Track question intent (causal, clarifying, comparative)
      this.topicDepth = 0; // How deep we are into a topic (for progressive explanations)
        this.defaultInsightQuestions = [
        "Why did density affect pairing?",
        "I don't understand.",
        "How does mobility vs. density differ?",
      ];

      this.handleResize = this.handleResize.bind(this);
      this.handleRun = this.handleRun.bind(this);
      this.handleBatchRun = this.handleBatchRun.bind(this);
      this.handleControlChange = this.handleControlChange.bind(this);
      this.handleChatSubmit = this.handleChatSubmit.bind(this);
      this.handleControlHelpDocumentClick = this.handleControlHelpDocumentClick.bind(this);
      this.handleControlHelpKeydown = this.handleControlHelpKeydown.bind(this);
      this.debounceTimer = null;
      this.ruleHazardHoverData = null;
      this.ruleHazardZoomHoverData = null;
      this.lastRuleAnalyticsRows = null;
      this.hazardSeriesSelection = {};
      this.autoHighlightedSeriesLabels = [];
      this.autoHighlightTop2Enabled = false;

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
      if (this.selectivitySelect) {
        this.selectivitySelect.addEventListener("change", this.handleControlChange);
      }
      if (this.patienceSelect) {
        this.patienceSelect.addEventListener("change", this.handleControlChange);
      }
      if (this.explorationSelect) {
        this.explorationSelect.addEventListener("change", this.handleControlChange);
      }
      if (this.runBatchButton) {
        this.runBatchButton.addEventListener("click", this.handleBatchRun);
      }
      this.bindHazardTooltipEvents();
      this.bindHazardExplorerEvents();
      this.bindControlHelpTooltips();
      this.chatForm.addEventListener("submit", this.handleChatSubmit);
      if (this.chatCapabilitiesButton) {
        this.chatCapabilitiesButton.addEventListener("click", () => {
          this.addChatMessage("Assistant", this.buildCapabilityMessage());
          this.renderInsightQuestions();
        });
      }
      if (this.chatResetButton) {
        this.chatResetButton.addEventListener("click", () => this.resetChatSession());
      }
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
      if (this.previewCsvButton) {
        this.previewCsvButton.addEventListener("click", () => this.previewCsv());
      }
      if (this.downloadPngButton) {
        this.downloadPngButton.addEventListener("click", () => this.downloadPng());
      }
      if (this.copyCitationButton) {
        this.copyCitationButton.addEventListener("click", () => this.copyCitation());
      }
      this.bindLessonPresets();
    }

    bindControlHelpTooltips() {
      if (!this.controlHelpButtons.length) return;

      this.controlHelpButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const willOpen = !button.classList.contains("is-open");
          this.closeControlHelpTooltips();
          if (willOpen) {
            button.classList.add("is-open");
            button.setAttribute("aria-expanded", "true");
          }
        });
      });

      document.addEventListener("click", this.handleControlHelpDocumentClick);
      document.addEventListener("keydown", this.handleControlHelpKeydown);
    }

    closeControlHelpTooltips() {
      this.controlHelpButtons.forEach((button) => {
        button.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      });
    }

    handleControlHelpDocumentClick(event) {
      if (!event.target.closest(".control-help")) {
        this.closeControlHelpTooltips();
      }
    }

    handleControlHelpKeydown(event) {
      if (event.key === "Escape") {
        this.closeControlHelpTooltips();
      }
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

      if (this.batchSummary) {
        this.batchSummary.classList.remove("is-visible");
        this.batchSummary.textContent = "";
      }
      if (this.csvPreview) {
        this.csvPreview.classList.remove("is-visible");
      }
      this.resetPreviewContent();

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

    handleBatchRun() {
      if (this.state.isRunning) {
        return;
      }

      const runCount = parseInt(this.batchRunCountSelect ? this.batchRunCountSelect.value : "30", 10) || 30;
      const metricsList = [];

      this.runButton.disabled = true;
      if (this.runBatchButton) this.runBatchButton.disabled = true;
      this.status.textContent = "Running batch experiment: " + runCount + " simulations...";

      for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
        this.state = {
          agents: this.createAgents(this.getDensityCount(this.densitySelect.value)),
          pairs: [],
          step: 0,
          isRunning: false,
          lastRun: this.state.lastRun,
        };

        for (let stepIndex = 0; stepIndex < STEP_COUNT; stepIndex += 1) {
          this.stepSimulation();
          this.state.step = stepIndex + 1;
        }

        metricsList.push(this.getSimulationMetrics());
      }

      const pairStats = this.computeBatchStats(metricsList.map((m) => m.pairCount));
      const strengthStats = this.computeBatchStats(metricsList.map((m) => m.matchingStrength));
      const searchStats = this.computeBatchStats(metricsList.map((m) => m.averageSearchSteps));
      const lastMetrics = metricsList[metricsList.length - 1];

      this.state.lastRun = {
        metrics: lastMetrics,
        mobilityLevel: this.mobilitySelect.value,
        densityLevel: this.densitySelect.value,
        preferenceRule: this.preferenceSelect.value,
        selectivityLevel: this.selectivitySelect ? this.selectivitySelect.value : "Medium",
        patienceLevel: this.patienceSelect ? this.patienceSelect.value : "Normal",
        explorationLevel: this.explorationSelect ? this.explorationSelect.value : "Balanced",
      };

      this.lastCitation = this.buildRunCitationMessage(
        this.state.lastRun.metrics,
        this.state.lastRun.mobilityLevel,
        this.state.lastRun.densityLevel,
        this.state.lastRun.preferenceRule,
        this.state.lastRun.selectivityLevel,
        this.state.lastRun.patienceLevel,
        this.state.lastRun.explorationLevel
      );

      this.updateSummaryBar();
      this.setExportEnabled(true);
      this.renderInsightQuestions();
      this.draw();
      this.showBatchSummary(runCount, pairStats, strengthStats, searchStats);

      this.status.textContent =
        "Batch complete: " +
        runCount +
        " runs. Mean pairs " +
        pairStats.mean.toFixed(1) +
        ", mean strength " +
        strengthStats.mean.toFixed(2) +
        ", mean search " +
        searchStats.mean.toFixed(1) +
        ".";

      this.addChatMessage(
        "Assistant",
        "Batch experiment complete (n=" +
          runCount +
          "). Mean pairs=" +
          pairStats.mean.toFixed(1) +
          " (95% CI " +
          pairStats.ciLow.toFixed(1) +
          " to " +
          pairStats.ciHigh.toFixed(1) +
          "), matching strength=" +
          strengthStats.mean.toFixed(2) +
          " (95% CI " +
          strengthStats.ciLow.toFixed(2) +
          " to " +
          strengthStats.ciHigh.toFixed(2) +
          "), avg search=" +
          searchStats.mean.toFixed(1) +
          " (95% CI " +
          searchStats.ciLow.toFixed(1) +
          " to " +
          searchStats.ciHigh.toFixed(1) +
          ")."
      );

      this.runButton.disabled = false;
      if (this.runBatchButton) this.runBatchButton.disabled = false;
    }

    computeBatchStats(values) {
      const n = values.length;
      if (!n) {
        return { mean: 0, sd: 0, ciLow: 0, ciHigh: 0 };
      }

      const mean = values.reduce((sum, value) => sum + value, 0) / n;
      const variance =
        n > 1
          ? values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / (n - 1)
          : 0;
      const sd = Math.sqrt(variance);
      const margin = n > 1 ? 1.96 * (sd / Math.sqrt(n)) : 0;

      return {
        mean,
        sd,
        ciLow: mean - margin,
        ciHigh: mean + margin,
      };
    }

    showBatchSummary(runCount, pairStats, strengthStats, searchStats) {
      if (!this.batchSummary) return;

      this.batchSummary.innerHTML =
        "Batch n=" +
        runCount +
        " | Pairs mean=" +
        pairStats.mean.toFixed(1) +
        " (95% CI " +
        pairStats.ciLow.toFixed(1) +
        " to " +
        pairStats.ciHigh.toFixed(1) +
        ") | Strength mean=" +
        strengthStats.mean.toFixed(2) +
        " (95% CI " +
        strengthStats.ciLow.toFixed(2) +
        " to " +
        strengthStats.ciHigh.toFixed(2) +
        ") | Avg search mean=" +
        searchStats.mean.toFixed(1) +
        " (95% CI " +
        searchStats.ciLow.toFixed(1) +
        " to " +
        searchStats.ciHigh.toFixed(1) +
        ").";
      this.batchSummary.classList.add("is-visible");
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

      this.chatInput.value = "";
      this.submitChatQuestion(text);
    }

    submitChatQuestion(text) {
      this.addChatMessage("You", text);
      const reply = this.buildChatReply(text);
      this.addChatMessage("Assistant", reply);
      this.renderInsightQuestions();
    }

    resetChatSession() {
      if (this.chatLog) {
        this.chatLog.innerHTML = "";
      }

      this.conversationHistory = [];
      this.lastTopic = null;
      this.lastQuestionType = null;
      this.topicDepth = 0;

      this.addChatMessage(
        "Assistant",
        this.state.lastRun
          ? "Chat reset. Ask about this scenario's density, mobility, preference rule, matching strength, or citations."
          : "Chat reset. Run a scenario, then ask about density, mobility, preference rules, matching, or citations."
      );
      this.renderInsightQuestions();
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
          matchedAtStep: null,
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
      const currentStep = this.state.step + 1;
      this.moveAgents();
      this.resolveEncounters(currentStep);

      this.state.agents.forEach((agent) => {
        if (!agent.matched) {
          agent.searchSteps += 1;
        }
      });
    }

    moveAgents() {
      const movement = mobilitySizes[this.mobilitySelect.value];
      const exploration = explorationMultipliers[this.explorationSelect ? this.explorationSelect.value : "Balanced"] || 1;
      const movementRange = movement * exploration;
      const size = this.getCanvasSize();
      const padding = AGENT_RADIUS + 2;

      this.state.agents.forEach((agent) => {
        if (agent.matched) {
          return;
        }

        agent.x = this.clamp(agent.x + this.randomFloat(-movementRange, movementRange), padding, size - padding);
        agent.y = this.clamp(agent.y + this.randomFloat(-movementRange, movementRange), padding, size - padding);
      });
    }

    resolveEncounters(currentStep) {
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
            this.matchAgents(agent, candidate, currentStep);
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
      const selectivityLevel = this.selectivitySelect ? this.selectivitySelect.value : "Medium";
      const patienceLevel = this.patienceSelect ? this.patienceSelect.value : "Normal";
      return this.getAcceptanceScoreWithSettings(
        agent,
        candidate,
        preferenceRule,
        selectivityLevel,
        patienceLevel
      );
    }

    matchAgents(agent, candidate, stepNumber) {
      agent.matched = true;
      candidate.matched = true;
      agent.partnerId = candidate.id;
      candidate.partnerId = agent.id;
      agent.matchedAtStep = stepNumber;
      candidate.matchedAtStep = stepNumber;

      this.state.pairs.push({ agent1: agent.id, agent2: candidate.id });
    }

    finishRun() {
      this.state.isRunning = false;
      this.runButton.disabled = false;
        this.lastTopic = null;
        this.lastQuestionType = null;
        this.topicDepth = 0;
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
      this.renderInsightQuestions();
    }

      getScenarioLabel() {
        if (!this.state.lastRun) return "";

        return (
          this.state.lastRun.densityLevel +
          " density, " +
          this.state.lastRun.mobilityLevel +
          " mobility, " +
          this.state.lastRun.preferenceRule.toLowerCase()
        );
      }

      getInsightQuestionSet() {
        if (!this.state.lastRun) {
          return this.defaultInsightQuestions;
        }

        const { metrics, densityLevel, mobilityLevel, preferenceRule } = this.state.lastRun;
        const pairCount = metrics.pairCount;
        const matchingStrength = metrics.matchingStrength.toFixed(2);
        const averageSearchSteps = metrics.averageSearchSteps.toFixed(1);
        const alternatePreference =
          preferenceRule === "Attractiveness-based"
            ? "Similarity-based"
            : "Attractiveness-based";

        if (this.lastTopic === "density") {
          return [
            "Why did " + densityLevel.toLowerCase() + " density lead to " + pairCount + " pairs?",
            "How did " + densityLevel.toLowerCase() + " density relate to avg search time of " + averageSearchSteps + " steps?",
            "What would likely change if density were " + (densityLevel === "Dense" ? "Sparse" : "Dense") + " instead of " + densityLevel + "?",
            "What in this run is the best evidence that density mattered?",
          ];
        }

        if (this.lastTopic === "mobility") {
          return [
            "How does " + mobilityLevel.toLowerCase() + " mobility differ from " + densityLevel.toLowerCase() + " density in this run?",
            "How did " + mobilityLevel.toLowerCase() + " mobility affect avg search time of " + averageSearchSteps + " steps?",
            "What would likely change if mobility were " + (mobilityLevel === "High" ? "Low" : "High") + " instead of " + mobilityLevel + "?",
            "I don't understand.",
          ];
        }

        if (this.lastTopic === "matching") {
          return [
            "What part of this run shows assortative matching at strength " + matchingStrength + "?",
            "Why did this scenario produce " + matchingStrength + " matching strength?",
            "How does " + mobilityLevel.toLowerCase() + " mobility differ from " + densityLevel.toLowerCase() + " density here?",
            "I don't understand.",
          ];
        }

        if (this.lastTopic === "preference") {
          return [
            "How did the " + preferenceRule.toLowerCase() + " rule shape this scenario?",
            "What would likely change under " + alternatePreference + "?",
            "Why did this rule produce matching strength " + matchingStrength + "?",
            "I don't understand.",
          ];
        }

        return [
          "Why did " + densityLevel.toLowerCase() + " density affect pairing in this run?",
          "I don't understand.",
          "How does " + mobilityLevel.toLowerCase() + " mobility vs. " + densityLevel.toLowerCase() + " density differ here?",
          "How did the " + preferenceRule.toLowerCase() + " rule shape the " + pairCount + " pairs we observed?",
          "What result best explains matching strength " + matchingStrength + "?",
        ];
      }

      buildCapabilityMessage() {
        if (!this.state.lastRun) {
          return "This website is built with HTML, CSS, and vanilla JavaScript. The simulation runs fully in the browser on a 2D canvas, with no backend model or API. The chat assistant uses lightweight NLP and conversation-state tracking, not a full LLM, so it is designed to explain this specific simulation: density, mobility, preference rules, selectivity, patience, exploration, matching strength, search time, results, and citations from Smaldino & Schank (2012). Run a scenario, then use the insight questions below or ask about one of those topics.";
        }

        return "This website is built with HTML, CSS, and vanilla JavaScript. The system runs a browser-based agent simulation on a 2D canvas: agents move, encounter nearby neighbors, decide whether to match using the active preference rule, and then the page computes pair count, matching strength, and average search time from that run. This model also includes configurable selectivity, patience relaxation, and exploration bias. The assistant is a lightweight NLP layer on top of those results, so it can explain this simulation and its citations, but it is not a full LLM. For this scenario, use the insight questions below or ask about density, mobility, preference rule, selectivity, patience, exploration, matching strength, search time, or citations.";
      }

      buildOutOfScopeReply() {
        if (!this.state.lastRun) {
          return "I can only help with this simulation right now. Run a scenario, then ask about density, mobility, preference rules, matching, search time, results, or citations.";
        }

        return "I am not sure I understood that. I can help with this run's density, mobility, preference rule, matching strength, search time, results, or citations. Try one of the suggested questions below.";
      }

      buildDensityCausalReply(metrics, density, mobility) {
        return (
          "Mechanism: density changes encounter frequency on the spatial grid. Under " +
          density +
          " density, agents had " +
          (density === "Sparse"
            ? "fewer local encounters"
            : density === "Dense"
            ? "more frequent local encounters"
            : "intermediate encounter rates") +
          ", which shifts how quickly acceptable partners are found. Evidence from this run: " +
          metrics.pairCount +
          " pairs, average search " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps, matching strength " +
          metrics.matchingStrength.toFixed(2) +
          ". Paper alignment: Smaldino & Schank (2012, pp. 17–18) report the same directional effect of density on encounter and pairing dynamics."
        );
      }

      buildDensitySearchReply(metrics, density) {
        return (
          "In this run, average search time is " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps under " +
          density +
          " density. Interpretation: " +
          (density === "Sparse"
            ? "larger spacing lowers encounter probability per step, so unmatched agents require more movement turns before acceptance events occur"
            : density === "Dense"
            ? "higher local contact rates increase encounter probability per step, reducing time-to-match"
            : "intermediate spacing keeps encounter probability and time-to-match in the middle range") +
          ". This is consistent with the model trend in Smaldino & Schank (2012, pp. 17–18)."
        );
      }

      buildDensityCounterfactualReply(metrics, density) {
        return (
          "Counterfactual: if density were " +
          (density === "Dense" ? "Sparse" : "Dense") +
          " instead of " +
          density +
          ", the first-order change would be encounter frequency. " +
          (density === "Sparse"
            ? "Switching to Dense should increase contact opportunities, typically lower average search below " + metrics.averageSearchSteps.toFixed(1) + " steps, and increase pair formation."
            : "Switching to Sparse should reduce contact opportunities, typically raise average search above " + metrics.averageSearchSteps.toFixed(1) + " steps, and reduce pair formation.") +
          " Exact counts are stochastic per run, but the directional prediction follows Smaldino & Schank (2012, pp. 17–18)."
        );
      }

      buildDensityEvidenceReply(metrics, density) {
        return (
          "Best evidence in this graph/run is the joint pattern across metrics: " +
          metrics.pairCount +
          " pairs, average search " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps, and matching strength " +
          metrics.matchingStrength.toFixed(2) +
          ". Under " +
          density +
          " density, this combination indicates the encounter constraint mechanism (pp. 11–13) operating through density-dependent contact rates (pp. 17–18)."
        );
      }

      buildMobilityDensityComparisonReply(metrics, density, mobility) {
        return (
          "Density and mobility are distinct levers in the model. Density sets local encounter opportunity volume; mobility sets spatial exploration speed. In this run, " +
          density.toLowerCase() +
          " density constrained available contacts, while " +
          mobility.toLowerCase() +
          " mobility controlled how quickly agents traversed the space. Observed outcome: " +
          metrics.pairCount +
          " pairs, average search " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps, matching strength " +
          metrics.matchingStrength.toFixed(2) +
          ". This decomposition matches Smaldino & Schank's framework (pp. 11–13, 16–18)."
        );
      }

      isCapabilityQuestion(text) {
        return !!text.match(/\bnlp\b|\bllm\b|language model|what can you do|what can you help|how do you work|what do you understand|what can i ask|help with|scope|capabilit/);
      }

    renderInsightQuestions() {
      if (!this.chatSuggestions) return;

      this.chatSuggestions.innerHTML = "";

      const title = document.createElement("p");
      title.className = "chat-suggestions-title";
        if (!this.state.lastRun) {
          title.textContent = "Run a scenario to unlock suggested insight questions";
        } else if (this.lastTopic) {
          title.textContent = "Suggested follow-ups for " + this.getScenarioLabel();
        } else {
          title.textContent = "Insight questions for " + this.getScenarioLabel();
        }
      this.chatSuggestions.appendChild(title);

      const buttons = document.createElement("div");
      buttons.className = "chat-suggestion-buttons";

        this.getInsightQuestionSet().forEach((question) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-suggestion-chip";
        button.textContent = question;
        button.disabled = !this.state.lastRun;
        button.addEventListener("click", () => this.submitChatQuestion(question));
        buttons.appendChild(button);
      });

      this.chatSuggestions.appendChild(buttons);
    }

    addChatMessage(author, text) {
      if (!this.chatLog) return;
      const p = document.createElement("p");
      p.className = "chat-message";
      p.innerHTML = "<strong>" + author + ":</strong> " + text;
      this.chatLog.appendChild(p);
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    // Enhanced NLP: Detect question intent
    detectIntent(text) {
      const lower = text.toLowerCase().trim();
      if (lower.match(/why|cause|result|effect|explain|happen/)) return "causal";
      if (lower.match(/don't|confused|unclear|simpler|easier|again|still/)) return "clarification";
      if (lower.match(/compare|vs|versus|different|same as|like|similar/)) return "comparative";
      if (lower.match(/can you|could you|how to|tell me|show|give|what is/)) return "explanatory";
      if (lower.match(/how much|how many|what|which|where|when/)) return "factual";
      return "general";
    }

    // Enhanced NLP: Detect what topic they're asking about
    detectTopic(text) {
      const lower = text.toLowerCase();
      if (lower.match(/density|grid|population|sparse|dense|encounter/)) return "density";
      if (lower.match(/mobility|move|movement|search|distance|step/)) return "mobility";
      if (lower.match(/selectivity|picky|choosy|strict|acceptance threshold/)) return "selectivity";
      if (lower.match(/patience|relax|waiting|flexibility over time/)) return "patience";
      if (lower.match(/exploration|explore|local|wide|roam/)) return "exploration";
      if (lower.match(/match|assortative|similar|similarity|preference|pair/)) return "matching";
      if (lower.match(/attract|preference|choice|rule|criterion/)) return "preference";
      return null;
    }

    // Enhanced NLP: Check for clarification signals
    isClarificationRequest(text) {
      return !!text.toLowerCase().match(/don't\s*(understand|get|follow)|confused|unclear|simpler|make it simple|explain again|still\s*(don't|confused)/);
    }

    // Progressive explanation: Get progressively deeper
    getProgressiveExplanation(topic, depth, metrics, density, mobility, preference) {
      if (depth === 1) {
        // First mention: basics
        if (topic === "density") {
          return "Density affects how often agents meet. With " + density + " density, agents are " + 
            (density === "Sparse" ? "spread out—fewer encounters, harder to find partners" : 
             density === "Dense" ? "packed together—frequent encounters, easy pairing" : 
             "moderately spaced—steady encounter rate") + ".";
        }
        if (topic === "mobility") {
          return "Mobility is how far each agent can move per turn. With " + mobility + " mobility, agents can " +
            (mobility === "Low" ? "barely move—stay local, meet same neighbors" :
             mobility === "High" ? "move far—explore more, meet diverse partners" :
             "move moderately—balance local and exploration") + ".";
        }
      }
      if (depth === 2) {
        // Second mention: connect to results
        if (topic === "density") {
          return "Your run shows this: " + density + " density → " + metrics.pairCount + " pairs, strength " + 
            metrics.matchingStrength.toFixed(2) + ". Smaldino & Schank (2012, pp. 17–18) found that " +
            (density === "Sparse" ? "sparse grids drastically reduce pairing" :
             density === "Dense" ? "dense grids accelerate pairing" :
             "intermediate density produces steady pairing") + ". Your results match exactly.";
        }
        if (topic === "mobility") {
          return "Your run took avg " + metrics.averageSearchSteps.toFixed(1) + " steps to pair up. " +
            (mobility === "Low" ? "Low mobility forces agents to search harder." :
             mobility === "High" ? "High mobility lets agents find partners faster." :
             "Medium mobility balances exploration and efficiency.") +
            " Smaldino & Schank (2012, p. 16) show this effect—your data confirms it.";
        }
      }
      if (depth >= 3) {
        // Third+ mention: deep mechanistic understanding
        if (topic === "density") {
          return "Deep dive on density: With " + density + " density and " + mobility + " mobility, " +
            "agents operate in local neighborhoods (pp. 11–13). The grid spacing directly limits who can meet. " +
            "Your matching strength " + metrics.matchingStrength.toFixed(2) + " emerges from this constraint—it's not " +
            "free choice but forced assortment by proximity. That's the core insight of Smaldino & Schank (2012).";
        }
        if (topic === "mobility") {
          return "Deep dive on mobility: Each step, agents move a certain distance. " + 
            (mobility === "Low" ? "Low mobility (movement ~6px) keeps agents in tight regions." :
             mobility === "High" ? "High mobility (movement ~24px) lets agents traverse the whole grid." :
             "Medium mobility (movement ~14px) provides balance.") +
            " Your avg search " + metrics.averageSearchSteps.toFixed(1) + " reflects this—it's tied directly " +
            "to how far agents can explore before encountering someone acceptable.";
        }
      }
      return null;
    }

    buildChatReply(text) {
      const lower = text.toLowerCase().trim();

      if (this.isCapabilityQuestion(lower)) {
        return this.buildCapabilityMessage();
      }
      
      // If no run yet, prompt to run
      if (!this.state.lastRun) {
        return "No simulation run yet. Hit Run Simulation or change a control to auto-run, then ask about the results. Once a run exists, I can explain density, mobility, preference rules, assortative matching, search time, and citation-based takeaways.";
      }

      const { metrics, mobilityLevel: mobility, densityLevel: density, preferenceRule: preference } = this.state.lastRun;
      
      // NLP: Detect intent and topic
      const intent = this.detectIntent(text);
      const detectedTopic = this.detectTopic(text);
      const isClarifying = this.isClarificationRequest(text);
      this.lastQuestionType = intent;
      
      // Update conversation tracking
      if (detectedTopic) {
        if (this.lastTopic === detectedTopic) {
          this.topicDepth += 1; // Same topic asked again—go deeper
        } else {
          this.lastTopic = detectedTopic;
          this.topicDepth = 1; // New topic—reset depth
        }
      }
      
      // Store conversation turn
      this.conversationHistory.push({
        userInput: text,
        intent: intent,
        topic: detectedTopic || this.lastTopic,
        timestamp: Date.now()
      });

      // Handle clarification with progressive depth
      if (isClarifying) {
        // If they just asked about something specific, go deeper on that topic
        if (this.lastTopic === "density") {
          return (
            "Density affects how often agents meet. With " +
            density +
            " density: " +
            (density === "Sparse" ? "agents are spread out, so they rarely encounter each other. This means fewer pairs form and search takes longer." : density === "Dense" ? "agents are packed together, so they meet very frequently. This means pairs form faster and more easily." : "agents are at a balanced spacing, so they meet regularly but not overwhelmingly.") +
            " Your run shows " +
            metrics.pairCount +
            " pairs formed. In Smaldino & Schank (2012, pp. 17–18), they found this exact pattern: higher density = more encounters = faster, stronger pairing."
          );
        }
        if (this.lastTopic === "mobility") {
          return (
            "Mobility is how far agents can move each turn. With " +
            mobility +
            " mobility: " +
            (mobility === "Low" ? "agents can only move a little, so they stay in one area and meet the same neighbors repeatedly. This limits their choices." : mobility === "High" ? "agents can move far, so they explore more of the grid and meet many different potential partners." : "agents have moderate movement, staying somewhat local but exploring more than low mobility.") +
            " Your run took avg " +
            metrics.averageSearchSteps.toFixed(1) +
            " steps to find partners. Smaldino & Schank (2012, p. 16) show that limited movement really does slow down the search, which is what we see here."
          );
        }
        if (this.lastTopic === "matching") {
          return (
            "Assortative matching means: do partners end up similar to each other? Your strength = " +
            metrics.matchingStrength.toFixed(2) +
            ". In your run with " +
            density +
            " density and " +
            mobility +
            " mobility, agents could only meet nearby neighbors (not pick globally). So they paired based on who was actually available locally, not on perfect preference. That's why space matters so much—it forces assortment (Smaldino & Schank 2012, pp. 11–13)."
          );
        }
        // Generic clarification
        return (
          "Let me break it down: Your run formed " +
          metrics.pairCount +
          " pairs. Matching strength " +
          metrics.matchingStrength.toFixed(2) +
          " means partners are " +
          (metrics.matchingStrength < 0.15 ? "very different" : metrics.matchingStrength > 0.3 ? "quite similar" : "somewhat similar") +
          ". With " +
          density +
          " density and " +
          mobility +
          " mobility, agents mostly encountered neighbors, which shaped who paired with whom. Ask me about a specific aspect: density, mobility, or matching?"
        );
      }

      if (lower.includes("mobility") && lower.includes("density")) {
        this.lastTopic = "mobility";
        return this.buildMobilityDensityComparisonReply(metrics, density, mobility);
      }

      if (lower.includes("density") && (lower.includes("search time") || lower.includes("avg search"))) {
        this.lastTopic = "density";
        return this.buildDensitySearchReply(metrics, density);
      }

      if (lower.includes("density") && (lower.includes("instead of") || lower.includes("would likely change"))) {
        this.lastTopic = "density";
        return this.buildDensityCounterfactualReply(metrics, density);
      }

      if (lower.includes("density") && lower.includes("evidence")) {
        this.lastTopic = "density";
        return this.buildDensityEvidenceReply(metrics, density);
      }

      if (lower.includes("density") && (lower.includes("lead to") || lower.includes("affect pairing"))) {
        this.lastTopic = "density";
        return this.buildDensityCausalReply(metrics, density, mobility);
      }

      // Detect topic from user input and track it
      if (lower.includes("density")) {
        this.lastTopic = "density";
        return (
          "Density note: Your run had " +
          density +
          " density, yielding " +
          metrics.pairCount +
          " pairs and matching strength " +
          metrics.matchingStrength.toFixed(2) +
          ". " +
          (density === "Sparse" ? "Sparse grids dramatically reduce encounters and extend search time, which weakens how well-matched pairs are (Smaldino & Schank 2012, pp. 17–18)." : density === "Dense" ? "Dense grids accelerate encounters and boost matching strength because agents meet more alternatives and sort better (Smaldino & Schank 2012, pp. 17–18)." : "Normal density provides steady encounters, producing stable intermediate matching (Smaldino & Schank 2012, pp. 17–18).")
        );
      }

      if (lower.includes("mobility")) {
        this.lastTopic = "mobility";
        return (
          "Mobility note: With " +
          mobility +
          " mobility, avg search was " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps. " +
          (mobility === "Low" ? "Low mobility severely constrains search—agents stay local and meet few potential partners, so matching weakens (Smaldino & Schank 2012, p. 16)." : mobility === "High" ? "High mobility improves search dramatically—agents explore more and find better-matched partners (Smaldino & Schank 2012, p. 16)." : "Medium mobility balances local interaction with broader search (Smaldino & Schank 2012, p. 16).") +
          " This matches the paper's findings exactly."
        );
      }

      if (lower.includes("selectivity") || lower.includes("picky") || lower.includes("choosy")) {
        this.lastTopic = "selectivity";
        const setting = this.state.lastRun.selectivityLevel || "Medium";
        return (
          "Selectivity note: This run used " +
          setting +
          " selectivity. " +
          (setting === "High"
            ? "High selectivity lowers acceptance probability, usually increasing search time and reducing pair formation."
            : setting === "Low"
            ? "Low selectivity raises acceptance probability, usually reducing search time and increasing pair formation."
            : "Medium selectivity keeps acceptance near baseline behavior.") +
          " In this run, we observed " +
          metrics.pairCount +
          " pairs with average search " +
          metrics.averageSearchSteps.toFixed(1) +
          "."
        );
      }

      if (lower.includes("patience") || lower.includes("relax") || lower.includes("waiting")) {
        this.lastTopic = "patience";
        const setting = this.state.lastRun.patienceLevel || "Normal";
        return (
          "Patience note: This run used " +
          setting +
          " patience relaxation. " +
          (setting === "Fast"
            ? "Fast relaxation increases acceptance quickly as unsuccessful search steps accumulate."
            : setting === "Slow"
            ? "Slow relaxation keeps standards tight for longer, delaying acceptance."
            : "Normal relaxation gradually widens acceptance over search time.") +
          " This setting influences how quickly unmatched agents become willing to accept available partners."
        );
      }

      if (lower.includes("exploration") || lower.includes("explore") || lower.includes("roam")) {
        this.lastTopic = "exploration";
        const setting = this.state.lastRun.explorationLevel || "Balanced";
        return (
          "Exploration note: This run used " +
          setting +
          " exploration. " +
          (setting === "Wide"
            ? "Wide exploration increases movement range per step, producing broader contact opportunities."
            : setting === "Local"
            ? "Local exploration reduces movement range per step, concentrating encounters in nearby neighborhoods."
            : "Balanced exploration keeps movement near baseline.") +
          " Through encounter rates, this affects search time and eventual pair formation."
        );
      }

      if (lower.includes("matching") || lower.includes("similar") || lower.includes("assort")) {
        this.lastTopic = "matching";
        return (
          "Assortative matching (how similar partners are): Your strength = " +
          metrics.matchingStrength.toFixed(2) +
          ". " +
          (metrics.matchingStrength < 0.15 ? "Very weak—partners are quite different." : metrics.matchingStrength > 0.3 ? "Strong—partners are quite similar." : "Moderate—partners are somewhat similar.") +
          " Smaldino & Schank (2012, pp. 11–18) show that spatial constraints force assortment: agents can't choose globally, so they pair based on local availability. Your " +
          density +
          " density and " +
          mobility +
          " mobility produced exactly this effect."
        );
      }

      if (lower.includes("attractiveness") || lower.includes("preference")) {
        this.lastTopic = "preference";
        return (
          "Preference rule: " +
          (preference === "Attractiveness-based" ? "Under attractiveness-based choice, highly attractive agents can afford to wait. Your avg search " + metrics.averageSearchSteps.toFixed(1) + " reflects this—waiting slows the overall search. Smaldino & Schank (2012, p. 16) note that spatial constraints make this pattern especially pronounced." : "Under similarity-based choice, agents accept partners who are locally similar, so pairing happens faster. Your avg search " + metrics.averageSearchSteps.toFixed(1) + " and matching strength " + metrics.matchingStrength.toFixed(2) + " show local similarity effects (Smaldino & Schank 2012, pp. 11–13).")
        );
      }

      if (lower.includes("explain") || lower.includes("result") || lower.includes("summary")) {
        this.lastTopic = "overall";
        return this.buildExplainMessage(metrics, mobility, density, preference);
      }

      if (lower.includes("citation")) {
        this.lastTopic = "citation";
        return this.buildRunCitationMessage(
          metrics,
          mobility,
          density,
          preference,
          this.state.lastRun.selectivityLevel,
          this.state.lastRun.patienceLevel,
          this.state.lastRun.explorationLevel
        );
      }

      if (lower.includes("detail") || lower.includes("quote") || lower.includes("map")) {
        this.lastTopic = "details";
        return (
          "The spatial locality constraint (pp. 11–13) shows that agents only meet neighbors. " +
          (mobility === "Low" ? "With low mobility (p. 16), agents cover little space and experience fewer encounters." : mobility === "High" ? "Higher mobility (p. 16) improves search by letting agents sweep through more of the grid." : "Medium mobility (p. 16) balances encounter breadth with realistic movement constraints.") + " " +
          (density === "Sparse" ? "Sparse density (pp. 17–18) further limits encounters and extends search time." : density === "Dense" ? "Dense conditions (pp. 17–18) accelerate encounters and reduce search duration." : "Normal density (pp. 17–18) produces steady encounter rates.") + " These patterns align with Smaldino & Schank's (2012) findings on how space constrains matching."
        );
      }

      if (lower.trim() === "yes" || lower.trim() === "ok" || lower.trim() === "sure") {
        return (
          "Tell me what to dig into: density effects, mobility effects, preference rules, or assortative matching? Quick recap: " +
          metrics.pairCount +
          " pairs, strength " +
          metrics.matchingStrength.toFixed(2) +
          ", avg search " +
          metrics.averageSearchSteps.toFixed(1) +
          "."
        );
      }

      // Default fallback
      return this.buildOutOfScopeReply();
    }

    resetTeachingExplanation() {
      this.teachingExplanation.textContent =
        "Run the simulation to generate a teaching explanation about how mobility, density, and preference rules shape assortative matching in this model.";
      this.addChatMessage(
        "Assistant",
        "Ready to discuss results. Run the simulation or ask how mobility, density, and preference rules connect to Smaldino & Schank (2012)."
      );
      this.setExportEnabled(false);
      this.renderInsightQuestions();
    }

    updateTeachingExplanation() {
      const metrics = this.getSimulationMetrics();
      const preferenceRule = this.preferenceSelect.value;
      const mobilityLevel = this.mobilitySelect.value;
      const densityLevel = this.densitySelect.value;
      const selectivityLevel = this.selectivitySelect ? this.selectivitySelect.value : "Medium";
      const patienceLevel = this.patienceSelect ? this.patienceSelect.value : "Normal";
      const explorationLevel = this.explorationSelect ? this.explorationSelect.value : "Balanced";

      const sentences = [
        "This run used " +
          mobilityLevel.toLowerCase() +
          " mobility, " +
          densityLevel.toLowerCase() +
          " density, " +
          selectivityLevel.toLowerCase() +
          " selectivity, " +
          patienceLevel.toLowerCase() +
          " patience, " +
          explorationLevel.toLowerCase() +
          " exploration, and a " +
          preferenceRule.toLowerCase() +
          " rule, producing " +
          metrics.pairCount +
          " pairs with a matching strength of " +
          metrics.matchingStrength.toFixed(2) +
          ".",
        this.getMobilityCommentary(mobilityLevel),
        this.getDensityCommentary(densityLevel),
        this.getPreferenceCommentary(preferenceRule),
        this.getBehaviorCommentary(selectivityLevel, patienceLevel, explorationLevel),
        this.getStrengthCommentary(metrics.matchingStrength),
        this.getSearchCommentary(metrics.averageSearchSteps),
      ];

      this.teachingExplanation.textContent = sentences.join(" ");
      this.appendRunSummary(metrics, mobilityLevel, densityLevel, preferenceRule);
      
      // Use simple mode or technical citation based on user preference
      const chatMessage = this.simpleMode
        ? this.buildExplainMessage(metrics, mobilityLevel, densityLevel, preferenceRule)
        : this.buildRunCitationMessage(
            metrics,
            mobilityLevel,
            densityLevel,
            preferenceRule,
            selectivityLevel,
            patienceLevel,
            explorationLevel
          );
      
      this.addChatMessage("Assistant", chatMessage);
      this.state.lastRun = {
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        explorationLevel,
      };
      this.lastCitation = this.buildRunCitationMessage(
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        explorationLevel
      );
      this.renderInsightQuestions();
      this.addChatMessage(
        "Assistant",
        "Try one of the insight questions below for this scenario."
      );
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

    buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule, selectivityLevel, patienceLevel, explorationLevel) {
      const assort =
        metrics.matchingStrength < 0.15
          ? "weak assortative pattern"
          : metrics.matchingStrength > 0.30
          ? "strong assortative pattern"
          : "moderate assortative pattern";

      const mobilityDesc =
        mobilityLevel === "Low"
          ? "lower mobility slows partner search and weakens assortment (p. 16)"
          : mobilityLevel === "High"
          ? "higher mobility improves partner search (p. 16)"
          : "medium mobility yields intermediate search efficiency (p. 16)";

      const densityDesc =
        densityLevel === "Sparse"
          ? "lower density reduces matching opportunities while increasing search duration (pp. 17–18)"
          : densityLevel === "Dense"
          ? "higher density increases encounter rates and accelerates matching (pp. 17–18)"
          : "normal density produces steady encounter rates (pp. 17–18)";

      const prefDesc =
        preferenceRule === "Attractiveness-based"
          ? "The observed longer wait times for high-attractiveness agents are consistent with the paper's discussion of attractiveness-prioritized matching (p. 16)."
          : "The results reflect similarity-based matching, which depends more on local availability than global sorting (pp. 11–13).";

      const behaviorDesc =
        "Behavior settings were selectivity=" +
        (selectivityLevel || "Medium") +
        ", patience=" +
        (patienceLevel || "Normal") +
        ", exploration=" +
        (explorationLevel || "Balanced") +
        ", which modulate acceptance strictness, relaxation over search time, and movement range.";

      return (
        "Run result: " +
        metrics.pairCount +
        " pairs, matching strength = " +
        metrics.matchingStrength.toFixed(2) +
        ", suggesting a " +
        assort +
        " (avg search " +
        metrics.averageSearchSteps.toFixed(1) +
        " steps). This result is consistent with Smaldino & Schank (2012): spatial locality constrains encounters (pp. 11–13), " +
        mobilityDesc.toLowerCase() +
        ", and " +
        densityDesc.toLowerCase() +
        ". " +
        prefDesc +
        " " +
        behaviorDesc
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

      return (
        "Result recap: " +
        metrics.pairCount +
        " pairs; matching strength " +
        metrics.matchingStrength.toFixed(2) +
        " (" +
        strengthLabel +
        "); avg search " +
        metrics.averageSearchSteps.toFixed(1) +
        ". According to Smaldino & Schank (2012), spatial locality (pp. 11–13) constrains encounters such that assortment reflects nearby availability more than global choice. With " +
        density.toLowerCase() +
        " density (pp. 17–18) and " +
        mobility.toLowerCase() +
        " mobility (p. 16), agents mostly meet nearby others, producing patterns consistent with the paper's spatial and movement effects on partner selection."
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

    getBehaviorCommentary(selectivityLevel, patienceLevel, explorationLevel) {
      const selectivityText =
        selectivityLevel === "High"
          ? "High selectivity lowers acceptance probability and usually raises search difficulty."
          : selectivityLevel === "Low"
          ? "Low selectivity raises acceptance probability and usually speeds up matching."
          : "Medium selectivity keeps acceptance criteria near baseline.";

      const patienceText =
        patienceLevel === "Fast"
          ? "Fast patience relaxation increases acceptance quickly as search continues."
          : patienceLevel === "Slow"
          ? "Slow patience relaxation keeps standards tighter for longer."
          : "Normal patience relaxation gradually broadens acceptance over search time.";

      const explorationText =
        explorationLevel === "Wide"
          ? "Wide exploration expands per-step movement, increasing contact opportunities."
          : explorationLevel === "Local"
          ? "Local exploration limits per-step movement and concentrates encounters nearby."
          : "Balanced exploration keeps movement near the default range.";

      return selectivityText + " " + patienceText + " " + explorationText;
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

    setExportEnabled(isEnabled) {
      if (this.previewCsvButton) this.previewCsvButton.disabled = !isEnabled;
      if (this.downloadCsvButton) this.downloadCsvButton.disabled = !isEnabled;
      if (this.downloadPngButton) this.downloadPngButton.disabled = !isEnabled;
      if (this.copyCitationButton) this.copyCitationButton.disabled = !isEnabled;
      
      if (isEnabled && this.state.lastRun) {
        this.lastCitation = this.buildRunCitationMessage(
          this.state.lastRun.metrics,
          this.state.lastRun.mobilityLevel,
          this.state.lastRun.densityLevel,
          this.state.lastRun.preferenceRule,
          this.state.lastRun.selectivityLevel,
          this.state.lastRun.patienceLevel,
          this.state.lastRun.explorationLevel
        );
      } else if (!isEnabled) {
        this.lastCitation = null;
      }
    }

    buildRunCsvText() {
      if (!this.state.lastRun) {
        return null;
      }

      const { metrics, mobilityLevel, densityLevel, preferenceRule } = this.state.lastRun;
      const rows = [
        ["date", new Date().toISOString()],
        ["mobility", mobilityLevel],
        ["density", densityLevel],
        ["preferenceRule", preferenceRule],
        ["selectivity", this.state.lastRun.selectivityLevel || "Medium"],
        ["patience", this.state.lastRun.patienceLevel || "Normal"],
        ["exploration", this.state.lastRun.explorationLevel || "Balanced"],
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

      return rows.map((r) => r.join(",")).join("\n");
    }

    previewCsv() {
      const csv = this.buildRunCsvText();
      if (!csv) {
        this.addChatMessage("Assistant", "Run first, then preview the summary.");
        return;
      }
      this.showCsvPreview(csv);
    }

    downloadCsv() {
      const csv = this.buildRunCsvText();
      if (!csv) {
        this.addChatMessage("Assistant", "Run first, then download the summary.");
        return;
      }
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, "simulation-summary.csv");
    }

    showCsvPreview(csvText) {
      if (!this.csvPreview || !this.csvPreviewContent) return;
      const reportData = this.buildPreviewReportData();
      if (!reportData) {
        this.addChatMessage("Assistant", "Run first, then preview the summary.");
        return;
      }

      this.csvPreviewContent.textContent = csvText;
      this.csvPreview.classList.add("is-visible");
      this.populatePreviewNarrative(reportData);
      this.drawMetricsChart(reportData);
      this.drawDifferenceChart(reportData);
      this.populateChartInsights(reportData);
      this.populateRuleAnalytics(reportData);
    }

    buildPreviewReportData() {
      if (!this.state.lastRun) return null;

      const { metrics, mobilityLevel, densityLevel, preferenceRule, selectivityLevel, patienceLevel, explorationLevel } = this.state.lastRun;
      const totalAgents = this.state.agents.length || 0;
      const maxPairs = Math.max(1, Math.floor(totalAgents / 2));

      const pairDifferenceBins = new Array(10).fill(0);
      this.state.pairs.forEach((pair) => {
        const first = this.state.agents[pair.agent1];
        const second = this.state.agents[pair.agent2];
        if (!first || !second) return;
        const diff = Math.abs(first.attractiveness - second.attractiveness);
        pairDifferenceBins[diff] += 1;
      });

      const structureLabel =
        metrics.matchingStrength >= 0.35
          ? "highly sorted"
          : metrics.matchingStrength >= 0.2
          ? "moderately sorted"
          : "weakly sorted";

      return {
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
        selectivityLevel: selectivityLevel || "Medium",
        patienceLevel: patienceLevel || "Normal",
        explorationLevel: explorationLevel || "Balanced",
        totalAgents,
        maxPairs,
        pairDifferenceBins,
        structureLabel,
      };
    }

    populatePreviewNarrative(reportData) {
      const {
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        explorationLevel,
        structureLabel,
      } = reportData;

      if (this.previewKpiPairs) {
        this.previewKpiPairs.textContent = String(metrics.pairCount);
      }
      if (this.previewKpiStrength) {
        this.previewKpiStrength.textContent = metrics.matchingStrength.toFixed(2);
      }
      if (this.previewKpiSearch) {
        this.previewKpiSearch.textContent = metrics.averageSearchSteps.toFixed(1);
      }

      if (this.previewIntroText) {
        this.previewIntroText.textContent =
          "This run evaluated " +
          preferenceRule.toLowerCase() +
          " matching under " +
          densityLevel.toLowerCase() +
          " density and " +
          mobilityLevel.toLowerCase() +
          " mobility, with selectivity " +
          selectivityLevel.toLowerCase() +
          ", patience " +
          patienceLevel.toLowerCase() +
          ", and exploration " +
          explorationLevel.toLowerCase() +
          ".";
      }

      if (this.previewBodyText) {
        this.previewBodyText.textContent =
          "The simulation produced " +
          metrics.pairCount +
          " pairs and a matching strength of " +
          metrics.matchingStrength.toFixed(2) +
          ", indicating a " +
          structureLabel +
          " pairing pattern. Average search steps reached " +
          metrics.averageSearchSteps.toFixed(1) +
          ", which reflects how quickly agents found acceptable partners under these constraints.";
      }

      if (this.previewConclusionText) {
        const takeaway =
          metrics.averageSearchSteps > 20
            ? "Search was costly, so encounter constraints likely limited efficient matching."
            : "Search was relatively efficient, suggesting encounters were available enough for timely pairing.";

        this.previewConclusionText.textContent =
          "Conclusion: In this parameter setting, outcomes were " +
          structureLabel +
          " and " +
          takeaway +
          " Use the two charts above to compare overall outcome levels and the distribution of pair differences.";
      }
    }

    drawMetricsChart(reportData) {
      if (!this.previewMetricsChart) return;

      const canvas = this.previewMetricsChart;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const chartSize = this.prepareHiDPICanvas(canvas, 190);

      const values = [
        reportData.metrics.pairCount / reportData.maxPairs,
        reportData.metrics.matchingStrength,
        Math.min(1, reportData.metrics.averageSearchSteps / STEP_COUNT),
      ];
      const labels = ["Pairs", "Strength", "Search"];
      const colors = ["#0f766e", "#b98236", "#3b6ea8"];

      this.drawBarChart(ctx, chartSize.width, chartSize.height, values, labels, colors);
    }

    drawDifferenceChart(reportData) {
      if (!this.previewDifferenceChart) return;

      const canvas = this.previewDifferenceChart;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const chartSize = this.prepareHiDPICanvas(canvas, 190);

      const maxCount = Math.max(1, ...reportData.pairDifferenceBins);
      const values = reportData.pairDifferenceBins.map((count) => count / maxCount);
      const labels = reportData.pairDifferenceBins.map((_, index) => String(index));
      const colors = labels.map((_, index) => (index <= 2 ? "#0f766e" : "#6c7a89"));

      this.drawBarChart(ctx, chartSize.width, chartSize.height, values, labels, colors);
    }

    populateChartInsights(reportData) {
      const { metrics, maxPairs, pairDifferenceBins, structureLabel } = reportData;
      const pairRate = maxPairs > 0 ? (metrics.pairCount / maxPairs) * 100 : 0;
      const searchPercent = (Math.min(STEP_COUNT, metrics.averageSearchSteps) / STEP_COUNT) * 100;

      if (this.previewMetricsInsight) {
        this.previewMetricsInsight.textContent =
          "Insight: Pairs reached " +
          pairRate.toFixed(0) +
          "% of the maximum possible count, matching strength is " +
          metrics.matchingStrength.toFixed(2) +
          " (" +
          structureLabel +
          "), and average search used " +
          searchPercent.toFixed(0) +
          "% of the run horizon. Higher search with lower pair/strength bars usually indicates tighter encounter constraints.";
      }

      if (this.previewDifferenceInsight) {
        if (metrics.pairCount === 0) {
          this.previewDifferenceInsight.textContent =
            "Insight: No pairs formed in this run, so the distribution has no partner-difference data yet.";
          return;
        }

        const lowDifferenceCount = pairDifferenceBins[0] + pairDifferenceBins[1] + pairDifferenceBins[2];
        const lowDifferenceShare = (lowDifferenceCount / metrics.pairCount) * 100;
        let peakBin = 0;
        for (let i = 1; i < pairDifferenceBins.length; i += 1) {
          if (pairDifferenceBins[i] > pairDifferenceBins[peakBin]) {
            peakBin = i;
          }
        }

        this.previewDifferenceInsight.textContent =
          "Insight: " +
          lowDifferenceShare.toFixed(0) +
          "% of pairs are in low-difference bins (0-2), and the peak bin is difference " +
          peakBin +
          ". More mass in lower bins means partners were more similar; heavier right-side bins indicate weaker assortment.";
      }
    }

    populateRuleAnalytics(reportData) {
      if (!this.ruleAnalyticsBody || !this.ruleHazardChart || !this.ruleHazardInsight) return;

      const settings = {
        densityLevel: reportData.densityLevel,
        mobilityLevel: reportData.mobilityLevel,
        selectivityLevel: reportData.selectivityLevel,
        patienceLevel: reportData.patienceLevel,
      };

      const analyticsRows = this.computeRuleAnalyticsRows(settings, RULE_ANALYTICS_RUNS);
      this.lastRuleAnalyticsRows = analyticsRows;
      this.renderHazardSeriesToggles(analyticsRows);
      this.updateRuleCodeExplainer(analyticsRows);

      this.renderRuleAnalyticsTable(analyticsRows);
      this.drawRuleHazardChart(analyticsRows);
      this.drawRuleHazardZoomChart(analyticsRows, 15);
      this.drawRecreatedFigure5(analyticsRows);
      this.drawRecreatedFigure6(analyticsRows);
      this.drawRecreatedFigure7(analyticsRows);
    }

    computeRuleAnalyticsRows(settings, runCount) {
      const combinations = [
        { ruleLabel: "Rule 1", ruleShort: "R1", preferenceRule: "Attractiveness-based", movement: "NS", explorationLevel: "Local" },
        { ruleLabel: "Rule 1", ruleShort: "R1", preferenceRule: "Attractiveness-based", movement: "ZZ", explorationLevel: "Balanced" },
        { ruleLabel: "Rule 1", ruleShort: "R1", preferenceRule: "Attractiveness-based", movement: "BR", explorationLevel: "Wide" },
        { ruleLabel: "Rule 2", ruleShort: "R2", preferenceRule: "Similarity-based", movement: "NS", explorationLevel: "Local" },
        { ruleLabel: "Rule 2", ruleShort: "R2", preferenceRule: "Similarity-based", movement: "ZZ", explorationLevel: "Balanced" },
        { ruleLabel: "Rule 2", ruleShort: "R2", preferenceRule: "Similarity-based", movement: "BR", explorationLevel: "Wide" },
      ];

      return combinations.map((combo) => {
        const pairCorrValues = [];
        const meanDateValues = [];
        const meanHazardValues = [];
        const pairCorrReplacementValues = [];
        const meanDateReplacementValues = [];
        const hazardSum = new Array(STEP_COUNT).fill(0);

        for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
          const result = this.runSyntheticSimulation({
            preferenceRule: combo.preferenceRule,
            movementLevel: combo.explorationLevel,
            densityLevel: settings.densityLevel,
            mobilityLevel: settings.mobilityLevel,
            selectivityLevel: settings.selectivityLevel,
            patienceLevel: settings.patienceLevel,
          });
          const replacementResult = this.runSyntheticSimulation({
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

    runSyntheticSimulation(settings) {
      const size = this.getCanvasSize();
      const padding = AGENT_RADIUS + 2;
      const densityMultiplier = densityMultipliers[settings.densityLevel] || 1;
      const agentCount = Math.max(10, Math.round(size * size * baseDensityFactor * densityMultiplier));

      const agents = [];
      const pairs = [];
      const matchedEventSteps = [];
      const matchedPairValues = [];
      for (let i = 0; i < agentCount; i += 1) {
        agents.push(this.createSyntheticAgent(i, size, padding));
      }

      const movement = (mobilitySizes[settings.mobilityLevel] || mobilitySizes.Medium) *
        (explorationMultipliers[settings.movementLevel] || explorationMultipliers.Balanced);

      for (let step = 1; step <= STEP_COUNT; step += 1) {
        agents.forEach((agent) => {
          if (agent.matched) return;
          agent.x = this.clamp(agent.x + this.randomFloat(-movement, movement), padding, size - padding);
          agent.y = this.clamp(agent.y + this.randomFloat(-movement, movement), padding, size - padding);
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
                agents[first.id] = this.createSyntheticAgent(first.id, size, padding);
                agents[second.id] = this.createSyntheticAgent(second.id, size, padding);
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
      const meanDateToMate = matchedEventSteps.length
        ? matchedEventSteps.reduce((sum, value) => sum + value, 0) / matchedEventSteps.length
        : STEP_COUNT;
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
      const denomX = n * sumXX - sumX * sumX;
      const denomY = n * sumYY - sumY * sumY;
      const denominator = Math.sqrt(Math.max(denomX, 0) * Math.max(denomY, 0));

      if (!denominator) return 0;
      return this.clamp(numerator / denominator, -1, 1);
    }

    computeInterPairCorrelationFromPairs(pairValues) {
      if (!pairValues.length) return 0;
      const xs = pairValues.map((pair) => pair[0]);
      const ys = pairValues.map((pair) => pair[1]);
      if (xs.length < 2) return 0;

      const n = xs.length;
      const sumX = xs.reduce((sum, value) => sum + value, 0);
      const sumY = ys.reduce((sum, value) => sum + value, 0);
      const sumXX = xs.reduce((sum, value) => sum + value * value, 0);
      const sumYY = ys.reduce((sum, value) => sum + value * value, 0);
      const sumXY = xs.reduce((sum, value, index) => sum + value * ys[index], 0);

      const numerator = n * sumXY - sumX * sumY;
      const denomX = n * sumXX - sumX * sumX;
      const denomY = n * sumYY - sumY * sumY;
      const denominator = Math.sqrt(Math.max(denomX, 0) * Math.max(denomY, 0));
      if (!denominator) return 0;
      return this.clamp(numerator / denominator, -1, 1);
    }

    computeHazardSeries(agents) {
      const series = [];
      let atRisk = agents.length;

      for (let step = 1; step <= STEP_COUNT; step += 1) {
        if (atRisk <= 0) {
          series.push(0);
          continue;
        }

        const events = agents.filter((agent) => agent.matchedAtStep === step).length;
        const hazard = events / atRisk;
        series.push(hazard);
        atRisk -= events;
      }

      return series;
    }

    computeHazardSeriesFromEvents(matchedEventSteps, atRiskCount) {
      const series = [];
      for (let step = 1; step <= STEP_COUNT; step += 1) {
        const events = matchedEventSteps.filter((value) => value === step).length;
        series.push(atRiskCount > 0 ? events / atRiskCount : 0);
      }
      return series;
    }

    renderRuleAnalyticsTable(rows) {
      if (!this.ruleAnalyticsBody) return;
      this.ruleAnalyticsBody.innerHTML = rows
        .map((row) => {
          const corrCiClass = this.getCiClass("correlation", row.interPairCorrelationCiLow, row.interPairCorrelationCiHigh);
          const dateCiClass = this.getCiClass("date", row.meanDateToMateCiLow, row.meanDateToMateCiHigh);
          const hazardCiClass = this.getCiClass("hazard", row.meanHazardCiLow, row.meanHazardCiHigh);

          return (
            "<tr><td>" +
            row.ruleLabel +
            "</td><td>" +
            row.movement +
            "</td><td class=\"" +
            corrCiClass +
            "\">" +
            row.interPairCorrelation.toFixed(3) +
            " [" +
            row.interPairCorrelationCiLow.toFixed(3) +
            ", " +
            row.interPairCorrelationCiHigh.toFixed(3) +
            "]" +
            "</td><td class=\"" +
            dateCiClass +
            "\">" +
            row.meanDateToMate.toFixed(2) +
            " [" +
            row.meanDateToMateCiLow.toFixed(2) +
            ", " +
            row.meanDateToMateCiHigh.toFixed(2) +
            "]" +
            "</td><td class=\"" +
            hazardCiClass +
            "\">" +
            row.meanHazard.toFixed(3) +
            " [" +
            row.meanHazardCiLow.toFixed(3) +
            ", " +
            row.meanHazardCiHigh.toFixed(3) +
            "]" +
            "</td></tr>"
          );
        })
        .join("");

      if (this.ruleAnalyticsDefinitions) {
        this.ruleAnalyticsDefinitions.textContent =
          "Definitions: inter-pair correlation r is Pearson correlation between attractiveness values of matched partners; mean date to mate is the average step where a matched agent formed a pair; mating hazard at step t is h(t)=matches(t)/atRisk(t). Rule 1 uses Attractiveness-based choice, Rule 2 uses Similarity-based choice. Movement labels: NS=local neighborhood search, ZZ=balanced zig-zag search, BR=broad random search. Each row reports mean with 95% CI from n=" +
          RULE_ANALYTICS_RUNS +
          " synthetic runs. CI colors: green=tight uncertainty, amber=medium, rose=wide.";
      }
    }

    getCiClass(metricType, ciLow, ciHigh) {
      const width = Math.max(0, ciHigh - ciLow);

      if (metricType === "correlation") {
        if (width <= 0.10) return "ci-tight";
        if (width <= 0.20) return "ci-medium";
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

    drawRuleHazardChart(rows) {
      if (!this.ruleHazardChart) return;
      const ctx = this.ruleHazardChart.getContext("2d");
      if (!ctx) return;

      const visibleRows = this.getVisibleHazardRows(rows);
      if (!visibleRows.length) {
        this.drawNoHazardSeriesMessage(this.ruleHazardChart, "No series selected. Use toggles to add rules.");
        this.ruleHazardHoverData = null;
        this.updateHazardDynamicExplainer([], this.getHazardChartMode());
        return;
      }
      const mode = this.getHazardChartMode();

      const chartSize = this.prepareHiDPICanvas(this.ruleHazardChart, 260);
      const width = chartSize.width;
      const height = chartSize.height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fdfaf5";
      ctx.fillRect(0, 0, width, height);

      const left = 46;
      const right = width - 12;
      const top = 18;
      const bottom = height - 36;
      const chartWidth = right - left;
      const chartHeight = bottom - top;

      const maxHazard = Math.max(
        0.01,
        ...visibleRows.map((row) => Math.max(...this.getHazardDisplayValues(row.hazardSeries, mode)))
      );

      ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.stroke();

      const colors = ["#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#dc2626", "#475569"];
      visibleRows.forEach((row, index) => {
        const displaySeries = this.getHazardDisplayValues(row.hazardSeries, mode);
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2.6;

        displaySeries.forEach((hazard, stepIndex) => {
          const x = left + (stepIndex / (STEP_COUNT - 1)) * chartWidth;
          const y = bottom - (hazard / maxHazard) * chartHeight;
          if (stepIndex === 0) ctx.moveTo(x, y);
          else if (mode === "step") {
            const prevX = left + ((stepIndex - 1) / (STEP_COUNT - 1)) * chartWidth;
            const prevY = bottom - (displaySeries[stepIndex - 1] / maxHazard) * chartHeight;
            ctx.lineTo(x, prevY);
            ctx.lineTo(x, y);
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();

        const legendY = top + 16 + index * 14;
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(right - 162, legendY - 7, 12, 3);
        ctx.fillStyle = "#3e352d";
        ctx.font = "11px Instrument Sans, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(row.ruleShort + "-" + row.movement, right - 146, legendY - 4);
      });

      this.drawStepMarkers(ctx, left, top, bottom, chartWidth, STEP_COUNT, [5, 10, 15]);

      this.ruleHazardHoverData = {
        left,
        right,
        top,
        bottom,
        chartWidth,
        maxStep: STEP_COUNT,
        series: visibleRows.map((row, index) => ({
          label: row.ruleShort + "-" + row.movement,
          color: colors[index % colors.length],
          values: this.getHazardDisplayValues(row.hazardSeries, mode),
        })),
      };

      let peakRow = rows[0];
      visibleRows.forEach((row) => {
        if (Math.max(...row.hazardSeries) > Math.max(...peakRow.hazardSeries)) {
          peakRow = row;
        }
      });

      if (this.ruleHazardInsight) {
        this.ruleHazardInsight.textContent =
          "Insight: Hazard at step t is h(t)=matches(t)/atRisk(t). The highest peak hazard in this benchmark appears under " +
          peakRow.ruleLabel +
          " " +
          peakRow.movement +
          ", meaning that combination yields the fastest early conversion from unmatched to matched states. See the zoom chart for readable early-step separation.";
      }
      this.updateHazardDynamicExplainer(visibleRows, mode);
    }

    drawRuleHazardZoomChart(rows, maxStep) {
      if (!this.ruleHazardZoomChart) return;
      const ctx = this.ruleHazardZoomChart.getContext("2d");
      if (!ctx) return;

      const visibleRows = this.getVisibleHazardRows(rows);
      if (!visibleRows.length) {
        this.drawNoHazardSeriesMessage(this.ruleHazardZoomChart, "No series selected. Use toggles to add rules.");
        this.ruleHazardZoomHoverData = null;
        return;
      }
      const mode = this.getHazardChartMode();

      const chartSize = this.prepareHiDPICanvas(this.ruleHazardZoomChart, 260);
      const width = chartSize.width;
      const height = chartSize.height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fdfaf5";
      ctx.fillRect(0, 0, width, height);

      const left = 46;
      const right = width - 12;
      const top = 18;
      const bottom = height - 36;
      const chartWidth = right - left;
      const chartHeight = bottom - top;
      const colors = ["#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#dc2626", "#475569"];

      const maxHazard = Math.max(
        0.01,
        ...visibleRows.map((row) => Math.max(...this.getHazardDisplayValues(row.hazardSeries, mode).slice(0, maxStep)))
      );

      ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.stroke();

      visibleRows.forEach((row, index) => {
        const displaySeries = this.getHazardDisplayValues(row.hazardSeries, mode);
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2.8;

        displaySeries.slice(0, maxStep).forEach((hazard, stepIndex) => {
          const x = left + (stepIndex / Math.max(1, maxStep - 1)) * chartWidth;
          const y = bottom - (hazard / maxHazard) * chartHeight;
          if (stepIndex === 0) ctx.moveTo(x, y);
          else if (mode === "step") {
            const prevY = bottom - (displaySeries[stepIndex - 1] / maxHazard) * chartHeight;
            ctx.lineTo(x, prevY);
            ctx.lineTo(x, y);
          } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      this.drawStepMarkers(ctx, left, top, bottom, chartWidth, maxStep, [5, 10, 15]);

      this.ruleHazardZoomHoverData = {
        left,
        right,
        top,
        bottom,
        chartWidth,
        maxStep,
        series: visibleRows.map((row, index) => ({
          label: row.ruleShort + "-" + row.movement,
          color: colors[index % colors.length],
          values: this.getHazardDisplayValues(row.hazardSeries, mode).slice(0, maxStep),
        })),
      };
    }

    bindHazardExplorerEvents() {
      if (this.hazardChartMode) {
        this.hazardChartMode.addEventListener("change", () => this.redrawHazardExplorer());
      }
      if (this.hazardSelectAllButton) {
        this.hazardSelectAllButton.addEventListener("click", () => {
          if (!this.lastRuleAnalyticsRows) return;
          this.disableAutoTop2IfNeeded();
          this.lastRuleAnalyticsRows.forEach((row) => {
            this.hazardSeriesSelection[row.ruleShort + "-" + row.movement] = true;
          });
          this.renderHazardSeriesToggles(this.lastRuleAnalyticsRows);
          this.redrawHazardExplorer();
        });
      }
      if (this.hazardClearAllButton) {
        this.hazardClearAllButton.addEventListener("click", () => {
          if (!this.lastRuleAnalyticsRows) return;
          this.disableAutoTop2IfNeeded();
          this.lastRuleAnalyticsRows.forEach((row) => {
            this.hazardSeriesSelection[row.ruleShort + "-" + row.movement] = false;
          });
          this.renderHazardSeriesToggles(this.lastRuleAnalyticsRows);
          this.redrawHazardExplorer();
        });
      }
      if (this.hazardAutoTop2) {
        this.hazardAutoTop2.addEventListener("change", () => {
          this.autoHighlightTop2Enabled = !!this.hazardAutoTop2.checked;
          this.redrawHazardExplorer();
        });
      }
      if (this.hazardAutoTopN) {
        this.hazardAutoTopN.addEventListener("change", () => {
          if (!this.autoHighlightTop2Enabled) return;
          this.redrawHazardExplorer();
        });
      }
    }

    redrawHazardExplorer() {
      if (!this.lastRuleAnalyticsRows) return;
      if (this.autoHighlightTop2Enabled) {
        this.applyAutoHighlightTop2(this.lastRuleAnalyticsRows);
      } else {
        this.autoHighlightedSeriesLabels = [];
      }
      this.renderHazardSeriesToggles(this.lastRuleAnalyticsRows);
      this.updateRuleCodeExplainer(this.lastRuleAnalyticsRows);
      this.drawRuleHazardChart(this.lastRuleAnalyticsRows);
      this.drawRuleHazardZoomChart(this.lastRuleAnalyticsRows, 15);
    }

    renderHazardSeriesToggles(rows) {
      if (!this.hazardSeriesToggles) return;

      const labels = rows.map((row) => row.ruleShort + "-" + row.movement);
      const noExisting = Object.keys(this.hazardSeriesSelection).length === 0;
      if (noExisting) {
        labels.forEach((label) => {
          this.hazardSeriesSelection[label] = true;
        });
      }

      this.hazardSeriesToggles.innerHTML = labels
        .map((label) => {
          const checked = this.hazardSeriesSelection[label] ? "checked" : "";
          const autoClass = this.autoHighlightedSeriesLabels.includes(label)
            ? " hazard-series-chip is-auto-highlight"
            : " hazard-series-chip";
          return (
            "<label class=\"" +
            autoClass.trim() +
            "\">" +
            "<input type=\"checkbox\" data-series-label=\"" +
            label +
            "\" " +
            checked +
            " />" +
            label +
            "</label>"
          );
        })
        .join("");

      Array.from(this.hazardSeriesToggles.querySelectorAll("input[data-series-label]")).forEach((input) => {
        input.addEventListener("change", () => {
          this.disableAutoTop2IfNeeded();
          const label = input.getAttribute("data-series-label");
          this.hazardSeriesSelection[label] = input.checked;
          this.redrawHazardExplorer();
        });
      });
    }

    disableAutoTop2IfNeeded() {
      if (!this.autoHighlightTop2Enabled) return;
      this.autoHighlightTop2Enabled = false;
      if (this.hazardAutoTop2) {
        this.hazardAutoTop2.checked = false;
      }
    }

    applyAutoHighlightTop2(rows) {
      const selectedCount = this.getAutoHighlightCount();
      const top2 = this.getMostDivergentLabels(rows, this.getHazardChartMode(), 15, selectedCount);
      this.lastRuleAnalyticsRows.forEach((row) => {
        const label = row.ruleShort + "-" + row.movement;
        this.hazardSeriesSelection[label] = top2.includes(label);
      });
      this.autoHighlightedSeriesLabels = [...top2];
    }

    getMostDivergentLabels(rows, mode, maxStep, topN) {
      if (rows.length <= topN) {
        return rows.map((row) => row.ruleShort + "-" + row.movement);
      }

      const distanceTotals = rows.map((row, index) => {
        let total = 0;
        const a = this.getHazardDisplayValues(row.hazardSeries, mode).slice(0, maxStep);
        for (let j = 0; j < rows.length; j += 1) {
          if (j === index) continue;
          const b = this.getHazardDisplayValues(rows[j].hazardSeries, mode).slice(0, maxStep);
          for (let k = 0; k < Math.min(a.length, b.length); k += 1) {
            total += Math.abs(a[k] - b[k]);
          }
        }
        return { label: row.ruleShort + "-" + row.movement, total };
      });

      return distanceTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, Math.max(2, topN))
        .map((item) => item.label);
    }

    getAutoHighlightCount() {
      const parsed = parseInt(this.hazardAutoTopN ? this.hazardAutoTopN.value : "2", 10);
      return this.clamp(parsed || 2, 2, 4);
    }

    getVisibleHazardRows(rows) {
      const visible = rows.filter((row) => {
        const label = row.ruleShort + "-" + row.movement;
        return !!this.hazardSeriesSelection[label];
      });
      return visible;
    }

    getHazardChartMode() {
      return this.hazardChartMode ? this.hazardChartMode.value : "line";
    }

    getHazardDisplayValues(series, mode) {
      if (mode !== "cumulative") {
        return series;
      }
      let running = 0;
      return series.map((value) => {
        running += value;
        return running;
      });
    }

    updateHazardDynamicExplainer(visibleRows, mode) {
      if (!this.hazardDynamicExplainer) return;
      const modeText =
        mode === "line"
          ? "Line mode shows step-by-step hazard trajectories."
          : mode === "step"
          ? "Step mode emphasizes changes at each discrete simulation step."
          : "Cumulative mode shows cumulative conversion pressure over time.";

      if (!visibleRows.length) {
        this.hazardDynamicExplainer.textContent =
          "Dynamic explainer: no series are selected. Use the rule toggles to add lines back for comparison. " +
          modeText;
        return;
      }

      const labels = visibleRows.map((row) => row.ruleShort + "-" + row.movement).join(", ");
      const autoNote = this.autoHighlightTop2Enabled
        ? " Auto-highlight is ON: showing top " + this.getAutoHighlightCount() + " most divergent series in early steps."
        : "";
      this.hazardDynamicExplainer.textContent =
        "Dynamic explainer: currently displaying " +
        visibleRows.length +
        " series (" +
        labels +
        "). " +
        modeText +
        " Use toggles to add/remove rule lines for clarity." +
        autoNote;
    }

    updateRuleCodeExplainer(rows) {
      if (!this.ruleCodeExplainer) return;
      const selected = this.getVisibleHazardRows(rows).map((row) => row.ruleShort + "-" + row.movement);
      const selectedText = selected.length ? selected.join(", ") : "none selected";
      this.ruleCodeExplainer.textContent =
        "Code guide: R1 = Rule 1 (Attractiveness-based), R2 = Rule 2 (Similarity-based), NS = local neighborhood search, ZZ = balanced zig-zag search, BR = broad random search. Selected now: " +
        selectedText +
        ".";
    }

    bindHazardTooltipEvents() {
      if (this.ruleHazardChart && this.ruleHazardTooltip) {
        this.ruleHazardChart.addEventListener("mousemove", (event) =>
          this.handleHazardTooltipMove(event, this.ruleHazardChart, this.ruleHazardTooltip, () => this.ruleHazardHoverData)
        );
        this.ruleHazardChart.addEventListener("mouseleave", () => this.hideHazardTooltip(this.ruleHazardTooltip));
      }

      if (this.ruleHazardZoomChart && this.ruleHazardZoomTooltip) {
        this.ruleHazardZoomChart.addEventListener("mousemove", (event) =>
          this.handleHazardTooltipMove(event, this.ruleHazardZoomChart, this.ruleHazardZoomTooltip, () => this.ruleHazardZoomHoverData)
        );
        this.ruleHazardZoomChart.addEventListener("mouseleave", () => this.hideHazardTooltip(this.ruleHazardZoomTooltip));
      }
    }

    handleHazardTooltipMove(event, canvas, tooltip, hoverDataGetter) {
      const hoverData = hoverDataGetter();
      if (!hoverData) return;

      const rect = canvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const clampedX = this.clamp(localX, hoverData.left, hoverData.right);
      const relative = (clampedX - hoverData.left) / Math.max(1, hoverData.chartWidth);
      const stepIndex = this.clamp(Math.round(relative * (hoverData.maxStep - 1)), 0, hoverData.maxStep - 1);

      const lines = ["Step " + (stepIndex + 1)];
      hoverData.series.forEach((series) => {
        const value = series.values[stepIndex] || 0;
        lines.push(
          '<span style="color:' +
            series.color +
            ';font-weight:700;">' +
            series.label +
            "</span>: " +
            value.toFixed(3)
        );
      });
      tooltip.innerHTML = lines.join("<br>");

      const parentRect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : rect;
      const tooltipX = event.clientX - parentRect.left + 12;
      const tooltipY = event.clientY - parentRect.top - 8;
      tooltip.style.left = Math.min(tooltipX, parentRect.width - 240) + "px";
      tooltip.style.top = Math.max(tooltipY, 24) + "px";
      tooltip.classList.add("is-visible");
    }

    hideHazardTooltip(tooltip) {
      if (!tooltip) return;
      tooltip.classList.remove("is-visible");
    }

    drawStepMarkers(ctx, left, top, bottom, chartWidth, maxStep, markerSteps) {
      markerSteps.forEach((markerStep) => {
        if (markerStep < 1 || markerStep > maxStep) return;
        const index = markerStep - 1;
        const x = left + (index / Math.max(1, maxStep - 1)) * chartWidth;

        ctx.save();
        ctx.strokeStyle = "rgba(185, 130, 54, 0.36)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#7a5a3a";
        ctx.font = "10px Instrument Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("s" + markerStep, x, top - 4);
        ctx.restore();
      });
    }

    drawNoHazardSeriesMessage(canvas, message) {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const chartSize = this.prepareHiDPICanvas(canvas, 260);
      ctx.clearRect(0, 0, chartSize.width, chartSize.height);
      ctx.fillStyle = "#fdfaf5";
      ctx.fillRect(0, 0, chartSize.width, chartSize.height);
      ctx.strokeStyle = "rgba(15, 118, 110, 0.2)";
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(12, 12, chartSize.width - 24, chartSize.height - 24);
      ctx.setLineDash([]);
      ctx.fillStyle = "#355c57";
      ctx.font = "13px Instrument Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(message, chartSize.width / 2, chartSize.height / 2);
    }

    drawRecreatedFigure5(rows) {
      if (!this.recreatedFigure5Chart) return;
      this.drawRecreatedGroupedFigure(
        this.recreatedFigure5Chart,
        rows,
        "interPairCorrelation",
        "interPairCorrelationReplacement",
        "Inter-pair correlation"
      );
    }

    drawRecreatedFigure6(rows) {
      if (!this.recreatedFigure6Chart) return;
      this.drawRecreatedGroupedFigure(
        this.recreatedFigure6Chart,
        rows,
        "meanDateToMate",
        "meanDateToMateReplacement",
        "Mean date to mate"
      );
    }

    drawRecreatedFigure7(rows) {
      if (!this.recreatedFigure7Chart) return;
      const ctx = this.recreatedFigure7Chart.getContext("2d");
      if (!ctx) return;
      const chartSize = this.prepareHiDPICanvas(this.recreatedFigure7Chart, 300);
      const width = chartSize.width;
      const height = chartSize.height;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fdfaf5";
      ctx.fillRect(0, 0, width, height);

      const left = 44;
      const right = width - 14;
      const top = 20;
      const bottom = height - 34;
      const chartWidth = right - left;
      const chartHeight = bottom - top;
      const maxStep = 15;
      const colors = ["#0f766e", "#1d4ed8", "#7c3aed", "#b45309", "#dc2626", "#475569"];
      const maxHazard = Math.max(0.01, ...rows.map((row) => Math.max(...row.hazardSeries.slice(0, maxStep))));

      ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.stroke();

      rows.forEach((row, index) => {
        ctx.beginPath();
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2.4;
        row.hazardSeries.slice(0, maxStep).forEach((hazard, stepIndex) => {
          const x = left + (stepIndex / Math.max(1, maxStep - 1)) * chartWidth;
          const y = bottom - (hazard / maxHazard) * chartHeight;
          if (stepIndex === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
    }

    drawRecreatedGroupedFigure(canvas, rows, noReplacementField, replacementField, yLabel) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const chartSize = this.prepareHiDPICanvas(canvas, 300);
      const width = chartSize.width;
      const height = chartSize.height;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fdfaf5";
      ctx.fillRect(0, 0, width, height);

      const left = 50;
      const right = width - 12;
      const top = 24;
      const bottom = height - 42;
      const chartWidth = right - left;
      const chartHeight = bottom - top;

      const data = ["R1-NS", "R1-ZZ", "R1-BR", "R2-NS", "R2-ZZ", "R2-BR"].map((label) => {
        const row = rows.find((item) => item.ruleShort + "-" + item.movement === label);
        return {
          label,
          noRepl: row ? row[noReplacementField] : 0,
          repl: row ? row[replacementField] : 0,
        };
      });

      const maxValue = Math.max(
        0.01,
        ...data.map((d) => Math.max(d.noRepl, d.repl))
      );

      ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.stroke();

      const groupWidth = chartWidth / data.length;
      const barWidth = Math.max(8, groupWidth * 0.28);
      const gap = Math.max(3, groupWidth * 0.08);

      data.forEach((item, index) => {
        const groupStart = left + index * groupWidth + (groupWidth - (2 * barWidth + gap)) / 2;
        const noHeight = (item.noRepl / maxValue) * chartHeight;
        const replHeight = (item.repl / maxValue) * chartHeight;

        ctx.fillStyle = "#374151";
        ctx.fillRect(groupStart, bottom - noHeight, barWidth, noHeight);
        ctx.fillStyle = "#e5e7eb";
        ctx.fillRect(groupStart + barWidth + gap, bottom - replHeight, barWidth, replHeight);
        ctx.strokeStyle = "#6b7280";
        ctx.strokeRect(groupStart + barWidth + gap, bottom - replHeight, barWidth, replHeight);

        ctx.fillStyle = "#3e352d";
        ctx.font = "10px Instrument Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(item.label, left + index * groupWidth + groupWidth / 2, bottom + 14);
      });

      ctx.fillStyle = "#3e352d";
      ctx.font = "11px Instrument Sans, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(yLabel, left + 4, top - 8);
      ctx.fillStyle = "#374151";
      ctx.fillRect(right - 130, top + 2, 10, 8);
      ctx.fillStyle = "#3e352d";
      ctx.fillText("No Replacement", right - 116, top + 10);
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(right - 130, top + 16, 10, 8);
      ctx.strokeStyle = "#6b7280";
      ctx.strokeRect(right - 130, top + 16, 10, 8);
      ctx.fillStyle = "#3e352d";
      ctx.fillText("Replacement", right - 116, top + 24);
    }

    prepareHiDPICanvas(canvas, height) {
      const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const width = Math.max(260, Math.floor(parentWidth || canvas.clientWidth || 440));
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = "100%";
      canvas.style.height = height + "px";
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { width, height };
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      return { width, height };
    }

    drawBarChart(ctx, width, height, values, labels, colors) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#fdfaf5";
      ctx.fillRect(0, 0, width, height);

      const left = 38;
      const right = width - 16;
      const top = 16;
      const bottom = height - 34;
      const chartWidth = right - left;
      const chartHeight = bottom - top;
      const barGap = 8;
      const barWidth = (chartWidth - barGap * (values.length - 1)) / values.length;

      ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.stroke();

      for (let i = 0; i < values.length; i += 1) {
        const value = this.clamp(values[i], 0, 1);
        const barHeight = value * chartHeight;
        const x = left + i * (barWidth + barGap);
        const y = bottom - barHeight;

        ctx.fillStyle = colors[i] || "#0f766e";
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#3e352d";
        ctx.font = "11px Instrument Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(labels[i], x + barWidth / 2, bottom + 15);
      }
    }

    resetPreviewContent() {
      if (this.csvPreviewContent) {
        this.csvPreviewContent.textContent = "";
      }
      if (this.previewIntroText) {
        this.previewIntroText.textContent =
          "Run a simulation, then use Preview run summary (CSV) to generate an interpreted report.";
      }
      if (this.previewBodyText) {
        this.previewBodyText.textContent =
          "This section summarizes how your control settings interacted with observed outcomes.";
      }
      if (this.previewConclusionText) {
        this.previewConclusionText.textContent =
          "The conclusion synthesizes what this run suggests about encounter constraints and matching patterns.";
      }
      if (this.previewKpiPairs) this.previewKpiPairs.textContent = "-";
      if (this.previewKpiStrength) this.previewKpiStrength.textContent = "-";
      if (this.previewKpiSearch) this.previewKpiSearch.textContent = "-";
      if (this.previewMetricsInsight) {
        this.previewMetricsInsight.textContent =
          "Insight: This chart compares run-level outcomes where taller bars indicate stronger values.";
      }
      if (this.previewDifferenceInsight) {
        this.previewDifferenceInsight.textContent =
          "Insight: This chart shows how similar partners were, with lower difference bins indicating stronger assortative matching.";
      }
      if (this.ruleAnalyticsDefinitions) {
        this.ruleAnalyticsDefinitions.textContent =
          "Definitions: Rule 1 maps to Attractiveness-based choice and Rule 2 maps to Similarity-based choice. Movement labels in this simulation are NS = local neighborhood search, ZZ = balanced zig-zag search, and BR = broad random search.";
      }
      if (this.ruleAnalyticsBody) {
        this.ruleAnalyticsBody.innerHTML = "<tr><td colspan=\"5\">Run preview to compute analytics.</td></tr>";
      }
      if (this.ruleHazardInsight) {
        this.ruleHazardInsight.textContent =
          "Insight: Hazard at step t is matches at t divided by agents still unmatched at the start of t.";
      }
      if (this.ruleHazardChart) {
        const ruleCtx = this.ruleHazardChart.getContext("2d");
        if (ruleCtx) {
          const chartSize = this.prepareHiDPICanvas(this.ruleHazardChart, 260);
          ruleCtx.clearRect(0, 0, chartSize.width, chartSize.height);
        }
      }
      if (this.ruleHazardZoomChart) {
        const zoomCtx = this.ruleHazardZoomChart.getContext("2d");
        if (zoomCtx) {
          const chartSize = this.prepareHiDPICanvas(this.ruleHazardZoomChart, 260);
          zoomCtx.clearRect(0, 0, chartSize.width, chartSize.height);
        }
      }
      this.ruleHazardHoverData = null;
      this.ruleHazardZoomHoverData = null;
      this.hideHazardTooltip(this.ruleHazardTooltip);
      this.hideHazardTooltip(this.ruleHazardZoomTooltip);
      [this.recreatedFigure5Chart, this.recreatedFigure6Chart, this.recreatedFigure7Chart].forEach((canvas) => {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const chartSize = this.prepareHiDPICanvas(canvas, 300);
        ctx.clearRect(0, 0, chartSize.width, chartSize.height);
      });

      if (this.previewMetricsChart) {
        const metricsCtx = this.previewMetricsChart.getContext("2d");
        if (metricsCtx) {
          const chartSize = this.prepareHiDPICanvas(this.previewMetricsChart, 190);
          metricsCtx.clearRect(0, 0, chartSize.width, chartSize.height);
        }
      }

      if (this.previewDifferenceChart) {
        const diffCtx = this.previewDifferenceChart.getContext("2d");
        if (diffCtx) {
          const chartSize = this.prepareHiDPICanvas(this.previewDifferenceChart, 190);
          diffCtx.clearRect(0, 0, chartSize.width, chartSize.height);
        }
      }
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
          button.blur();
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
        if (this.state.lastRun) {
          this.lastCitation = this.buildRunCitationMessage(
            this.state.lastRun.metrics,
            this.state.lastRun.mobilityLevel,
            this.state.lastRun.densityLevel,
            this.state.lastRun.preferenceRule,
            this.state.lastRun.selectivityLevel,
            this.state.lastRun.patienceLevel,
            this.state.lastRun.explorationLevel
          );
        } else {
          this.addChatMessage("Assistant", "Run first, then copy the citation.");
          return;
        }
      }
      
      if (!this.lastCitation) {
        this.addChatMessage("Assistant", "Could not generate citation.");
        return;
      }
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.lastCitation)
          .then(() => {
            this.addChatMessage("Assistant", "Citation copied.");
          })
          .catch((err) => {
            console.error("Clipboard error:", err);
            this.addChatMessage("Assistant", "Clipboard blocked—copy manually from the chat.");
          });
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
      setSelect(this.selectivitySelect, "Medium");
      setSelect(this.patienceSelect, "Normal");
      setSelect(this.explorationSelect, "Balanced");
      this.state.lastRun = null;
      this.lastCitation = null;
      this.lastTopic = null; // Reset conversation context
      this.lastQuestionType = null;
      this.topicDepth = 0;
      this.setExportEnabled(false);
      this.updateSummaryBarPlaceholder();
      this.renderInsightQuestions();
    }

    updateSummaryBarPlaceholder() {
      if (!this.summaryPairs) return;
      this.summaryPairs.textContent = "— pairs";
      this.summaryStrength.textContent = "Strength —";
      this.summarySearch.textContent = "Avg search —";
      if (this.runSummary) this.runSummary.classList.remove("is-visible");
      if (this.batchSummary) {
        this.batchSummary.textContent = "";
        this.batchSummary.classList.remove("is-visible");
      }
      if (this.csvPreview) {
        this.csvPreview.classList.remove("is-visible");
      }
      this.resetPreviewContent();
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
