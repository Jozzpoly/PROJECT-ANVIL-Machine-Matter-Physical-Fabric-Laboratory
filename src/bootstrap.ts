const experiment = new URLSearchParams(window.location.search).get("experiment");

if (experiment === "cut") {
  void import("./cut-demo.js");
} else {
  void import("./main.js");
}
