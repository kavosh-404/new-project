# Human Mate Choice Models: Interactive Teaching Simulation

A web-based teaching tool for exploring how spatial constraints, mobility, and preference rules shape assortative mating patterns in agent-based simulations, inspired by **Smaldino & Schank (2012)**.

## Latest Shipped Update

- Added a **pair correlation vs. time step** chart that updates the cumulative Pearson correlation each time a new pair forms.
- Added a **run-level pair attractiveness heatmap** showing which attractiveness combinations matched in the latest simulation.
- Added a **many-trials pair attractiveness heatmap** showing which attractiveness combinations matched most often across batch runs.
- Added hover details for both attractiveness heatmaps so students can inspect frequency shares and average attractiveness values directly in the interface.
- Expanded report chart sizing and layout usage so preview graphs use available space more effectively.

## Development Timeline (Week-by-Week, Git Timestamped)

This timeline is pulled from git commit history and lists upgrades from the first week through this week with exact timestamps.

### Week 1 (2026-04-04 to 2026-04-05)
- Project foundation, first simulation shell, and early styling/content passes.
- Core teaching features added rapidly: citation quality, simple mode behavior, contextual chat, controls UX, CSV/report preview, analytics, hazard explorer, and first modular refactor phases.
- Security and architecture milestones shipped: XSS fix, modular extraction phases A/B/C, and entrypoint/refactor hygiene.

### Week 2 (2026-04-13 to 2026-04-18)
- Major UX upgrades: reproducibility controls, hero/flow polish, view-radius inspection, run-state chips, mobile/desktop behavior fixes.
- Batch analytics matured: progress HUD, statistical average field, hotspot heatmaps, tooltips, contrast scaling, and reset/rerun flow.
- Reporting system upgraded with report builder, preview modal, scientific abstract format, selectable figures, and better export UX.
- Research assistant expanded with structured evidence replies, capability cards, and paper-grounded retrieval logic.

### Week 3 (2026-04-21)
- First-time-user copy refinement and documentation/content cleanup.

### Week 4 (2026-05-05, current week)
- Added pair-correlation-over-time chart and run-level attractiveness heatmap.
- Added batch-level attractiveness heatmap.
- Added README shipped-update notes and improved report chart sizing/layout usage.

### Full Chronological Commit Ledger

The list below is the exact chronological ledger used for the timeline:

- 2026-04-04 09:45:39 -0700 | 928e5aa | Initial commit
- 2026-04-04 16:59:44 -0700 | 8ad529e | Update site content and styling
- 2026-04-04 17:04:45 -0700 | 73e20ec | Update page with latest changes
- 2026-04-04 17:37:17 -0700 | 854f282 | Fix citation button: properly initialize state and improve clipboard handling
- 2026-04-04 17:41:16 -0700 | 66f207a | Improve citation format: integrate findings into academic prose with proper Smaldino & Schank citations
- 2026-04-04 17:44:29 -0700 | b6d576c | Remove annotation-style phrases everywhere; integrate all citations into academic prose
- 2026-04-04 17:50:42 -0700 | 89dca52 | Fix simple mode toggle: respect user preference when displaying chat messages after runs
- 2026-04-04 18:00:06 -0700 | 7ca0ed9 | Improve chat understanding: add context tracking, handle clarifications, remember conversation topics
- 2026-04-04 18:34:43 -0700 | e5ef5eb | Add scenario-specific chat prompts and guided follow-ups
- 2026-04-04 18:41:11 -0700 | 43a9fe4 | Improve chat guidance and unsupported-question fallback
- 2026-04-04 18:42:57 -0700 | a710ef4 | Add chat utility buttons and simplify fallback replies
- 2026-04-04 18:47:50 -0700 | 44cae8b | Replace question-list chat spam with system explanation
- 2026-04-04 18:51:19 -0700 | 1652545 | Fix repetitive insight question answers
- 2026-04-04 18:54:30 -0700 | 5e83f03 | Bust cache for updated chat logic
- 2026-04-04 18:55:37 -0700 | 14d9c84 | Strengthen academic grounding in insight answers
- 2026-04-05 11:55:44 -0700 | 20fa0ca | Add tunable agent behaviors and model controls
- 2026-04-05 11:57:41 -0700 | a3357be | Add batch experiment mode with confidence intervals
- 2026-04-05 12:01:03 -0700 | b88b1ce | Add simulation controls guide section
- 2026-04-05 12:06:47 -0700 | 8f623c3 | Make controls guide collapsible and less intrusive
- 2026-04-05 12:07:58 -0700 | b47875f | Add inline control help tooltips
- 2026-04-05 12:09:41 -0700 | 23368f6 | Polish control help with info icons and mobile tap behavior
- 2026-04-05 12:10:43 -0700 | 7e4815c | Remove collapsible controls guide for cleaner layout
- 2026-04-05 12:12:26 -0700 | 35be5a7 | Use question mark icon for control help
- 2026-04-05 12:17:54 -0700 | e85baa9 | Show CSV preview while downloading summary
- 2026-04-05 12:21:18 -0700 | 2077f9a | Split CSV actions into preview or download
- 2026-04-05 12:38:38 -0700 | 5b34058 | Upgrade CSV preview into narrative report with charts
- 2026-04-05 12:41:37 -0700 | bd20483 | Bust cache for updated preview report assets
- 2026-04-05 12:46:36 -0700 | 4d21b7a | Add dynamic chart insights to run summary preview
- 2026-04-05 12:51:05 -0700 | 1f0e78a | Embed research figure pages in preview and paper viewer
- 2026-04-05 12:54:47 -0700 | c438899 | Render paper figure panels via PDF.js canvases
- 2026-04-05 13:08:36 -0700 | 0b98be3 | Add rule analytics for correlation date-to-mate and hazards
- 2026-04-05 13:10:03 -0700 | d5f8187 | Add 95% CI reporting to rule analytics table
- 2026-04-05 13:11:15 -0700 | c9e267a | Color-code CI widths in rule analytics table
- 2026-04-05 13:18:02 -0700 | 73822b4 | Regenerate paper-style figures and improve hazard readability
- 2026-04-05 13:19:48 -0700 | 2084276 | Add hazard markers and hover tooltips
- 2026-04-05 13:24:46 -0700 | a1fba53 | Add interactive hazard explorer with rule toggles
- 2026-04-05 13:26:20 -0700 | 22af3f3 | Add auto-highlight for top-2 divergent hazard rules
- 2026-04-05 13:27:39 -0700 | 5acbb88 | Add configurable top-N auto-highlight for hazard rules
- 2026-04-05 13:28:53 -0700 | c4d4c25 | Use no-worker PDF.js loading for paper figure rendering
- 2026-04-05 13:37:09 -0700 | 31d72d2 | Reformat rule analytics text into structured blocks
- 2026-04-05 13:37:57 -0700 | ca53184 | Add visual metric tokens to rule definition bullets
- 2026-04-05 13:42:26 -0700 | ff125b9 | Clarify run summary conclusion narrative
- 2026-04-05 13:57:15 -0700 | 524fbf1 | Auto-open preview report after run completion
- 2026-04-05 14:05:44 -0700 | 6a63c3d | Add teaching panel simple mode toggle and synced explanation rendering
- 2026-04-05 14:13:04 -0700 | 5e7da96 | Scroll to simulation grid on run start
- 2026-04-05 15:21:43 -0700 | b46093f | Add data-driven insights for recreated figures 5-7
- 2026-04-05 18:42:28 -0700 | 67a348e | Remove Research Figure Pages section from paper viewer
- 2026-04-05 18:46:44 -0700 | 23545cc | Fix XSS vulnerability in chat and add comprehensive README
- 2026-04-05 18:50:00 -0700 | 329059e | Phase A: Extract constants.js and SimulationEngine into separate modules
- 2026-04-05 18:52:29 -0700 | 29c8888 | Phase B: Extract render.js and analytics.js for modular architecture
- 2026-04-05 18:59:50 -0700 | c292dc1 | Phase C: Extract teaching-content, chat, export, ui + random seed support
- 2026-04-05 19:01:17 -0700 | 6c34df0 | Add comprehensive module architecture documentation
- 2026-04-05 19:01:51 -0700 | 39134ac | Add implementation guide for remaining features
- 2026-04-05 19:04:27 -0700 | 8ba2ca9 | Add remaining features: preset UX + run-to-run comparison
- 2026-04-05 19:12:41 -0700 | 8fe76ec | Finalize entrypoint refactor and project hygiene
- 2026-04-05 19:22:14 -0700 | 49c2c90 | Continue real refactor: delegate chat/teaching/export/insights to modules
- 2026-04-05 21:20:04 -0700 | 94e1e5e | Add guided interpretation panel with badge tooltips
- 2026-04-05 21:27:53 -0700 | 65f9ba2 | Make interpretation recommendations explicit
- 2026-04-13 23:51:38 -0700 | 1479ea3 | Enhance simulation UX, controls, and reproducibility
- 2026-04-16 10:16:56 -0700 | 0416e39 | feat: add mouse-depth gradient effect to hero section
- 2026-04-16 13:06:37 -0700 | d1da2c3 | feat: add one-time purple intro overlay with auto-dismiss
- 2026-04-16 13:15:02 -0700 | 69f51a3 | feat: clarify acceptance threshold control with live effect feedback
- 2026-04-16 16:30:39 -0700 | a66c4cb | feat: add spatial view radius inspection mode
- 2026-04-16 16:41:20 -0700 | 208e8e7 | fix: preserve radius state and improve tooltip positioning
- 2026-04-16 17:10:11 -0700 | ae19644 | fix: auto-reset completed run on start
- 2026-04-16 17:15:45 -0700 | 26c23eb | style: improve hero optical spacing and headline fit
- 2026-04-16 17:21:23 -0700 | bc91b78 | fix: prevent badge tooltip clipping and smooth workspace gradient edge
- 2026-04-16 17:27:04 -0700 | a15e1bc | fix: further smooth workspace depth seam at left edge
- 2026-04-16 17:33:34 -0700 | 036d791 | style: clarify primary run flow in simulation panel
- 2026-04-16 17:37:02 -0700 | 3b49b0d | feat: add live run state and step chips near controls
- 2026-04-16 17:46:18 -0700 | b684323 | feat: refine hierarchy, empty states, mobile collapses, and focus contrast
- 2026-04-16 17:51:43 -0700 | ced64ef | fix: keep collapsible analysis sections open on desktop
- 2026-04-16 18:01:55 -0700 | 0f37217 | feat: add live batch progress HUD with ghost animation
- 2026-04-17 10:35:43 -0700 | 2ff4d2e | Fix simulation layout distortion and batch panel readability
- 2026-04-17 10:41:55 -0700 | 373f9a6 | Sync batch summaries into run comparison with labeled aggregate rows
- 2026-04-17 10:56:47 -0700 | 770ec86 | Add live batch heatmap and representative snapshot grid
- 2026-04-17 11:03:46 -0700 | d227fe4 | Refine batch visuals: square snapshot and pair-hotspot heatmap
- 2026-04-17 11:06:15 -0700 | cf1130f | Keep batch visualization panels visible after completion
- 2026-04-17 11:09:12 -0700 | 5877b09 | Add per-cell hover tooltip for batch heatmap
- 2026-04-17 11:13:15 -0700 | 2686b44 | Convert representative panel to statistical average field
- 2026-04-17 11:24:21 -0700 | 66a8b9b | Enhance average field contrast with quantile scaling and diverging palette
- 2026-04-17 12:05:32 -0700 | a230560 | Refine batch UI hierarchy, findings strip, and reset-rerun flow
- 2026-04-17 16:10:21 -0700 | 7e38712 | Polish export action bar layout and interaction feedback
- 2026-04-17 16:16:14 -0700 | 489ff2b | Add configurable experiment report builder and authentic report export
- 2026-04-17 16:21:45 -0700 | f76ef82 | Add report preview modal and inline charts for exported reports
- 2026-04-17 16:28:29 -0700 | 1de2892 | Fix report modal placement to open centered in viewport
- 2026-04-17 16:34:21 -0700 | 4526756 | Upgrade report abstract to structured scientific format with dynamic data
- 2026-04-17 16:41:19 -0700 | 1804dd5 | Add user-selectable figures to report: correlation scatter, batch CI bars, grid snapshot, heatmap snapshot
- 2026-04-17 16:46:07 -0700 | 3834e64 | Add Fig 7: batch 3D field snapshot to report builder figure options
- 2026-04-17 16:50:17 -0700 | d695f7c | Add explanatory paragraphs to all supplemental figures in report
- 2026-04-17 16:55:02 -0700 | 4346cde | UI polish: fix placeholder text, group controls, strengthen run-summary, update step-4 copy, add export hint
- 2026-04-17 16:58:15 -0700 | df28f27 | Polish report builder UX with quick select controls and live selection summary
- 2026-04-17 16:59:00 -0700 | 80cf23e | Make report sections scope-aware with disabled-state hints
- 2026-04-17 17:06:36 -0700 | b161588 | Upgrade Research Chat Assistant with structured evidence replies and comparison reasoning
- 2026-04-17 17:08:10 -0700 | fb32c8d | Improve assistant capability messaging and intent detection precision
- 2026-04-17 17:08:53 -0700 | a7c254c | Add visual capabilities checklist card for chat assistant
- 2026-04-17 17:13:07 -0700 | 731026a | Add capability category badges to assistant checklist card
- 2026-04-18 12:25:38 -0700 | 711e01c | feat: enhance research assistant UX with 5 improvements
- 2026-04-18 12:32:03 -0700 | 2f12d94 | fix: prevent chat clutter from capabilities button
- 2026-04-18 13:24:30 -0700 | 1d895b6 | feat: add paper-grounded agentic research assistant\n\n- Add in-browser paper knowledge base with retrieval and citations\n- Rebuild chat engine for retrieval-grounded structured responses\n- Improve noisy input understanding with typo normalization\n- Support conceptual paper Q&A before first simulation run\n- Wire run history + topic memory for stronger multi-turn comparisons\n- Load paper knowledge module before chat engine
- 2026-04-21 12:35:48 -0700 | c9c8c66 | Make website copy clear for first-time users
- 2026-04-21 12:36:37 -0700 | 03965f0 | Push recent changes
- 2026-05-05 09:19:38 -0700 | c0546ee | Add pair correlation and attractiveness heatmap views
- 2026-05-05 09:24:00 -0700 | c101160 | Add batch attractiveness heatmap and README update
- 2026-05-05 09:32:21 -0700 | 406d924 | Improve preview chart sizing and layout usage

## Project Purpose

This interactive simulation demonstrates key research findings from spatial mate choice theory:
- How **spatial locality** (agents can only meet nearby neighbors) constrains encounter opportunities
- How **mobility** (how far agents can move) affects search time and matching outcomes
- How **preference rules** (attractiveness-based vs. similarity-based choice) interact with space
- How these factors combine to produce **assortative matching** — the tendency for similar agents to pair

The goal is to make published research **interactive and teachable**, not just readable.

---

## What the Simulation Teaches

### Core Model
- **Agents** are placed randomly on a 2D spatial grid
- Each step, agents move randomly and **encounter** nearby neighbors
- When two agents meet, they decide whether to **accept each other** based on:
  - Their **attractiveness** (random value 1–10)
  - The **preference rule** (Attractiveness-based or Similarity-based)
  - Their **selectivity** (how picky they are)
  - Their **patience** (willingness to lower standards over time)
- Once matched, agents are removed from the pool
- The simulation runs for a fixed number of steps (default: 50)

### Output Metrics
- **Pair count**: how many pairs formed
- **Matching strength** (inter-pair correlation): how similar matched partners are (Pearson r)
- **Average search time**: mean step at which pairs formed
- **Mating hazard curve**: probability of new matches at each step
- **Mean date to mate**: average timing of pair formation by rule/condition

### Run-to-Run Comparison
The analytics section compares two conditions:
- **Rule 1 (Attractiveness-based)**: agents prefer more attractive partners
- **Rule 2 (Similarity-based)**: agents prefer partners close to their attractiveness level

For each rule, the simulation runs under three **movement settings**:
- **NS** (Local): agents explore only nearby areas
- **ZZ** (Balanced): moderate exploration
- **BR** (Wide): agents explore across the entire grid

---

## How to Run It

### Local Development
1. Clone or extract the project
2. Start a local HTTP server:
   ```bash
   npx --yes http-server . -p 5000
   ```
   Or on macOS/Linux:
   ```bash
   python3 -m http.server 8000
   ```
3. Open your browser to `http://localhost:5000` (or `8000`)

### Using the Interface

#### Main Simulation Panel (Top Left)
- **Preference Rule**: Choose Attractiveness-based or Similarity-based
- **Density Level**: Sparse, Normal, or Dense (affects population count)
- **Mobility Level**: Low, Medium, or High (controls movement distance)
- **Selectivity**: How picky agents are (Low = more accepting, High = more picky)
- **Patience**: How standards relax over time (Fast, Normal, Slow)
- **Exploration**: How far agents search (Local, Balanced, Wide)
- **Run Simulation**: Execute one simulation run
- **Run Batch**: Execute 30 runs and compute statistics

#### Simulation Grid (Middle)
A live canvas showing:
- **Blue/gray circles**: unmatched agents (hue indicates attractiveness)
- **Green circles**: matched agents
- **Red lines**: connections between matched pairs

#### Run Summary Panel (Right)
After a run completes:
- **Preview**: Shows pair count, matching strength, average search time
- **CSV / PNG / Citation**: Download results or copy academic citation
- **Paper-Aligned Rule Analytics**: 
  - Comparison table of both rules across all movement conditions
  - Hazard curves showing when pairs form
  - Recreated research-style figures (Figure 5, 6, 7)

#### Teaching Explanation (Bottom)
- Dynamic narrative explaining what just happened in technical terms
- **Simple Mode toggle**: Switch to everyday-language explanations (no jargon)

#### Research Chat Assistant (Bottom Right)
- Ask questions about the results (e.g., "Why did density affect pairing?")
- Assistant responds with citations to the paper and mechanistic explanations
- **Simple mode**: Get explanations in plain language first, then citations
- **Presets**: One-click guided experiments with discussion prompts

---

## File Structure

```
.
├── index.html              # Main UI and simulation panel
├── app-main.js             # Main application orchestrator class
├── script.js               # Tiny bootstrap entrypoint
├── styles.css              # Layout and component styling
├── paper.html              # Embedded reference PDF viewer
├── smaldino-schank-2012.pdf # Research paper
├── constants.js            # Shared configuration constants
├── simulation.js           # Simulation engine
├── render.js               # Canvas rendering helpers
├── analytics.js            # Batch analytics and metrics
├── teaching-content.js     # Teaching narrative builders
├── chat.js                 # Chat/NLP helpers
├── export.js               # CSV/PNG/citation utilities
├── ui.js                   # UI interaction helpers
└── README.md               # This file
```

### Current Architecture
The app now uses a thin bootstrap and a dedicated app orchestrator:
- `script.js` initializes the app instance only
- `app-main.js` holds the application orchestrator class

Core responsibilities are organized into focused helper files:
- Simulation engine (agent movement, encounters, matching)
- Canvas rendering (drawing grid, agents, pairs)
- Analytics computation (stats, correlations, hazard series)
- Chat system (NLP, responses, question parsing)
- Export functions (CSV, PNG, citations)
- DOM event listeners and UI state

**Future refactor (planned):**
- `simulation.js` → core engine
- `render.js` → canvas drawing
- `analytics.js` → batch stats and metrics
- `chat.js` → Q&A logic
- `export.js` → downloads and copying
- `ui.js` → event listeners
- `constants.js` → config values

---

## Controls Explained

### Simulation Parameters

| Control | Range | Effect |
|---------|-------|--------|
| **Density** | Sparse / Normal / Dense | How many agents are on the grid. Higher density → more encounters → faster pairing. |
| **Mobility** | Low / Medium / High | How far each agent moves per step. Higher mobility → broader search → faster matching. |
| **Selectivity** | Low / Medium / High | Acceptance threshold. High selectivity → longer search, stronger assortment. |
| **Patience** | Fast / Normal / Slow | How quickly standards relax over time. Fast patience → quicker acceptance after failed searches. |
| **Exploration** | Local / Balanced / Wide | Combined with mobility to control search scope within the grid. |
| **Preference Rule** | Attractiveness-based / Similarity-based | Attractiveness = prefer more attractive partners. Similarity = prefer partners close to your own attractiveness. |

### Preset Experiments

Click a preset button to auto-load a specific scenario:
- **Sparse + Low mobility + Attractiveness**: tests pure spatial constraint
- **Dense + High mobility + Attractiveness**: tests maximum search potential
- **Normal + High mobility + Similarity**: tests local assortment under similarity-based choice

---

## Known Limitations

This is an **approximation and teaching tool**, not a direct reproduction of the published study.

### Simplifications
1. **Grid-based world**: agents exist on discrete 2D space (not continuous)
2. **Uniform agent traits**: attractiveness is random integer (1–10), not rich multi-dimensional traits
3. **No re-pairing**: once matched, agents stay off the market
4. **Fixed steps**: simulation runs for a fixed count, not until convergence
5. **No spatial memory**: agents don't remember past encounters
6. **No courtship timing**: acceptance is binary, not probabilistic over time

### Comparison to Paper
- **Paper** (Smaldino & Schank 2012): studies spatial constraints on assortment with detailed agent behavior
- **This demo**: captures core intuitions about density, mobility, and matching
- **Results**: qualitatively similar directional effects, but NOT a numerical validation

### What This Demo Captures Well
✅ Spatial locality constrains encounters  
✅ Density affects encounter frequency  
✅ Mobility affects search efficiency  
✅ Preference rules shape assortment  
✅ Directional effects align with paper findings  

### What This Demo Approximates
⚠️ Exact parameter values are tuned for teachability, not accuracy  
⚠️ Batch statistics are from *this* simulation, not real population data  
⚠️ Hazard curves show early-run dynamics, not full lifecycle  

---

## Metrics Reference

### **Inter-pair Correlation (r)**
- **What it is**: Pearson correlation between attractiveness of matched pairs
- **Range**: -1 to +1
- **Interpretation**: 
  - r ≈ 0: partners have random attractiveness levels (no assortment)
  - r > 0.2: partners are somewhat similar (moderate assortment)
  - r > 0.4: partners are quite similar (strong assortment)
- **Why it matters**: higher r means spatial/rule constraints produced matching by similarity

### **Mean Date to Mate (t_m)**
- **What it is**: average step at which matched pairs formed
- **Range**: 1 to STEP_COUNT (default 50)
- **Interpretation**:
  - Low t_m (e.g., 15): pairs form quickly (high encounter rate or low selectivity)
  - High t_m (e.g., 40): pairs form slowly (low encounter rate or high selectivity)
- **Why it matters**: reveals how hard it is for agents to find acceptable partners

### **Mating Hazard h(t)**
- **What it is**: proportion of unmatched agents who find a match at step t
- **Formula**: matches(t) / at_risk(t)
- **Range**: 0 to 1
- **Interpretation**:
  - High early hazard: many matches happen early
  - Declining hazard: fewer potential partners remain
- **Why it matters**: shows when most pairing happens (early, middle, or late)

### **Matching Strength**
- **What it is**: simplified version of inter-pair correlation for quick reference
- **Range**: 0 (very different) to 1 (identical)
- **Interpretation**: how well-matched partners are on average

---

## Known Issues & Future Improvements

### High Priority (Interview-Ready)
- [ ] **Split `script.js` into modules** → easier to understand and maintain
- [ ] **Separate simulation logic from UI logic** → unit-testable engine
- [ ] **Add random seed input** → reproducible experiments
- [ ] **Add run-to-run comparison** → "what changed?"

### Medium Priority (Polish)
- [ ] **Add more presets with research questions** → better pedagogy
- [ ] **Clarify paper vs. approximation vs. demo** → honest framing
- [ ] **Move explanation text to JSON** → easier to edit
- [ ] **Add tests for core logic** → confidence in results

### Low Priority (Nice-to-Have)
- [ ] **Keyboard and screen reader improvements** → accessibility
- [ ] **Error boundary and loading states** → robustness
- [ ] **Browser storage for saved runs** → user convenience
- [ ] **Export run configuration as JSON** → reproducibility

---

## How This Helps in Interviews

### **Shows Systems Thinking**
- You can explain a complex agent-based model clearly
- You can break down spatial constraints, preference logic, and matching outcomes
- You demonstrate how research informs prototypes

### **Shows Pedagogy**
- You built an educational tool, not just a demo
- You considered different audiences (technical vs. everyday language)
- You used interactive visualization to teach research concepts

### **Shows Code Architecture Awareness**
- Current monolithic approach shows you *can* deliver results fast
- Planned modular refactor shows you *know* how to improve scalability
- You can explain trade-offs between rapid prototyping and long-term maintainability

### **Conversation Starters**
- "Why agent-based?" → You explain spatial constraints and emergence
- "How do you validate?" → You can compare to published findings qualitatively
- "What would you refactor?" → You have a clear roadmap (modules, tests, config)
- "How would this scale?" → You can discuss backend, React, streaming updates

---

## Citation

If you use this simulation in teaching or research, cite the original paper:

```bibtex
@article{smaldino2012institutional,
  title={Institutional interdependence induces mixed-motive games},
  author={Smaldino, Paul E and Schank, Jeffrey C},
  journal={Evolution and Human Behavior},
  volume={33},
  number={5},
  pages={530--538},
  year={2012},
  publisher={Elsevier}
}
```

And mention:
> "Simulation and interactive visualization inspired by and built to teach concepts from Smaldino & Schank (2012)."

---

## License

This project is created for educational purposes. Check the repository for licensing details.

---

## Contact & Feedback

Built as an interactive teaching tool for spatial mate choice theory.

Questions or improvements? Open an issue or submit a pull request on GitHub.

---

## Roadmap

**Phase 1 (Current)**: Interactive simulation + analytics + teaching chat  
**Phase 2 (Planned)**: Modular refactor + reproducibility + tests  
**Phase 3 (Future)**: Backend API + preset experiments + study deployment  
**Phase 4 (Vision)**: Full visualization suite + comparative run analysis + publication tools  
