import "./bearing-demo.css";
import "./bearing-owner-language.css";
import "./cut-owner-gate.css";
import "./rebind-demo.css";

const params = new URLSearchParams(window.location.search);
const experiment = params.get("experiment");
const studio = params.get("studio");
const activeRoot = studio === null && experiment === null;

if (studio === "1" || activeRoot) {
  void (async () => {
    const presentation = await import("./studio-r2/semantic-presentation.js");
    presentation.installSemanticPresentation();
    const loose = await import("./studio-r2/loose.js");
    loose.installLooseWorkspaceCapture();
    await import("./studio-r2/app.js");
    const readiness = await import("./studio-r2/blind-test-readiness.js");
    readiness.installBlindTestReadiness();
    loose.installLooseTray();
  })();
} else if (experiment === "cut") {
  void (async () => {
    await import("./cut-demo.js");
    await import("./cut-owner-gate.js");
  })();
} else if (experiment === "bearing") {
  void (async () => {
    await import("./bearing-demo.js");
    await import("./bearing-owner-gate.js");
    await import("./bearing-owner-language.js");
  })();
} else if (experiment === "rebind") {
  void (async () => {
    await import("./rebind-demo.js");
    await import("./rebind-owner-gate.js");
  })();
} else if (experiment === "load-rebind") {
  void import("./load-rebind-demo.js");
} else if (experiment === "torque") {
  void import("./torque-demo.js");
} else if (experiment === "collapse" || studio === "0") {
  void import("./main.js");
} else {
  void import("./main.js");
}
