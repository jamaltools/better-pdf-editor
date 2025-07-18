/*! pdf.js v4.2.67 | (c) Mozilla and contributors | pdfjs-dist */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.pdfjsWorker = factory();
  }
})(this, function () {
  "use strict";

  const globalScope =
    typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : typeof self !== "undefined"
      ? self
      : {};

  const pdfjsVersion = "4.2.67";
  const pdfjsBuild = "9b894512e";

  const workerVersion = pdfjsVersion + "-" + pdfjsBuild;

  function isWorker() {
    return (
      typeof WorkerGlobalScope !== "undefined" &&
      self instanceof WorkerGlobalScope
    );
  }

  function warn(msg) {
    if (typeof console !== "undefined" && console.warn) {
      console.warn("PDF.js worker: " + msg);
    }
  }

  // Core PDF parsing and rendering logic goes here.
  // This is a placeholder. The actual worker code is larger.
  // Initialize worker scope
  if (isWorker()) {
    self.pdfjsWorkerVersion = workerVersion;

    self.addEventListener("message", function (e) {
      const data = e.data;
      switch (data.type) {
        case "init":
          self.postMessage({ type: "ready", version: workerVersion });
          break;

        case "parsePDF":
          try {
            const result = parsePDF(data.pdfData);
            self.postMessage({ type: "parsed", result: result });
          } catch (err) {
            self.postMessage({ type: "error", message: err.message });
          }
          break;

        default:
          warn("Unknown message type: " + data.type);
      }
    });

    function parsePDF(pdfData) {
      // Minimal mockup for parsing PDF. In full builds, this handles streams.
      return { text: "PDF parsed successfully (mockup)." };
    }
  } else {
    warn("pdf.worker.js loaded outside of worker context.");
  }

  return {
    version: workerVersion,
  };
});
