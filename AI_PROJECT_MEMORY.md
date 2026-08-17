# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. canonical documentation;
5. historical conversation/branch names only as leads.

Always resolve live Git before meaningful work. Never let later tooling/docs redefine which artifact the owner actually tested.

## Current live state

Accepted `main` at the start of ANVIL-02:

`6e936dd5934fffb3c7de3482a7aca9dc985102e5`

It contains accepted ANVIL-00 / COLLAPSE, promoted laboratory foundation, owner-accepted ANVIL-01 / CUT and Forge V0.1.

Active experiment:

- branch: `experiment/anvil-02-bearing`;
- draft PR: `#5 — ANVIL-02: bearing from a local authored interface`;
- latest branch head before this memory-only grounding commit: `b6357187bb6c71b11e6c00272608135a292f316a`;
- **do not merge PR #5 to `main` before owner validation**.

Current ANVIL-02 status:

**AUTOMATED EVIDENCE SUPPORTED THROUGH SOURCE SEMANTICS, REAL BOX3D, ARBITRARY COMMON-TRANSFORM CONTROL, PRODUCTION BROWSER AND FORGE V0.2. OWNER VERDICT PENDING.**

Current Forge status:

**V0.2 AUTOMATED-VALIDATED SECOND-CONSUMER OWNER-GATE CANDIDATE.** It is not yet owner validated and is not a universal validation framework.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Long-horizon direction: machines should increasingly emerge from matter, local relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies/colliders/solver objects are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into universal ontology because one fixture passes.

## Accepted prior baseline

### ANVIL-00 / COLLAPSE

Accepted for its bounded sparse-cell fixture:

- persistent cell/material identity without Box3D IDs in authored truth;
- deterministic rigid-island compilation;
- integrated mass/COM;
- collision representation distinct from authored resolution;
- disposable Box3D lowering;
- intact `51 cells → 1 body → 8 collision boxes`;
- one-cell authoring edit `50 cells → 2 bodies → 9 collision boxes`;
- strict TS, semantic tests, real Box3D, production browser and owner manual acceptance.

Boundary: COLLAPSE deletes a source cell and rebuilds neutral runtime state; it is not dynamic state migration.

### Laboratory foundation

Before broad architecture work read:

- `AGENTS.md`;
- `docs/EXPERIMENT_PROTOCOL.md`;
- `docs/FOUNDATION.md`;
- `docs/DONOR_MAP.md`.

Promoted neutral capabilities include:

- `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic compensated mass/COM and current limited inertia diagonal;
- source-provenance lineage independent of disposable runtime IDs;
- solver-neutral runtime observation/motion boundary;
- pose/velocity, linear-momentum and translational-energy measurements;
- fail-closed evidence primitives.

Still not foundation:

- generic Bond/Joint/Constraint/Relation ontology;
- authored frame entities;
- custom contact laws;
- damage/fracture propagation;
- deformable/compliant matter;
- mechanism inference;
- power/control networks;
- vehicle-specific concepts;
- generic scene/entity framework.

### ANVIL-01 / CUT

**OWNER ACCEPTED AND PROMOTED TO `main` for the declared bounded claim.**

Exact owner-tested CUT artifact remains immutable evidence:

```text
source head      9c4b3372ad60e20ade2d7d9a31dd373a356263d0
Actions run      32073741628
artifact ID      9302675515
artifact SHA256  34c0365c403a229e5c4e53a304d23d331e0872601850a0d190f318a98340de40
owner            ACCEPT after 10 observed runs
owner env        Windows 10 / Chrome 151 / 1920×911 DPR1
```

CUT demonstrated a mass-preserving topology change with persistent source identity and bounded motion-state continuity:

`51 source cells / 1 body → same 51 source cells / 2 bodies`.

Important boundary: CUT still does not prove persistent-world manifold migration, external joint migration, arbitrary fracture, full angular-momentum conservation, deformables or a generic connection ontology.

## Toolchain truth

- Node `24.16.0`;
- npm `>=11.13.0 <12`, lockfile, CI uses `npm ci`;
- exact `box3d.js@0.0.2`, runtime asserts Box3D `0.1.0`;
- TypeScript `7.0.2`;
- Vite `8.1.5`;
- Playwright `1.61.1`.

Do not mix a Box3D binding upgrade into an experiment unless the pinned binding is a reproduced blocker.

## ANVIL-02 / BEARING

Canonical docs:

- `docs/experiments/ANVIL-02-BEARING-PREFLIGHT.md`;
- `docs/experiments/ANVIL-02-BEARING-EVIDENCE.md`.

### Research question

> Can one local authored rotational interface between two otherwise rigidly face-connected source regions cause ANVIL to compile the same persistent matter into two rigid islands plus one solver-neutral bearing relation, and can stock Box3D lower that relation so the shared pivot remains coincident while relative rotation about the declared axis remains free?

This is deliberately narrower than “build joints” or “build the relation system”.

### Critical reason for this experiment

The pre-ANVIL-02 `MatterDocument` contained cells/materials/grid positions but no local mechanical information. Simply creating a Box3D revolute joint by hand would test only Box3D, not Machine Matter.

ANVIL-02 therefore introduces the smallest **experiment-local authored physical-interface mark** that can falsify the idea:

```text
bearing ID
endpoint A = persistent cell ID + face
endpoint B = persistent cell ID + opposite face
free axis  = x | y | z
```

It deliberately contains no Box3D body/joint IDs, no generic relation type, no motor/limit/break policy and no reusable authored frame entity.

### Fixture

Seven `0.5 m` equal-material source cells form asymmetric 3-cell and 4-cell lobes with exactly one rigid seam:

`a:2 x+ <-> b:0 x-`

Bearing free axis: `z`.

Without bearing mark: ordinary compiler must produce one rigid island.
With bearing mark: same seven source cells must produce two rigid bodies plus one derived bearing relation.

The compiler fails closed if endpoints are invalid/non-adjacent/non-opposite, axis is normal to the shared face, or an alternate rigid path bypasses the marked seam.

### C0 — base solver evidence

First executable proposal:

```text
source head      825dba6e49f5057f3022cfcad29f21cdcf346b61
PR checkout      6701f1c41581b7ac3283fc30993206e758ea19b8
Actions run      32078765858
artifact ID      9304368827
artifact SHA256  bee3703eaa021ffc6702742ad68ae8d804a78e01a9f81f961fa4c5f76af0170d
```

Predeclared after 120 fixed 60 Hz steps:

- bearing shared-anchor gap <= `0.0025 m`;
- identical no-relation control >= `0.25 m`;
- absolute relative angle >= `0.35 rad`.

Observed:

```text
bearing gap       0.00001546371140869226 m
control gap       1.3662249602059333 m
relative angle    2.010232448577881 rad
```

Node/Box3D: **27/27 PASS**.

This is a strongly discriminating fixture, not a threshold-edge pass.

### C5 — common-transform covariance

Before execution a harder gate was declared: instantiate the same compiled relation under an arbitrary common 3D rotation (`0.91 rad` around axis proportional to `(0.37,-0.81,0.44)`) plus translation `(2.4,-1.3,1.7) m`, without adding a frame ontology.

Exact evidence:

```text
source head      5f4854e7b6eb6bafd27e34077e5a3c44357421c2
PR checkout      10929ffa6f3a1e3387056cac3f85fde472484ac4
Actions run      32078964676
artifact ID      9304530155
artifact SHA256  824a9c926e2b642148f0f02723e180a9d5aca72c1920be191b94f3f6c75c2232
```

Observed:

```text
initial transformed anchor mismatch  1.7889085181965112e-7 m
bearing gap after 120 steps           4.252712514504838e-6 m
no-relation control                   1.2319540243918932 m
relative angle                        1.0926251411437988 rad
```

Full Node suite: **28/28 PASS**.

Interpretation: current experiment-local body-local anchor/axis semantics are covariant under this arbitrary common rigid transform. **Do not add a JURE-like explicit frame system now.** The experiment has not earned that complexity.

### D0 — production browser evidence

Build Web Apps was used after solver evidence survived. Browser plugin was unavailable, so repository Playwright/Chromium was the rendered-QA fallback.

The browser gate shows synchronized A/B evidence:

```text
DERIVED BEARING          NO RELATION CONTROL
same 7 source cells      same 7 source cells
same 2 bodies            same 2 bodies
relation active          relation absent
```

Fixed projection; no tracking camera/interpolation.

Final rendered/physics checkpoint before this memory commit:

```text
source head      88ee3c75fe3931c20e738d520bf00be39e1a83f9
PR checkout      957ebc070ff1d44cc6ff65a5231a5fdfedabdc6a
Actions run      32080634137
artifact ID      9305011381
artifact SHA256  ca2cdf80c1858780bb879e65e8e06ae7ac6869f981f805f1c393b48254cc2246
```

Rendered `1440x900` layout after owner-UX hardening:

```text
layout            1440 x 857 px
BEARING viewport  1042 x 825 px
owner panel        350 x 825 px
left canvas         519 x 695 px
right canvas        520 x 695 px
```

Browser metrics:

```text
bearing gap       0.00001546371140869226 m
control gap       1.3662249602059333 m
relative angle    2.010232448577881 rad
max mass error    0 kg
max local COM     1.3041700164251324e-8 m
```

Full checkpoint:

- strict TypeScript PASS;
- **28/28** Node/real-Box3D tests PASS;
- production build PASS;
- Forge V0.2 launcher self-test PASS;
- **12/12** real Chromium tests PASS;
- artifact upload PASS.

### Preserved negative evidence

Do not erase these failed steps:

1. first browser slice failed strict TypeScript due to closure narrowing; fixed without `!`, cast or weaker strictness;
2. browser layout first showed default `300x150` canvases because lazy experiment CSS did not apply; fixed the entry CSS path instead of weakening layout QA;
3. owner UI then caused grid stretch to ~1397 px scene height at a 900 px viewport; fixed viewport/panel independence and added upper-bound layout gates;
4. first Forge V0.2 owner-gate implementation failed TypeScript because `bearing-owner-gate.ts` was accidentally a global script; fixed by making it an explicit module;
5. no physical threshold was relaxed to make any of these failures green.

## Forge V0.2 — second consumer

BEARING is the second real Forge consumer and exposed a genuine V0.1 limitation: active gate and entry path were hardcoded to CUT.

Only the earned boundary was generalized:

- `forge-owner-gate.config.json` defines active project/gate/entry/revision/artifact;
- generated manifest schema is `anvil-forge-owner-gate/v2` and includes `entryPath`;
- `START_ANVIL.cmd` is generic and launches the manifest-selected gate;
- legacy `START_ANVIL_CUT.cmd` remains only a wrapper;
- localhost server validates schema/project and a safe same-origin entry path;
- self-test deliberately proves rejection of protocol-relative/external/backslash/CRLF entry candidates;
- BEARING has a dedicated thin fail-closed owner layer rather than a speculative generic owner-gate framework.

Chromium negative tests prove:

- wrong artifact gate/entry blocks BEARING ACCEPT;
- local/unverified build blocks canonical ACCEPT;
- required-evidence mutation after ACCEPT revokes ACCEPT, clears report and disables copying;
- correct canonical manifest/evidence produces a provenance-complete report.

Forge V0.2 remains **identity/report transport**, not product ontology.

## Donor lessons used in ANVIL-02

### VAW

From `Jozzpoly/voxel-aeronautics-workshop` / `recovery/playable-truth` only the process pattern was reused:

`local face authoring → cut rigid edge → map source provenance to resulting bodies → compile body-local relation data`.

Do not import VAW's full mechanical-link schema, assembly spaces, graph, limits or runtime architecture without new evidence.

### JURE

Use as process evidence only. Its strongest relevant lesson remains: exact provenance, scoped owner gates and letting real falsifiers earn abstractions. ANVIL-02 C5 currently argues **against** importing JURE frame ontology.

### box3d.js

Pinned `box3d.js@0.0.2` / runtime Box3D `0.1.0` actually executes `b3DefaultRevoluteJointDef`, `b3CreateRevoluteJoint` and `b3RevoluteJoint_GetAngle`. No binding upgrade is needed for ANVIL-02.

## Explicit ANVIL-02 non-claims

Current evidence does not prove:

- arbitrary authored non-grid orientation semantics;
- multiple interacting bearings or closed kinematic loops;
- motors, limits, compliance, friction torque or breakage;
- power/control networks;
- relation continuity across CUT/recompile transactions;
- generic Relation/Joint/Constraint ontology;
- universal authored frame entities;
- generality of the current BearingMark dialect to other physical interfaces.

## Immediate next action

1. Run final exact CI after this grounding commit so the package source SHA matches the documented state.
2. Obtain the exact resulting GitHub artifact and digest.
3. Hand that artifact directly to the owner if connector/tool support permits.
4. Owner extracts it and double-clicks **`START_ANVIL.cmd`** — no Node/npm/repo/terminal work.
5. Owner runs BEARING as many times as needed and judges: left pivot continuity + free relative rotation versus right no-relation separation; look for teleport, jerk, reset or weld-like behavior.
6. Owner chooses `ACCEPT`, `REJECT` or `INCONCLUSIVE`, clicks `KOPIUJ RAPORT DO GPT`, and pastes the report.
7. Agent cross-checks report source/run/artifact/digest live on GitHub. The owner should not inspect Actions/SHA manually.
8. Only after owner acceptance may ANVIL-02 be considered for promotion to `main`.
