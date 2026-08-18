import "./bearing-demo.css";
import "./bearing-owner-language.css";
import "./cut-owner-gate.css";

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
} else {
  void import("./main.js");
}
