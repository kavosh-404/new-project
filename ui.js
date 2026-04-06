/**
 * ui.js
 * Event binding and DOM manipulation for the UI
 */

class UIController {
  constructor(simulation) {
    this.sim = simulation;
    this.debounceTimer = null;
    this.observedRuns = []; // For run comparison feature
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Window resize
    window.addEventListener("resize", () => this.handleResize());

    // Canvas events
    this.sim.runButton?.addEventListener("click", () => this.handleRun());
    this.sim.runBatchButton?.addEventListener("click", () => this.handleBatchRun());

    // Control dropdowns (debounced)
    const controls = [
      this.sim.preferenceSelect,
      this.sim.mobilitySelect,
      this.sim.densitySelect,
      this.sim.selectivitySelect,
      this.sim.patienceSelect,
      this.sim.explorationSelect,
    ];
    controls.forEach((control) => {
      control?.addEventListener("change", () => this.handleControlChange());
    });

    // Export buttons
    this.sim.previewCsvButton?.addEventListener("click", () => this.previewCsv());
    this.sim.downloadCsvButton?.addEventListener("click", () =>
      ExportEngine.downloadCsv(this.sim.state.lastRun.metrics, this.getRunSettings())
    );
    this.sim.downloadPngButton?.addEventListener("click", () =>
      ExportEngine.downloadPng(this.sim.canvas)
    );
    this.sim.copyCitationButton?.addEventListener("click", () => this.copyCitation());

    // Chat events
    this.sim.chatForm?.addEventListener("submit", (e) => this.handleChatSubmit(e));
    this.sim.chatCapabilitiesButton?.addEventListener("click", () => this.showCapabilities());
    this.sim.chatResetButton?.addEventListener("click", () => this.resetChatSession());

    // Simple mode toggles
    this.sim.teachingSimpleToggle?.addEventListener("change", (e) =>
      this.setSimpleMode(e.target.checked, { announceInChat: true, refreshTeachingPanel: true })
    );
    this.sim.chatSimpleToggle?.addEventListener("change", (e) =>
      this.setSimpleMode(e.target.checked, { announceInChat: false })
    );

    // Control help tooltips
    this.bindControlHelpTooltips();

    // Lesson presets
    this.bindLessonPresets();

    // Hazard explorer
    this.bindHazardExplorerEvents();
  }

  /**
   * Handle window resize
   */
  handleResize() {
    if (!this.sim.canvas) return;

    const parent = this.sim.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const size = Math.max(320, Math.min(rect.width, rect.height));
    const scale = window.devicePixelRatio || 1;

    this.sim.canvas.width = size * scale;
    this.sim.canvas.height = size * scale;

    if (this.sim.context) {
      this.sim.context.scale(scale, scale);
      this.sim.context.clearRect(0, 0, size, size);

      if (this.sim.state.agents.length > 0) {
        this.sim.draw();
      }
    }
  }

  /**
   * Handle run button click
   */
  handleRun() {
    if (this.sim.state.isRunning) return;

    this.scrollToSimulationGrid();

    // Clear previous summaries
    if (this.sim.batchSummary) this.sim.batchSummary.innerHTML = "";
    if (this.sim.csvPreview) this.sim.csvPreview.style.display = "none";
    if (this.sim.csvPreviewContent) this.sim.csvPreviewContent.textContent = "";

    // Initialize run
    this.sim.state.step = 0;
    this.sim.state.isRunning = true;
    this.sim.state.agents = this.sim.engine.createAgents(
      this.getAgentCount()
    );
    this.sim.state.pairs = [];

    // Update UI
    this.sim.runButton.disabled = true;
    this.updateStatus();

    // Reset teaching panel
    this.sim.state.lastRun = null;
    this.resetTeachingExplanation();
    this.resetChatSession();
    ExportEngine.setExportEnabled(false, {
      previewCsvButton: this.sim.previewCsvButton,
      downloadCsvButton: this.sim.downloadCsvButton,
      downloadPngButton: this.sim.downloadPngButton,
      copyCitationButton: this.sim.copyCitationButton,
    });

    // Start animation loop
    this.sim.draw();
    this.animate();
  }

  /**
   * Animation loop
   */
  animate() {
    if (!this.sim.state.isRunning) return;

    // Advance simulation
    const shouldContinue = this.sim.engine.stepSimulation(
      this.sim.state.agents,
      this.sim.state.pairs,
      this.sim.state.step,
      {
        preferenceRule: this.getRunSettings().preferenceRule,
        selectivityLevel: this.getRunSettings().selectivityLevel,
        patienceLevel: this.getRunSettings().patienceLevel,
        explorationLevel: this.getRunSettings().explorationLevel,
      }
    );

    this.sim.state.step += 1;
    this.updateStatus();
    this.sim.draw();

    if (this.sim.state.step >= STEP_COUNT || !shouldContinue) {
      this.finishRun();
    } else {
      requestAnimationFrame(() => this.animate());
    }
  }

  /**
   * Finish run and compute results
   */
  finishRun() {
    this.sim.state.isRunning = false;
    this.sim.runButton.disabled = false;

    // Compute metrics
    const metrics = this.sim.engine.computeMetrics(
      this.sim.state.agents,
      this.sim.state.pairs
    );
    metrics.agents = this.sim.state.agents;
    metrics.pairs = this.sim.state.pairs;

    // Cache run
    this.sim.state.lastRun = {
      metrics,
      settings: this.getRunSettings(),
      step: this.sim.state.step,
    };

    // Also cache for run comparison
    this.observedRuns.push(this.sim.state.lastRun);

    // Update teaching panel
    this.updateTeachingExplanation();
    this.updateStatus(true);

    // Enable exports
    ExportEngine.setExportEnabled(true, {
      previewCsvButton: this.sim.previewCsvButton,
      downloadCsvButton: this.sim.downloadCsvButton,
      downloadPngButton: this.sim.downloadPngButton,
      copyCitationButton: this.sim.copyCitationButton,
    });

    // Cache citation
    this.sim.lastCitation = TeachingContent.buildRunCitationMessage(
      metrics,
      this.getRunSettings().mobilityLevel,
      this.getRunSettings().densityLevel,
      this.getRunSettings().preferenceRule,
      this.getRunSettings().selectivityLevel,
      this.getRunSettings().patienceLevel,
      this.getRunSettings().explorationLevel
    );

    // Add initial chat message
    this.addChatMessage("Assistant", this.sim.lastCitation);
    this.renderInsightQuestions();
  }

  /**
   * Handle batch run
   */
  handleBatchRun() {
    const runCount = parseInt(this.sim.batchRunCountSelect?.value || "5");
    const reportData = AnalyticsEngine.computeRuleAnalyticsRows(
      this.sim.engine,
      this.getRunSettings(),
      runCount
    );

    // Build summary HTML
    let html = "<h3>Batch Statistics (6 rules × " + runCount + " runs)</h3>";
    html +=
      "<table><tr><th>Rule</th><th>Pairs</th><th>Strength</th><th>Avg Search</th></tr>";

    reportData.forEach((row) => {
      html += `<tr>
        <td>${row.ruleShort}-${row.movement}</td>
        <td>${row.interPairCorrelation.toFixed(2)} ± ${((row.interPairCorrelationCiHigh - row.interPairCorrelationCiLow) / 2).toFixed(2)}</td>
        <td>${row.meanDateToMate.toFixed(1)} ± ${((row.meanDateToMateCiHigh - row.meanDateToMateCiLow) / 2).toFixed(1)}</td>
        <td>${row.meanHazard.toFixed(3)} ± ${((row.meanHazardCiHigh - row.meanHazardCiLow) / 2).toFixed(3)}</td>
      </tr>`;
    });
    html += "</table>";

    if (this.sim.batchSummary) {
      this.sim.batchSummary.innerHTML = html;
    }

    this.addChatMessage(
      "Assistant",
      "Batch complete! I ran " +
        runCount +
        " simulations across 6 rule/movement combinations and computed statistics. Check the batch summary above."
    );
  }

  /**
   * Handle control change with debounce
   */
  handleControlChange() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      if (!this.sim.state.isRunning) {
        this.handleRun();
      }
    }, 400);
  }

  /**
   * Update status text
   */
  updateStatus(isComplete = false) {
    if (!this.sim.status) return;

    if (isComplete) {
      this.sim.status.textContent =
        `Simulation complete: ${this.sim.state.pairs.length} pairs formed across ${STEP_COUNT} steps.`;
    } else if (this.sim.state.isRunning) {
      this.sim.status.textContent =
        `Running step ${this.sim.state.step} of ${STEP_COUNT}: ${this.sim.state.pairs.length} pairs formed so far.`;
    } else {
      this.sim.status.textContent = "Ready to simulate density, mobility, and mate choice encounters.";
    }
  }

  /**
   * Scroll to simulation grid
   */
  scrollToSimulationGrid() {
    if (this.sim.simulationGridSection) {
      this.sim.simulationGridSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * Update teaching panel narrative
   */
  updateTeachingExplanation() {
    const metrics = this.sim.state.lastRun.metrics;
    const settings = this.getRunSettings();

    const narrative = TeachingContent.buildTeachingPanelNarrative(
      metrics,
      settings.mobilityLevel,
      settings.densityLevel,
      settings.preferenceRule,
      settings.selectivityLevel,
      settings.patienceLevel,
      settings.explorationLevel,
      this.sim.simpleMode
    );

    if (this.sim.teachingExplanation) {
      this.sim.teachingExplanation.textContent = narrative;
    }

    this.updateSummaryBar(metrics);
    this.renderInsightQuestions();
  }

  /**
   * Update KPI summary bar
   */
  updateSummaryBar(metrics) {
    if (this.sim.summaryPairs) {
      this.sim.summaryPairs.textContent = `${metrics.pairs.length} pairs`;
    }
    if (this.sim.summaryStrength) {
      this.sim.summaryStrength.textContent = `Strength ${metrics.matchingStrength.toFixed(2)}`;
    }
    if (this.sim.summarySearch) {
      this.sim.summarySearch.textContent = `Avg search ${Math.round(metrics.averageSearchSteps)}`;
    }
    if (this.sim.runSummary) {
      this.sim.runSummary.classList.add("is-visible");
    }
  }

  /**
   * Reset teaching explanation to placeholder
   */
  resetTeachingExplanation() {
    const placeholder = TeachingContent.getTeachingPlaceholderText(this.sim.simpleMode);
    if (this.sim.teachingExplanation) {
      this.sim.teachingExplanation.textContent = placeholder;
    }
  }

  /**
   * Set simple mode
   */
  setSimpleMode(enabled, options = {}) {
    this.sim.simpleMode = enabled;

    // Update toggles
    if (this.sim.teachingSimpleToggle) {
      this.sim.teachingSimpleToggle.checked = enabled;
    }
    if (this.sim.chatSimpleToggle) {
      this.sim.chatSimpleToggle.checked = enabled;
    }

    // Regenerate teaching panel if requested
    if (options.refreshTeachingPanel && this.sim.state.lastRun) {
      this.updateTeachingExplanation();
    }

    // Announce change in chat
    if (options.announceInChat) {
      const mode = enabled ? "simple (plain language)" : "technical (with citations)";
      this.addChatMessage("Assistant", `Switched to ${mode} mode.`);
    }
  }

  /**
   * Chat functions
   */
  handleChatSubmit(event) {
    event.preventDefault();
    const text = this.sim.chatInput?.value?.trim() || "";
    if (!text) return;

    this.sim.chatInput.value = "";
    this.submitChatQuestion(text);
  }

  /**
   * Submit chat question
   */
  submitChatQuestion(text) {
    this.addChatMessage("You", text);

    const reply = ChatEngine.buildChatReply(
      text,
      this.sim.state.lastRun?.metrics || null,
      !!this.sim.state.lastRun,
      this.getRunSettings().densityLevel,
      this.getRunSettings().mobilityLevel,
      this.getRunSettings().preferenceRule,
      this.sim.lastTopic,
      this.sim.topicDepth || 0
    );

    this.addChatMessage("Assistant", reply);
    this.renderInsightQuestions();
  }

  /**
   * Add chat message
   */
  addChatMessage(author, text) {
    if (!this.sim.chatLog) return;

    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = author + ":";
    p.appendChild(strong);
    p.appendChild(document.createTextNode(" " + text));

    this.sim.chatLog.appendChild(p);
    this.sim.chatLog.scrollTop = this.sim.chatLog.scrollHeight;
  }

  /**
   * Render suggested follow-up questions
   */
  renderInsightQuestions() {
    if (!this.sim.chatSuggestions) return;

    this.sim.chatSuggestions.innerHTML = "";

    if (!this.sim.state.lastRun) {
      this.sim.chatSuggestions.innerHTML =
        "<p>Run the simulation to see suggested questions.</p>";
      return;
    }

    const questions = ChatEngine.getInsightQuestionSet(null, this.sim.lastTopic);

    questions.forEach((question) => {
      const btn = document.createElement("button");
      btn.textContent = question;
      btn.className = "suggestion-btn";
      btn.addEventListener("click", () => this.submitChatQuestion(question));
      this.sim.chatSuggestions.appendChild(btn);
    });
  }

  /**
   * Reset chat session
   */
  resetChatSession() {
    this.sim.conversationHistory = [];
    this.sim.lastTopic = null;
    this.sim.lastQuestionType = null;
    this.sim.topicDepth = 0;

    if (this.sim.chatLog) {
      this.sim.chatLog.innerHTML = "";
    }

    this.addChatMessage(
      "Assistant",
      "Chat reset. Run the simulation, then ask me about density, mobility, matching, or search time."
    );
    this.renderInsightQuestions();
  }

  /**
   * Show capabilities
   */
  showCapabilities() {
    this.submitChatQuestion("What can you do?");
  }

  /**
   * Copy citation to clipboard
   */
  async copyCitation() {
    if (!this.sim.lastCitation) return;

    try {
      await navigator.clipboard.writeText(this.sim.lastCitation);
      this.addChatMessage("Assistant", "Citation copied to clipboard!");
    } catch (err) {
      this.addChatMessage("Assistant", `Citation: ${this.sim.lastCitation}`);
    }
  }

  /**
   * Preview CSV
   */
  previewCsv() {
    if (!this.sim.state.lastRun) {
      this.addChatMessage("Assistant", "Run the simulation first to preview CSV.");
      return;
    }

    const { metrics, settings } = this.sim.state.lastRun;
    const csvText = ExportEngine.buildRunCsvText(metrics, settings);

    if (this.sim.csvPreviewContent) {
      this.sim.csvPreviewContent.textContent = csvText;
    }
    if (this.sim.csvPreview) {
      this.sim.csvPreview.style.display = "block";
    }
  }

  /**
   * Bind control help tooltips
   */
  bindControlHelpTooltips() {
    document.addEventListener("click", (e) => {
      if (!e.target.classList.contains("control-help")) {
        this.closeControlHelpTooltips();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeControlHelpTooltips();
      }
    });
  }

  /**
   * Close control help tooltips
   */
  closeControlHelpTooltips() {
    this.sim.controlHelpButtons?.forEach((btn) => {
      btn.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
  }

  /**
   * Bind lesson presets
   */
  bindLessonPresets() {
    document.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.applyPreset(btn.dataset.preset);
      });
    });
  }

  /**
   * Apply preset scenario
   */
  applyPreset(preset) {
    const presets = {
      "sparse-low-attractiveness": {
        density: "Low Density",
        mobility: "Low Mobility",
        preference: "Attractiveness-based",
      },
      "dense-high-attractiveness": {
        density: "High Density",
        mobility: "High Mobility",
        preference: "Attractiveness-based",
      },
      "normal-high-similarity": {
        density: "Normal Density",
        mobility: "High Mobility",
        preference: "Similarity-based",
      },
    };

    const config = presets[preset];
    if (!config) return;

    if (this.sim.densitySelect) this.sim.densitySelect.value = config.density;
    if (this.sim.mobilitySelect) this.sim.mobilitySelect.value = config.mobility;
    if (this.sim.preferenceSelect) this.sim.preferenceSelect.value = config.preference;

    this.sim.state.lastRun = null;
    this.resetTeachingExplanation();
    this.resetChatSession();
    this.handleRun();
  }

  /**
   * Bind hazard explorer events
   */
  bindHazardExplorerEvents() {
    // Placeholder for hazard chart interactivity
    // Full implementation would tie to hazardChartMode, series toggles, etc.
  }

  /**
   * Get run settings from controls
   */
  getRunSettings() {
    return {
      densityLevel: this.sim.densitySelect?.value || "Normal Density",
      mobilityLevel: this.sim.mobilitySelect?.value || "Medium Mobility",
      preferenceRule: this.sim.preferenceSelect?.value || "Attractiveness-based",
      selectivityLevel: this.sim.selectivitySelect?.value || "Medium",
      patienceLevel: this.sim.patienceSelect?.value || "Normal",
      explorationLevel: this.sim.explorationSelect?.value || "Balanced",
    };
  }

  /**
   * Get agent count based on density
   */
  getAgentCount() {
    const densityLevel = this.sim.densitySelect?.value || "Normal Density";
    const densityMap = {
      "Low Density": 20,
      "Normal Density": 50,
      "High Density": 100,
    };
    return densityMap[densityLevel] || 50;
  }
}

// Export for use in other modules
window.UIController = UIController;
