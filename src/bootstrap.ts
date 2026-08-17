const experiment = new URLSearchParams(window.location.search).get("experiment");

if (experiment === "cut") {
  void (async () => {
    await import("./cut-demo.js");
    await import("./cut-owner-gate.js");
  })();
} else if (experiment === "bearing") {
  void import("./bearing-demo.js");
} else {
  void import("./main.js");
}
