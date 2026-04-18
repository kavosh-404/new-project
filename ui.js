/**
 * ui.js
 * Event binding and DOM manipulation for the UI
 */

class UIController {
  constructor(simulation) {
    this.sim = simulation;
    this.debounceTimer = null;
    this.observedRuns = []; // For run comparison feature
    this.capabilityCardShown = localStorage.getItem('capabilityCardShown') === 'true' ? true : false;
  }

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Show capability card on first launch
    setTimeout(() => {
      if (!this.capabilityCardShown) {
        this.showCapabilityCard();
      }
    }, 500);

    // Capability card close controls (bind once so repeated openings do not stack handlers)
    const capabilityModal = document.getElementById('capability-card-modal');
    const capabilityClose = document.getElementById('capability-card-close');
    const capabilityBackdrop = document.getElementById('capability-card-backdrop');
    const capabilityGotIt = document.getElementById('capability-card-got-it');
    const closeCapability = () => {
      if (capabilityModal) this.closeCapabilityCard(capabilityModal);
    };
    capabilityClose?.addEventListener('click', closeCapability);
    capabilityBackdrop?.addEventListener('click', closeCapability);
    capabilityGotIt?.addEventListener('click', closeCapability);

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

    // Also cache compact run history for chat comparison logic
    const runId = this.observedRuns.length + 1;
    this.observedRuns.push({
      id: runId,
      pairCount: metrics.pairs.length,
      strength: metrics.matchingStrength,
      search: metrics.averageSearchSteps,
      density: this.sim.state.lastRun.settings.densityLevel,
      mobility: this.sim.state.lastRun.settings.mobilityLevel,
      preference: this.sim.state.lastRun.settings.preferenceRule,
    });

    // Update teaching panel
    this.updateTeachingExplanation();
    this.updateStatus(true);

    // Highlight last two runs in comparison table
    this.highlightLastTwoRuns();

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

    const normalizedInput =
      window.PaperKnowledgeBase && typeof window.PaperKnowledgeBase.normalizeQuery === "function"
        ? window.PaperKnowledgeBase.normalizeQuery(text)
        : text.toLowerCase();
    const detectedTopic = ChatEngine.detectTopic(normalizedInput);
    if (detectedTopic) {
      this.sim.topicDepth = this.sim.lastTopic === detectedTopic ? (this.sim.topicDepth || 0) + 1 : 1;
      this.sim.lastTopic = detectedTopic;
    }

    const reply = ChatEngine.buildChatReply(
      text,
      this.sim.state.lastRun?.metrics || null,
      !!this.sim.state.lastRun,
      this.getRunSettings().densityLevel,
      this.getRunSettings().mobilityLevel,
      this.getRunSettings().preferenceRule,
      this.sim.lastTopic,
      this.sim.topicDepth || 0,
      this.observedRuns
    );

    this.addChatMessage("Assistant", reply);
    this.renderInsightQuestions();
  }

  /**
   * Add chat message with support for structured replies
   */
  addChatMessage(author, text) {
    if (!this.sim.chatLog) return;

    // Handle structured replies with progressive disclosure
    if (typeof text === 'object' && text.type === 'research-structured') {
      this.addStructuredChatMessage(author, text);
    } else {
      // Simple text message
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = author + ":";
      p.appendChild(strong);
      p.appendChild(document.createTextNode(" " + text));

      this.sim.chatLog.appendChild(p);
    }

    this.sim.chatLog.scrollTop = this.sim.chatLog.scrollHeight;
  }

  /**
   * Add structured chat message with confidence badge and progressive disclosure
   */
  addStructuredChatMessage(author, reply) {
    const card = document.createElement('div');
    card.className = 'research-message-card';

    // Header with author and confidence badge
    const header = document.createElement('div');
    header.className = 'research-message-header';

    const authorSpan = document.createElement('strong');
    authorSpan.textContent = author;
    header.appendChild(authorSpan);

    const confidenceBadge = document.createElement('span');
    confidenceBadge.className = `confidence-badge confidence-${reply.confidence.toLowerCase()}`;
    confidenceBadge.textContent = `Confidence: ${reply.confidence}`;
    confidenceBadge.setAttribute('title', this.getConfidenceTooltip(reply.confidence));
    header.appendChild(confidenceBadge);

    card.appendChild(header);

    // Claim (always visible)
    const claimDiv = document.createElement('div');
    claimDiv.className = 'research-claim';
    claimDiv.innerHTML = '<strong>📌 Claim:</strong> ' + reply.claim;
    card.appendChild(claimDiv);

    // Evidence (collapsible)
    const evidenceDiv = document.createElement('div');
    evidenceDiv.className = 'research-section';
    const evidenceToggle = document.createElement('button');
    evidenceToggle.className = 'disclosure-toggle';
    evidenceToggle.innerHTML = '+ Evidence';
    evidenceToggle.setAttribute('aria-expanded', 'false');
    const evidenceContent = document.createElement('div');
    evidenceContent.className = 'disclosure-content hidden';
    evidenceContent.innerHTML = '<strong>📊 Evidence:</strong> ' + reply.evidence;
    evidenceToggle.addEventListener('click', () => {
      const expanded = evidenceToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        evidenceToggle.innerHTML = '+ Evidence';
        evidenceContent.classList.add('hidden');
      } else {
        evidenceToggle.innerHTML = '- Evidence';
        evidenceContent.classList.remove('hidden');
      }
      evidenceToggle.setAttribute('aria-expanded', !expanded);
    });
    evidenceDiv.appendChild(evidenceToggle);
    evidenceDiv.appendChild(evidenceContent);
    card.appendChild(evidenceDiv);

    // Interpretation (collapsible)
    const interpDiv = document.createElement('div');
    interpDiv.className = 'research-section';
    const interpToggle = document.createElement('button');
    interpToggle.className = 'disclosure-toggle';
    interpToggle.innerHTML = '+ Interpretation';
    interpToggle.setAttribute('aria-expanded', 'false');
    const interpContent = document.createElement('div');
    interpContent.className = 'disclosure-content hidden';
    interpContent.innerHTML = '<strong>🔍 Interpretation:</strong> ' + reply.interpretation;
    interpToggle.addEventListener('click', () => {
      const expanded = interpToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        interpToggle.innerHTML = '+ Interpretation';
        interpContent.classList.add('hidden');
      } else {
        interpToggle.innerHTML = '- Interpretation';
        interpContent.classList.remove('hidden');
      }
      interpToggle.setAttribute('aria-expanded', !expanded);
    });
    interpDiv.appendChild(interpToggle);
    interpDiv.appendChild(interpContent);
    card.appendChild(interpDiv);

    // Citation
    if (reply.citation) {
      const citDiv = document.createElement('div');
      citDiv.className = 'research-citation';
      citDiv.innerHTML = '<strong>📚 Citation:</strong> ' + reply.citation;
      card.appendChild(citDiv);
    }

    // Next step
    if (reply.nextStep) {
      const nextDiv = document.createElement('div');
      nextDiv.className = 'research-next-step';
      nextDiv.innerHTML = '<strong>➡️ Next step:</strong> ' + reply.nextStep;
      nextDiv.addEventListener('click', () => {
        const match = reply.nextStep.match(/Ask: ["']([^"']+)["']/);
        if (match) {
          this.submitChatQuestion(match[1]);
        }
      });
      card.appendChild(nextDiv);
    }

    this.sim.chatLog.appendChild(card);
  }

  /**
   * Get confidence tooltip text
   */
  getConfidenceTooltip(level) {
    const tooltips = {
      'High': 'Strong evidence from run data, known parameters, or both',
      'Medium': 'Partial evidence or limited run history',
      'Low': 'Question outside primary scope; best-effort explanation. Try running 5+ scenarios.'
    };
    return tooltips[level] || 'See nearby explanation text.';
  }

  /**
   * Render interactive example questions
   */
  renderExampleQuestions() {
    if (!this.sim.chatSuggestions) return;

    // Create a section for example questions
    const exampleContainer = document.createElement('div');
    exampleContainer.className = 'example-questions-container';
    exampleContainer.innerHTML = '<p class="example-questions-label">💡 Example questions you can ask:</p>';

    const examples = [
      "📊 Why did sparse density lead to fewer pairs?",
      "⚖️ Compare my last two runs for density effects",
      "⏱️ What explains the matching strength in this run?",
      "🔍 How does this connect to Smaldino & Schank (2012)?"
    ];

    examples.forEach((example) => {
      const btn = document.createElement('button');
      btn.className = 'example-question-btn';
      
      // Extract the actual question (remove emoji prefix)
      const question = example.replace(/^[^\s]*\s+/, '');
      btn.textContent = example;
      btn.addEventListener('click', () => this.submitChatQuestion(question));
      exampleContainer.appendChild(btn);
    });

    const suggestionsDiv = this.sim.chatSuggestions;
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.appendChild(exampleContainer);

    // Add follow-up questions after examples
    if (!this.sim.state.lastRun) {
      return;
    }

    const followUpDiv = document.createElement('div');
    followUpDiv.className = 'follow-up-questions-container';
    followUpDiv.innerHTML = '<p class="follow-up-questions-label">👉 Follow-up suggestions for this run:</p>';

    const questions = ChatEngine.getInsightQuestionSet(null, this.sim.lastTopic);
    questions.forEach((question) => {
      const btn = document.createElement("button");
      btn.textContent = question;
      btn.className = "suggestion-btn";
      btn.addEventListener("click", () => this.submitChatQuestion(question));
      followUpDiv.appendChild(btn);
    });

    suggestionsDiv.appendChild(followUpDiv);
  }

  /**
   * Show capability card modal (first launch)
   */
  showCapabilityCard() {
    const modal = document.getElementById('capability-card-modal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
  }

  /**
   * Close capability card and mark as shown
   */
  closeCapabilityCard(modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    this.capabilityCardShown = true;
    localStorage.setItem('capabilityCardShown', 'true');
  }

  /**
   * Highlight last two runs in comparison panel
   */
  highlightLastTwoRuns() {
    const comparisonBody = document.getElementById('run-comparison-body');
    if (!comparisonBody) return;

    const rows = comparisonBody.querySelectorAll('tr');
    rows.forEach((row, idx) => {
      row.classList.remove('highlight-last-run');
    });

    // Highlight last two actual runs
    if (rows.length >= 2) {
      rows[rows.length - 1].classList.add('highlight-last-run', 'last-run');
      if (rows.length >= 3) {
        rows[rows.length - 2].classList.add('highlight-last-run', 'second-last-run');
      }
    }
  }

  /**
   * Render suggested follow-up questions
   */
  renderInsightQuestions() {
    this.renderExampleQuestions();
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
    this.showCapabilityCard();
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
