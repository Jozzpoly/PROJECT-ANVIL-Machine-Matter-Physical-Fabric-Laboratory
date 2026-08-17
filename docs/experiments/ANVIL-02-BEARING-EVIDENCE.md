# ANVIL-02 / BEARING — Evidence Log

Status: **ACTIVE — Evidence C supported for base + arbitrary common-transform fixtures; production browser gate now under test**

## C0 — first executable bearing slice

Exact first proposal:

- branch: `experiment/anvil-02-bearing`;
- source head: `825dba6e49f5057f3022cfcad29f21cdcf346b61`;
- PR: `#5` (draft);
- PR synthetic checkout: `6701f1c41581b7ac3283fc30993206e758ea19b8`;
- Actions run: `32078765858`;
- artifact ID: `9304368827`;
- artifact SHA-256: `bee3703eaa021ffc6702742ad68ae8d804a78e01a9f81f961fa4c5f76af0170d`.

The run passed strict TypeScript, all existing ANVIL regressions, ANVIL-02 semantic tests, exact pinned Box3D binding execution, production build, Forge launcher self-test, and the existing Chromium regression suite.

### Base real-solver metrics

Predeclared C2/C3 thresholds:

- constrained shared-anchor gap <= `0.0025 m`;
- identical no-relation control gap >= `0.25 m`;
- absolute relative revolute angle >= `0.35 rad` after 120 fixed 60 Hz steps.

Observed:

```text
constrained anchor gap   0.00001546371140869226 m
no-relation control gap  1.3662249602059333 m
revolute relative angle  2.010232448577881 rad
```

The constrained gap is roughly 162x below the declared maximum, while the control separation and relative angle are each more than 5x above their declared minima.

Total Node test result at this checkpoint: **27/27 PASS**.

Verdict at C0: **SUPPORTED FOR THE IDENTITY-ORIENTED BASE FIXTURE**, not yet an ANVIL-02 experiment verdict.

## C5 — arbitrary common-transform covariance

### Gate declared before execution

Use the same `compileBearing()` output. Apply one common transform to both runtime bodies:

- rotation angle `0.91 rad` about axis proportional to `(0.37, -0.81, 0.44)`;
- translation `(2.4, -1.3, 1.7) m`.

The Box3D relation receives only the already compiled `localAnchorA/B` and `localAxisA/B`. A separate no-joint world is the control.

Predeclared gates after 120 fixed 60 Hz steps:

- initial transformed shared-anchor error <= **0.00001 m**;
- transformed bearing shared-anchor gap <= **0.0025 m**;
- transformed no-relation control gap >= **0.25 m**;
- absolute revolute angle >= **0.35 rad**.

No transformed-specific loosening of C2/C3 tolerances was permitted.

### Exact execution

- source head: `5f4854e7b6eb6bafd27e34077e5a3c44357421c2`;
- PR synthetic checkout: `10929ffa6f3a1e3387056cac3f85fde472484ac4`;
- Actions run: `32078964676`;
- artifact ID: `9304530155`;
- artifact SHA-256: `824a9c926e2b642148f0f02723e180a9d5aca72c1920be191b94f3f6c75c2232`.

Observed:

```text
initial transformed gap  1.7889085181965112e-7 m
constrained anchor gap   4.252712514504838e-6 m
no-relation control gap  1.2319540243918932 m
revolute relative angle  1.0926251411437988 rad
transformed world axis   (-0.58009, -0.43362, 0.68954)
```

Full run evidence:

- strict TypeScript PASS;
- Node semantic / exact Box3D suite **28/28 PASS**;
- production build PASS;
- Forge V0.1 launcher self-test PASS;
- existing Chromium regressions **7/7 PASS**;
- artifact upload PASS.

### C5 interpretation

**SUPPORTED FOR THIS COMMON-RIGID-TRANSFORM FIXTURE.**

Current experiment-local body-local anchor/axis semantics are sufficient to lower this bearing correctly after an arbitrary common rigid transform. Therefore ANVIL-02 has **not** earned a need for a JURE-like explicit frame ontology at this stage. Adding one now would be speculative infrastructure.

This result does not prove arbitrary authored non-grid orientations, multiple relations, closed loops, or relation migration across topology changes.

## D0 — production browser A/B gate — implementation intent

The next slice is intentionally visual and evidence-oriented, using the existing ANVIL design language rather than redesigning the laboratory.

One owner-visible run shows two synchronized panels:

```text
DERIVED BEARING          NO RELATION CONTROL
same 7 source cells      same 7 source cells
same 2 compiled bodies   same 2 compiled bodies
relation enabled         relation deliberately disabled
```

The camera/projection remains fixed. There is no tracking camera or interpolation intended to hide discontinuity.

The browser must reproduce the solver thresholds already earned in C0:

- source `7 → 7`;
- bodies `1 → 2`;
- relation `0 → 1`;
- bearing anchor gap <= `0.0025 m`;
- no-relation gap >= `0.25 m`;
- absolute relative angle >= `0.35 rad`;
- existing body mass and local-COM lowering tolerances;
- finite two-body post-step state in both worlds.

Browser plugin is not available in this session. Per the invoked Build Web Apps workflow, rendered QA therefore uses the repository's real Playwright/Chromium pipeline as the fallback. No claim of owner-visible validation is made until a packaged Forge artifact is run by the owner.

## Still not claimed

Even if D0 passes, ANVIL-02 will not yet prove:

- arbitrary authored non-grid orientations;
- multiple interacting bearings or closed kinematic loops;
- limits, motors, compliance, friction or breakage;
- joint continuity across a CUT/recompile transaction;
- a generic Relation/Joint/Constraint ontology;
- universal frame entities.
