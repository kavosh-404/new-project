/**
 * script.js
 * Main orchestrator for the mate choice simulation UI and chat system
 * Uses the modular SimulationEngine for core logic
 */

class MateChoiceSimulation {
    constructor() {
      // Initialize simulation engine (pure logic)
      this.engine = new SimulationEngine(500);

      this.canvas = document.getElementById("simulation-canvas");
      this.context = this.canvas.getContext("2d");
      this.simulationGridSection = this.canvas
        ? this.canvas.closest(".simulation-grid") || this.canvas
        : null;
      this.preferenceSelect = document.getElementById("preference-rule");
      this.mobilitySelect = document.getElementById("mobility-level");
      this.densitySelect = document.getElementById("density-level");
      this.selectivitySelect = document.getElementById("selectivity-level");
      this.patienceSelect = document.getElementById("patience-level");
      this.explorationSelect = document.getElementById("exploration-level");
      this.modelTypeSelect = document.getElementById("model-type");
      this.agentCountInput = document.getElementById("agent-count");
      this.acceptanceBiasInput = document.getElementById("acceptance-bias");
      this.acceptanceBiasEffect = document.getElementById("acceptance-bias-effect");
      this.viewRadiusInput = document.getElementById("view-radius");
      this.viewRadiusEffect = document.getElementById("view-radius-effect");
      this.randomSeedInput = document.getElementById("random-seed");
      this.speedSelect = document.getElementById("simulation-speed");
      this.runButton = document.getElementById("run-simulation");
      this.stepButton = document.getElementById("step-simulation");
      this.resetButton = document.getElementById("reset-simulation");
      this.runStateChip = document.getElementById("run-state-chip");
      this.runStepChip = document.getElementById("run-step-chip");
      this.status = document.getElementById("simulation-status");
      this.decisionStatus = document.getElementById("decision-status");
      this.barBothAccept = document.getElementById("bar-both-accept");
      this.barAOnly = document.getElementById("bar-a-only");
      this.barBOnly = document.getElementById("bar-b-only");
      this.barBothReject = document.getElementById("bar-both-reject");
      this.inspectionSummary = document.getElementById("inspection-summary");
      this.inspectionCandidates = document.getElementById("inspection-candidates");
      this.inspectionOutcome = document.getElementById("inspection-outcome");
      this.teachingExplanation = document.getElementById("teaching-explanation");
      this.teachingSimpleToggle = document.getElementById("teaching-simple-toggle");
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
      this.batchProgress = document.getElementById("batch-progress");
      this.batchProgressLabel = document.getElementById("batch-progress-label");
      this.batchProgressCount = document.getElementById("batch-progress-count");
      this.batchProgressPhase = document.getElementById("batch-progress-phase");
      this.batchProgressFill = document.getElementById("batch-progress-fill");
      this.batchProgressEta = document.getElementById("batch-progress-eta");
      this.batchProgressInteractions = document.getElementById("batch-progress-interactions");
      this.batchProgressPairs = document.getElementById("batch-progress-pairs");
      this.batchProgressStrength = document.getElementById("batch-progress-strength");
      this.batchProgressSearch = document.getElementById("batch-progress-search");
      this.batchGhostCanvas = document.getElementById("batch-ghost-canvas");
      this.batchSnapshotCanvas = document.getElementById("batch-snapshot-canvas");
      this.batchSnapshotNote = document.getElementById("batch-snapshot-note");
      this.batchFieldTooltip = document.getElementById("batch-field-tooltip");
      this.batchHeatmapCanvas = document.getElementById("batch-heatmap-canvas");
      this.batchHeatmapNote = document.getElementById("batch-heatmap-note");
      this.batchHeatmapTooltip = document.getElementById("batch-heatmap-tooltip");
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
      this.recreatedFigure5Insight = document.getElementById("recreated-figure5-insight");
      this.recreatedFigure6Insight = document.getElementById("recreated-figure6-insight");
      this.recreatedFigure7Insight = document.getElementById("recreated-figure7-insight");
      this.summaryPairs = document.getElementById("summary-pairs");
      this.summaryStrength = document.getElementById("summary-strength");
      this.summarySearch = document.getElementById("summary-search");
      this.runSummary = document.getElementById("run-summary");
      this.runInterpretationPanel = document.getElementById("run-interpretation-panel");
      this.runBadgeSearch = document.getElementById("run-badge-search");
      this.runBadgeAssortment = document.getElementById("run-badge-assortment");
      this.runBadgePairRate = document.getElementById("run-badge-pair-rate");
      this.runInterpretationWhat = document.getElementById("run-interpretation-what");
      this.runInterpretationWhy = document.getElementById("run-interpretation-why");
      this.runInterpretationNext = document.getElementById("run-interpretation-next");
      this.runComparisonPanel = document.getElementById("run-comparison-panel");
      this.runComparisonBody = document.getElementById("run-comparison-body");
      this.runComparisonSummary = document.getElementById("run-comparison-summary");
      this.clearRunComparisonButton = document.getElementById("clear-run-comparison");
      this.lessonPresetStatus = document.getElementById("lesson-preset-status");
      this.lessonPresetButtons = Array.from(document.querySelectorAll("[data-preset]"));
      this.controlHelpButtons = Array.from(document.querySelectorAll(".control-help"));
      this.mobileCollapsibleSections = Array.from(document.querySelectorAll(".mobile-collapsible"));

      this.state = {
        agents: [],
        pairs: [],
        step: 0,
        isRunning: false,
        interactionEvents: [],
        interactionQueue: [],
        rippleQueue: [],
        selectedAgentId: null,
        decisionStats: {
          bothAccept: 0,
          aAcceptsOnly: 0,
          bAcceptsOnly: 0,
          bothReject: 0,
        },
        pairDecisionCorrelation: 0,
        lastRun: null,
      };

      this.lastCitation = null;
      this.runHistory = [];
      this.maxRunHistory = 8;
      this.nextRunId = 1;
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
      this.handleCanvasClick = this.handleCanvasClick.bind(this);
      this.handleViewRadiusChange = this.handleViewRadiusChange.bind(this);
      this.handleControlChange = this.handleControlChange.bind(this);
      this.handleChatSubmit = this.handleChatSubmit.bind(this);
      this.handleControlHelpDocumentClick = this.handleControlHelpDocumentClick.bind(this);
      this.handleControlHelpKeydown = this.handleControlHelpKeydown.bind(this);
      this.debounceTimer = null;
      this.ruleHazardHoverData = null;
      this.ruleHazardZoomHoverData = null;
      this.batchFieldHoverData = null;
      this.batchHeatmapHoverData = null;
      this.lastRuleAnalyticsRows = null;
      this.hazardSeriesSelection = {};
      this.autoHighlightedSeriesLabels = [];
      this.autoHighlightTop2Enabled = false;
      this.stepTimer = null;
      this.postStartScrollTimer = null;
      this.rngState = null;
      this.baseSeed = null;
      this.wasDesktopLayout = null;
      this.isBatchRunning = false;
      this.batchGhostContext = null;
      this.batchSnapshotContext = null;
      this.batchHeatmapContext = null;
      this.batchGhostParticles = [];
      this.batchGhostAnimationId = null;
      this.batchProgressHideTimer = null;

      this.bindEvents();
      this.handleResize();
      this.updateAcceptanceBiasEffect();
      this.updateViewRadiusControlState();
      this.updateViewRadiusEffect();
      this.seedPreview();
      this.setSimpleMode(this.simpleMode, { refreshTeachingPanel: false });
      this.resetTeachingExplanation();
      this.initChat();
      this.renderRunComparison();
      this.updateRunInterpretation(null);
      this.updateRunStateChips();
    }

    bindEvents() {
      window.addEventListener("resize", this.handleResize);
      this.runButton.addEventListener("click", this.handleRun);
      if (this.stepButton) {
        this.stepButton.addEventListener("click", () => this.handleStepForward());
      }
      if (this.resetButton) {
        this.resetButton.addEventListener("click", () => this.handleReset());
      }
      this.preferenceSelect.addEventListener("change", this.handleControlChange);
      this.mobilitySelect.addEventListener("change", this.handleControlChange);
      this.densitySelect.addEventListener("change", this.handleControlChange);
      if (this.modelTypeSelect) {
        this.modelTypeSelect.addEventListener("change", this.handleControlChange);
      }
      if (this.agentCountInput) {
        this.agentCountInput.addEventListener("change", this.handleControlChange);
      }
      if (this.speedSelect) {
        this.speedSelect.addEventListener("change", () => this.updateStatus());
      }
      if (this.acceptanceBiasInput) {
        this.acceptanceBiasInput.addEventListener("input", () => this.updateAcceptanceBiasEffect());
        this.acceptanceBiasInput.addEventListener("change", this.handleControlChange);
      }
      if (this.viewRadiusInput) {
        this.viewRadiusInput.addEventListener("input", () => {
          this.updateViewRadiusEffect();
          this.draw();
        });
        this.viewRadiusInput.addEventListener("change", this.handleViewRadiusChange);
      }
      if (this.randomSeedInput) {
        this.randomSeedInput.addEventListener("change", this.handleControlChange);
      }
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
      this.bindBatchFieldTooltipEvents();
      this.bindBatchHeatmapTooltipEvents();
      this.bindHazardExplorerEvents();
      this.bindControlHelpTooltips();
      if (this.canvas) {
        this.canvas.addEventListener("click", this.handleCanvasClick);
      }
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
          this.setSimpleMode(this.chatSimpleToggle.checked, {
            announceInChat: true,
            refreshTeachingPanel: true,
          });
        });
      }
      if (this.teachingSimpleToggle) {
        this.teachingSimpleToggle.addEventListener("change", () => {
          this.setSimpleMode(this.teachingSimpleToggle.checked, {
            announceInChat: false,
            refreshTeachingPanel: true,
          });
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
      if (this.clearRunComparisonButton) {
        this.clearRunComparisonButton.addEventListener("click", () => this.clearRunComparison());
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
      const isDesktopLayout = (window.innerWidth || 0) > 900;
      if (this.wasDesktopLayout !== isDesktopLayout && this.mobileCollapsibleSections.length) {
        this.mobileCollapsibleSections.forEach((section) => {
          if (isDesktopLayout) {
            section.setAttribute("open", "open");
          } else {
            section.removeAttribute("open");
          }
        });
        this.wasDesktopLayout = isDesktopLayout;
      }

      const rect = this.canvas.getBoundingClientRect();
      const measuredSize = Math.floor(Math.min(rect.width || 0, rect.height || rect.width || 0));
      const size = Math.max(220, measuredSize || 0);
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
      this.resetRng();
      this.state = this.buildFreshState();
      this.runButton.textContent = "Start Simulation";
      if (this.stepButton) this.stepButton.disabled = false;
      this.updateAcceptanceBiasEffect();
      this.updateViewRadiusControlState();
      this.updateViewRadiusEffect();
      this.draw();
      this.updateDecisionStatus();
    }

    updateAcceptanceBiasEffect() {
      if (!this.acceptanceBiasEffect || !this.acceptanceBiasInput) return;
      const bias = parseFloat(this.acceptanceBiasInput.value || "0") || 0;
      const percent = Math.round(Math.abs(bias) * 100);

      if (percent === 0) {
        this.acceptanceBiasEffect.textContent = "Current effect: neutral (no threshold shift).";
        return;
      }

      if (bias < 0) {
        this.acceptanceBiasEffect.textContent = "Current effect: lowers base acceptance by " + percent + "% (more selective).";
        return;
      }

      this.acceptanceBiasEffect.textContent = "Current effect: raises base acceptance by " + percent + "% (more lenient).";
    }

    getViewRadiusMultiplier() {
      const parsed = parseFloat(this.viewRadiusInput ? this.viewRadiusInput.value : "1");
      return this.clamp(isNaN(parsed) ? 1 : parsed, 0.7, 2.2);
    }

    updateViewRadiusControlState() {
      if (!this.viewRadiusInput) return;
      const isSpatial = !this.modelTypeSelect || this.modelTypeSelect.value === "Spatial";
      this.viewRadiusInput.disabled = !isSpatial;
    }

    updateViewRadiusEffect() {
      if (!this.viewRadiusEffect) return;
      const isSpatial = !this.modelTypeSelect || this.modelTypeSelect.value === "Spatial";
      if (!isSpatial) {
        this.viewRadiusEffect.textContent = "Current model uses global encounters; view radius applies in Spatial mode only.";
        return;
      }

      this.viewRadiusEffect.textContent =
        "Current radius: " +
        Math.round(this.getEncounterDistance()) +
        " px. Wider radius exposes more nearby potential matches.";
    }

    getSelectedAgent() {
      if (!this.state || typeof this.state.selectedAgentId !== "number") {
        return null;
      }

      return this.state.agents.find((agent) => agent.id === this.state.selectedAgentId) || null;
    }

    getVisibleCandidatesForAgent(agent) {
      const isSpatial = !this.modelTypeSelect || this.modelTypeSelect.value === "Spatial";
      if (!agent || agent.matched || !isSpatial) {
        return [];
      }

      const radius = this.getEncounterDistance();
      return this.state.agents.filter((candidate) => {
        if (candidate.id === agent.id || candidate.matched) {
          return false;
        }

        return this.getDistance(agent, candidate) <= radius;
      });
    }

    updateInspectionPanel() {
      if (!this.inspectionSummary || !this.inspectionCandidates || !this.inspectionOutcome) {
        return;
      }

      const isSpatial = !this.modelTypeSelect || this.modelTypeSelect.value === "Spatial";
      if (!isSpatial) {
        this.inspectionSummary.textContent = "Inspection ring is available in Spatial mode. Switch models to inspect local visibility.";
        this.inspectionCandidates.textContent = "Visible candidates: all unmatched agents are globally reachable in Non-Spatial mode.";
        this.inspectionOutcome.textContent = "Match possible now: local radius is not used in this model.";
        return;
      }

      const selectedAgent = this.getSelectedAgent();
      if (!selectedAgent) {
        this.inspectionSummary.textContent = "Click an agent to inspect its 360-degree view. Click empty space to clear.";
        this.inspectionCandidates.textContent = "Visible candidates: -";
        this.inspectionOutcome.textContent = "Match possible now: -";
        return;
      }

      const visibleCandidates = this.getVisibleCandidatesForAgent(selectedAgent);
      this.inspectionSummary.textContent =
        "Agent " +
        (selectedAgent.id + 1) +
        " selected · attractiveness " +
        selectedAgent.attractiveness +
        "/10" +
        (selectedAgent.matched ? " · already matched" : ".");
      this.inspectionCandidates.textContent =
        "Visible candidates: " +
        visibleCandidates.length +
        " within " +
        Math.round(this.getEncounterDistance()) +
        " px.";

      if (selectedAgent.matched) {
        this.inspectionOutcome.textContent = "Match possible now: no, this agent is already paired.";
      } else if (!visibleCandidates.length) {
        this.inspectionOutcome.textContent = "Match possible now: no nearby unmatched agents are inside view.";
      } else {
        this.inspectionOutcome.textContent = "Match possible now: yes, if one of these visible agents is encountered and both accept.";
      }
    }

    getCanvasPoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      const size = this.getCanvasSize();
      const scaleX = rect.width ? size / rect.width : 1;
      const scaleY = rect.height ? size / rect.height : 1;
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    }

    handleCanvasClick(event) {
      const isSpatial = !this.modelTypeSelect || this.modelTypeSelect.value === "Spatial";
      if (!isSpatial || !this.canvas) {
        return;
      }

      const point = this.getCanvasPoint(event);
      let selectedAgent = null;
      let bestDistance = Infinity;

      this.state.agents.forEach((agent) => {
        const distance = this.getDistance(point, agent);
        if (distance <= AGENT_RADIUS + 6 && distance < bestDistance) {
          bestDistance = distance;
          selectedAgent = agent;
        }
      });

      this.state.selectedAgentId = selectedAgent ? selectedAgent.id : null;
      this.updateInspectionPanel();
      this.draw();
    }

    handleRun(options = {}) {
      const { forceRestart = false } = options;

      if (this.state.isRunning && !forceRestart) {
        this.state.isRunning = false;
        this.runButton.textContent = "Resume Simulation";
        if (this.stepButton) this.stepButton.disabled = false;
        this.stopStepping();
        this.updateStatus();
        return;
      }

      if (forceRestart && this.state.isRunning) {
        this.state.isRunning = false;
        this.stopStepping();
      }

      const runAlreadyComplete = this.state.step >= STEP_COUNT;
      const needsFreshStart = forceRestart || runAlreadyComplete || (this.state.step === 0 && this.state.pairs.length === 0);

      this.scrollToSimulationGrid();

      if (this.batchSummary) {
        this.batchSummary.classList.remove("is-visible");
        this.batchSummary.textContent = "";
      }
      if (this.csvPreview) {
        this.csvPreview.classList.remove("is-visible");
      }
      this.resetPreviewContent("light");

      if (needsFreshStart) {
        this.resetRng();
        this.state = this.buildFreshState();
      }

      this.state.isRunning = true;
      this.runButton.textContent = "Pause Simulation";
      if (this.stepButton) this.stepButton.disabled = true;
      this.status.textContent = "Simulation started. Agents are interacting now.";
      this.updateRunStateChips();
      this.draw();
      this.scheduleSummaryScrollAfterStart();
      this.animate(true);
    }

    handleStepForward() {
      if (this.state.isRunning || this.state.step >= STEP_COUNT) {
        return;
      }
      this.scrollToSimulationGrid();
      this.stepSimulation();
      this.state.step += 1;
      this.draw();
      this.updateStatus();
      this.updateDecisionStatus();
      if (this.state.step >= STEP_COUNT) {
        this.finishRun();
      }
    }

    handleReset() {
      this.stopStepping();
      this.resetRng();
      this.state = this.buildFreshState();
      this.runButton.textContent = "Start Simulation";
      if (this.stepButton) this.stepButton.disabled = false;
      this.updateSummaryBarPlaceholder();
      this.updateViewRadiusControlState();
      this.updateViewRadiusEffect();
      this.updateStatus();
      this.updateDecisionStatus();
      this.draw();
    }

    stopStepping() {
      if (this.stepTimer) {
        window.clearTimeout(this.stepTimer);
        this.stepTimer = null;
      }
      if (this.postStartScrollTimer) {
        window.clearTimeout(this.postStartScrollTimer);
        this.postStartScrollTimer = null;
      }
    }

    scheduleSummaryScrollAfterStart() {
      if (this.postStartScrollTimer) {
        window.clearTimeout(this.postStartScrollTimer);
      }

      this.postStartScrollTimer = window.setTimeout(() => {
        this.postStartScrollTimer = null;
        const target = this.runSummary || this.csvPreview;
        if (target && target.scrollIntoView) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 5000);
    }

    getSpeedMultiplier() {
      const parsed = parseFloat(this.speedSelect ? this.speedSelect.value : "1");
      return this.clamp(isNaN(parsed) ? 1 : parsed, 0.2, 4);
    }

    getActiveAgentCount() {
      const parsed = parseInt(this.agentCountInput ? this.agentCountInput.value : "500", 10);
      const clamped = this.clamp(isNaN(parsed) ? 500 : parsed, 100, 2000);
      if (this.agentCountInput) {
        this.agentCountInput.value = String(clamped);
      }
      return clamped;
    }

    getNumericSeed() {
      if (!this.randomSeedInput || this.randomSeedInput.value === "") return null;
      const parsed = parseInt(this.randomSeedInput.value, 10);
      if (isNaN(parsed) || parsed <= 0) return null;
      return parsed;
    }

    resetRng(seedOverride) {
      const seed = typeof seedOverride === "number" ? seedOverride : this.getNumericSeed();
      this.baseSeed = seed;
      if (typeof seed === "number" && isFinite(seed)) {
        this.rngState = Math.abs(seed) % 2147483647;
        if (this.rngState === 0) this.rngState = 1;
      } else {
        this.rngState = null;
      }
    }

    random() {
      if (!this.rngState) return Math.random();
      this.rngState = (this.rngState * 48271) % 2147483647;
      return this.rngState / 2147483647;
    }

    buildFreshState() {
      return {
        agents: this.createAgents(this.getActiveAgentCount()),
        pairs: [],
        step: 0,
        isRunning: false,
        interactionEvents: [],
        interactionQueue: [],
        rippleQueue: [],
        selectedAgentId: null,
        decisionStats: {
          bothAccept: 0,
          aAcceptsOnly: 0,
          bAcceptsOnly: 0,
          bothReject: 0,
        },
        pairDecisionCorrelation: 0,
        lastRun: this.state ? this.state.lastRun : null,
      };
    }

    async handleBatchRun() {
      if (this.state.isRunning || this.isBatchRunning) {
        return;
      }

      this.isBatchRunning = true;

      const runCount = parseInt(this.batchRunCountSelect ? this.batchRunCountSelect.value : "30", 10) || 30;
      const metricsList = [];
      const spatialStrength = [];
      const nonSpatialStrength = [];
      const batchFieldAccumulator = this.createBatchFieldAccumulator(16, 16);
      const batchHeatAccumulator = this.createBatchHeatAccumulator(18, 10);
      const totalSamples = runCount * 2;
      const batchStartMs = performance.now ? performance.now() : Date.now();
      let processedSamples = 0;
      let batchLastRun = this.state.lastRun;

      this.runButton.disabled = true;
      if (this.runBatchButton) this.runBatchButton.disabled = true;
      this.status.textContent = "Running batch experiment: " + runCount + " simulations...";
      if (this.batchProgressHideTimer) {
        window.clearTimeout(this.batchProgressHideTimer);
        this.batchProgressHideTimer = null;
      }
      this.setBatchProgressVisible(true);
      this.updateBatchProgress({
        phase: "Preparing batch runs...",
        processed: 0,
        total: totalSamples,
        batchStartMs,
        metricsList,
        recentInteractions: 0,
      });
      this.resetBatchSnapshot("Preparing statistical average field...");
      this.resetBatchHeatmap("Preparing pairing-hotspot heatmap...");

      const preservedState = {
        ...this.state,
        agents: this.state.agents.map((agent) => ({ ...agent })),
        pairs: this.state.pairs.map((pair) => ({ ...pair })),
        interactionEvents: this.state.interactionEvents.map((interaction) => ({ ...interaction })),
        interactionQueue: this.state.interactionQueue.map((interaction) => ({ ...interaction })),
        decisionStats: { ...this.state.decisionStats },
      };

      const currentModel = this.modelTypeSelect ? this.modelTypeSelect.value : "Spatial";
      const compareModel = currentModel === "Spatial" ? "Non-Spatial" : "Spatial";

      try {
        for (let runIndex = 0; runIndex < runCount; runIndex += 1) {
          const seedBase = this.getNumericSeed();
          const runSeed = typeof seedBase === "number" ? seedBase + runIndex * 101 : null;

          const primaryResult = this.runSingleBatchSample({
            modelName: currentModel,
            seed: runSeed,
          });
          metricsList.push(primaryResult.metrics);
          if (currentModel === "Spatial") {
            spatialStrength.push(primaryResult.metrics.matchingStrength);
          } else {
            nonSpatialStrength.push(primaryResult.metrics.matchingStrength);
          }
          processedSamples += 1;
          this.updateBatchProgress({
            phase: "Sampling " + currentModel + " run " + (runIndex + 1) + " of " + runCount + "...",
            processed: processedSamples,
            total: totalSamples,
            batchStartMs,
            metricsList,
            recentInteractions: primaryResult.interactions,
          });
          this.accumulateBatchField(batchFieldAccumulator, primaryResult.snapshot);
          this.drawBatchField(batchFieldAccumulator, {
            modelName: currentModel,
            runIndex: runIndex + 1,
            runCount,
            processed: processedSamples,
            total: totalSamples,
          });
          this.accumulateBatchHeatmap(batchHeatAccumulator, primaryResult.snapshot);
          this.drawBatchHeatmap(batchHeatAccumulator, {
            processed: processedSamples,
            total: totalSamples,
          });
          await this.waitForNextFrame();

          const compareSeed = typeof runSeed === "number" ? runSeed + 53 : null;
          const compareResult = this.runSingleBatchSample({
            modelName: compareModel,
            seed: compareSeed,
          });
          if (compareModel === "Spatial") {
            spatialStrength.push(compareResult.metrics.matchingStrength);
          } else {
            nonSpatialStrength.push(compareResult.metrics.matchingStrength);
          }
          processedSamples += 1;
          this.updateBatchProgress({
            phase: "Sampling " + compareModel + " run " + (runIndex + 1) + " of " + runCount + "...",
            processed: processedSamples,
            total: totalSamples,
            batchStartMs,
            metricsList,
            recentInteractions: compareResult.interactions,
          });
          this.accumulateBatchField(batchFieldAccumulator, compareResult.snapshot);
          this.drawBatchField(batchFieldAccumulator, {
            modelName: compareModel,
            runIndex: runIndex + 1,
            runCount,
            processed: processedSamples,
            total: totalSamples,
          });
          this.accumulateBatchHeatmap(batchHeatAccumulator, compareResult.snapshot);
          this.drawBatchHeatmap(batchHeatAccumulator, {
            processed: processedSamples,
            total: totalSamples,
          });
          await this.waitForNextFrame();
        }
        const pairStats = this.computeBatchStats(metricsList.map((m) => m.pairCount));
        const strengthStats = this.computeBatchStats(metricsList.map((m) => m.matchingStrength));
        const searchStats = this.computeBatchStats(metricsList.map((m) => m.averageSearchSteps));
        const spatialStats = this.computeBatchStats(spatialStrength);
        const nonSpatialStats = this.computeBatchStats(nonSpatialStrength);
        const lastMetrics = metricsList[metricsList.length - 1];

        this.state.lastRun = {
          metrics: lastMetrics,
          mobilityLevel: this.mobilitySelect.value,
          densityLevel: this.densitySelect.value,
          preferenceRule: this.preferenceSelect.value,
          selectivityLevel: this.selectivitySelect ? this.selectivitySelect.value : "Medium",
          patienceLevel: this.patienceSelect ? this.patienceSelect.value : "Normal",
          explorationLevel: this.explorationSelect ? this.explorationSelect.value : "Balanced",
          modelType: this.modelTypeSelect ? this.modelTypeSelect.value : "Spatial",
          agentCount: this.getActiveAgentCount(),
          viewRadiusMultiplier: this.getViewRadiusMultiplier(),
        };
        batchLastRun = this.state.lastRun;

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
        this.updateRunInterpretation(this.buildPreviewReportData());
        this.setExportEnabled(true);
        this.renderInsightQuestions();
        this.draw();
        this.showBatchSummary(runCount, pairStats, strengthStats, searchStats, spatialStats, nonSpatialStats);
        this.recordBatchForComparison(runCount, pairStats, strengthStats, searchStats, spatialStats, nonSpatialStats);

        this.status.textContent =
          "Batch complete: " +
          runCount +
          " runs. Mean pairs " +
          pairStats.mean.toFixed(1) +
          ", mean strength " +
          strengthStats.mean.toFixed(2) +
          ", mean search " +
          searchStats.mean.toFixed(1) +
          ". Spatial r=" +
          spatialStats.mean.toFixed(2) +
          ", Non-spatial r=" +
          nonSpatialStats.mean.toFixed(2) +
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
            "). Spatial r=" +
            spatialStats.mean.toFixed(2) +
            " (95% CI " +
            spatialStats.ciLow.toFixed(2) +
            " to " +
            spatialStats.ciHigh.toFixed(2) +
            "), Non-spatial r=" +
            nonSpatialStats.mean.toFixed(2) +
            " (95% CI " +
            nonSpatialStats.ciLow.toFixed(2) +
            " to " +
            nonSpatialStats.ciHigh.toFixed(2) +
            ")."
        );

        this.updateBatchProgress({
          phase: "Batch complete.",
          processed: totalSamples,
          total: totalSamples,
          batchStartMs,
          metricsList,
          recentInteractions: 0,
        });
        if (this.batchSnapshotNote) {
          this.batchSnapshotNote.textContent =
            "Statistical average field completed. Color encodes matched-rate; opacity encodes relative occupancy concentration.";
        }
        if (this.batchHeatmapNote) {
          this.batchHeatmapNote.textContent =
            "Statistical hotspot heatmap across sampled runs. Cell intensity reflects where matched pairs concentrate.";
        }
      } catch (error) {
        console.error("Batch run failed", error);
        this.status.textContent = "Batch run failed. Please try again.";
        this.addChatMessage("Assistant", "Batch run failed unexpectedly. Try a smaller n and run again.");
      } finally {
        if (this.modelTypeSelect) {
          this.modelTypeSelect.value = currentModel;
        }
        this.state = preservedState;
        this.state.lastRun = batchLastRun;
        this.resetRng();
        this.draw();
        this.updateStatus();
        this.updateDecisionStatus();
        this.scheduleBatchProgressAutoHide();
        this.runButton.disabled = false;
        if (this.runBatchButton) this.runBatchButton.disabled = false;
        this.isBatchRunning = false;
      }
    }

    runSingleBatchSample({ modelName, seed }) {
      if (this.modelTypeSelect) {
        this.modelTypeSelect.value = modelName;
      }
      this.resetRng(seed);
      this.state = {
        ...this.buildFreshState(),
        agents: this.createAgents(this.getActiveAgentCount()),
        pairs: [],
        step: 0,
        isRunning: false,
        lastRun: this.state.lastRun,
      };

      for (let stepIndex = 0; stepIndex < STEP_COUNT; stepIndex += 1) {
        this.stepSimulation();
        this.state.step = stepIndex + 1;
      }

      const snapshot = {
        agents: this.state.agents.map((agent) => ({
          x: agent.x,
          y: agent.y,
          matched: !!agent.matched,
          attractiveness: agent.attractiveness,
        })),
        pairs: this.state.pairs.map((pair) => ({
          agent1: pair.agent1,
          agent2: pair.agent2,
        })),
        canvasSize: this.getCanvasSize(),
      };

      return {
        metrics: this.getSimulationMetrics(),
        interactions: this.state.interactionEvents.length,
        snapshot,
      };
    }

    waitForNextFrame() {
      return new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    }

    setBatchProgressVisible(isVisible) {
      if (!this.batchProgress) return;
      this.batchProgress.classList.toggle("is-visible", !!isVisible);
      this.batchProgress.setAttribute("aria-hidden", isVisible ? "false" : "true");
    }

    scheduleBatchProgressAutoHide() {
      if (this.batchProgressHideTimer) {
        window.clearTimeout(this.batchProgressHideTimer);
        this.batchProgressHideTimer = null;
      }
      if (!this.isBatchRunning) {
        this.setBatchProgressVisible(true);
      }
    }

    startBatchGhostAnimation() {
      if (!this.batchGhostCanvas) return;
      if (!this.batchGhostContext) {
        this.batchGhostContext = this.batchGhostCanvas.getContext("2d");
      }
      if (!this.batchGhostContext) return;

      const width = this.batchGhostCanvas.width || 220;
      const height = this.batchGhostCanvas.height || 86;
      this.batchGhostParticles = Array.from({ length: 14 }, () => ({
        x: this.randomFloat(8, width - 8),
        y: this.randomFloat(8, height - 8),
        vx: this.randomFloat(-0.55, 0.55),
        vy: this.randomFloat(-0.45, 0.45),
        tint: this.random() > 0.55 ? "teal" : "amber",
      }));

      if (this.batchGhostAnimationId) {
        window.cancelAnimationFrame(this.batchGhostAnimationId);
      }

      const animate = () => {
        if (!this.isBatchRunning) {
          this.batchGhostAnimationId = null;
          return;
        }
        this.drawBatchGhostFrame();
        this.batchGhostAnimationId = window.requestAnimationFrame(animate);
      };

      this.batchGhostAnimationId = window.requestAnimationFrame(animate);
    }

    drawBatchGhostFrame() {
      if (!this.batchGhostCanvas || !this.batchGhostContext) return;

      const ctx = this.batchGhostContext;
      const width = this.batchGhostCanvas.width;
      const height = this.batchGhostCanvas.height;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < this.batchGhostParticles.length; i += 1) {
        const p = this.batchGhostParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 6 || p.x >= width - 6) p.vx *= -1;
        if (p.y <= 6 || p.y >= height - 6) p.vy *= -1;

        p.vx += this.randomFloat(-0.012, 0.012);
        p.vy += this.randomFloat(-0.012, 0.012);
        p.vx = this.clamp(p.vx, -0.8, 0.8);
        p.vy = this.clamp(p.vy, -0.8, 0.8);
      }

      for (let i = 0; i < this.batchGhostParticles.length; i += 1) {
        const a = this.batchGhostParticles[i];
        for (let j = i + 1; j < this.batchGhostParticles.length; j += 1) {
          const b = this.batchGhostParticles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 26) continue;
          const alpha = (1 - dist / 26) * 0.55;
          ctx.strokeStyle = "rgba(15, 118, 110, " + alpha.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      this.batchGhostParticles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = p.tint === "teal" ? "rgba(15, 118, 110, 0.9)" : "rgba(185, 130, 54, 0.88)";
        ctx.fill();
      });
    }

    resetBatchSnapshot(noteText) {
      if (!this.batchSnapshotCanvas) return;
      const ctx = this.batchSnapshotCanvas.getContext("2d");
      if (!ctx) return;

      const chartSize = this.prepareSquareCanvas(this.batchSnapshotCanvas, 420);
      ctx.clearRect(0, 0, chartSize.size, chartSize.size);
      ctx.fillStyle = "rgba(255, 252, 246, 0.9)";
      ctx.fillRect(0, 0, chartSize.size, chartSize.size);

      ctx.fillStyle = "#5e4d3f";
      ctx.font = "12px Instrument Sans, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Average field will appear during batch sampling.", 10, 18);

      if (this.batchSnapshotNote && noteText) {
        this.batchSnapshotNote.textContent = noteText;
      }
    }

    createBatchFieldAccumulator(columns, rows) {
      return {
        columns,
        rows,
        occupancy: Array.from({ length: rows }, () => Array(columns).fill(0)),
        matched: Array.from({ length: rows }, () => Array(columns).fill(0)),
        samples: 0,
      };
    }

    accumulateBatchField(accumulator, snapshot) {
      if (!accumulator || !snapshot || !snapshot.agents || !snapshot.agents.length) return;

      const columns = accumulator.columns;
      const rows = accumulator.rows;
      const size = Math.max(1, snapshot.canvasSize || 1);

      snapshot.agents.forEach((agent) => {
        const xNorm = this.clamp(agent.x / size, 0, 0.9999);
        const yNorm = this.clamp(agent.y / size, 0, 0.9999);
        const col = Math.floor(xNorm * columns);
        const row = Math.floor(yNorm * rows);
        accumulator.occupancy[row][col] += 1;
        if (agent.matched) {
          accumulator.matched[row][col] += 1;
        }
      });

      accumulator.samples += 1;
    }

    drawBatchField(accumulator, meta) {
      if (!this.batchSnapshotCanvas || !accumulator || !accumulator.samples) return;
      if (!this.batchSnapshotContext) {
        this.batchSnapshotContext = this.batchSnapshotCanvas.getContext("2d");
      }
      const ctx = this.batchSnapshotContext;
      if (!ctx) return;

      const chartSize = this.prepareSquareCanvas(this.batchSnapshotCanvas, 420);
      const width = chartSize.size;
      const height = chartSize.size;
      const pad = 10;
      const innerWidth = width - pad * 2;
      const innerHeight = height - pad * 2;
      const cellW = innerWidth / accumulator.columns;
      const cellH = innerHeight / accumulator.rows;

      const occGrid = Array.from({ length: accumulator.rows }, () => Array(accumulator.columns).fill(0));
      const matchGrid = Array.from({ length: accumulator.rows }, () => Array(accumulator.columns).fill(0));

      let maxOccupancy = 0;
      let minMatchedRate = 1;
      let maxMatchedRate = 0;
      let matchedRateSum = 0;
      let occupiedCellCount = 0;
      const matchedRates = [];
      for (let row = 0; row < accumulator.rows; row += 1) {
        for (let col = 0; col < accumulator.columns; col += 1) {
          const occ = accumulator.occupancy[row][col];
          maxOccupancy = Math.max(maxOccupancy, occ);
          if (occ > 0) {
            const matchedRate = accumulator.matched[row][col] / occ;
            minMatchedRate = Math.min(minMatchedRate, matchedRate);
            maxMatchedRate = Math.max(maxMatchedRate, matchedRate);
            matchedRateSum += matchedRate;
            occupiedCellCount += 1;
            matchedRates.push(matchedRate);
            occGrid[row][col] = occ;
            matchGrid[row][col] = matchedRate;
          }
        }
      }

      if (!occupiedCellCount) {
        minMatchedRate = 0;
        maxMatchedRate = 0;
      }
      const meanMatchedRate = occupiedCellCount ? matchedRateSum / occupiedCellCount : 0;
      const matchedRateRange = maxMatchedRate - minMatchedRate;
      const smoothOccGrid = this.smoothGrid(occGrid, 1);
      const smoothMatchGrid = this.smoothGrid(matchGrid, 1);
      const sortedMatchedRates = matchedRates.slice().sort((a, b) => a - b);
      const q10 = this.getSortedQuantile(sortedMatchedRates, 0.1);
      const q50 = this.getSortedQuantile(sortedMatchedRates, 0.5);
      const q90 = this.getSortedQuantile(sortedMatchedRates, 0.9);

      let maxSmoothedOccupancy = 0;
      for (let row = 0; row < accumulator.rows; row += 1) {
        for (let col = 0; col < accumulator.columns; col += 1) {
          maxSmoothedOccupancy = Math.max(maxSmoothedOccupancy, smoothOccGrid[row][col]);
        }
      }

      const normalizeMatchedRate = (rate) => {
        if (q90 - q10 >= 0.02) {
          return this.clamp((rate - q10) / (q90 - q10), 0, 1);
        }
        if (matchedRateRange >= 0.1) {
          return this.clamp((rate - minMatchedRate) / matchedRateRange, 0, 1);
        }
        // Contrast-stretch narrow ranges around median so subtle differences become visible.
        return this.clamp(0.5 + (rate - q50) / 0.03, 0, 1);
      };

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 252, 246, 0.94)";
      ctx.fillRect(0, 0, width, height);

      for (let row = 0; row < accumulator.rows; row += 1) {
        for (let col = 0; col < accumulator.columns; col += 1) {
          const occ = smoothOccGrid[row][col];
          const matchedRate = smoothMatchGrid[row][col] || 0;
          const occIntensity = maxSmoothedOccupancy > 0 ? Math.sqrt(occ / maxSmoothedOccupancy) : 0;
          const matchedNorm = normalizeMatchedRate(matchedRate);

          const rgb = this.interpolateDivergingColor(matchedNorm);
          const alpha = 0.14 + 0.82 * occIntensity;
          const x = pad + col * cellW;
          const y = pad + row * cellH;

          ctx.fillStyle =
            "rgba(" +
            Math.round(rgb.r) +
            "," +
            Math.round(rgb.g) +
            "," +
            Math.round(rgb.b) +
            "," +
            alpha.toFixed(3) +
            ")";
          ctx.fillRect(x, y, cellW, cellH);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
          ctx.lineWidth = 0.6;
          ctx.strokeRect(x, y, cellW, cellH);
        }
      }

      ctx.strokeStyle = "rgba(79, 57, 36, 0.22)";
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, innerWidth, innerHeight);

      const hotspots = this.collectTopFieldCells(smoothOccGrid, smoothMatchGrid, 3);
      hotspots.forEach((cell, index) => {
        const cx = pad + (cell.col + 0.5) * cellW;
        const cy = pad + (cell.row + 0.5) * cellH;
        const radius = Math.max(4, Math.min(cellW, cellH) * 0.28);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.fill();
        ctx.strokeStyle = "rgba(31, 26, 23, 0.55)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#2a231d";
        ctx.font = "700 10px Instrument Sans, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(index + 1), cx, cy + 0.5);
      });

      // Compact legend for matched-rate color scale.
      const legendX = pad + 6;
      const legendY = pad + 6;
      const legendW = 120;
      const legendH = 10;
      const legendGradient = ctx.createLinearGradient(legendX, 0, legendX + legendW, 0);
      legendGradient.addColorStop(0, "rgba(59, 76, 192, 0.95)");
      legendGradient.addColorStop(0.5, "rgba(244, 244, 244, 0.95)");
      legendGradient.addColorStop(1, "rgba(180, 4, 38, 0.95)");
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.fillRect(legendX - 4, legendY - 12, legendW + 8, 28);
      ctx.fillStyle = legendGradient;
      ctx.fillRect(legendX, legendY, legendW, legendH);
      ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
      ctx.strokeRect(legendX, legendY, legendW, legendH);
      ctx.fillStyle = "#4b3b2e";
      ctx.font = "10px Instrument Sans, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("low " + (q10 * 100).toFixed(1) + "%", legendX, legendY + 20);
      ctx.textAlign = "center";
      ctx.fillText("mid " + (q50 * 100).toFixed(1) + "%", legendX + legendW / 2, legendY + 20);
      ctx.textAlign = "right";
      ctx.fillText("high " + (q90 * 100).toFixed(1) + "%", legendX + legendW, legendY + 20);

      const processed = meta && typeof meta.processed === "number" ? meta.processed : accumulator.samples;
      const total = meta && typeof meta.total === "number" ? meta.total : accumulator.samples;
      this.batchFieldHoverData = {
        pad,
        innerWidth,
        innerHeight,
        cellW,
        cellH,
        rows: accumulator.rows,
        columns: accumulator.columns,
        occupancy: accumulator.occupancy,
        matched: accumulator.matched,
        samples: accumulator.samples,
        maxOccupancy,
      };

      if (this.batchSnapshotNote) {
        this.batchSnapshotNote.textContent =
          "Average field from " + processed + "/" + total + " sampled runs. " +
          "Color: matched-rate in each cell. Opacity: relative occupancy concentration. " +
          "Observed match-rate range: " + (minMatchedRate * 100).toFixed(1) + "% to " + (maxMatchedRate * 100).toFixed(1) + "%. " +
          "Top concentration cells are marked 1-3.";
      }
    }

    smoothGrid(grid, passes) {
      let current = grid.map((row) => row.slice());
      const totalPasses = Math.max(1, passes || 1);

      for (let passIndex = 0; passIndex < totalPasses; passIndex += 1) {
        const next = current.map((row) => row.slice());
        for (let row = 0; row < current.length; row += 1) {
          for (let col = 0; col < current[row].length; col += 1) {
            let sum = 0;
            let count = 0;
            for (let dRow = -1; dRow <= 1; dRow += 1) {
              for (let dCol = -1; dCol <= 1; dCol += 1) {
                const rr = row + dRow;
                const cc = col + dCol;
                if (rr < 0 || rr >= current.length || cc < 0 || cc >= current[row].length) continue;
                const weight = dRow === 0 && dCol === 0 ? 2 : 1;
                sum += current[rr][cc] * weight;
                count += weight;
              }
            }
            next[row][col] = count > 0 ? sum / count : current[row][col];
          }
        }
        current = next;
      }

      return current;
    }

    collectTopFieldCells(occGrid, matchGrid, topN) {
      const cells = [];
      for (let row = 0; row < occGrid.length; row += 1) {
        for (let col = 0; col < occGrid[row].length; col += 1) {
          const occ = occGrid[row][col] || 0;
          const match = matchGrid[row][col] || 0;
          if (occ <= 0) continue;
          cells.push({ row, col, score: occ * (0.35 + 0.65 * match) });
        }
      }

      return cells
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(0, topN || 3));
    }

    getSortedQuantile(sortedValues, q) {
      if (!sortedValues || !sortedValues.length) return 0;
      const clampedQ = this.clamp(q, 0, 1);
      const index = clampedQ * (sortedValues.length - 1);
      const low = Math.floor(index);
      const high = Math.ceil(index);
      if (low === high) return sortedValues[low];
      const weight = index - low;
      return sortedValues[low] * (1 - weight) + sortedValues[high] * weight;
    }

    interpolateDivergingColor(t) {
      const value = this.clamp(t, 0, 1);
      const stops = [
        { t: 0, r: 59, g: 76, b: 192 },
        { t: 0.5, r: 244, g: 244, b: 244 },
        { t: 1, r: 180, g: 4, b: 38 },
      ];

      for (let i = 0; i < stops.length - 1; i += 1) {
        const a = stops[i];
        const b = stops[i + 1];
        if (value < a.t || value > b.t) continue;
        const span = Math.max(1e-6, b.t - a.t);
        const p = (value - a.t) / span;
        return {
          r: a.r + (b.r - a.r) * p,
          g: a.g + (b.g - a.g) * p,
          b: a.b + (b.b - a.b) * p,
        };
      }

      return value <= 0.5 ? { r: 59, g: 76, b: 192 } : { r: 180, g: 4, b: 38 };
    }

    bindBatchFieldTooltipEvents() {
      if (!this.batchSnapshotCanvas || !this.batchFieldTooltip) return;
      this.batchSnapshotCanvas.addEventListener("mousemove", (event) => this.handleBatchFieldTooltipMove(event));
      this.batchSnapshotCanvas.addEventListener("mouseleave", () => this.hideHazardTooltip(this.batchFieldTooltip));
    }

    handleBatchFieldTooltipMove(event) {
      if (!this.batchSnapshotCanvas || !this.batchFieldTooltip || !this.batchFieldHoverData) return;

      const hoverData = this.batchFieldHoverData;
      const rect = this.batchSnapshotCanvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;

      const inBounds =
        localX >= hoverData.pad &&
        localX <= hoverData.pad + hoverData.innerWidth &&
        localY >= hoverData.pad &&
        localY <= hoverData.pad + hoverData.innerHeight;

      if (!inBounds) {
        this.hideHazardTooltip(this.batchFieldTooltip);
        return;
      }

      const col = this.clamp(Math.floor((localX - hoverData.pad) / hoverData.cellW), 0, hoverData.columns - 1);
      const row = this.clamp(Math.floor((localY - hoverData.pad) / hoverData.cellH), 0, hoverData.rows - 1);
      const occ = hoverData.occupancy[row][col] || 0;
      const matched = hoverData.matched[row][col] || 0;
      const meanAgentsPerRun = hoverData.samples > 0 ? occ / hoverData.samples : 0;
      const matchedRate = occ > 0 ? (matched / occ) * 100 : 0;
      const occRel = hoverData.maxOccupancy > 0 ? (occ / hoverData.maxOccupancy) * 100 : 0;

      this.batchFieldTooltip.innerHTML =
        "Cell r" + (row + 1) + ", c" + (col + 1) + "<br>" +
        "Avg agents/run: " + meanAgentsPerRun.toFixed(2) + "<br>" +
        "Matched-rate: " + matchedRate.toFixed(1) + "%<br>" +
        "Relative occupancy: " + occRel.toFixed(1) + "%";

      const parentRect = this.batchSnapshotCanvas.parentElement
        ? this.batchSnapshotCanvas.parentElement.getBoundingClientRect()
        : rect;
      const tooltipX = event.clientX - parentRect.left + 12;
      const tooltipY = event.clientY - parentRect.top - 8;
      this.batchFieldTooltip.style.left = Math.min(tooltipX, parentRect.width - 240) + "px";
      this.batchFieldTooltip.style.top = Math.max(tooltipY, 24) + "px";
      this.batchFieldTooltip.classList.add("is-visible");
    }

    drawBatchSnapshot(snapshot, meta) {
      if (!this.batchSnapshotCanvas || !snapshot || !snapshot.agents || !snapshot.agents.length) return;
      if (!this.batchSnapshotContext) {
        this.batchSnapshotContext = this.batchSnapshotCanvas.getContext("2d");
      }
      const ctx = this.batchSnapshotContext;
      if (!ctx) return;

      const chartSize = this.prepareSquareCanvas(this.batchSnapshotCanvas, 420);
      const width = chartSize.size;
      const height = chartSize.size;
      const pad = 10;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 252, 246, 0.94)";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(15, 118, 110, 0.09)";
      ctx.lineWidth = 1;
      const spacing = Math.max(16, Math.floor((height - pad * 2) / 7));
      for (let position = pad; position <= height - pad; position += spacing) {
        ctx.beginPath();
        ctx.moveTo(pad, position);
        ctx.lineTo(width - pad, position);
        ctx.stroke();
      }
      for (let position = pad; position <= width - pad; position += spacing) {
        ctx.beginPath();
        ctx.moveTo(position, pad);
        ctx.lineTo(position, height - pad);
        ctx.stroke();
      }

      const size = Math.max(1, snapshot.canvasSize || 1);
      const mapX = (x) => pad + this.clamp(x / size, 0, 1) * (width - pad * 2);
      const mapY = (y) => pad + this.clamp(y / size, 0, 1) * (height - pad * 2);

      ctx.strokeStyle = "rgba(185, 28, 28, 0.35)";
      ctx.lineWidth = 1.1;
      snapshot.pairs.forEach((pair) => {
        const first = snapshot.agents[pair.agent1];
        const second = snapshot.agents[pair.agent2];
        if (!first || !second) return;
        ctx.beginPath();
        ctx.moveTo(mapX(first.x), mapY(first.y));
        ctx.lineTo(mapX(second.x), mapY(second.y));
        ctx.stroke();
      });

      const radius = Math.max(1.7, Math.min(3.8, (height - pad * 2) / 46));
      snapshot.agents.forEach((agent) => {
        ctx.beginPath();
        ctx.arc(mapX(agent.x), mapY(agent.y), radius, 0, Math.PI * 2);
        ctx.fillStyle = agent.matched ? "#22c55e" : this.getAgentColor(agent.attractiveness);
        ctx.fill();
      });

      const model = meta && meta.modelName ? meta.modelName : "Unknown";
      const runLabel = meta ? meta.runIndex + "/" + meta.runCount : "-";
      if (this.batchSnapshotNote) {
        this.batchSnapshotNote.textContent =
          "Representative " + model + " snapshot from batch sample " + runLabel +
          ". Rendered with true square proportions; this is illustrative and not a mean grid.";
      }
    }

    createBatchHeatAccumulator(columns, rows) {
      return {
        columns,
        rows,
        grid: Array.from({ length: rows }, () => Array(columns).fill(0)),
        samples: 0,
        pairEvents: 0,
      };
    }

    resetBatchHeatmap(noteText) {
      if (!this.batchHeatmapCanvas) return;
      const ctx = this.batchHeatmapCanvas.getContext("2d");
      if (!ctx) return;

      const chartSize = this.prepareHiDPICanvas(this.batchHeatmapCanvas, 170);
      ctx.clearRect(0, 0, chartSize.width, chartSize.height);
      ctx.fillStyle = "rgba(255, 252, 246, 0.92)";
      ctx.fillRect(0, 0, chartSize.width, chartSize.height);
      ctx.fillStyle = "#5e4d3f";
      ctx.font = "12px Instrument Sans, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Pairing hotspot map will appear after sampled runs.", 10, 18);

      if (this.batchHeatmapNote && noteText) {
        this.batchHeatmapNote.textContent = noteText;
      }
    }

    accumulateBatchHeatmap(accumulator, snapshot) {
      if (!accumulator || !snapshot || !snapshot.agents || !snapshot.agents.length) return;

      const columns = accumulator.columns;
      const rows = accumulator.rows;
      const size = snapshot.canvasSize || 1;

      snapshot.pairs.forEach((pair) => {
        const first = snapshot.agents[pair.agent1];
        const second = snapshot.agents[pair.agent2];
        if (!first || !second) return;
        const midpointX = (first.x + second.x) / 2;
        const midpointY = (first.y + second.y) / 2;
        const xNorm = this.clamp(midpointX / Math.max(1, size), 0, 0.9999);
        const yNorm = this.clamp(midpointY / Math.max(1, size), 0, 0.9999);
        const col = Math.floor(xNorm * columns);
        const row = Math.floor(yNorm * rows);
        accumulator.grid[row][col] += 1;
        accumulator.pairEvents += 1;
      });

      accumulator.samples += 1;
    }

    drawBatchHeatmap(accumulator, meta) {
      if (!this.batchHeatmapCanvas || !accumulator) return;
      if (!this.batchHeatmapContext) {
        this.batchHeatmapContext = this.batchHeatmapCanvas.getContext("2d");
      }
      const ctx = this.batchHeatmapContext;
      if (!ctx) return;

      const chartSize = this.prepareHiDPICanvas(this.batchHeatmapCanvas, 170);
      const width = chartSize.width;
      const height = chartSize.height;
      const pad = 10;
      const innerWidth = width - pad * 2;
      const innerHeight = height - pad * 2;
      const cellW = innerWidth / accumulator.columns;
      const cellH = innerHeight / accumulator.rows;

      if (!accumulator.pairEvents) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(255, 252, 246, 0.94)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#5e4d3f";
        ctx.font = "12px Instrument Sans, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("No pair hotspots yet (few or no matches in sampled runs).", 10, 18);
        if (this.batchHeatmapNote) {
          this.batchHeatmapNote.textContent =
            "Pairing hotspot map: no matched-pair events accumulated yet.";
        }
        this.batchHeatmapHoverData = null;
        this.hideHazardTooltip(this.batchHeatmapTooltip);
        return;
      }

      let maxCellCount = 0;
      accumulator.grid.forEach((row) => {
        row.forEach((count) => {
          maxCellCount = Math.max(maxCellCount, count);
        });
      });

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 252, 246, 0.94)";
      ctx.fillRect(0, 0, width, height);

      for (let row = 0; row < accumulator.rows; row += 1) {
        for (let col = 0; col < accumulator.columns; col += 1) {
          const intensity = maxCellCount > 0 ? accumulator.grid[row][col] / maxCellCount : 0;
          const alpha = 0.08 + 0.85 * intensity;
          const x = pad + col * cellW;
          const y = pad + row * cellH;
          ctx.fillStyle = "rgba(185, 130, 54, " + alpha.toFixed(3) + ")";
          ctx.fillRect(x, y, cellW, cellH);
        }
      }

      ctx.strokeStyle = "rgba(79, 57, 36, 0.22)";
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, innerWidth, innerHeight);

      const processed = meta && typeof meta.processed === "number" ? meta.processed : accumulator.samples;
      const total = meta && typeof meta.total === "number" ? meta.total : accumulator.samples;

      this.batchHeatmapHoverData = {
        pad,
        innerWidth,
        innerHeight,
        cellW,
        cellH,
        rows: accumulator.rows,
        columns: accumulator.columns,
        grid: accumulator.grid,
        pairEvents: accumulator.pairEvents,
        maxCellCount,
      };

      if (this.batchHeatmapNote) {
        this.batchHeatmapNote.textContent =
          "Pairing hotspots from " + processed + "/" + total +
          " sampled runs, based on " + accumulator.pairEvents +
          " matched-pair events. Brighter cells mark stronger concentration of pair formation.";
      }
    }

    bindBatchHeatmapTooltipEvents() {
      if (!this.batchHeatmapCanvas || !this.batchHeatmapTooltip) return;

      this.batchHeatmapCanvas.addEventListener("mousemove", (event) => this.handleBatchHeatmapTooltipMove(event));
      this.batchHeatmapCanvas.addEventListener("mouseleave", () => this.hideHazardTooltip(this.batchHeatmapTooltip));
    }

    handleBatchHeatmapTooltipMove(event) {
      if (!this.batchHeatmapCanvas || !this.batchHeatmapTooltip || !this.batchHeatmapHoverData) {
        return;
      }

      const hoverData = this.batchHeatmapHoverData;
      const rect = this.batchHeatmapCanvas.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;

      const inBounds =
        localX >= hoverData.pad &&
        localX <= hoverData.pad + hoverData.innerWidth &&
        localY >= hoverData.pad &&
        localY <= hoverData.pad + hoverData.innerHeight;

      if (!inBounds) {
        this.hideHazardTooltip(this.batchHeatmapTooltip);
        return;
      }

      const col = this.clamp(Math.floor((localX - hoverData.pad) / hoverData.cellW), 0, hoverData.columns - 1);
      const row = this.clamp(Math.floor((localY - hoverData.pad) / hoverData.cellH), 0, hoverData.rows - 1);
      const count = hoverData.grid[row][col] || 0;
      const sharePercent = hoverData.pairEvents > 0 ? (count / hoverData.pairEvents) * 100 : 0;
      const intensityPercent = hoverData.maxCellCount > 0 ? (count / hoverData.maxCellCount) * 100 : 0;

      this.batchHeatmapTooltip.innerHTML =
        "Cell r" + (row + 1) + ", c" + (col + 1) + "<br>" +
        "Pair events: " + count + "<br>" +
        "Share of events: " + sharePercent.toFixed(2) + "%<br>" +
        "Relative intensity: " + intensityPercent.toFixed(1) + "%";

      const parentRect = this.batchHeatmapCanvas.parentElement
        ? this.batchHeatmapCanvas.parentElement.getBoundingClientRect()
        : rect;
      const tooltipX = event.clientX - parentRect.left + 12;
      const tooltipY = event.clientY - parentRect.top - 8;
      this.batchHeatmapTooltip.style.left = Math.min(tooltipX, parentRect.width - 240) + "px";
      this.batchHeatmapTooltip.style.top = Math.max(tooltipY, 24) + "px";
      this.batchHeatmapTooltip.classList.add("is-visible");
    }

    stopBatchGhostAnimation() {
      if (this.batchGhostAnimationId) {
        window.cancelAnimationFrame(this.batchGhostAnimationId);
        this.batchGhostAnimationId = null;
      }
    }

    formatBatchDuration(ms) {
      if (!isFinite(ms) || ms <= 0) return "0.0s";
      if (ms < 1000) return (ms / 1000).toFixed(1) + "s";
      const seconds = Math.round(ms / 1000);
      if (seconds < 60) return seconds + "s";
      const minutes = Math.floor(seconds / 60);
      const remSeconds = seconds % 60;
      return minutes + "m " + remSeconds + "s";
    }

    updateBatchProgress({ phase, processed, total, batchStartMs, metricsList, recentInteractions }) {
      if (!this.batchProgress) return;

      const safeTotal = total > 0 ? total : 1;
      const clampedProcessed = this.clamp(processed, 0, safeTotal);
      const ratio = clampedProcessed / safeTotal;
      const nowMs = performance.now ? performance.now() : Date.now();
      const elapsedMs = Math.max(0, nowMs - batchStartMs);
      const etaMs = clampedProcessed > 0 ? (elapsedMs / clampedProcessed) * (safeTotal - clampedProcessed) : 0;
      const rollingPairs = metricsList.length
        ? metricsList.reduce((sum, metric) => sum + metric.pairCount, 0) / metricsList.length
        : 0;
      const rollingStrength = metricsList.length
        ? metricsList.reduce((sum, metric) => sum + metric.matchingStrength, 0) / metricsList.length
        : 0;
      const rollingSearch = metricsList.length
        ? metricsList.reduce((sum, metric) => sum + metric.averageSearchSteps, 0) / metricsList.length
        : 0;

      if (this.batchProgressLabel) {
        this.batchProgressLabel.textContent = clampedProcessed >= safeTotal ? "Batch complete" : "Batch progress";
      }
      if (this.batchProgressCount) {
        this.batchProgressCount.textContent = clampedProcessed + "/" + safeTotal;
      }
      if (this.batchProgressPhase) {
        this.batchProgressPhase.textContent = phase;
      }
      if (this.batchProgressFill) {
        this.batchProgressFill.style.width = (ratio * 100).toFixed(1) + "%";
      }
      if (this.batchProgressEta) {
        if (clampedProcessed >= safeTotal) {
          this.batchProgressEta.textContent = "Elapsed " + this.formatBatchDuration(elapsedMs);
        } else {
          this.batchProgressEta.textContent =
            "Elapsed " +
            this.formatBatchDuration(elapsedMs) +
            " | ETA " +
            this.formatBatchDuration(etaMs);
        }
      }
      if (this.batchProgressInteractions) {
        this.batchProgressInteractions.textContent = "Sampled interactions: " + recentInteractions;
      }
      if (this.batchProgressPairs) {
        this.batchProgressPairs.textContent =
          "Rolling pairs mean: " + (metricsList.length ? rollingPairs.toFixed(1) : "-");
      }
      if (this.batchProgressStrength) {
        this.batchProgressStrength.textContent =
          "Rolling strength mean: " + (metricsList.length ? rollingStrength.toFixed(2) : "-");
      }
      if (this.batchProgressSearch) {
        this.batchProgressSearch.textContent =
          "Rolling search mean: " + (metricsList.length ? rollingSearch.toFixed(1) : "-");
      }
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

    showBatchSummary(runCount, pairStats, strengthStats, searchStats, spatialStats, nonSpatialStats) {
      if (!this.batchSummary) return;

      this.batchSummary.innerHTML =
        "<ul class=\"batch-summary-list\">" +
        "<li><strong>Batch n=" + runCount + "</strong></li>" +
        "<li>Pairs mean: " + pairStats.mean.toFixed(1) +
        " (95% CI " + pairStats.ciLow.toFixed(1) + " to " + pairStats.ciHigh.toFixed(1) + ")</li>" +
        "<li>Strength mean: " + strengthStats.mean.toFixed(2) +
        " (95% CI " + strengthStats.ciLow.toFixed(2) + " to " + strengthStats.ciHigh.toFixed(2) + ")</li>" +
        "<li>Avg search mean: " + searchStats.mean.toFixed(1) +
        " (95% CI " + searchStats.ciLow.toFixed(1) + " to " + searchStats.ciHigh.toFixed(1) + ")</li>" +
        "<li>Spatial r: " + spatialStats.mean.toFixed(2) +
        " (95% CI " + spatialStats.ciLow.toFixed(2) + " to " + spatialStats.ciHigh.toFixed(2) + ")</li>" +
        "<li>Non-spatial r: " + nonSpatialStats.mean.toFixed(2) +
        " (95% CI " + nonSpatialStats.ciLow.toFixed(2) + " to " + nonSpatialStats.ciHigh.toFixed(2) + ")</li>" +
        "<li><strong>Note:</strong> Batch values are aggregate statistics and are not added to Run Comparison rows.</li>" +
        "</ul>";
      this.batchSummary.classList.add("is-visible");
    }

    handleControlChange() {
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }

      this.updateAcceptanceBiasEffect();
      this.updateViewRadiusControlState();
      this.updateViewRadiusEffect();

      this.debounceTimer = window.setTimeout(() => {
        this.debounceTimer = null;

        if (!this.state.isRunning) {
          this.seedPreview();
          this.updateStatus();
          this.updateDecisionStatus();
        }
      }, 400);
    }

    handleViewRadiusChange() {
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      this.updateViewRadiusControlState();
      this.updateViewRadiusEffect();
      this.updateStatus();
      this.updateInspectionPanel();
      this.draw();
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
          trail: [],
          lastDecision: null,
          isInteracting: false,
        });
      }

      return agents;
    }

    animate(runImmediate) {
      if (!this.state.isRunning) return;

      if (runImmediate) {
        this.advanceOneSimulationFrame();
      }

      const delayMs = Math.max(24, Math.round(220 / this.getSpeedMultiplier()));
      this.stopStepping();
      this.stepTimer = window.setTimeout(() => {
        this.stepTimer = null;
        if (!this.state.isRunning) return;
        this.advanceOneSimulationFrame();
        if (this.state.isRunning) {
          this.animate(false);
        }
      }, delayMs);
    }

    advanceOneSimulationFrame() {
      if (this.state.step >= STEP_COUNT) {
        this.finishRun();
        return;
      }

      this.stepSimulation();
      this.state.step += 1;
      this.draw();
      this.updateStatus();
      this.updateDecisionStatus();

      if (this.state.step >= STEP_COUNT) {
        this.finishRun();
      }
    }

    stepSimulation() {
      const currentStep = this.state.step + 1;

      this.state.interactionQueue = this.state.interactionQueue
        .map((interaction) => ({ ...interaction, ttl: interaction.ttl - 1 }))
        .filter((interaction) => interaction.ttl > 0);
      this.state.rippleQueue = this.state.rippleQueue
        .map((ripple) => ({ ...ripple, ttl: ripple.ttl - 1 }))
        .filter((ripple) => ripple.ttl > 0);

      this.state.agents.forEach((agent) => {
        agent.isInteracting = false;
      });

      const modelType = this.modelTypeSelect ? this.modelTypeSelect.value : "Spatial";
      if (modelType === "Non-Spatial") {
        this.resolveNonSpatialEncounters(currentStep);
      } else {
        this.moveAgents();
        this.resolveSpatialEncounters(currentStep);
      }

      this.state.agents.forEach((agent) => {
        if (!agent.matched) {
          agent.searchSteps += 1;
        }
      });

      this.state.pairDecisionCorrelation = this.computeDecisionCorrelation();
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

        agent.trail.push({ x: agent.x, y: agent.y });
        if (agent.trail.length > 6) {
          agent.trail.shift();
        }

        agent.x = this.clamp(agent.x + this.randomFloat(-movementRange, movementRange), padding, size - padding);
        agent.y = this.clamp(agent.y + this.randomFloat(-movementRange, movementRange), padding, size - padding);
      });
    }

    resolveSpatialEncounters(currentStep) {
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

          if (this.getDistance(agent, candidate) > this.getEncounterDistance()) {
            continue;
          }

          const outcome = this.evaluateEncounter(agent, candidate);
          this.registerInteraction(agent, candidate, outcome, currentStep);

          if (outcome.acceptA && outcome.acceptB) {
            this.matchAgents(agent, candidate, currentStep);
            break;
          }
        }
      }
    }

    resolveNonSpatialEncounters(currentStep) {
      const bag = this.shuffle(this.state.agents.filter((agent) => !agent.matched));
      for (let index = 0; index < bag.length - 1; index += 2) {
        const first = bag[index];
        const second = bag[index + 1];
        if (!first || !second || first.matched || second.matched) continue;
        const outcome = this.evaluateEncounter(first, second);
        this.registerInteraction(first, second, outcome, currentStep);
        if (outcome.acceptA && outcome.acceptB) {
          this.matchAgents(first, second, currentStep);
        }
      }
    }

    evaluateEncounter(agent, candidate) {
      const preferenceRule = this.preferenceSelect.value;
      const agentAcceptance = this.getAcceptanceScore(agent, candidate, preferenceRule);
      const candidateAcceptance = this.getAcceptanceScore(candidate, agent, preferenceRule);

      const acceptA = this.random() < agentAcceptance;
      const acceptB = this.random() < candidateAcceptance;
      return {
        acceptA,
        acceptB,
        outcome: acceptA && acceptB ? "both-accept" : acceptA ? "a-accepts" : acceptB ? "b-accepts" : "both-reject",
      };
    }

    registerInteraction(agent, candidate, outcome, currentStep) {
      this.state.interactionQueue.push({
        agentA: agent.id,
        agentB: candidate.id,
        step: currentStep,
        ttl: 8,
        outcome: outcome.outcome,
      });

      agent.isInteracting = true;
      candidate.isInteracting = true;
      agent.lastDecision = outcome.acceptA ? "accept" : "reject";
      candidate.lastDecision = outcome.acceptB ? "accept" : "reject";

      if (outcome.outcome === "both-accept") this.state.decisionStats.bothAccept += 1;
      else if (outcome.outcome === "a-accepts") this.state.decisionStats.aAcceptsOnly += 1;
      else if (outcome.outcome === "b-accepts") this.state.decisionStats.bAcceptsOnly += 1;
      else this.state.decisionStats.bothReject += 1;

      this.state.interactionEvents.push({
        step: currentStep,
        acceptA: outcome.acceptA ? 1 : 0,
        acceptB: outcome.acceptB ? 1 : 0,
      });

      const color = outcome.outcome === "both-accept"
        ? "rgba(22, 163, 74, 0.55)"
        : outcome.outcome === "both-reject"
        ? "rgba(185, 28, 28, 0.5)"
        : "rgba(17, 24, 39, 0.45)";
      this.state.rippleQueue.push({ x: agent.x, y: agent.y, ttl: 10, color });
      this.state.rippleQueue.push({ x: candidate.x, y: candidate.y, ttl: 10, color });
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
      this.stopStepping();
      this.state.isRunning = false;
      this.runButton.disabled = false;
      this.runButton.textContent = "Start Simulation";
      if (this.stepButton) this.stepButton.disabled = false;
      this.lastTopic = null;
      this.lastQuestionType = null;
      this.topicDepth = 0;
      this.updateStatus(true);
      this.updateDecisionStatus();
      this.updateTeachingExplanation();
      this.recordRunForComparison("Single");
      this.setExportEnabled(true);
      this.updateSummaryBar();
      this.updateRunInterpretation(this.buildPreviewReportData());
      this.autoOpenPreviewReport();
      this.draw();
    }

    autoOpenPreviewReport() {
      const csv = this.buildRunCsvText();
      if (!csv) return;
      this.showCsvPreview(csv);

      if (this.csvPreview && this.csvPreview.scrollIntoView) {
        this.csvPreview.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    scrollToSimulationGrid() {
      if (this.simulationGridSection && this.simulationGridSection.scrollIntoView) {
        const rect = this.simulationGridSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const alreadyVisible = rect.top >= 0 && rect.bottom <= viewportHeight;
        if (alreadyVisible) {
          return;
        }
        this.simulationGridSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    updateStatus(isComplete = false) {
      const matchedCount = this.state.agents.filter((agent) => agent.matched).length;
      const pairCount = this.state.pairs.length;
      const modelType = this.modelTypeSelect ? this.modelTypeSelect.value : "Spatial";

      this.updateRunStateChips(isComplete);

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
        if (this.state.step === 0) {
          this.status.textContent =
            "Ready to simulate density, mobility, and mate choice encounters.";
          return;
        }
        this.status.textContent =
          "Paused at step " +
          this.state.step +
          ". Model: " +
          modelType +
          ". Use Step +1 for frame-by-frame decisions.";
        return;
      }

      this.status.textContent =
        "Running step " +
        this.state.step +
        " of " +
        STEP_COUNT +
        ": " +
        pairCount +
        " pairs formed so far (" +
        modelType +
        ", speed x" +
        this.getSpeedMultiplier().toFixed(1) +
        ").";
    }

    updateRunStateChips(isComplete = false) {
      if (!this.runStateChip || !this.runStepChip) return;

      let stateLabel = "Idle";
      let stateClass = "idle";

      if (isComplete || this.state.step >= STEP_COUNT) {
        stateLabel = "Complete";
        stateClass = "complete";
      } else if (this.state.isRunning) {
        stateLabel = "Running";
        stateClass = "running";
      } else if (this.state.step > 0) {
        stateLabel = "Paused";
        stateClass = "paused";
      }

      this.runStateChip.textContent = stateLabel;
      this.runStateChip.className = "run-meta-chip run-meta-state " + stateClass;
      this.runStepChip.textContent = this.state.step + "/" + STEP_COUNT;
    }

    updateDecisionStatus() {
      if (!this.decisionStatus) return;
      const stats = this.state.decisionStats;
      const total = stats.bothAccept + stats.aAcceptsOnly + stats.bAcceptsOnly + stats.bothReject;
      const toPercent = (value) => (total > 0 ? (value / total) * 100 : 0);

      this.decisionStatus.textContent =
        "Decisions: both accept " +
        stats.bothAccept +
        ", A only " +
        stats.aAcceptsOnly +
        ", B only " +
        stats.bAcceptsOnly +
        ", both reject " +
        stats.bothReject +
        ". Pair decision correlation r=" +
        this.state.pairDecisionCorrelation.toFixed(2) +
        ".";

      if (this.barBothAccept) this.barBothAccept.style.width = toPercent(stats.bothAccept).toFixed(1) + "%";
      if (this.barAOnly) this.barAOnly.style.width = toPercent(stats.aAcceptsOnly).toFixed(1) + "%";
      if (this.barBOnly) this.barBOnly.style.width = toPercent(stats.bAcceptsOnly).toFixed(1) + "%";
      if (this.barBothReject) this.barBothReject.style.width = toPercent(stats.bothReject).toFixed(1) + "%";
    }

    draw() {
      const size = this.getCanvasSize();

      this.context.clearRect(0, 0, size, size);
      this.drawGrid(size);
      this.drawTrails();
      this.drawActiveInteractions();
      this.drawRipples();
      this.drawPairs();
      this.drawInspectionOverlay();
      this.drawAgents();
      this.drawSimulationLegend(size);
      this.updateInspectionPanel();
    }

    drawInspectionOverlay() {
      const selectedAgent = this.getSelectedAgent();
      const isSpatial = !this.modelTypeSelect || this.modelTypeSelect.value === "Spatial";
      if (!selectedAgent || !isSpatial) {
        return;
      }

      const visibleCandidates = this.getVisibleCandidatesForAgent(selectedAgent);
      const radius = this.getEncounterDistance();

      this.context.save();
      this.context.beginPath();
      this.context.arc(selectedAgent.x, selectedAgent.y, radius, 0, Math.PI * 2);
      this.context.fillStyle = "rgba(79, 70, 229, 0.08)";
      this.context.fill();
      this.context.setLineDash([8, 6]);
      this.context.strokeStyle = "rgba(79, 70, 229, 0.42)";
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.setLineDash([]);

      visibleCandidates.forEach((candidate) => {
        this.context.beginPath();
        this.context.arc(candidate.x, candidate.y, AGENT_RADIUS + 4.5, 0, Math.PI * 2);
        this.context.fillStyle = "rgba(245, 158, 11, 0.14)";
        this.context.fill();
        this.context.strokeStyle = "rgba(245, 158, 11, 0.82)";
        this.context.lineWidth = 1.5;
        this.context.stroke();
      });

      this.context.restore();
    }

    drawSimulationLegend(size) {
      const panelX = 10;
      const panelY = 10;
      const panelW = Math.min(240, size * 0.72);
      const panelH = 102;

      this.context.save();
      this.context.fillStyle = "rgba(255, 255, 255, 0.88)";
      this.context.strokeStyle = "rgba(31, 26, 23, 0.18)";
      this.context.lineWidth = 1;
      this.context.beginPath();
      this.context.roundRect(panelX, panelY, panelW, panelH, 10);
      this.context.fill();
      this.context.stroke();

      this.context.fillStyle = "#1f1a17";
      this.context.font = "600 11px Instrument Sans, sans-serif";
      this.context.fillText("Legend", panelX + 10, panelY + 16);

      const rowStartY = panelY + 30;
      const rowGap = 16;
      const dotX = panelX + 14;
      const textX = panelX + 26;

      const drawDot = (y, color, label) => {
        this.context.beginPath();
        this.context.arc(dotX, y, 4, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.fill();
        this.context.fillStyle = "#1f1a17";
        this.context.font = "10px Instrument Sans, sans-serif";
        this.context.fillText(label, textX, y + 3);
      };

      drawDot(rowStartY, this.getAgentColor(5), "Blue = neutral");
      drawDot(rowStartY + rowGap, "#16a34a", "Green = accepted/matched");
      drawDot(rowStartY + rowGap * 2, "#b91c1c", "Red = rejected");

      const lineY = rowStartY + rowGap * 3;
      this.context.beginPath();
      this.context.moveTo(dotX - 4, lineY);
      this.context.lineTo(dotX + 10, lineY);
      this.context.strokeStyle = "#111827";
      this.context.lineWidth = 2;
      this.context.stroke();
      this.context.fillStyle = "#1f1a17";
      this.context.fillText("Black = interaction", textX, lineY + 3);

      this.context.beginPath();
      this.context.moveTo(panelX + 126, lineY);
      this.context.lineTo(panelX + 142, lineY);
      this.context.strokeStyle = "#ff4d4d";
      this.context.lineWidth = 2.5;
      this.context.stroke();
      this.context.fillText("Red line = paired", panelX + 148, lineY + 3);
      this.context.restore();
    }

    drawTrails() {
      this.state.agents.forEach((agent) => {
        if (!agent.trail || agent.trail.length < 2) return;
        for (let index = 1; index < agent.trail.length; index += 1) {
          const from = agent.trail[index - 1];
          const to = agent.trail[index];
          const alpha = (index / agent.trail.length) * 0.22;
          this.context.beginPath();
          this.context.moveTo(from.x, from.y);
          this.context.lineTo(to.x, to.y);
          this.context.strokeStyle = "rgba(15, 118, 110, " + alpha.toFixed(3) + ")";
          this.context.lineWidth = 1.1;
          this.context.stroke();
        }
      });
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

    drawActiveInteractions() {
      this.state.interactionQueue.forEach((interaction) => {
        const first = this.state.agents[interaction.agentA];
        const second = this.state.agents[interaction.agentB];
        if (!first || !second) return;

        const progress = this.clamp((8 - interaction.ttl) / 8, 0.08, 1);
        const x = first.x + (second.x - first.x) * progress;
        const y = first.y + (second.y - first.y) * progress;
        const pulse = 1 + 0.2 * Math.sin((8 - interaction.ttl) * 0.8);

        this.context.beginPath();
        this.context.moveTo(first.x, first.y);
        this.context.lineTo(x, y);
        this.context.strokeStyle = "rgba(0, 0, 0, " + this.clamp(0.25 + interaction.ttl / 8, 0.25, 0.9) + ")";
        this.context.lineWidth = (1.2 + (interaction.ttl / 8) * 2.4) * pulse;
        this.context.stroke();
      });
    }

    drawRipples() {
      this.state.rippleQueue.forEach((ripple) => {
        const progress = 1 - ripple.ttl / 10;
        const radius = AGENT_RADIUS + progress * 10;
        this.context.beginPath();
        this.context.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        this.context.strokeStyle = ripple.color.replace(/0\.[0-9]+\)/, (0.45 * (1 - progress)).toFixed(3) + ")");
        this.context.lineWidth = 1.4;
        this.context.stroke();
      });
    }

    drawAgents() {
      const selectedAgent = this.getSelectedAgent();
      const visibleCandidateIds = new Set(this.getVisibleCandidatesForAgent(selectedAgent).map((agent) => agent.id));

      this.state.agents.forEach((agent) => {
        if (visibleCandidateIds.has(agent.id)) {
          this.context.beginPath();
          this.context.arc(agent.x, agent.y, AGENT_RADIUS + 4.5, 0, Math.PI * 2);
          this.context.strokeStyle = "rgba(245, 158, 11, 0.88)";
          this.context.lineWidth = 1.4;
          this.context.stroke();
        }

        this.context.beginPath();
        this.context.arc(agent.x, agent.y, AGENT_RADIUS, 0, Math.PI * 2);
        this.context.fillStyle = this.getAgentFillColor(agent);
        this.context.fill();

        if (selectedAgent && agent.id === selectedAgent.id) {
          this.context.lineWidth = 2.4;
          this.context.strokeStyle = "#4f46e5";
        } else {
          this.context.lineWidth = 1;
          this.context.strokeStyle = "rgba(31, 26, 23, 0.18)";
        }
        this.context.stroke();

        if (selectedAgent && agent.id === selectedAgent.id) {
          this.context.beginPath();
          this.context.arc(agent.x, agent.y, AGENT_RADIUS + 5.8, 0, Math.PI * 2);
          this.context.strokeStyle = "rgba(79, 70, 229, 0.28)";
          this.context.lineWidth = 2.4;
          this.context.stroke();
        }
      });
    }

    getAgentFillColor(agent) {
      if (agent.isInteracting) return "#111827";
      if (agent.lastDecision === "accept") return "#16a34a";
      if (agent.lastDecision === "reject") return "#b91c1c";
      if (agent.matched) return "#22c55e";
      return this.getAgentColor(agent.attractiveness);
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

    getDensityCount() {
      return this.getActiveAgentCount();
    }

    getEncounterDistance() {
      const densityLevel = this.densitySelect ? this.densitySelect.value : "Normal";
      return this.getEncounterDistanceForDensity(densityLevel);
    }

    getEncounterDistanceForDensity(densityLevel, explicitViewRadiusMultiplier) {
      const densityMultiplier = densityLevel === "Sparse" ? 0.85 : densityLevel === "Dense" ? 1.2 : 1;
      const radiusMultiplier =
        typeof explicitViewRadiusMultiplier === "number"
          ? explicitViewRadiusMultiplier
          : this.getViewRadiusMultiplier();
      return ENCOUNTER_DISTANCE * densityMultiplier * radiusMultiplier;
    }

    computeDecisionCorrelation() {
      if (!this.state.interactionEvents.length) return 0;
      const xs = this.state.interactionEvents.map((event) => event.acceptA);
      const ys = this.state.interactionEvents.map((event) => event.acceptB);
      if (xs.length < 2) return 0;

      const n = xs.length;
      const sumX = xs.reduce((acc, value) => acc + value, 0);
      const sumY = ys.reduce((acc, value) => acc + value, 0);
      const sumXX = xs.reduce((acc, value) => acc + value * value, 0);
      const sumYY = ys.reduce((acc, value) => acc + value * value, 0);
      const sumXY = xs.reduce((acc, value, index) => acc + value * ys[index], 0);
      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
      if (!denominator) return 0;
      return this.clamp(numerator / denominator, -1, 1);
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
          this.state.lastRun.preferenceRule.toLowerCase() +
          ", radius x" +
          (this.state.lastRun.viewRadiusMultiplier || 1).toFixed(1)
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
        return TeachingContent.buildCapabilityMessage(!!this.state.lastRun);
      }

      buildOutOfScopeReply() {
        return TeachingContent.buildOutOfScopeReply();
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
      const strong = document.createElement("strong");
      strong.textContent = author + ":";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(" " + text));
      this.chatLog.appendChild(p);
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }


    buildChatReply(text) {
      const normalizeDensity = (densityLevel) =>
        densityLevel === "Sparse" ? "Low Density" : densityLevel === "Dense" ? "High Density" : "Normal Density";
      const normalizeMobility = (mobilityLevel) =>
        mobilityLevel === "Low" ? "Low Mobility" : mobilityLevel === "High" ? "High Mobility" : "Medium Mobility";

      const intent = ChatEngine.detectIntent(text);
      const detectedTopic = ChatEngine.detectTopic(text);
      this.lastQuestionType = intent;

      if (detectedTopic) {
        this.topicDepth = this.lastTopic === detectedTopic ? this.topicDepth + 1 : 1;
        this.lastTopic = detectedTopic;
      }

      this.conversationHistory.push({
        userInput: text,
        intent,
        topic: detectedTopic || this.lastTopic,
        timestamp: Date.now(),
      });

      const hasRun = !!this.state.lastRun;
      const metrics = hasRun
        ? {
            ...this.state.lastRun.metrics,
            pairs: this.state.pairs,
            agents: this.state.agents,
          }
        : null;

      const densityLevel = hasRun ? normalizeDensity(this.state.lastRun.densityLevel) : "Normal Density";
      const mobilityLevel = hasRun ? normalizeMobility(this.state.lastRun.mobilityLevel) : "Medium Mobility";
      const preferenceRule = hasRun ? this.state.lastRun.preferenceRule : "Attractiveness-based";

      return ChatEngine.buildChatReply(
        text,
        metrics,
        hasRun,
        densityLevel,
        mobilityLevel,
        preferenceRule,
        this.lastTopic,
        this.topicDepth
      );
    }

    resetTeachingExplanation() {
      this.teachingExplanation.textContent = this.getTeachingPlaceholderText();
      this.addChatMessage(
        "Assistant",
        "Ready to discuss results. Run the simulation or ask how mobility, density, and preference rules connect to Smaldino & Schank (2012)."
      );
      this.setExportEnabled(false);
      this.renderInsightQuestions();
    }

    setSimpleMode(enabled, options = {}) {
      const { announceInChat = false, refreshTeachingPanel = false } = options;
      this.simpleMode = !!enabled;

      if (this.chatSimpleToggle && this.chatSimpleToggle.checked !== this.simpleMode) {
        this.chatSimpleToggle.checked = this.simpleMode;
      }
      if (this.teachingSimpleToggle && this.teachingSimpleToggle.checked !== this.simpleMode) {
        this.teachingSimpleToggle.checked = this.simpleMode;
      }

      if (refreshTeachingPanel) {
        this.refreshTeachingPanelNarrative();
      }

      if (announceInChat) {
        this.addChatMessage(
          "Assistant",
          this.simpleMode
            ? "Simple mode on: I’ll explain runs in everyday language before citing the paper."
            : "Simple mode off: I’ll give fuller technical references."
        );
      }
    }

    getTeachingPlaceholderText() {
      return TeachingContent.getTeachingPlaceholderText(this.simpleMode);
    }

    buildTeachingPanelNarrative(
      metrics,
      mobilityLevel,
      densityLevel,
      preferenceRule,
      selectivityLevel,
      patienceLevel,
      explorationLevel
    ) {
      const normalizeDensity = (level) =>
        level === "Sparse" ? "Low Density" : level === "Dense" ? "High Density" : "Normal Density";
      const normalizeMobility = (level) =>
        level === "Low" ? "Low Mobility" : level === "High" ? "High Mobility" : "Medium Mobility";
      const moduleMetrics = {
        ...metrics,
        pairs: this.state.pairs,
        agents: this.state.agents,
      };

      return TeachingContent.buildTeachingPanelNarrative(
        moduleMetrics,
        normalizeMobility(mobilityLevel),
        normalizeDensity(densityLevel),
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        explorationLevel,
        this.simpleMode
      );
    }

    refreshTeachingPanelNarrative() {
      if (!this.teachingExplanation) return;
      const lastRun = this.state && this.state.lastRun;
      if (!lastRun) {
        this.teachingExplanation.textContent = this.getTeachingPlaceholderText();
        return;
      }

      this.teachingExplanation.textContent = this.buildTeachingPanelNarrative(
        lastRun.metrics,
        lastRun.mobilityLevel,
        lastRun.densityLevel,
        lastRun.preferenceRule,
        lastRun.selectivityLevel,
        lastRun.patienceLevel,
        lastRun.explorationLevel
      );
    }

    updateTeachingExplanation() {
      const metrics = this.getSimulationMetrics();
      const preferenceRule = this.preferenceSelect.value;
      const mobilityLevel = this.mobilitySelect.value;
      const densityLevel = this.densitySelect.value;
      const selectivityLevel = this.selectivitySelect ? this.selectivitySelect.value : "Medium";
      const patienceLevel = this.patienceSelect ? this.patienceSelect.value : "Normal";
      const explorationLevel = this.explorationSelect ? this.explorationSelect.value : "Balanced";

      this.teachingExplanation.textContent = this.buildTeachingPanelNarrative(
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        explorationLevel
      );
      this.appendRunSummary(metrics, mobilityLevel, densityLevel, preferenceRule);
      
      // Use simple mode or technical citation based on user preference
      const normalizeDensity = (level) =>
        level === "Sparse" ? "Low Density" : level === "Dense" ? "High Density" : "Normal Density";
      const normalizeMobility = (level) =>
        level === "Low" ? "Low Mobility" : level === "High" ? "High Mobility" : "Medium Mobility";
      const moduleMetrics = {
        ...metrics,
        pairs: this.state.pairs,
        agents: this.state.agents,
      };

      const chatMessage = this.simpleMode
        ? TeachingContent.buildSimpleExplainMessage(
            moduleMetrics,
            normalizeDensity(densityLevel),
            normalizeMobility(mobilityLevel),
            preferenceRule
          )
        : this.buildRunCitationMessage(
            moduleMetrics,
            normalizeMobility(mobilityLevel),
            normalizeDensity(densityLevel),
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
        modelType: this.modelTypeSelect ? this.modelTypeSelect.value : "Spatial",
        agentCount: this.getActiveAgentCount(),
        viewRadiusMultiplier: this.getViewRadiusMultiplier(),
      };
      this.lastCitation = this.buildRunCitationMessage(
        moduleMetrics,
        normalizeMobility(mobilityLevel),
        normalizeDensity(densityLevel),
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

      const matchingStrength = this.computeInterPairCorrelation(this.state.agents, this.state.pairs);

      return {
        pairCount: this.state.pairs.length,
        matchedCount: matchedAgents.length,
        averageSearchSteps,
        matchingStrength,
        averagePairDifference: averageDifference,
        pairDecisionCorrelation: this.state.pairDecisionCorrelation,
        decisionStats: { ...this.state.decisionStats },
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
      const normalizeDensity = (level) =>
        level === "Sparse" ? "Low Density" : level === "Dense" ? "High Density" : "Normal Density";
      const normalizeMobility = (level) =>
        level === "Low" ? "Low Mobility" : level === "High" ? "High Mobility" : "Medium Mobility";
      const moduleMetrics = {
        ...metrics,
        pairs: this.state.pairs,
        agents: this.state.agents,
      };

      return TeachingContent.buildRunCitationMessage(
        moduleMetrics,
        normalizeMobility(mobilityLevel),
        normalizeDensity(densityLevel),
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        explorationLevel
      );
    }

    setExportEnabled(isEnabled) {
      ExportEngine.setExportEnabled(isEnabled, {
        previewCsvButton: this.previewCsvButton,
        downloadCsvButton: this.downloadCsvButton,
        downloadPngButton: this.downloadPngButton,
        copyCitationButton: this.copyCitationButton,
      });
      
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

      const normalizeDensity = (level) =>
        level === "Sparse" ? "Low Density" : level === "Dense" ? "High Density" : "Normal Density";
      const normalizeMobility = (level) =>
        level === "Low" ? "Low Mobility" : level === "High" ? "High Mobility" : "Medium Mobility";

      const exportMetrics = {
        pairs: this.state.pairs.map((pair) => ({ a: pair.agent1, b: pair.agent2 })),
        agents: this.state.agents.map((agent) => ({ id: agent.id, attr: agent.attractiveness })),
        matchingStrength: this.state.lastRun.metrics.matchingStrength,
        averageSearchSteps: this.state.lastRun.metrics.averageSearchSteps,
        matchedAgents: this.state.lastRun.metrics.matchedCount,
      };

      const exportSettings = {
        mobilityLevel: normalizeMobility(this.state.lastRun.mobilityLevel),
        densityLevel: normalizeDensity(this.state.lastRun.densityLevel),
        preferenceRule: this.state.lastRun.preferenceRule,
        modelType: this.state.lastRun.modelType || "Spatial",
        agentCount: this.state.lastRun.agentCount || this.state.agents.length,
        selectivityLevel: this.state.lastRun.selectivityLevel || "Medium",
        patienceLevel: this.state.lastRun.patienceLevel || "Normal",
        explorationLevel: this.state.lastRun.explorationLevel || "Balanced",
        viewRadiusMultiplier: this.state.lastRun.viewRadiusMultiplier || 1,
      };

      return ExportEngine.buildRunCsvText(exportMetrics, exportSettings);
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
      if (!this.state.lastRun) {
        this.addChatMessage("Assistant", "Run first, then download the summary.");
        return;
      }

      const normalizeDensity = (level) =>
        level === "Sparse" ? "Low Density" : level === "Dense" ? "High Density" : "Normal Density";
      const normalizeMobility = (level) =>
        level === "Low" ? "Low Mobility" : level === "High" ? "High Mobility" : "Medium Mobility";

      const exportMetrics = {
        pairs: this.state.pairs.map((pair) => ({ a: pair.agent1, b: pair.agent2 })),
        agents: this.state.agents.map((agent) => ({ id: agent.id, attr: agent.attractiveness })),
        matchingStrength: this.state.lastRun.metrics.matchingStrength,
        averageSearchSteps: this.state.lastRun.metrics.averageSearchSteps,
        matchedAgents: this.state.lastRun.metrics.matchedCount,
      };

      const exportSettings = {
        mobilityLevel: normalizeMobility(this.state.lastRun.mobilityLevel),
        densityLevel: normalizeDensity(this.state.lastRun.densityLevel),
        preferenceRule: this.state.lastRun.preferenceRule,
        modelType: this.state.lastRun.modelType || "Spatial",
        agentCount: this.state.lastRun.agentCount || this.state.agents.length,
        selectivityLevel: this.state.lastRun.selectivityLevel || "Medium",
        patienceLevel: this.state.lastRun.patienceLevel || "Normal",
        explorationLevel: this.state.lastRun.explorationLevel || "Balanced",
        viewRadiusMultiplier: this.state.lastRun.viewRadiusMultiplier || 1,
      };

      ExportEngine.downloadCsv(exportMetrics, exportSettings);
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

      const { metrics, mobilityLevel, densityLevel, preferenceRule, selectivityLevel, patienceLevel, explorationLevel, modelType, agentCount, viewRadiusMultiplier } = this.state.lastRun;
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
        modelType: modelType || (this.modelTypeSelect ? this.modelTypeSelect.value : "Spatial"),
        agentCount: agentCount || totalAgents,
        selectivityLevel: selectivityLevel || "Medium",
        patienceLevel: patienceLevel || "Normal",
        explorationLevel: explorationLevel || "Balanced",
        viewRadiusMultiplier: viewRadiusMultiplier || 1,
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
        modelType,
        agentCount,
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
          " in " +
          modelType.toLowerCase() +
          " mode with " +
          agentCount +
          " active agents" +
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
            ". Pair-decision correlation within encounters was " +
            metrics.pairDecisionCorrelation.toFixed(2) +
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
        const searchEfficiency =
          metrics.averageSearchSteps > 20
            ? "search was slow"
            : metrics.averageSearchSteps > 12
            ? "search was moderate"
            : "search was fast";

        const pairingResult =
          metrics.pairCount === 0
            ? "no stable pairs formed"
            : metrics.pairCount < Math.max(3, Math.floor(reportData.maxPairs * 0.35))
            ? "pair formation remained limited"
            : "pair formation was substantial";

        this.previewConclusionText.textContent =
          "Conclusion: Under " +
          reportData.densityLevel.toLowerCase() +
          " density, " +
          reportData.mobilityLevel.toLowerCase() +
          " mobility, and the " +
          reportData.preferenceRule.toLowerCase() +
          " rule, this run produced " +
          metrics.pairCount +
          " pairs with matching strength " +
          metrics.matchingStrength.toFixed(2) +
          ". Overall, the system was " +
          structureLabel +
          ": " +
          pairingResult +
          " and " +
          searchEfficiency +
          " (avg search " +
          metrics.averageSearchSteps.toFixed(1) +
          " steps). Use the hazard explorer to see which rule/movement combinations accelerate early matching, and use the pair-difference distribution to judge whether similarity came from strong preference filtering or local encounter constraints.";
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
        (reportData.metrics.matchingStrength + 1) / 2,
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
            " (Pearson r), " +
            "assortment appears " +
            structureLabel +
            ", and average search used " +
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
        viewRadiusMultiplier: reportData.viewRadiusMultiplier || 1,
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
      this.updateRecreatedFigureInsights(analyticsRows);
    }

    updateRecreatedFigureInsights(rows) {
      if (!rows || !rows.length) return;

      if (this.recreatedFigure5Insight) {
        this.recreatedFigure5Insight.textContent = AnalyticsEngine.generateFigure5Insight(rows);
      }

      if (this.recreatedFigure6Insight) {
        this.recreatedFigure6Insight.textContent = AnalyticsEngine.generateFigure6Insight(rows);
      }

      if (this.recreatedFigure7Insight) {
        this.recreatedFigure7Insight.textContent = AnalyticsEngine.generateFigure7Insight(rows);
      }
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
            modelType: settings.modelType || "Spatial",
            acceptanceBias: settings.acceptanceBias || 0,
            viewRadiusMultiplier: settings.viewRadiusMultiplier || 1,
          });
          const replacementResult = this.runSyntheticSimulation({
            preferenceRule: combo.preferenceRule,
            movementLevel: combo.explorationLevel,
            densityLevel: settings.densityLevel,
            mobilityLevel: settings.mobilityLevel,
            selectivityLevel: settings.selectivityLevel,
            patienceLevel: settings.patienceLevel,
            modelType: settings.modelType || "Spatial",
            acceptanceBias: settings.acceptanceBias || 0,
            viewRadiusMultiplier: settings.viewRadiusMultiplier || 1,
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
      const modelType = settings.modelType || "Spatial";
      const bias = typeof settings.acceptanceBias === "number" ? settings.acceptanceBias : 0;
      const encounterDistance = this.getEncounterDistanceForDensity(
        settings.densityLevel,
        settings.viewRadiusMultiplier || 1
      );

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
        if (modelType === "Spatial") {
          agents.forEach((agent) => {
            if (agent.matched) return;
            agent.x = this.clamp(agent.x + this.randomFloat(-movement, movement), padding, size - padding);
            agent.y = this.clamp(agent.y + this.randomFloat(-movement, movement), padding, size - padding);
          });
        }

        const unmatched = this.shuffle(agents.filter((agent) => !agent.matched));
        for (let i = 0; i < unmatched.length; i += 1) {
          const first = unmatched[i];
          if (first.matched) continue;

          const startJ = modelType === "Non-Spatial" ? i + 1 : i + 1;
          for (let j = startJ; j < unmatched.length; j += 1) {
            const second = unmatched[j];
            if (second.matched) continue;
            if (modelType === "Spatial" && this.getDistance(first, second) > encounterDistance) continue;

            const acceptFirst = this.getAcceptanceScoreWithSettings(
              first,
              second,
              settings.preferenceRule,
              settings.selectivityLevel,
              settings.patienceLevel,
              bias
            );
            const acceptSecond = this.getAcceptanceScoreWithSettings(
              second,
              first,
              settings.preferenceRule,
              settings.selectivityLevel,
              settings.patienceLevel,
              bias
            );

            if (this.random() < acceptFirst && this.random() < acceptSecond) {
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

            if (modelType === "Non-Spatial") {
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

    getAcceptanceScoreWithSettings(agent, candidate, preferenceRule, selectivityLevel, patienceLevel, explicitBias) {
      const selectivity = selectivityMultipliers[selectivityLevel || "Medium"] || 1;
      const patienceRate = patienceRates[patienceLevel || "Normal"] || 0.01;
      const patienceBoost = agent.searchSteps * patienceRate;
      const bias = typeof explicitBias === "number"
        ? explicitBias
        : (parseFloat(this.acceptanceBiasInput ? this.acceptanceBiasInput.value : "0") || 0);

      if (preferenceRule === "Similarity-based") {
        const difference = Math.abs(agent.attractiveness - candidate.attractiveness);
        return this.clamp((1 - difference / 9) * selectivity + patienceBoost + bias, 0.1, 1);
      }

      return this.clamp((candidate.attractiveness / 10) * selectivity + patienceBoost + bias, 0.1, 1);
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
          "Statistics: each row reports mean with 95% CI from n=" +
          RULE_ANALYTICS_RUNS +
          " synthetic runs. CI colors: green=tight, amber=medium, rose=wide.";
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
        "Selected now: " +
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

    prepareSquareCanvas(canvas, maxSize) {
      const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
      const target = Math.floor(parentWidth || canvas.clientWidth || maxSize || 360);
      const size = this.clamp(target, 240, maxSize || 420);
      const ratio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(size * ratio);
      canvas.height = Math.floor(size * ratio);
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      canvas.style.maxWidth = "100%";

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { size };
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      return { size };
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

    resetPreviewContent(mode) {
      const resetMode = mode || "full";
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
          "Statistics: each row reports mean with 95% CI from n=" +
          RULE_ANALYTICS_RUNS +
          " synthetic runs. CI colors: green=tight, amber=medium, rose=wide.";
      }
      if (this.ruleCodeExplainer) {
        this.ruleCodeExplainer.textContent = "Selected now: none selected.";
      }
      if (this.ruleAnalyticsBody) {
        this.ruleAnalyticsBody.innerHTML = "<tr><td colspan=\"5\">Run preview to compute analytics.</td></tr>";
      }
      if (this.ruleHazardInsight) {
        this.ruleHazardInsight.textContent =
          "Insight: Hazard at step t is matches at t divided by agents still unmatched at the start of t.";
      }
      if (resetMode !== "full") {
        return;
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
      ExportEngine.downloadPng(this.canvas);
    }

    bindLessonPresets() {
      this.lessonPresetButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const preset = button.getAttribute("data-preset");
          this.applyPreset(preset);
          this.markActivePresetButton(button);
          this.updatePresetStatus(preset);
          this.handleRun({ forceRestart: true });
          button.blur();
        });
      });
    }

    markActivePresetButton(activeButton) {
      this.lessonPresetButtons.forEach((button) => {
        button.classList.toggle("is-active", button === activeButton);
      });
    }

    updatePresetStatus(preset) {
      if (!this.lessonPresetStatus) return;
      const labels = {
        "sparse-low-attractiveness": "Sparse + Low mobility + Attractiveness",
        "dense-high-attractiveness": "Dense + High mobility + Attractiveness",
        "normal-high-similarity": "Normal + High mobility + Similarity",
      };
      this.lessonPresetStatus.textContent =
        "Preset status: " + (labels[preset] || "custom settings applied") + ".";
    }

    recordRunForComparison(modeLabel) {
      if (!this.state.lastRun || !this.state.lastRun.metrics) return;
      const run = this.state.lastRun;
      this.runHistory.push({
        id: this.nextRunId,
        entryType: "single",
        mode: modeLabel,
        density: run.densityLevel,
        mobility: run.mobilityLevel,
        preference: run.preferenceRule,
        radiusMultiplier: run.viewRadiusMultiplier || 1,
        pairCount: run.metrics.pairCount,
        strength: run.metrics.matchingStrength,
        search: run.metrics.averageSearchSteps,
      });
      this.nextRunId += 1;

      if (this.runHistory.length > this.maxRunHistory) {
        this.runHistory = this.runHistory.slice(this.runHistory.length - this.maxRunHistory);
      }

      this.renderRunComparison();
    }

    recordBatchForComparison(runCount, pairStats, strengthStats, searchStats, spatialStats, nonSpatialStats) {
      this.runHistory.push({
        id: this.nextRunId,
        entryType: "batch",
        mode: "Batch",
        density: "Mixed",
        mobility: "Mixed",
        preference: "Aggregate",
        radiusMultiplier: 1,
        batchN: runCount,
        pairCount: pairStats.mean,
        strength: strengthStats.mean,
        search: searchStats.mean,
        spatialStrength: spatialStats.mean,
        nonSpatialStrength: nonSpatialStats.mean,
      });
      this.nextRunId += 1;

      if (this.runHistory.length > this.maxRunHistory) {
        this.runHistory = this.runHistory.slice(this.runHistory.length - this.maxRunHistory);
      }

      this.renderRunComparison();
    }

    clearRunComparison() {
      this.runHistory = [];
      this.renderRunComparison();
      this.addChatMessage("Assistant", "Run comparison history cleared.");
    }

    renderRunComparison() {
      if (!this.runComparisonBody) return;

      if (!this.runHistory.length) {
        this.runComparisonBody.innerHTML = "<tr><td colspan=\"6\">No completed runs yet. Run once to set a baseline, then change one setting and rerun. Batch entries are labeled.</td></tr>";
        if (this.runComparisonSummary) {
          this.runComparisonSummary.textContent =
            "Start with one baseline run. Batch rows are labeled and summarize aggregate means.";
        }
        return;
      }

      const rows = this.runHistory
        .map((run, index) => {
          const prev = index > 0 ? this.runHistory[index - 1] : null;
          const deltaPairs = prev ? run.pairCount - prev.pairCount : 0;
          const deltaStrength = prev ? run.strength - prev.strength : 0;
          const pairsText = run.entryType === "batch" ? run.pairCount.toFixed(1) : String(run.pairCount);
          const searchText = run.search.toFixed(1);
          const scenarioText = run.entryType === "batch"
            ? "Batch n=" + run.batchN + " (aggregate means)"
            : run.density +
              " / " +
              run.mobility +
              " / " +
              run.preference +
              " / R x" +
              run.radiusMultiplier.toFixed(1);
          const deltaText = prev
            ? (deltaPairs >= 0 ? "+" : "") +
              deltaPairs.toFixed(1) +
              " pairs, " +
              (deltaStrength >= 0 ? "+" : "") +
              deltaStrength.toFixed(2) +
              " str"
            : "Baseline";

          return (
            "<tr>" +
            "<td>#" + run.id + (run.entryType === "batch" ? " [Batch]" : "") + "</td>" +
            "<td>" + scenarioText + "</td>" +
            "<td>" + pairsText + "</td>" +
            "<td>" + run.strength.toFixed(2) + "</td>" +
            "<td>" + searchText + "</td>" +
            "<td>" + deltaText + "</td>" +
            "</tr>"
          );
        })
        .join("");

      this.runComparisonBody.innerHTML = rows;

      if (this.runComparisonSummary) {
        const latest = this.runHistory[this.runHistory.length - 1];
        const bestStrength = this.runHistory.reduce((best, run) =>
          run.strength > best.strength ? run : best
        );
        this.runComparisonSummary.textContent =
          "Tracking " +
          this.runHistory.length +
          " recent runs. Latest: " +
          latest.pairCount +
          " pairs, strength " +
          latest.strength.toFixed(2) +
          ". Best strength so far: Run #" +
          bestStrength.id +
          " (" +
          bestStrength.strength.toFixed(2) +
          ").";
      }
    }

    updateRunInterpretation(reportData) {
      if (!this.runInterpretationWhat || !this.runInterpretationWhy || !this.runInterpretationNext) {
        return;
      }

      const setBadge = (element, text, tone) => {
        if (!element) return;
        element.textContent = text;
        element.classList.remove("is-good", "is-warning", "is-risk");
        if (tone) {
          element.classList.add(tone);
        }
      };

      if (!reportData) {
        this.runInterpretationWhat.textContent =
          "What you'll learn after a run: how many pairs formed and how quickly matching happened.";
        this.runInterpretationWhy.textContent =
          "Why it likely happened: this section links your settings to observed outcomes.";
        this.runInterpretationNext.textContent =
          "Example insight: Dense + high mobility often increases pair counts while lowering average search steps.";
        setBadge(this.runBadgeSearch, "Search guide", null);
        setBadge(this.runBadgeAssortment, "Assortment guide", null);
        setBadge(this.runBadgePairRate, "Pair-rate guide", null);
        return;
      }

      const {
        metrics,
        densityLevel,
        mobilityLevel,
        preferenceRule,
        selectivityLevel,
        patienceLevel,
        maxPairs,
      } = reportData;
      const pairRate = maxPairs > 0 ? (metrics.pairCount / maxPairs) * 100 : 0;
      const searchTone = metrics.averageSearchSteps <= 12 ? "is-good" : metrics.averageSearchSteps <= 16 ? "is-warning" : "is-risk";
      const assortmentTone = metrics.matchingStrength >= 0.35 ? "is-good" : metrics.matchingStrength >= 0.2 ? "is-warning" : "is-risk";
      const pairTone = pairRate >= 65 ? "is-good" : pairRate >= 40 ? "is-warning" : "is-risk";
      const searchLabel = metrics.averageSearchSteps <= 12 ? "fast" : metrics.averageSearchSteps <= 16 ? "moderate" : "slow";
      const assortmentLabel = metrics.matchingStrength >= 0.35 ? "high" : metrics.matchingStrength >= 0.2 ? "medium" : "low";

      setBadge(this.runBadgeSearch, "Search: " + searchLabel, searchTone);
      setBadge(this.runBadgeAssortment, "Assortment: " + assortmentLabel, assortmentTone);
      setBadge(this.runBadgePairRate, "Pair rate: " + pairRate.toFixed(0) + "%", pairTone);

      const denseOrMobile = densityLevel === "Dense" || mobilityLevel === "High";
      const constrained = densityLevel === "Sparse" || mobilityLevel === "Low";
      const sortedLanguage =
        metrics.matchingStrength >= 0.35
          ? "partners ended up strongly sorted by the preference rule"
          : metrics.matchingStrength >= 0.2
          ? "partners showed moderate sorting"
          : "pairing was only weakly sorted";

      this.runInterpretationWhat.textContent =
        "What happened: " +
        metrics.pairCount +
        " pairs formed with matching strength " +
        metrics.matchingStrength.toFixed(2) +
        " and average search " +
        metrics.averageSearchSteps.toFixed(1) +
        "; " +
        sortedLanguage +
        ".";

      this.runInterpretationWhy.textContent =
        "Why it likely happened: " +
        densityLevel.toLowerCase() +
        " density and " +
        mobilityLevel.toLowerCase() +
        " mobility made encounters " +
        (denseOrMobile ? "easier to find" : constrained ? "harder to find" : "moderately available") +
        ", while " +
        preferenceRule.toLowerCase() +
        " preferences shaped who accepted whom once they met.";

      const currentSettings = {
        density: densityLevel,
        mobility: mobilityLevel,
        selectivity: selectivityLevel || "Medium",
        patience: patienceLevel || "Normal",
      };
      const proposedSettings = { ...currentSettings };
      let recommendationReason = "to see whether pair count and sorting move together or trade off";

      if (metrics.averageSearchSteps > 16) {
        proposedSettings.mobility =
          currentSettings.mobility === "Low"
            ? "High"
            : currentSettings.mobility === "Medium"
            ? "High"
            : currentSettings.mobility;
        proposedSettings.density =
          currentSettings.density === "Sparse"
            ? "Normal"
            : currentSettings.density === "Normal"
            ? "Dense"
            : currentSettings.density;
        if (proposedSettings.selectivity === "High") {
          proposedSettings.selectivity = "Medium";
        }
        if (proposedSettings.patience === "Low") {
          proposedSettings.patience = "Normal";
        }
        recommendationReason = "average search is slow, so the next test should reduce encounter frictions and check whether missed matches mainly came from scarcity";
      } else if (metrics.matchingStrength < 0.2) {
        if (currentSettings.mobility === "High") {
          proposedSettings.mobility = "Medium";
        }
        if (proposedSettings.selectivity === "Low") {
          proposedSettings.selectivity = "Medium";
        }
        if (proposedSettings.patience === "High") {
          proposedSettings.patience = "Normal";
        }
        recommendationReason = "assortment is weak, so the next test should make acceptance slightly stricter and reduce overly easy matching";
      } else if (pairRate < 40) {
        proposedSettings.patience = currentSettings.patience === "Low" ? "Normal" : "High";
        if (proposedSettings.selectivity === "High") {
          proposedSettings.selectivity = "Medium";
        }
        recommendationReason = "pair rate is low, so the next test should give agents more time and slightly relax refusal pressure";
      } else {
        proposedSettings.density = currentSettings.density === "Normal" ? "Dense" : "Normal";
        if (currentSettings.mobility === "Low") {
          proposedSettings.mobility = "Medium";
        }
        if (proposedSettings.selectivity === "Medium") {
          proposedSettings.selectivity = "High";
        }
        recommendationReason = "this run already looks healthy, so the next test should stress the pattern with a slightly tighter acceptance rule";
      }

      const prioritizedChanges = [];
      ["density", "mobility", "selectivity", "patience"].forEach((key) => {
        if (currentSettings[key] !== proposedSettings[key]) {
          prioritizedChanges.push({
            key,
            from: currentSettings[key],
            to: proposedSettings[key],
          });
        }
      });

      const keptControls = ["density", "mobility", "selectivity", "patience"]
        .filter((key) => currentSettings[key] === proposedSettings[key])
        .map((key) => key);

      const changeLabels = {
        density: "density",
        mobility: "mobility",
        selectivity: "selectivity",
        patience: "patience",
      };

      const explicitChanges = prioritizedChanges.slice(0, 2).map((change) => {
        return (
          "change " +
          changeLabels[change.key] +
          " from " +
          change.from.toLowerCase() +
          " to " +
          change.to.toLowerCase()
        );
      });

      const keepText = keptControls.length
        ? " Keep " + keptControls.join(", ") + " unchanged."
        : "";

      const changeText = explicitChanges.length
        ? explicitChanges.join(" and ")
        : "repeat the same settings once more";

      this.runInterpretationNext.textContent =
        "What to try next: " +
        changeText.charAt(0).toUpperCase() +
        changeText.slice(1) +
        "." +
        keepText +
        " Reason: " +
        recommendationReason +
        ".";
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
          const normalizeDensity = (level) =>
            level === "Sparse" ? "Low Density" : level === "Dense" ? "High Density" : "Normal Density";
          const normalizeMobility = (level) =>
            level === "Low" ? "Low Mobility" : level === "High" ? "High Mobility" : "Medium Mobility";
          const moduleMetrics = {
            ...this.state.lastRun.metrics,
            pairs: this.state.pairs,
            agents: this.state.agents,
          };
          this.lastCitation = this.buildRunCitationMessage(
            moduleMetrics,
            normalizeMobility(this.state.lastRun.mobilityLevel),
            normalizeDensity(this.state.lastRun.densityLevel),
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
      this.resetPreviewContent("light");
    }

    shuffle(items) {
      const copy = [...items];

      for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(this.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
      }

      return copy;
    }

    randomInt(min, max) {
      return Math.floor(this.random() * (max - min + 1)) + min;
    }

    randomFloat(min, max) {
      return this.random() * (max - min) + min;
    }

    clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }
  }

// Export class for bootstrap
window.MateChoiceSimulation = MateChoiceSimulation;
