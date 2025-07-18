/*!
 * pdf.js v4.2.67 build
 * https://mozilla.github.io/pdf.js/
 *
 * Copyright 2024 Mozilla Foundation
 * Licensed under Apache License 2.0
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.pdfjsLib = factory();
  }
})(this, function () {
  "use strict";

  const pdfjsVersion = "4.2.67";
  const pdfjsBuild = "4.2.67";
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = pdfjsLib;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() { return pdfjsLib; });
  } else {
    this.pdfjsLib = pdfjsLib;
  }
}).call(this);
