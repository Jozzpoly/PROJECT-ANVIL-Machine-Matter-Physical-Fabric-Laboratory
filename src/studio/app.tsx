import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { BearingAxis } from "../experiments/anvil-02-bearing.js";
import {
  BreakLabRuntimeSession,
  classifyBreakLabSource,
  type BreakLabClassification,
} from "./break-lab.js";
import { classifyStudioSource, type StudioClassification } from "./compile.js";
import { resolveBearingTarget, resolveTorqueTarget } from "./meaning.js";
import {
  StudioRuntimeSession,
  createStudioRuntimeIdSource,
  type StudioRuntimeActivation,
} from "./runtime.js";
import { downloadStudioSource, readStudioSourceFile } from "./storage.js";
import {
  StudioViewport,
  type StudioMatterTool,
  type StudioMeaningTool,
  type StudioViewportHit,
} from "./three/StudioViewport.js";
import type {
  StudioBearingDraftVisual,
  StudioTorqueDraftVisual,
} from "./three/StudioMeaningPresentation.js";
import {
  StudioWorkspace,
  createEditableStarterSource,
  createEmptyStudioSource,
  previewRemoveMatter,
  type StudioWorkspaceSnapshot,
} from "./workspace.js";

type StudioIntent = "select" | "matter" | "meaning";
type StudioWorkState = "BUILD" | "RUNNING" | "PAUSED";
type StudioRuntimeMode = "STANDARD" | "BREAK";
type ActiveStudioRuntime = StudioRuntimeSession | BreakLabRuntimeSession;

interface StudioBearingDraft extends StudioBearingDraftVisual {
  readonly bearingId: string | null;
  readonly legalAxes: readonly [BearingAxis, BearingAxis];
}

interface StudioTorqueDraft extends StudioTorqueDraftVisual {
  readonly patchId: string | null;
}

const EMPTY_PREVIEW = createEmptyStudioSource();
const DEFAULT_TORQUE_EFFORT_NM = 100;

export function StudioApp(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceRef = useRef<StudioWorkspace | null>(null);
  const viewportRef = useRef<StudioViewport | null>(null);
  const runtimeRef = useRef<ActiveStudioRuntime | null>(null);
  const runtimeModeRef = useRef<StudioRuntimeMode | null>(null);
  const runtimeIdSourceRef = useRef(createStudioRuntimeIdSource());
  const runtimeStartingRef = useRef(false);
  const workStateRef = useRef<StudioWorkState>("BUILD");
  const activeMaterialRef = useRef("studio:alloy");
  const meaningToolRef = useRef<StudioMeaningTool>("bearing");
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const [snapshot, setSnapshot] = useState<StudioWorkspaceSnapshot | null>(null);
  const [classification, setClassification] = useState<StudioClassification | null>(null);
  const [breakClassification, setBreakClassification] = useState<BreakLabClassification | null>(null);
  const [classificationFault, setClassificationFault] = useState<string | null>(null);
  const [showFirstRun, setShowFirstRun] = useState(true);
  const [intent, setIntent] = useState<StudioIntent>("select");
  const [matterTool, setMatterTool] = useState<StudioMatterTool>("add");
  const [meaningTool, setMeaningTool] = useState<StudioMeaningTool>("bearing");
  const [bearingDraft, setBearingDraft] = useState<StudioBearingDraft | null>(null);
  const [torqueDraft, setTorqueDraft] = useState<StudioTorqueDraft | null>(null);
  const [torqueText, setTorqueText] = useState("");
  const [selection, setSelection] = useState<string | null>(null);
  const [hover, setHover] = useState<StudioViewportHit | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [workState, setWorkState] = useState<StudioWorkState>("BUILD");
  const [runtimeMode, setRuntimeMode] = useState<StudioRuntimeMode | null>(null);
  const [runtimeActivation, setRuntimeActivation] = useState<StudioRuntimeActivation>("OFF");
  const [runtimeSessionId, setRuntimeSessionId] = useState<string | null>(null);
  const [runtimeStarting, setRuntimeStarting] = useState(false);

  meaningToolRef.current = meaningTool;

  const setWorkStateValue = (next: StudioWorkState): void => {
    workStateRef.current = next;
    setWorkState(next);
  };

  const setRuntimeModeValue = (next: StudioRuntimeMode | null): void => {
    runtimeModeRef.current = next;
    setRuntimeMode(next);
  };

  const requireBuild = (): boolean => {
    if (workStateRef.current === "BUILD" && !runtimeStartingRef.current && runtimeRef.current === null) return true;
    setNotice("REQUIRES BUILD · Stop & Edit before changing authored source.");
    return false;
  };

  const refreshWorkspace = (): void => {
    const workspace = workspaceRef.current;
    if (workspace === null) {
      setSnapshot(null);
      setClassification(null);
      setBreakClassification(null);
      setClassificationFault(null);
      return;
    }
    const next = workspace.snapshot();
    setSnapshot(next);
    setBreakClassification(classifyBreakLabSource(next.source));
    try {
      setClassification(classifyStudioSource(next.source, next.sourceGeneration));
      setClassificationFault(null);
    } catch (error: unknown) {
      console.error(error);
      setClassification(null);
      setClassificationFault("Studio could not evaluate the current authored meaning.");
    }
    const firstMaterial = next.source.matter.materials[0]?.id;
    if (
      firstMaterial !== undefined &&
      !next.source.matter.materials.some((material) => material.id === activeMaterialRef.current)
    ) {
      activeMaterialRef.current = firstMaterial;
    }
  };

  const clearMeaningDraft = (): void => {
    setBearingDraft(null);
    setTorqueDraft(null);
    setTorqueText("");
    viewportRef.current?.setBearingDraft(null);
    viewportRef.current?.setTorqueDraft(null);
  };

  const startWorkspace = (source: ReturnType<typeof createEmptyStudioSource>): void => {
    if (!requireBuild()) return;
    workspaceRef.current = new StudioWorkspace(source);
    setSelection(null);
    setHover(null);
    setNotice(null);
    setIntent("select");
    setMatterTool("add");
    setMeaningTool("bearing");
    meaningToolRef.current = "bearing";
    clearMeaningDraft();
    setShowFirstRun(false);
    refreshWorkspace();
  };

  const commitBearingDraft = (draft: StudioBearingDraft): void => {
    if (!requireBuild()) return;
    const workspace = workspaceRef.current;
    if (workspace === null) return;
    try {
      if (draft.bearingId === null) {
        workspace.commitAddBearing(draft.endpointA, draft.endpointB, draft.freeAxis);
      } else {
        workspace.commitEditBearing(draft.bearingId, draft.endpointA, draft.endpointB, draft.freeAxis);
      }
      setNotice(null);
      clearMeaningDraft();
      refreshWorkspace();
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Bearing commit failed");
    }
  };

  const commitTorqueDraft = (draft: StudioTorqueDraft): void => {
    if (!requireBuild()) return;
    const workspace = workspaceRef.current;
    if (workspace === null || !Number.isFinite(draft.effortNm)) return;
    try {
      if (draft.patchId === null) {
        workspace.commitAddTorquePatch(draft.target, draft.effortNm);
      } else {
        workspace.commitEditTorquePatch(draft.patchId, draft.target, draft.effortNm);
      }
      setNotice(null);
      clearMeaningDraft();
      refreshWorkspace();
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "TorquePatch commit failed");
    }
  };

  const disposeRuntimeToBuild = (): void => {
    const runtime = runtimeRef.current;
    viewportRef.current?.detachRuntime();
    runtimeRef.current = null;
    runtime?.dispose();
    setRuntimeModeValue(null);
    setWorkStateValue("BUILD");
    setRuntimeActivation("OFF");
    setRuntimeSessionId(null);
  };

  const startRuntime = async (): Promise<void> => {
    if (runtimeStartingRef.current || runtimeRef.current !== null || workStateRef.current !== "BUILD") return;
    const workspace = workspaceRef.current;
    const viewport = viewportRef.current;
    if (workspace === null || viewport === null) return;

    const current = workspace.snapshot();
    let currentClassification: StudioClassification;
    try {
      currentClassification = classifyStudioSource(current.source, current.sourceGeneration);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Studio could not prepare this realization.");
      return;
    }
    setClassification(currentClassification);
    if (currentClassification.runReadiness !== "READY") {
      setNotice("RUN requires one current valid and supported Bearing + TorquePatch composition.");
      return;
    }

    runtimeStartingRef.current = true;
    setRuntimeStarting(true);
    clearMeaningDraft();
    setIntent("select");
    setHover(null);
    setNotice(null);

    let runtime: StudioRuntimeSession | null = null;
    try {
      runtime = await StudioRuntimeSession.create(
        current.source,
        current.sourceGeneration,
        currentClassification,
        runtimeIdSourceRef.current,
      );
      const latest = workspace.snapshot();
      if (latest.sourceGeneration !== current.sourceGeneration) {
        throw new Error("Authored source changed while Studio was creating the runtime session");
      }
      viewport.attachRuntime(runtime);
      runtimeRef.current = runtime;
      setRuntimeModeValue("STANDARD");
      setRuntimeSessionId(runtime.sessionId);
      setRuntimeActivation(runtime.activation);
      setWorkStateValue("RUNNING");
      runtime = null;
    } catch (error: unknown) {
      runtime?.dispose();
      setRuntimeModeValue(null);
      setNotice(error instanceof Error ? error.message : "Studio could not create the runtime session.");
      setWorkStateValue("BUILD");
      setRuntimeActivation("OFF");
      setRuntimeSessionId(null);
    } finally {
      runtimeStartingRef.current = false;
      setRuntimeStarting(false);
    }
  };

  const startBreakRuntime = async (): Promise<void> => {
    if (runtimeStartingRef.current || runtimeRef.current !== null || workStateRef.current !== "BUILD") return;
    const workspace = workspaceRef.current;
    const viewport = viewportRef.current;
    if (workspace === null || viewport === null) return;

    const current = workspace.snapshot();
    const currentBreak = classifyBreakLabSource(current.source);
    setBreakClassification(currentBreak);
    if (currentBreak.eligibility !== "ELIGIBLE" || currentBreak.compilation === null) {
      setNotice(`BREAK RUN unavailable · ${currentBreak.reason}`);
      return;
    }

    runtimeStartingRef.current = true;
    setRuntimeStarting(true);
    clearMeaningDraft();
    setIntent("select");
    setHover(null);
    setNotice(null);

    let runtime: BreakLabRuntimeSession | null = null;
    try {
      runtime = await BreakLabRuntimeSession.create(
        current.source,
        current.sourceGeneration,
        runtimeIdSourceRef.current,
      );
      const latest = workspace.snapshot();
      if (latest.sourceGeneration !== current.sourceGeneration) {
        throw new Error("Authored source changed while Break Lab was creating the runtime session");
      }
      // BreakLabRuntimeSession deliberately satisfies the viewport's solver-neutral
      // runtime shape. The cast stays local to this disposable experiment boundary.
      viewport.attachRuntime(runtime as unknown as StudioRuntimeSession);
      runtimeRef.current = runtime;
      setRuntimeModeValue("BREAK");
      setRuntimeSessionId(runtime.sessionId);
      setRuntimeActivation(runtime.activation);
      setWorkStateValue("RUNNING");
      setNotice("BREAK LAB · experimental multi-Bearing realization");
      runtime = null;
    } catch (error: unknown) {
      runtime?.dispose();
      setRuntimeModeValue(null);
      setNotice(error instanceof Error ? `BREAK LAB FAULT · ${error.message}` : "BREAK LAB FAULT");
      setWorkStateValue("BUILD");
      setRuntimeActivation("OFF");
      setRuntimeSessionId(null);
    } finally {
      runtimeStartingRef.current = false;
      setRuntimeStarting(false);
    }
  };

  const pauseRuntime = (): void => {
    if (runtimeRef.current === null || workStateRef.current !== "RUNNING") return;
    viewportRef.current?.setRuntimeRunning(false);
    setWorkStateValue("PAUSED");
  };

  const resumeRuntime = (): void => {
    if (runtimeRef.current === null || workStateRef.current !== "PAUSED") return;
    viewportRef.current?.setRuntimeRunning(true);
    setWorkStateValue("RUNNING");
  };

  const stepRuntime = (): void => {
    if (runtimeRef.current === null || workStateRef.current !== "PAUSED") return;
    viewportRef.current?.stepRuntimeOnce();
  };

  const stopRuntime = (): void => {
    if (runtimeRef.current === null) return;
    disposeRuntimeToBuild();
    setNotice(null);
  };

  const restartRuntime = async (): Promise<void> => {
    if (runtimeRef.current === null || runtimeStartingRef.current) return;
    const mode = runtimeModeRef.current;
    disposeRuntimeToBuild();
    if (mode === "BREAK") await startBreakRuntime();
    else await startRuntime();
  };

  const setActivation = (value: StudioRuntimeActivation): void => {
    const runtime = runtimeRef.current;
    if (runtime === null) return;
    try {
      runtime.setActivation(value);
      setRuntimeActivation(runtime.activation);
      setNotice(null);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Activation change failed");
    }
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
        if (!requireBuild()) return;
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
        if (!requireBuild()) return;
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
          clearMeaningDraft();
          refreshWorkspace();
        } catch (error: unknown) {
          setNotice(error instanceof Error ? error.message : "Matter Remove failed");
        }
      },
      onMeaningTarget: (hit) => {
        if (!requireBuild()) return;
        const workspace = workspaceRef.current;
        if (workspace === null) return;
        const current = workspace.snapshot();

        if (meaningToolRef.current === "bearing") {
          const target = resolveBearingTarget(current.source, hit.cellId, hit.face);
          if (target === null) {
            clearMeaningDraft();
            setNotice("Choose a shared Matter interface for Bearing.");
            return;
          }
          if (target.existingBearings.length > 1) {
            clearMeaningDraft();
            setNotice("This interface already contains multiple Bearing intents. Repair the composition before editing it here.");
            return;
          }
          const existing = target.existingBearings[0] ?? null;
          const freeAxis = existing !== null && target.legalAxes.includes(existing.freeAxis)
            ? existing.freeAxis
            : target.legalAxes[0];
          setTorqueDraft(null);
          setTorqueText("");
          setBearingDraft({
            bearingId: existing?.id ?? null,
            endpointA: target.endpointA,
            endpointB: target.endpointB,
            legalAxes: target.legalAxes,
            freeAxis,
          });
          setNotice(null);
          return;
        }

        const target = resolveTorqueTarget(current.source, hit.cellId, hit.face);
        if (target === null) {
          clearMeaningDraft();
          setNotice("Choose one authored Bearing endpoint for TorquePatch.");
          return;
        }
        if (target.existingPatches.length > 1) {
          clearMeaningDraft();
          setNotice("This endpoint already contains multiple TorquePatch intents. Repair the composition before editing it here.");
          return;
        }
        const existing = target.existingPatches[0] ?? null;
        const effortNm = existing?.effortNm ?? DEFAULT_TORQUE_EFFORT_NM;
        const draft: StudioTorqueDraft = {
          patchId: existing?.id ?? null,
          target: target.target,
          bearingAxis: target.bearing.freeAxis,
          effortNm,
        };
        setBearingDraft(null);
        setTorqueDraft(draft);
        setTorqueText(String(effortNm));
        setNotice(null);
      },
      onTorqueDraftEffort: (effortNm) => {
        if (runtimeRef.current !== null) return;
        setTorqueDraft((current) => current === null ? null : { ...current, effortNm });
        setTorqueText(String(effortNm));
      },
      onRuntimeFault: (message) => {
        const activeRuntime = runtimeRef.current;
        viewportRef.current?.detachRuntime();
        runtimeRef.current = null;
        activeRuntime?.dispose();
        setRuntimeModeValue(null);
        setWorkStateValue("BUILD");
        setRuntimeActivation("OFF");
        setRuntimeSessionId(null);
        setNotice(`RUNTIME FAULT · ${message}`);
      },
    });
    viewportRef.current = viewport;
    return () => {
      const activeRuntime = runtimeRef.current;
      runtimeRef.current = null;
      runtimeModeRef.current = null;
      activeRuntime?.dispose();
      viewportRef.current = null;
      viewport.dispose();
    };
  }, []);

  useEffect(() => {
    if (runtimeRef.current !== null) return;
    viewportRef.current?.setSource(snapshot?.source ?? EMPTY_PREVIEW);
  }, [snapshot]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null) return;
    const tool = intent === "select"
      ? "select"
      : intent === "matter"
        ? matterTool
        : meaningTool;
    try {
      viewport.setTool(tool);
      viewport.clearDraft();
      if (intent === "meaning" && bearingDraft !== null) viewport.setBearingDraft(bearingDraft);
      if (intent === "meaning" && torqueDraft !== null) viewport.setTorqueDraft(torqueDraft);
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Studio tool requires BUILD");
      setIntent("select");
    }
    setHover(null);
  }, [intent, matterTool, meaningTool]);

  useEffect(() => {
    viewportRef.current?.setSelection(selection);
  }, [selection]);

  useEffect(() => {
    viewportRef.current?.setBearingDraft(bearingDraft);
  }, [bearingDraft]);

  useEffect(() => {
    viewportRef.current?.setTorqueDraft(torqueDraft);
  }, [torqueDraft]);

  const torqueNumericValue = torqueText.trim() === "" ? Number.NaN : Number(torqueText);
  const torqueNumericValid = Number.isFinite(torqueNumericValue);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const workspace = workspaceRef.current;
      if (event.key === "Escape") {
        clearMeaningDraft();
        viewportRef.current?.clearDraft();
        setHover(null);
        setNotice(null);
        return;
      }
      if (event.key === "Enter" && intent === "meaning" && workStateRef.current === "BUILD") {
        if (meaningTool === "bearing" && bearingDraft !== null) {
          event.preventDefault();
          commitBearingDraft(bearingDraft);
          return;
        }
        if (meaningTool === "torque" && torqueDraft !== null && torqueNumericValid) {
          event.preventDefault();
          commitTorqueDraft({ ...torqueDraft, effortNm: torqueNumericValue });
          return;
        }
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
      if (!requireBuild()) return;
      if (event.shiftKey) workspace.redo();
      else workspace.undo();
      setSelection(null);
      clearMeaningDraft();
      setNotice(null);
      refreshWorkspace();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bearingDraft, torqueDraft, torqueNumericValid, torqueNumericValue, intent, meaningTool]);

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

  const chooseIntent = (next: StudioIntent): void => {
    if (next !== "select" && !requireBuild()) return;
    setIntent(next);
    setNotice(null);
    if (next !== "meaning") clearMeaningDraft();
  };

  const chooseMatterTool = (tool: StudioMatterTool): void => {
    if (!requireBuild()) return;
    setIntent("matter");
    setMatterTool(tool);
    clearMeaningDraft();
    setNotice(null);
  };

  const chooseMeaningTool = (tool: StudioMeaningTool): void => {
    if (!requireBuild()) return;
    setIntent("meaning");
    setMeaningTool(tool);
    meaningToolRef.current = tool;
    clearMeaningDraft();
    setNotice(null);
  };

  const undo = (): void => {
    if (!requireBuild()) return;
    if (workspaceRef.current?.undo()) {
      setSelection(null);
      clearMeaningDraft();
      setNotice(null);
      refreshWorkspace();
    }
  };

  const redo = (): void => {
    if (!requireBuild()) return;
    if (workspaceRef.current?.redo()) {
      setSelection(null);
      clearMeaningDraft();
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
    if (file === undefined || !requireBuild()) return;
    try {
      startWorkspace(await readStudioSourceFile(file));
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Open failed");
    }
  };

  const assignMaterial = (materialId: string): void => {
    if (!requireBuild()) return;
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

  const removeBearing = (): void => {
    if (!requireBuild()) return;
    const workspace = workspaceRef.current;
    const id = bearingDraft?.bearingId;
    if (workspace === null || id == null) return;
    try {
      workspace.commitRemoveBearing(id);
      clearMeaningDraft();
      setNotice("Bearing removed. Dependent local intent, if any, remains authored for repair.");
      refreshWorkspace();
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "Bearing removal failed");
    }
  };

  const removeTorquePatch = (): void => {
    if (!requireBuild()) return;
    const workspace = workspaceRef.current;
    const id = torqueDraft?.patchId;
    if (workspace === null || id == null) return;
    try {
      workspace.commitRemoveTorquePatch(id);
      clearMeaningDraft();
      setNotice("TorquePatch removed.");
      refreshWorkspace();
    } catch (error: unknown) {
      setNotice(error instanceof Error ? error.message : "TorquePatch removal failed");
    }
  };

  const updateTorqueFromText = (text: string): void => {
    if (!requireBuild()) return;
    setTorqueText(text);
    if (text.trim() === "") return;
    const effortNm = Number(text);
    if (!Number.isFinite(effortNm)) return;
    setTorqueDraft((current) => current === null ? null : { ...current, effortNm });
  };

  const dependentCount =
    (removePreview?.dependentBearingIds.length ?? 0) +
    (removePreview?.dependentTorquePatchIds.length ?? 0);
  const primaryIssue = classification?.issues[0] ?? null;
  const primaryIssueClass = primaryIssue?.code.includes("INVALID")
    ? "invalid"
    : primaryIssue === null
      ? ""
      : "unsupported";
  const runtimeLive = runtimeSessionId !== null;
  const breakCandidate = (snapshot?.source.bearings.length ?? 0) >= 2;
  const canRun =
    snapshot !== null &&
    classification?.runReadiness === "READY" &&
    workState === "BUILD" &&
    !runtimeStarting;
  const canBreakRun =
    snapshot !== null &&
    breakClassification?.eligibility === "ELIGIBLE" &&
    workState === "BUILD" &&
    !runtimeStarting;

  return (
    <main
      className="studio-surface"
      data-anvil-studio="substrate"
      data-authored-cells={snapshot?.source.matter.cells.length ?? 0}
      data-source-generation={snapshot?.sourceGeneration ?? 0}
      data-authored-validity={classification?.authoredValidity ?? "UNKNOWN"}
      data-composition-support={classification?.compositionSupport ?? "UNKNOWN"}
      data-run-readiness={classification?.runReadiness ?? "UNKNOWN"}
      data-break-lab-eligibility={breakClassification?.eligibility ?? "INELIGIBLE"}
      data-torque-draft-effort={torqueDraft?.effortNm ?? ""}
      data-work-state={workState}
      data-runtime-mode={runtimeMode ?? "NONE"}
      data-runtime-activation={runtimeLive ? runtimeActivation : "NONE"}
      data-runtime-session={runtimeSessionId ?? ""}
      data-react-renders={renderCountRef.current}
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
          <button type="button" onClick={() => requireBuild() && setShowFirstRun(true)}>New</button>
          <button type="button" onClick={() => requireBuild() && fileInputRef.current?.click()}>Open</button>
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
        <section className="studio-simulation-dock studio-island" aria-label="Simulation">
          <span className={`studio-work-state ${workState.toLowerCase()}`}>
            {workState}{runtimeMode === "BREAK" ? " · BREAK" : ""}
          </span>
          {workState === "BUILD" ? (
            <>
              <button type="button" className="run-control" onClick={() => void startRuntime()} disabled={!canRun}>
                {runtimeStarting ? "RUN…" : "RUN"}
              </button>
              {breakCandidate && (
                <button
                  type="button"
                  className="break-run-control"
                  onClick={() => void startBreakRuntime()}
                  disabled={!canBreakRun}
                  title={breakClassification?.reason ?? "Break Lab is not available for this source"}
                >{runtimeStarting ? "BREAK…" : "BREAK RUN"}</button>
              )}
            </>
          ) : (
            <>
              {workState === "RUNNING" ? (
                <button type="button" onClick={pauseRuntime}>Pause</button>
              ) : (
                <>
                  <button type="button" onClick={resumeRuntime}>Resume</button>
                  <button type="button" onClick={stepRuntime}>Step</button>
                </>
              )}
              <button
                type="button"
                className={runtimeActivation === "ON" ? "active activation-control" : "activation-control"}
                onClick={() => setActivation(runtimeActivation === "OFF" ? "ON" : "OFF")}
              >{runtimeActivation === "OFF" ? "Activate" : "Deactivate"}</button>
              <button type="button" onClick={() => void restartRuntime()}>Restart</button>
              <button type="button" className="stop-control" onClick={stopRuntime}>Stop</button>
            </>
          )}
          {notice !== null && <span className="studio-simulation-notice">{notice}</span>}
        </section>
      )}

      {snapshot !== null && (
        <nav className="studio-intent-rail studio-island" aria-label="Intent">
          <button
            type="button"
            className={intent === "select" ? "active" : ""}
            onClick={() => chooseIntent("select")}
          >Select</button>
          <button
            type="button"
            className={intent === "matter" ? "active" : ""}
            onClick={() => chooseIntent("matter")}
          >Matter</button>
          <button
            type="button"
            className={intent === "meaning" ? "active" : ""}
            onClick={() => chooseMeaningTool("bearing")}
          >Meaning</button>
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

      {snapshot !== null && intent === "meaning" && (
        <section className="studio-context-pod studio-island" aria-label="Meaning tools">
          <div className="studio-pod-title">MEANING</div>
          <div className="studio-tool-tabs">
            <button
              type="button"
              className={meaningTool === "bearing" ? "active meaning-bearing" : "meaning-bearing"}
              onClick={() => chooseMeaningTool("bearing")}
            >Bearing</button>
            <button
              type="button"
              className={meaningTool === "torque" ? "active meaning-torque" : "meaning-torque"}
              onClick={() => chooseMeaningTool("torque")}
            >Torque</button>
          </div>

          {meaningTool === "bearing" && (
            bearingDraft === null ? (
              <p>Click a shared Matter interface to author or edit its Bearing.</p>
            ) : (
              <>
                <p>{bearingDraft.bearingId === null ? "New Bearing draft." : "Editing the Bearing on this interface."}</p>
                <div className="studio-axis-row" aria-label="Bearing axis">
                  {bearingDraft.legalAxes.map((axis) => (
                    <button
                      key={axis}
                      type="button"
                      className={bearingDraft.freeAxis === axis ? "active meaning-bearing" : "meaning-bearing"}
                      onClick={() => setBearingDraft({ ...bearingDraft, freeAxis: axis })}
                    >Axis {axis.toUpperCase()}</button>
                  ))}
                </div>
                <div className="studio-button-row studio-commit-row">
                  <button type="button" className="commit bearing-commit" onClick={() => commitBearingDraft(bearingDraft)}>Commit · Enter</button>
                  <button type="button" onClick={clearMeaningDraft}>Cancel</button>
                  {bearingDraft.bearingId !== null && <button type="button" className="danger-quiet" onClick={removeBearing}>Remove</button>}
                </div>
                <p className="studio-hint">Esc cancels</p>
              </>
            )
          )}

          {meaningTool === "torque" && (
            torqueDraft === null ? (
              <p>Click one authored Bearing endpoint to create or edit its TorquePatch.</p>
            ) : (
              <>
                <p>{torqueDraft.patchId === null ? "New TorquePatch draft." : "Editing this TorquePatch."}</p>
                <label className="studio-effort-field">
                  <span>Effort</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={torqueText}
                    aria-label="Torque effort Nm"
                    onChange={(event) => updateTorqueFromText(event.currentTarget.value)}
                    onBlur={() => {
                      if (!torqueNumericValid) setTorqueText(String(torqueDraft.effortNm));
                    }}
                  />
                  <span>Nm</span>
                </label>
                <p className="studio-hint">Drag the orange world handle for relative adjustment · Shift = fine</p>
                {!torqueNumericValid && <p className="studio-issue invalid">Effort must be a finite number.</p>}
                <div className="studio-button-row studio-commit-row">
                  <button
                    type="button"
                    className="commit torque-commit"
                    disabled={!torqueNumericValid}
                    onClick={() => commitTorqueDraft({ ...torqueDraft, effortNm: torqueNumericValue })}
                  >Commit · Enter</button>
                  <button type="button" onClick={clearMeaningDraft}>Cancel</button>
                  {torqueDraft.patchId !== null && <button type="button" className="danger-quiet" onClick={removeTorquePatch}>Remove</button>}
                </div>
                <p className="studio-hint">Esc cancels · crossing zero reverses direction</p>
              </>
            )
          )}

          {classificationFault !== null && <p className="studio-issue invalid">{classificationFault}</p>}
          {primaryIssue !== null && <p className={`studio-issue ${primaryIssueClass}`}>{primaryIssue.message}</p>}
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
          {notice !== null && <p className="studio-notice">{notice}</p>}
        </section>
      )}

      {showFirstRun && workState === "BUILD" && (
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
