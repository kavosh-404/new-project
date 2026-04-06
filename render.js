/**
 * render.js
 * Canvas rendering for the mate choice simulation
 * Handles all drawing: grid, agents, pairs, charts
 */

class RenderEngine {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
  }

  /**
   * Prepare high-DPI canvas (for retina displays)
   */
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

  /**
   * Full render of simulation state
   */
  draw(agents, pairs, canvasSize) {
    this.context.clearRect(0, 0, canvasSize, canvasSize);
    this.drawGrid(canvasSize);
    this.drawPairs(pairs, agents);
    this.drawAgents(agents);
  }

  /**
   * Draw background grid
   */
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

  /**
   * Draw matched pair connections
   */
  drawPairs(pairs, agents) {
    this.context.strokeStyle = "#ff4d4d";
    this.context.lineWidth = 2.5;

    pairs.forEach((pair) => {
      const first = agents[pair.agent1];
      const second = agents[pair.agent2];

      this.context.beginPath();
      this.context.moveTo(first.x, first.y);
      this.context.lineTo(second.x, second.y);
      this.context.stroke();
    });
  }

  /**
   * Draw individual agents
   */
  drawAgents(agents) {
    agents.forEach((agent) => {
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

  /**
   * Get hue-based color for agent attractiveness
   */
  getAgentColor(attractiveness) {
    const hue = 210 + attractiveness * 1.5;
    const saturation = 70;
    const lightness = 62 - attractiveness * 1.6;
    return "hsl(" + hue + " " + saturation + "% " + lightness + "%)";
  }

  /**
   * Draw bar chart (generic)
   */
  drawBarChart(canvas, values, labels, colors) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const chartSize = this.prepareHiDPICanvas(canvas, 240);
    const width = chartSize.width;
    const height = chartSize.height;

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

    const maxValue = Math.max(...values, 0.01);

    values.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight;
      const barX = left + index * (barWidth + barGap);
      const barY = bottom - barHeight;

      ctx.fillStyle = colors[index] || "#374151";
      ctx.fillRect(barX, barY, barWidth, barHeight);
    });

    ctx.fillStyle = "#3e352d";
    ctx.font = "11px Instrument Sans, sans-serif";
    ctx.textAlign = "center";

    labels.forEach((label, index) => {
      const x = left + index * (barWidth + barGap) + barWidth / 2;
      ctx.fillText(label, x, bottom + 16);
    });
  }

  /**
   * Draw line chart (generic)
   */
  drawLineChart(canvas, dataSeries, labels, colors, yAxisLabel) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const chartSize = this.prepareHiDPICanvas(canvas, 260);
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

    // Find max value across all series
    const maxValue = Math.max(
      0.01,
      ...dataSeries.map((series) => Math.max(...series))
    );

    // Draw axes
    ctx.strokeStyle = "rgba(79, 57, 36, 0.25)";
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.stroke();

    // Draw each series
    dataSeries.forEach((series, seriesIndex) => {
      ctx.beginPath();
      ctx.strokeStyle = colors[seriesIndex] || "#374151";
      ctx.lineWidth = 2;

      series.forEach((value, pointIndex) => {
        const x = left + (pointIndex / Math.max(1, series.length - 1)) * chartWidth;
        const y = bottom - (value / maxValue) * chartHeight;
        if (pointIndex === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
    });

    // Draw y-axis label
    ctx.fillStyle = "#3e352d";
    ctx.font = "11px Instrument Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(yAxisLabel, left + 4, top - 8);
  }

  /**
   * Draw grouped bar chart for figure comparison
   */
  drawGroupedBars(canvas, data, yLabel) {
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

    // Draw bars
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

    // Draw legend
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
}
