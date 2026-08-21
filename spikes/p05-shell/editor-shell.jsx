import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createThreeViewport } from "./three-viewport.js";

window.__P05B = {
  reactRenderCount: 0,
  rendererFrames: 0,
  runtimeSpeedRadps: 0,
  ready: false,
  selection: null,
  preview: null,
  targetCellId: null,
  targetScreen: null,
  sourceSnapshot: null,
  sourceUntouched: false,
};

function InspectorValue({ className = "", children, ...props }) {
  return <span className={`v ${className}`} {...props}>{children}</span>;
}

function App() {
  window.__P05B.reactRenderCount += 1;
  const canvasRef = useRef(null);
  const controllerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [selection, setSelection] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let controller = null;
    createThreeViewport({
      canvas: canvasRef.current,
      onReady(info) {
        if (cancelled) return;
        window.__P05B.ready = true;
        window.__P05B.targetCellId = info.targetCellId;
        window.__P05B.targetScreen = info.targetScreen;
        window.__P05B.sourceSnapshot = info.sourceSnapshot;
        window.__P05B.sourceUntouched = info.sourceUntouched();
        setReady(true);
      },
      onSelection(nextSelection) {
        if (cancelled) return;
        window.__P05B.selection = nextSelection;
        setSelection(nextSelection);
      },
      onPreview(nextPreview) {
        if (cancelled) return;
        window.__P05B.preview = nextPreview;
        setPreview(nextPreview);
      },
    }).then((created) => {
      if (cancelled) {
        created.dispose();
        return;
      }
      controller = created;
      controllerRef.current = created;
    });
    return () => {
      cancelled = true;
      controllerRef.current = null;
      controller?.dispose();
    };
  }, []);

  function nudgePreview() {
    const controller = controllerRef.current;
    if (!controller) return;
    controller.nudgePreview();
    window.__P05B.sourceUntouched = controller.sourceUntouched();
  }

  return (
    <main className="shell">
      <section className="viewport-wrap">
        <canvas id="editor-viewport" ref={canvasRef} />
        <div className="badge">
          <strong>ANVIL P05b · Three + React</strong>
          <span>technology boundary proof — not Studio product UI</span>
        </div>
      </section>
      <aside className="inspector" aria-label="Technology proof inspector">
        <h1>Editor shell boundary</h1>
        <p className="sub">React owns sparse editor state. Three owns the hot render loop.</p>
        <div className="group">
          <h2>Runtime</h2>
          <div className="kv"><span className="k">state</span><InspectorValue className={ready ? "ok" : ""}>{ready ? "ready" : "booting"}</InspectorValue></div>
          <div className="kv"><span className="k">ownership</span><InspectorValue>renderer loop outside React</InspectorValue></div>
        </div>
        <div className="group">
          <h2>Selection bridge</h2>
          <div className="kv"><span className="k">cell</span><InspectorValue className="pick" id="selected-cell">{selection?.cellId ?? "none"}</InspectorValue></div>
          <div className="kv"><span className="k">face</span><InspectorValue className="pick" id="selected-face">{selection?.face ?? "none"}</InspectorValue></div>
        </div>
        <div className="group">
          <h2>Presentation gizmo</h2>
          <div className="kv"><span className="k">preview X</span><InspectorValue id="preview-x">{preview ? preview.x.toFixed(3) : "—"}</InspectorValue></div>
          <button id="nudge-preview" type="button" onClick={nudgePreview}>Nudge presentation proxy +0.1 X</button>
          <p className="note">The gizmo proxy is presentation/editor state. This action must not mutate authored Matter/Bearing/Torque source.</p>
        </div>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
