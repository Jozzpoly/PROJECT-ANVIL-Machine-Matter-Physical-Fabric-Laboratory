import type { BearingEndpoint } from "../experiments/anvil-02-bearing.js";
import type { MaterialDefinition } from "../model.js";
import type { FreedomSourceV0, GridFace } from "../studio-recovery/source.js";

type GridTuple = readonly [number, number, number];
type StudySubtest = "N" | "A";
type SceneId = "sA" | "sB" | "mA" | "mB" | "bA" | "bB" | "dA" | "dB";
type SceneCommand = readonly [GridTuple, GridFace, number];

interface SceneDefinition {
  readonly commands: readonly SceneCommand[];
  readonly target: readonly [GridTuple, GridTuple];
}

const MATERIAL: MaterialDefinition = Object.freeze({
  id: "studio:alloy",
  densityKgM3: 780,
  friction: 0.45,
  displayColor: "#91AABE",
});

const FACE_OFFSETS: Readonly<Record<GridFace, GridTuple>> = Object.freeze({
  "x-": [-1, 0, 0],
  "x+": [1, 0, 0],
  "y-": [0, -1, 0],
  "y+": [0, 1, 0],
  "z-": [0, 0, -1],
  "z+": [0, 0, 1],
});

const OPPOSITE: Readonly<Record<GridFace, GridFace>> = Object.freeze({
  "x-": "x+",
  "x+": "x-",
  "y-": "y+",
  "y+": "y-",
  "z-": "z+",
  "z+": "z-",
});

const SCENES: Readonly<Record<SceneId, SceneDefinition>> = Object.freeze({
  sA: { commands: [[[0, 0, 0], "x-", 3], [[-1, 0, 0], "y+", 2], [[-2, 0, 0], "z+", 1]], target: [[-1, 2, 0], [-1, 1, 0]] },
  sB: { commands: [[[0, 0, 0], "x-", 3], [[-2, 0, 0], "z+", 2], [[-3, 0, 0], "y+", 1]], target: [[-2, 0, 2], [-2, 0, 1]] },
  mA: { commands: [[[0, 0, 0], "x-", 7], [[-2, 0, 0], "y+", 3], [[-4, 0, 0], "z+", 2], [[-6, 0, 0], "y+", 2]], target: [[-2, 3, 0], [-2, 2, 0]] },
  mB: { commands: [[[0, 0, 0], "x-", 7], [[-3, 0, 0], "z+", 3], [[-5, 0, 0], "y+", 2], [[-7, 0, 0], "z+", 2]], target: [[-3, 0, 3], [-3, 0, 2]] },
  bA: { commands: [[[0, 0, 0], "x-", 9], [[-2, 0, 0], "y+", 5], [[-4, 0, 0], "z+", 4], [[-6, 0, 0], "y+", 4], [[-8, 0, 0], "z+", 4]], target: [[-2, 5, 0], [-2, 4, 0]] },
  bB: { commands: [[[0, 0, 0], "x-", 9], [[-3, 0, 0], "z+", 5], [[-5, 0, 0], "y+", 4], [[-7, 0, 0], "z+", 4], [[-9, 0, 0], "y+", 4]], target: [[-3, 0, 5], [-3, 0, 4]] },
  dA: { commands: [[[0, 0, 0], "x-", 13], [[-1, 0, 0], "y+", 7], [[-3, 0, 0], "z+", 6], [[-5, 0, 0], "y+", 6], [[-7, 0, 0], "z+", 5], [[-9, 0, 0], "y+", 5], [[-11, 0, 0], "z+", 5], [[-13, 0, 0], "y+", 5]], target: [[-1, 7, 0], [-1, 6, 0]] },
  dB: { commands: [[[0, 0, 0], "x-", 13], [[-2, 0, 0], "z+", 7], [[-4, 0, 0], "y+", 6], [[-6, 0, 0], "z+", 6], [[-8, 0, 0], "y+", 5], [[-10, 0, 0], "z+", 5], [[-12, 0, 0], "y+", 5], [[-13, 0, 0], "z+", 5]], target: [[-2, 0, 7], [-2, 0, 6]] },
});

function key(grid: GridTuple): string {
  return `${grid[0]},${grid[1]},${grid[2]}`;
}

function add(a: GridTuple, b: GridTuple, scale: number): GridTuple {
  return [a[0] + b[0] * scale, a[1] + b[1] * scale, a[2] + b[2] * scale];
}

function defaultAxis(endpoint: BearingEndpoint): "x" | "y" | "z" {
  if (endpoint.face === "x-" || endpoint.face === "x+") return "z";
  if (endpoint.face === "y-" || endpoint.face === "y+") return "x";
  return "y";
}

export function createWER1StudyFixtureSource(sceneId: SceneId, subtest: StudySubtest): FreedomSourceV0 {
  const scene = SCENES[sceneId];
  const cells = new Map<string, { id: string; grid: GridTuple }>();
  let next = 2;
  cells.set("0,0,0", { id: "matter:1", grid: [0, 0, 0] });

  for (const [from, face, count] of scene.commands) {
    const offset = FACE_OFFSETS[face];
    for (let step = 1; step <= count; step += 1) {
      const grid = add(from, offset, step);
      const gridKey = key(grid);
      if (cells.has(gridKey)) break;
      cells.set(gridKey, { id: `matter:${next}`, grid });
      next += 1;
    }
  }

  const [targetA, targetB] = scene.target;
  const cellA = cells.get(key(targetA));
  const cellB = cells.get(key(targetB));
  if (cellA === undefined || cellB === undefined) throw new Error(`WER-1 fixture ${sceneId} target cells missing`);

  const delta: GridTuple = [targetB[0] - targetA[0], targetB[1] - targetA[1], targetB[2] - targetA[2]];
  const faceA = (Object.keys(FACE_OFFSETS) as GridFace[]).find((face) => {
    const offset = FACE_OFFSETS[face];
    return offset[0] === delta[0] && offset[1] === delta[1] && offset[2] === delta[2];
  });
  if (faceA === undefined) throw new Error(`WER-1 fixture ${sceneId} target is not adjacent`);

  const endpointA: BearingEndpoint = { cellId: cellA.id, face: faceA };
  const endpointB: BearingEndpoint = { cellId: cellB.id, face: OPPOSITE[faceA] };

  return {
    schema: "anvil-studio-source/0",
    matter: {
      schema: "anvil-matter/0",
      revision: `wer1-study/${sceneId}/${subtest}`,
      cellSizeM: 0.5,
      materials: [{ ...MATERIAL }],
      cells: [...cells.values()].map((cell) => ({
        id: cell.id,
        grid: { x: cell.grid[0], y: cell.grid[1], z: cell.grid[2] },
        materialId: MATERIAL.id,
      })),
    },
    bearings: subtest === "N" ? [{
      id: "bearing:1",
      endpointA,
      endpointB,
      freeAxis: defaultAxis(endpointA),
    }] : [],
    torquePatches: [],
  };
}

export function createWER1StudyInitialSource(search = window.location.search): FreedomSourceV0 | null {
  const params = new URLSearchParams(search);
  if (params.get("wer1study") !== "1") return null;
  const scene = params.get("wer1fixture");
  const subtest = params.get("wer1sub");
  if (!(scene === "sA" || scene === "sB" || scene === "mA" || scene === "mB" || scene === "bA" || scene === "bB" || scene === "dA" || scene === "dB")) {
    throw new Error(`Unknown WER-1 fixture ${String(scene)}`);
  }
  if (subtest !== "N" && subtest !== "A") throw new Error(`Unknown WER-1 subtest ${String(subtest)}`);
  return createWER1StudyFixtureSource(scene, subtest);
}
