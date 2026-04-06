/**
 * export.js
 * CSV, PNG, and citation export functionality
 */

class ExportEngine {
  /**
   * Build CSV text from run metrics and pairs
   */
  static buildRunCsvText(metrics, settings) {
    const lines = [
      `date,${new Date().toISOString()}`,
      `mobility,${settings.mobilityLevel}`,
      `density,${settings.densityLevel}`,
      `preferenceRule,${settings.preferenceRule}`,
      `selectivity,${settings.selectivityLevel}`,
      `patience,${settings.patienceLevel}`,
      `exploration,${settings.explorationLevel}`,
      `pairs,${metrics.pairs.length}`,
      `matchingStrength,${metrics.matchingStrength.toFixed(4)}`,
      `averageSearchSteps,${metrics.averageSearchSteps.toFixed(2)}`,
      `matchedAgents,${metrics.matchedAgents}`,
      `totalAgents,${metrics.agents.length}`,
      "",
      "pair_id,a_id,b_id,a_attr,b_attr",
    ];

    metrics.pairs.forEach((pair, index) => {
      const a = metrics.agents[pair.a];
      const b = metrics.agents[pair.b];
      lines.push(
        `${index},${pair.a},${pair.b},${a ? a.attr : "?"},${b ? b.attr : "?"}`
      );
    });

    return lines.join("\n");
  }

  /**
   * Trigger file download
   */
  static triggerDownload(urlOrBlob, filename) {
    const link = document.createElement("a");
    link.href = typeof urlOrBlob === "string" ? urlOrBlob : URL.createObjectURL(urlOrBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URLs
    if (typeof urlOrBlob !== "string") {
      URL.revokeObjectURL(link.href);
    }
  }

  /**
   * Download run as CSV
   */
  static downloadCsv(metrics, settings) {
    const csvText = this.buildRunCsvText(metrics, settings);
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    this.triggerDownload(blob, "simulation-summary.csv");
  }

  /**
   * Download canvas as PNG
   */
  static downloadPng(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    this.triggerDownload(dataUrl, "simulation-grid.png");
  }

  /**
   * Build preview report data for CSV preview modal
   */
  static buildPreviewReportData(metrics, settings, maxPairs = 200) {
    // Compute pair difference distribution
    const pairDifferences = metrics.pairs.map((pair) => {
      const a = metrics.agents[pair.a];
      const b = metrics.agents[pair.b];
      return a && b ? Math.abs(a.attr - b.attr) : 0;
    });

    const bins = [0, 0, 0, 0, 0]; // 0-1, 1-2, 2-3, 3-4, 4-5
    pairDifferences.forEach((diff) => {
      if (diff < 1) bins[0]++;
      else if (diff < 2) bins[1]++;
      else if (diff < 3) bins[2]++;
      else if (diff < 4) bins[3]++;
      else bins[4]++;
    });

    const lowDiffCount = bins[0] + bins[1]; // 0-2 bin
    const lowDiffPct = ((lowDiffCount / Math.max(1, metrics.pairs.length)) * 100).toFixed(0);

    const structureLabel =
      lowDiffPct > 60 ? "highly sorted" : lowDiffPct > 35 ? "moderately sorted" : "weakly sorted";

    return {
      metrics,
      settings,
      pairDifferenceBins: bins,
      structureLabel,
      lowDiffPct,
    };
  }

  /**
   * Get structure interpretation text
   */
  static getStructureInterpretation(lowDiffPct, structureLabel) {
    if (structureLabel === "highly sorted") {
      return `${lowDiffPct}% of pairs have low attractiveness differences (0–2 points), indicating strong assortative pairing.`;
    }
    if (structureLabel === "moderately sorted") {
      return `${lowDiffPct}% of pairs have low attractiveness differences, showing moderate assortment with some mixing.`;
    }
    return `${lowDiffPct}% of pairs have low attractiveness differences, indicating weak assortment and considerable mating across the attractiveness spectrum.`;
  }

  /**
   * Determine CSV dialog visibility state
   */
  static setExportEnabled(isEnabled, buttons) {
    if (buttons.previewCsvButton) buttons.previewCsvButton.disabled = !isEnabled;
    if (buttons.downloadCsvButton) buttons.downloadCsvButton.disabled = !isEnabled;
    if (buttons.downloadPngButton) buttons.downloadPngButton.disabled = !isEnabled;
    if (buttons.copyCitationButton) buttons.copyCitationButton.disabled = !isEnabled;
  }
}

// Export for use in other modules
window.ExportEngine = ExportEngine;
