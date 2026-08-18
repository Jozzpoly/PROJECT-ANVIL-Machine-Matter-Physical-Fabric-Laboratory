import "./bearing-demo.css";
import "./bearing-owner-language.css";
import "./cut-owner-gate.css";
import "./rebind-demo.css";

const experiment = new URLSearchParams(window.location.search).get("experiment");

if (experiment === "cut") {
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
} else {
  void import("./main.js");
}
