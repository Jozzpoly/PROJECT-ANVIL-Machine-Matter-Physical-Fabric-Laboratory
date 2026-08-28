import type { BearingEndpoint } from "../experiments/anvil-02-bearing.js";
import { realizeFreedomSource, type FreedomDiagnostic } from "../studio-recovery/realize.js";
import { FreedomWorkspace, type FreedomSnapshot } from "../studio-recovery/source.js";

interface LooseEntry {
  readonly bearingIds: readonly string[];
  readonly torqueIds: readonly string[];
  readonly endpointA: BearingEndpoint;
  readonly endpointB: BearingEndpoint;
  readonly label: string;
}

let currentWorkspace: FreedomWorkspace | null = null;
let captureInstalled = false;

function sameEndpoint(a: BearingEndpoint, b: BearingEndpoint): boolean {
  return a.cellId === b.cellId && a.face === b.face;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/gu, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[character] ?? character));
}

function looseEntries(snapshot: FreedomSnapshot): LooseEntry[] {
  const source = snapshot.source;
  const cellIds = new Set(source.matter.cells.map((cell) => cell.id));
  const entries: LooseEntry[] = [];
  const representedTorqueIds = new Set<string>();

  for (const bearing of source.bearings) {
    if (cellIds.has(bearing.endpointA.cellId) || cellIds.has(bearing.endpointB.cellId)) continue;
    const torqueIds = source.torquePatches
      .filter((patch) => sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB))
      .map((patch) => patch.id);
    for (const id of torqueIds) representedTorqueIds.add(id);
    entries.push({
      bearingIds: [bearing.id],
      torqueIds,
      endpointA: { ...bearing.endpointA },
      endpointB: { ...bearing.endpointB },
      label: `Loose · Bearing ${bearing.id}${torqueIds.length > 0 ? ` · Torque ${torqueIds.join(", ")}` : ""}`,
    });
  }

  for (const patch of source.torquePatches) {
    if (cellIds.has(patch.target.cellId) || representedTorqueIds.has(patch.id)) continue;
    const representedByBearing = source.bearings.some((bearing) =>
      sameEndpoint(patch.target, bearing.endpointA) || sameEndpoint(patch.target, bearing.endpointB),
    );
    if (representedByBearing) continue;
    entries.push({
      bearingIds: [],
      torqueIds: [patch.id],
      endpointA: { ...patch.target },
      endpointB: { ...patch.target },
      label: `Loose · Torque ${patch.id}`,
    });
  }

  return entries;
}

function diagnosticMarkup(entries: readonly FreedomDiagnostic[]): string {
  return entries.map((entry) =>
    `<div class="r2-diagnostic ${entry.code.includes("DUPLICATE") ? "r2-conflict" : ""}">${escapeHtml(entry.code)} · ${escapeHtml(entry.message)}</div>`,
  ).join("");
}

export function installLooseWorkspaceCapture(): void {
  if (captureInstalled) return;
  captureInstalled = true;
  const original = FreedomWorkspace.prototype.snapshot;
  FreedomWorkspace.prototype.snapshot = function snapshotWithLooseCapture(): FreedomSnapshot {
    currentWorkspace = this;
    return original.call(this);
  };
}

export function installLooseTray(): void {
  const shell = document.querySelector<HTMLElement>(".r2-studio");
  const contextPod = document.querySelector<HTMLElement>("[data-r2-context]");
  if (shell === null || contextPod === null) throw new Error("R2 Loose adapter requires Studio shell");

  const tray = document.createElement("div");
  tray.className = "r2-island";
  tray.dataset.r2Loose = "";
  tray.hidden = true;
  Object.assign(tray.style, {
    left: "18px",
    top: "78px",
    maxWidth: "calc(100vw - 36px)",
    padding: "4px",
    display: "none",
    gap: "4px",
    flexWrap: "wrap",
  });
  shell.append(tray);

  let entries: LooseEntry[] = [];

  const hideTray = (): void => {
    tray.hidden = true;
    tray.style.display = "none";
    tray.innerHTML = "";
  };

  const render = (): void => {
    const workspace = currentWorkspace;
    const build = shell.dataset.runtime === "build";
    if (workspace === null || !build) {
      entries = [];
      hideTray();
      shell.dataset.loose = "0";
      return;
    }
    const snapshot = workspace.snapshot();
    entries = looseEntries(snapshot);
    shell.dataset.loose = String(entries.length);
    if (entries.length === 0) {
      hideTray();
      return;
    }
    tray.innerHTML = entries.map((entry, index) =>
      `<button type="button" data-loose-index="${index}" title="No surviving spatial referent; authored meaning is preserved">${escapeHtml(entry.label)}</button>`,
    ).join("");
    tray.hidden = false;
    tray.style.display = "flex";
  };

  tray.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const indexText = target.dataset.looseIndex;
    if (indexText === undefined) return;
    const entry = entries[Number(indexText)];
    const workspace = currentWorkspace;
    if (entry === undefined || workspace === null || shell.dataset.runtime !== "build") return;

    const snapshot = workspace.snapshot();
    const evidence = realizeFreedomSource(snapshot.source);
    const diagnosticsFor = (id: string): readonly FreedomDiagnostic[] => evidence.diagnostics.filter((item) => item.sourceId === id);
    const bearings = entry.bearingIds
      .map((id) => snapshot.source.bearings.find((bearing) => bearing.id === id))
      .filter((bearing) => bearing !== undefined);
    const torques = entry.torqueIds
      .map((id) => snapshot.source.torquePatches.find((patch) => patch.id === id))
      .filter((patch) => patch !== undefined);

    const bearingMarkup = bearings.map((bearing) => `
      <div class="r2-meaning" data-bearing="${escapeHtml(bearing.id)}">
        <div class="r2-meaning-head"><span class="r2-meaning-id">Bearing ${escapeHtml(bearing.id)}</span><button class="r2-danger" data-delete-bearing="${escapeHtml(bearing.id)}">Delete</button></div>
        <div class="r2-meaning-controls">
          <label>axis <select data-bearing-axis="${escapeHtml(bearing.id)}"><option value="x" ${bearing.freeAxis === "x" ? "selected" : ""}>x</option><option value="y" ${bearing.freeAxis === "y" ? "selected" : ""}>y</option><option value="z" ${bearing.freeAxis === "z" ? "selected" : ""}>z</option></select></label>
          <button data-rebind-bearing="${escapeHtml(bearing.id)}">Rebind</button>
        </div>
        ${diagnosticMarkup(diagnosticsFor(bearing.id))}
      </div>`).join("");
    const torqueMarkup = torques.map((patch) => `
      <div class="r2-meaning" data-torque="${escapeHtml(patch.id)}">
        <div class="r2-meaning-head"><span class="r2-meaning-id">Torque ${escapeHtml(patch.id)}</span><button class="r2-danger" data-delete-torque="${escapeHtml(patch.id)}">Delete</button></div>
        <div class="r2-meaning-controls">
          <label>Nm <input type="number" step="1" value="${patch.effortNm}" data-torque-effort="${escapeHtml(patch.id)}"></label>
          <button data-apply-torque="${escapeHtml(patch.id)}">Apply</button>
          <button data-retarget-torque="${escapeHtml(patch.id)}">Retarget</button>
        </div>
        ${diagnosticMarkup(diagnosticsFor(patch.id))}
      </div>`).join("");

    contextPod.innerHTML = `
      <h3>Loose meaning</h3>
      <p class="r2-small">No surviving spatial referent · authored intent preserved · no repair required</p>
      ${bearingMarkup}${torqueMarkup}
    `;
    contextPod.hidden = false;
  });

  const observer = new MutationObserver(render);
  observer.observe(shell, { attributes: true, attributeFilter: ["data-source-generation", "data-runtime"] });
  render();
}