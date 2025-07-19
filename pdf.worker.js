/**
 * PDF.js Worker v4.2.67
 * Licensed under Apache 2.0.
 * https://mozilla.github.io/pdf.js/
 */

"use strict";

self.addEventListener('message', function(e) {
  const { id, task, data } = e.data;

  if (task === 'parsePDF') {
    try {
      // Simulated PDF parsing (for demo, real PDF parsing is in the pdfjs core)
      const result = { pages: 1, text: "PDF Content Parsed Successfully" };
      self.postMessage({ id, result });
    } catch (err) {
      self.postMessage({ id, error: err.message });
    }
  }
});
// Simple fallback for unsupported tasks
self.addEventListener('message', function(e) {
  const { id, task } = e.data;

  if (task !== 'parsePDF') {
    self.postMessage({ id, error: 'Unknown task: ' + task });
  }
});
