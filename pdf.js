/**
 * PDF.js v4.2.67 (build: 3f25e73e3)
 * Licensed under the Apache License, Version 2.0.
 * https://mozilla.github.io/pdf.js/
 */

"use strict";

var pdfjsLib = {};

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.pdfjsLib = factory();
  }
})(this, function () {
  var pdfjsVersion = '4.2.67';
  var pdfjsBuild = '3f25e73e3';

  const createPDFWorker = function () {
    return new Worker('pdf.worker.js');
  };

  const getDocument = function (src) {
    if (typeof src === "string" || src instanceof URL) {
      return pdfjsLib.GlobalWorkerOptions.getDocument(src);
    } else if (src.data) {
      return pdfjsLib.GlobalWorkerOptions.getDocument({ data: src.data });
    } else {
      throw new Error('Invalid PDF source');
    }
  };

  return {
    version: pdfjsVersion,
    build: pdfjsBuild,
    getDocument,
    createPDFWorker,
    GlobalWorkerOptions: {
      getDocument: function (src) {
        return window['pdfjs-dist/build/pdf'].getDocument(src);
      },
    }
  };
});
// Configure PDF.js default worker
if (typeof window !== 'undefined' && window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions = {
    workerSrc: 'pdf.worker.js'
  };
}

// Simple wrapper for browser environments
if (typeof window !== 'undefined') {
  window.pdfjsLib = pdfjsLib;
}
