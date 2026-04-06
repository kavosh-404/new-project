/**
 * script.js
 * Tiny bootstrap for the application.
 */

(function bootstrapMateChoiceApp() {
  const start = function startApp() {
    if (typeof window.MateChoiceSimulation !== "function") {
      console.error("MateChoiceSimulation class not found. Check script loading order.");
      return;
    }
    if (window.__mateChoiceAppInstance) {
      return;
    }
    window.__mateChoiceAppInstance = new window.MateChoiceSimulation();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
