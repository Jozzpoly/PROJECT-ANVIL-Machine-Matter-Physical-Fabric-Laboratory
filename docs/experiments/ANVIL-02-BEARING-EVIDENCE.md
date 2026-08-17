# ANVIL-02 / BEARING — Evidence Log

Status: **ACTIVE — Evidence C base fixture supported; transformed-frame falsifier pending**

## Checkpoint C0 — first executable bearing slice

Exact proposal head before the frame-covariance extension:

- branch: `experiment/anvil-02-bearing`;
- source head: `825dba6e49f5057f3022cfcad29f21cdcf346b61`;
- PR: `#5` (draft);
- PR synthetic checkout: `6701f1c41581b7ac3283fc30993206e758ea19b8`;
- Actions run: `32078765858`.

The run passed strict TypeScript, all existing ANVIL regressions, ANVIL-02 semantic tests, exact pinned Box3D binding execution, production build, Forge launcher self-test, and the existing Chromium regression suite.

### ANVIL-02 real-solver metrics

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

This is a strongly discriminating fixture: the constrained gap is roughly 162x below the declared maximum, while the control separation and relative angle are each more than 5x above their declared minima.

Total Node test result at this checkpoint: **27/27 PASS**.

Verdict so far: **SUPPORTED FOR THE IDENTITY-ORIENTED BASE FIXTURE**, not yet an ANVIL-02 experiment verdict.

## A02-C5 — common-transform covariance — gate declared before execution

### Question

Does the compiled bearing relation remain physically valid when both compiled bodies are instantiated under the same arbitrary rigid transform, using only the already-compiled body-local anchors and axes?

This gate tests whether ANVIL-02 has already earned enough spatial semantics for the current bearing fixture, or whether an explicit frame layer is actually required.

### Intervention

Use the same `compileBearing()` output as C0. Do not change source topology, relation schema, thresholds, or Box3D version.

Apply one common transform to the two runtime bodies:

- arbitrary normalized 3D rotation: angle `0.91 rad` about axis proportional to `(0.37, -0.81, 0.44)`;
- translation `(2.4, -1.3, 1.7) m`.

Runtime positions are `T(authored COM)`. Runtime body orientations are the common rotation. The world bearing axis and pivot are transformed from the authored compiled values only for constructing a discriminating zero-pivot-velocity initial condition; the Box3D joint itself receives the existing compiled `localAnchorA/B` and `localAxisA/B`.

Use unequal angular velocities along the transformed free axis:

- body A: `-0.55 rad/s`;
- body B: `+0.85 rad/s`.

Choose each COM linear velocity so the transformed bearing pivot initially has zero velocity for that body.

### Controls

Run an otherwise identical second Box3D world with **no joint**. Body-body collision is disabled in both worlds, so contact cannot rescue either case.

### Predeclared gates

After `120` fixed 60 Hz steps:

- transformed bearing shared-anchor gap <= **0.0025 m**;
- transformed no-relation control gap >= **0.25 m**;
- absolute revolute angle >= **0.35 rad**;
- initial transformed shared-anchor error before stepping <= **0.00001 m**.

These deliberately reuse the already declared C2/C3 physical tolerances. No looser transformed-frame threshold is introduced.

### Interpretation

- Pass: current experiment-local body-local anchor/axis representation is sufficient for common rigid-transform covariance in this fixture. Do **not** add a JURE-like frame ontology merely because one can be imagined.
- Fail with correct identity-frame C0: frame semantics are now experimentally earned as the next problem. Diagnose anchor vs axis vs pose mapping before changing representation.
- Control fails to separate: fixture is no longer discriminating under the transform; redesign the control rather than weakening the constrained gate.

## Still not claimed

Even if C5 passes, ANVIL-02 will not yet prove:

- arbitrary authored non-grid orientations;
- multiple interacting bearings or closed kinematic loops;
- limits, motors, compliance, friction or breakage;
- joint continuity across a CUT/recompile transaction;
- a generic Relation/Joint/Constraint ontology;
- universal frame entities.
