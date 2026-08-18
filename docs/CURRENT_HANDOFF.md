# PROJECT ANVIL — Current Handoff

Status: **ANVIL-08 / COMPLIANCE-RESOLUTION — DRAFT, PREFLIGHT FROZEN, IMPLEMENTATION PENDING**

This is a short takeover pointer, not a science archive. Live Git and executable evidence override this file if they differ.

## Start here

1. Resolve live `main` from GitHub.
2. Accepted material truth remains through **ANVIL-07 / ELASTIC-SEAM**, material merge `62dcc651f73dc3f228109d3d8922afd534b75950`.
3. Resolve PR #13 / `experiment/anvil-08-compliance-resolution` and verify its live head.
4. Frozen ANVIL-08 preflight: `docs/experiments/ANVIL-08-COMPLIANCE-RESOLUTION-PREFLIGHT.md`.
5. Pre-implementation frozen head: `a1e1000cfd6b40c9e84e2d86a4f735f37205af9f`.
6. No executable ANVIL-08 result exists at that checkpoint. Do not infer support from the preflight or from accepted ANVIL-07 behavior.
7. Compare the active branch with live `main`; later state/handoff grounding on main is process/meta drift, not a reason to rebase for aesthetics.

## Accepted vs active

**Accepted:** ANVIL-00…07. ANVIL-07 remains the first accepted bounded local compliant binding result; its exact evidence is in `docs/experiments/ANVIL-07-ELASTIC-SEAM-EVIDENCE.md`.

**Active/unaccepted:** ANVIL-08 / COMPLIANCE-RESOLUTION, PR #13, Draft.

Primary question:

> Can the same intended physical normal-compliance interface retain the same macroscopic deformation and recovery under a 2x authored source refinement, without per-voxel retuning and without forcing authored patch count to equal runtime relation count?

## Frozen ANVIL-08 design

The candidate authored concept remains experiment-local:

```text
NormalCompliancePatch {
  id
  target: { cellId, face }
  normalStiffnessPerAreaNPerM3
  normalDampingPerAreaNsPerM3
}
```

The mark names one local source face. The opposite face is resolved from matter adjacency. Patch area is derived from `cellSizeM^2`.

Frozen physical comparison:

- COARSE: 7 cells, `cellSizeM = 0.5 m`, one `0.25 m²` interface patch;
- FINE: exact 2x subdivision in each axis, 56 cells, `cellSizeM = 0.25 m`, four `0.0625 m²` interface patches;
- same occupied volume, density, masses, COMs, interface area, force points and load schedule;
- candidate `K_n = 40000 N/m³`, `C_n = 7200 N·s/m³`, producing aggregate `k=10000 N/m`, `c=1800 N·s/m` at both resolutions;
- negative `FINE_FIXED_PATCH_CONTROL` intentionally copies the old whole-seam `10000/1800` to each fine patch, producing aggregate `40000/7200` and a predicted much smaller loaded extension;
- four fine authored patches must be allowed to aggregate into one disposable runtime relation in the frozen 1D mode.

All detailed thresholds, failure classifications and non-claims are owned only by the preflight.

## Exact next action

Keep PR #13 **Draft** and implement only the frozen first slice:

1. experiment-local authored/compiler types for local face compliance;
2. deterministic coarse + exact 2x refined fixtures;
3. local neighbor resolution, duplicate/double-side rejection and coplanar/normal validity checks;
4. block all marked rigid adjacencies and prove the same two physical islands at both resolutions;
5. derive patch area contributions and aggregate candidate `k,c` after source-to-body resolution;
6. create one 1D disposable runtime relation at the physical interface centroid, reusing accepted ANVIL-07 lowering internally only if it does not leak its schema into authored truth;
7. implement the naive fixed-per-patch control only as experiment harness/control;
8. add frozen structural + real-solver tests and canonical Node test registration;
9. run Draft/core and classify any red before changing anything else.

## Do not do now

- do not edit the frozen preflight merely because code is inconvenient;
- do not add a third resolution or parameter sweep;
- do not add heterogeneity, rotation, shear, contact, damage, REBIND, ACTIVATE or browser presentation;
- do not promote `NormalCompliancePatch`, `ElasticSeam`, generic SurfaceLaw/Bond/Relation or a local-property field into foundation;
- do not require compiler/runtime identifiers to match across source resolutions;
- do not require one runtime relation per authored patch;
- do not call typecheck/build/capability evidence proof of resolution invariance.

## Strategic horizon

If ANVIL-08 resolves cleanly, stop the scaling slice. The default next strategic step is a **composition checkpoint**, currently ACTIVATE, unless the ANVIL-08 result exposes a more consequential contradiction.

## Stable project documents

- `AGENTS.md` — agent rules, truth hierarchy and implementation review cadence.
- `docs/EXPERIMENT_PROTOCOL.md` — per-experiment evidence lifecycle.
- `docs/RESEARCH_COMPASS.md` — macro anti-drift / frontier validation method.
- `docs/FOUNDATION.md` — only already-earned reusable boundaries.
- `AI_PROJECT_MEMORY.md` — accepted capability/architecture index + strategic pointer.
- `.anvil/project-state.json` — machine-readable current checkpoint claim.
