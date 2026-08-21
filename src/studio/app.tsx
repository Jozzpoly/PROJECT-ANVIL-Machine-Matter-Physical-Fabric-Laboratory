import { useEffect, useRef } from "react";
import { StudioViewport } from "./three/StudioViewport.js";

export function StudioApp(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const viewport = new StudioViewport(canvas);
    return () => viewport.dispose();
  }, []);

  return (
    <main className="studio-surface" data-anvil-studio="substrate">
      <canvas
        ref={canvasRef}
        className="studio-world"
        data-studio-world="true"
        aria-label="ANVIL Studio world canvas"
      />
      <div className="studio-substrate-marker" aria-hidden="true">ANVIL · STUDIO</div>
    </main>
  );
}
