import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  StudioWorkspace,
  createEditableStarterSource,
  createEmptyStudioSource,
  previewRemoveMatter,
  type StudioGridFace,
  type StudioWorkspaceSnapshot,
} from "./workspace.js";
import { downloadStudioSource, readStudioSourceFile } from "./storage.js";
import {
  StudioViewport,
  type StudioMatterTool,
  type StudioViewportHit,
} from "./three/StudioViewport.js";

type StudioIntent = "select" | "matter";

const EMPTY_PREVIEW = createEmptyStudioSource();

export function StudioApp(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<StudioWorkspace | null>(null);
  const viewportRef = useRef<StudioViewport | null>(null);
  const activeMaterialRef = useRef("studio:alloy");

  const [snapshot, setSnapshot] = useState<StudioWorkspaceSnapshot | null>(null);
  const [showFirstRun, setShowFirstRun] = useState(true);
  const [intent, setIntent] = useState<StudioIntent>("select");
  const [matterTool, setMatterTool] = useState<StudioMatterTool>("add");
  const [selection, setSelection] = useState<string | null>(null);
  const [hover, setHover] = useState<StudioViewportHit | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refreshWorkspace = (): void => {
    const workspace = workspaceRef.current;
    if (workspace === null) {
      setSnapshot(null);
      return;
    }
    const next = workspace.snapshot();
    setSnapshot(next);
    const firstMaterial = next.source.matter.materials[0]?.id;
    if (
      firstMaterial !== undefined &&
      !next.source.matter.materials.some((material) => material.id === activeMaterialRef.current)
    ) {
      activeMaterialRef.current = firstMaterial;
    }
  };

  const startWorkspace = (source: ReturnType<typeof createEmptyStudioSource>): void => {
    workspaceRef.current = new StudioWorkspace(source);
    setSelection(null);
    setHover(null);
    setNotice(null);
    setIntent("select");
    setMatterTool("add");
    setShowFirstRun(false);
    refreshWorkspace();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const viewport = new StudioViewport(canvas, {
      onSelect: (cellId) => {
        setSelection(cellId);
        setNotice(null);
      },
      onHover: setHover,
      onAdd: (request) => {
        const workspace = workspaceRef.current;
        if (workspace === null) return;
        try {
          const id = request.kind === "seed"
            ? workspace.commitSeedMatter(activeMaterialRef.current)
            : workspace.commitAddMatterFromFace(
                request.cellId,
                request.face,
                activeMaterialRef.current,
              );
          setSelection(id);
          setNotice(null);
          refreshWorkspace();
        } catch (error: unknown) {
          setNotice(error instanceof Error ? error.message : "Matter Add failed");
        }
      },
      onRemove: (cellId) => {
        const workspace = workspaceRef.current;
        if (workspace === null) return;
        try {
          const result = workspace.commitRemoveMatter(cellId);
          setSelection((current) => current === cellId ? null : current);
          const dependencies = result.dependentBearingIds.length + result.dependentTorquePatchIds.length;
          setNotice(
            dependencies > 0
              ? `${dependencies} local ${dependencies === 1 ? "meaning remains" : "meanings remain"} to repair.`
              : null,
          );
          refreshWorkspace();
        } catch (error: unknown) {
          setNotice(error instanceof Error ? error.message : "Matter Remove failed");
        }
      },
    });
    viewportRef.current = viewport;
    return () => {
      viewportRef.current = null;
      viewport.dispose();
    };
  }, []);

  useEffect(() => {
    viewportRef.current?.setSource(snapshot?.source ?? EMPTY_PREVIEW);
  }, [snapshot]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    viewport.setTool(intent === "select" ? "select" : matterTool);
    viewport.clearDraft();
    setHover(null);
  }, [intent, matterTool]);

  useEffect(() => {
    viewportRef.current?.setSelection(selection);
  }, [selection]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const workspace = workspaceRef.current;
      if (event.key === "Escape") {
        viewportRef.current?.clearDraft();
        setHover(null);
        setNotice(null);
        return;
      }
      if (workspace === null || !event.ctrlKey) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        const current = workspace.snapshot();
        downloadStudioSource(current.source);
        workspace.markSaved();
        refreshWorkspace();
        return;
      }
      if (key !== "z") return;
      event.preventDefault();
      if (event.shiftKey) workspace.redo();
      else workspace.undo();
      setSelection(null);
      setNotice(null);
      refreshWorkspace();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const selectedCell = useMemo(
    () => snapshot?.source.matter.cells.find((cell) => cell.id === selection) ?? null,
    [snapshot, selection],
  );
  const selectedMaterial = useMemo(
    () => snapshot?.source.matter.materials.find((material) => material.id === selectedCell?.materialId) ?? null,
    [snapshot, selectedCell],
  );
  const removePreview = useMemo(() => {
    if (snapshot === null || intent !== "matter" || matterTool !== "remove" || hover === null) return null;
    try {
      return previewRemoveMatter(snapshot.source, hover.cellId);
    } catch {
      return null;
    }
  }, [snapshot, intent, matterTool, hover]);

  const chooseMatterTool = (tool: StudioMatterTool): void => {
    setIntent("matter");
    setMatterTool(tool);
    setNotice(null);
  };

  const undo = (): void => {
    if (workspaceRef.current?.undo()) {
      setSelection(null);
      setNotice(null);
      refreshWorkspace();
    }
  };

  const redo = (): void => {
    if (workspaceRef.current?.redo()) {
      setSelection(null);
      setNotice(null);
      refreshWorkspace();
    }
  };

  const save = (): void => {
    const workspace = workspaceRef.current;
    if (workspace === null) return;
    downloadStudioSource(workspace.snapshot().source);
    workspace.markSaved();
    refreshWorkspace();
  };

  const openFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file === undefined) return;
    try {
      startWorkspace(await readStudioSourceFile(file));
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Open failed");
    }
  };

  const assignMaterial = (materialId: string): void => {
    const workspace = workspaceRef.current;
    if (workspace === null || selectedCell === null || selectedCell.materialId === materialId) return;
    try {
      workspace.commitAssignMaterial(selectedCell.id, materialId);
      activeMaterialRef.current = materialId;
      setNotice(null);
      refreshWorkspace();
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Material assignment failed");
    }
  };

  const dependentCount =
    (removePreview?.dependentBearingIds.length ?? 0) +
    (removePreview?.dependentTorquePatchIds.length ?? 0);

  return (
    <main
      className="studio-surface"
      data-anvil-studio="substrate"
      data-authored-cells={snapshot?.source.matter.cells.length ?? 0}
      data-source-generation={snapshot?.sourceGeneration ?? 0}
    >
      <canvas
        ref={canvasRef}
        className="studio-world"
        data-studio-world="true"
        aria-label="ANVIL Studio world canvas"
      />

      <section className="studio-workspace-dock studio-island" aria-label="Workspace">
        <div className="studio-brand">ANVIL <span>STUDIO</span></div>
        {snapshot !== null && <span className="studio-workspace-state">{snapshot.dirty ? "UNSAVED" : "SAVED"}</span>}
        <div className="studio-button-row">
          <button type="button" onClick={() => setShowFirstRun(true)}>New</button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>Open</button>
          <button type="button" onClick={save} disabled={snapshot === null}>Save</button>
          <span className="studio-separator" />
          <button type="button" onClick={undo} disabled={!snapshot?.canUndo} aria-label="Undo">↶</button>
          <button type="button" onClick={redo} disabled={!snapshot?.canRedo} aria-label="Redo">↷</button>
        </div>
        <input
          ref={fileInputRef}
          className="studio-file-input"
          type="file"
          accept="application/json,.json"
          onChange={(event) => void openFile(event)}
        />
      </section>

      {snapshot !== null && (
        <nav className="studio-intent-rail studio-island" aria-label="Intent">
          <button
            type="button"
            className={intent === "select" ? "active" : ""}
            onClick={() => setIntent("select")}
          >Select</button>
          <button
            type="button"
            className={intent === "matter" ? "active" : ""}
            onClick={() => setIntent("matter")}
          >Matter</button>
        </nav>
      )}

      {snapshot !== null && intent === "matter" && (
        <section className="studio-context-pod studio-island" aria-label="Matter tools">
          <div className="studio-pod-title">MATTER</div>
          <div className="studio-tool-tabs">
            <button type="button" className={matterTool === "add" ? "active" : ""} onClick={() => chooseMatterTool("add")}>Add</button>
            <button type="button" className={matterTool === "remove" ? "active" : ""} onClick={() => chooseMatterTool("remove")}>Remove</button>
            <button type="button" className={matterTool === "material" ? "active" : ""} onClick={() => chooseMatterTool("material")}>Material</button>
          </div>

          {matterTool === "add" && (
            <p>{snapshot.source.matter.cells.length === 0 ? "Click the origin ghost to place the first cell." : "Hover an exposed face and click to add one cell."}</p>
          )}
          {matterTool === "remove" && (
            <p>
              {hover === null
                ? "Hover a cell to preview removal."
                : dependentCount > 0
                  ? `Removal keeps ${dependentCount} local ${dependentCount === 1 ? "meaning" : "meanings"} as intent to repair.`
                  : "Click to remove this cell."}
            </p>
          )}
          {matterTool === "material" && (
            selectedCell === null ? (
              <p>Select a Matter cell, then choose one of this workspace's materials.</p>
            ) : (
              <div className="studio-material-list">
                {snapshot.source.matter.materials.map((material, index) => (
                  <button
                    type="button"
                    key={material.id}
                    className={material.id === selectedCell.materialId ? "active" : ""}
                    onClick={() => assignMaterial(material.id)}
                    title={`Material ${index + 1}`}
                  >
                    <span className="studio-material-swatch" style={{ background: material.displayColor }} />
                    Material {index + 1}
                  </button>
                ))}
              </div>
            )
          )}
          {notice !== null && <p className="studio-notice">{notice}</p>}
        </section>
      )}

      {snapshot !== null && intent === "select" && selectedCell !== null && (
        <section className="studio-context-pod studio-island" aria-label="Selection">
          <div className="studio-pod-title">MATTER CELL</div>
          <p>
            Grid {selectedCell.grid.x}, {selectedCell.grid.y}, {selectedCell.grid.z}
            {selectedMaterial !== null ? ` · ${selectedMaterial.displayColor}` : ""}
          </p>
          <p className="studio-hint">F focuses the current selection.</p>
        </section>
      )}

      {showFirstRun && (
        <section className="studio-first-run studio-island" aria-label="New workspace">
          <div className="studio-pod-title">NEW WORKSPACE</div>
          <p>Start with empty matter or a small editable construction.</p>
          <div className="studio-button-row">
            <button type="button" onClick={() => startWorkspace(createEmptyStudioSource())}>Empty</button>
            <button type="button" onClick={() => startWorkspace(createEditableStarterSource())}>Editable Starter</button>
            {snapshot !== null && <button type="button" className="quiet" onClick={() => setShowFirstRun(false)}>Cancel</button>}
          </div>
        </section>
      )}
    </main>
  );
}
