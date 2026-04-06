# Human Mate Choice Models: Interactive Teaching Simulation

A web-based teaching tool for exploring how spatial constraints, mobility, and preference rules shape assortative mating patterns in agent-based simulations, inspired by **Smaldino & Schank (2012)**.

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
├── script.js               # All logic (simulation, analytics, chat, UI)
├── styles.css              # Layout and component styling
├── paper.html              # Embedded reference PDF viewer
├── smaldino-schank-2012.pdf # Research paper
├── package-lock.json       # NPM metadata (minimal)
└── README.md               # This file
```

### Current Architecture (Monolithic)
**Note:** `script.js` currently handles:
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
