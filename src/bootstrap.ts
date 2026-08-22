const params = new URLSearchParams(window.location.search);
const studio = params.get("studio");
const experiment = params.get("experiment");

if (studio === "1") {
  void import("./studio/index.js");
} else if (experiment === "cut") {
  void (async () => {
    await import("./cut-owner-gate.css");
    await import("./cut-demo.js");
    await import("./cut-owner-gate.js");
  })();
} else if (experiment === "bearing") {
  void (async () => {
    await import("./bearing-demo.css");
    await import("./bearing-owner-language.css");
    await import("./bearing-demo.js");
    await import("./bearing-owner-gate.js");
    await import("./bearing-owner-language.js");
  })();
} else if (experiment === "rebind") {
  void (async () => {
    await import("./rebind-demo.css");
    await import("./rebind-demo.js");
    await import("./rebind-owner-gate.js");
  })();
} else if (experiment === "load-rebind") {
  void import("./load-rebind-demo.js");
} else if (experiment === "torque") {
  void import("./torque-demo.js");
} else {
  void import("./main.js");
}
