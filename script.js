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
      this.chatSuggestions = document.getElementById("chat-suggestions");
      this.chatForm = document.getElementById("chat-form");
      this.chatInput = document.getElementById("chat-input");
      this.chatSimpleToggle = document.getElementById("chat-simple-toggle");
      this.chatCapabilitiesButton = document.getElementById("chat-capabilities");
      this.chatResetButton = document.getElementById("chat-reset");
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
      this.addChatMessage(
        "Assistant",
        "I can compare each run to Smaldino & Schank (2012). After a run, ask follow-ups like “How did density influence assortative matching?”"
      );
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
          return "This website is built with HTML, CSS, and vanilla JavaScript. The simulation runs fully in the browser on a 2D canvas, with no backend model or API. The chat assistant uses lightweight NLP and conversation-state tracking, not a full LLM, so it is designed to explain this specific simulation: density, mobility, preference rules, matching strength, search time, results, and citations from Smaldino & Schank (2012). Run a scenario, then use the insight questions below or ask about one of those topics.";
        }

        return "This website is built with HTML, CSS, and vanilla JavaScript. The system runs a browser-based agent simulation on a 2D canvas: agents move, encounter nearby neighbors, decide whether to match using the active preference rule, and then the page computes pair count, matching strength, and average search time from that run. The assistant is a lightweight NLP layer on top of those results, so it can explain this simulation and its citations, but it is not a full LLM. For this scenario, use the insight questions below or ask about density, mobility, the preference rule, matching strength, search time, or citations.";
      }

      buildOutOfScopeReply() {
        if (!this.state.lastRun) {
          return "I can only help with this simulation right now. Run a scenario, then ask about density, mobility, preference rules, matching, search time, results, or citations.";
        }

        return "I am not sure I understood that. I can help with this run's density, mobility, preference rule, matching strength, search time, results, or citations. Try one of the suggested questions below.";
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
        return this.buildRunCitationMessage(metrics, mobility, density, preference);
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
      
      // Use simple mode or technical citation based on user preference
      const chatMessage = this.simpleMode
        ? this.buildExplainMessage(metrics, mobilityLevel, densityLevel, preferenceRule)
        : this.buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule);
      
      this.addChatMessage("Assistant", chatMessage);
      this.state.lastRun = {
        metrics,
        mobilityLevel,
        densityLevel,
        preferenceRule,
      };
      this.lastCitation = this.buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule);
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

    buildRunCitationMessage(metrics, mobilityLevel, densityLevel, preferenceRule) {
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
        prefDesc
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
      if (this.downloadCsvButton) this.downloadCsvButton.disabled = !isEnabled;
      if (this.downloadPngButton) this.downloadPngButton.disabled = !isEnabled;
      if (this.copyCitationButton) this.copyCitationButton.disabled = !isEnabled;
      
      if (isEnabled && this.state.lastRun) {
        this.lastCitation = this.buildRunCitationMessage(
          this.state.lastRun.metrics,
          this.state.lastRun.mobilityLevel,
          this.state.lastRun.densityLevel,
          this.state.lastRun.preferenceRule
        );
      } else if (!isEnabled) {
        this.lastCitation = null;
      }
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
            this.state.lastRun.preferenceRule
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
