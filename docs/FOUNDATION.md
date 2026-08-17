# PROJECT ANVIL — Laboratory Foundation

This document records the **small set of concepts promoted out of individual experiments**. Promotion means the concept has either been demonstrated by evidence already in this repository or is a neutral measurement boundary required to falsify the next experiment.

It does **not** mean the concept is final Machine Matter ontology.

## Foundation rule

A reusable abstraction belongs here only when at least one of these is true:

1. a completed experiment already depends on the boundary and evidence supports keeping it;
2. the abstraction is necessary to measure the next falsifier without prescribing its answer;
3. multiple donor projects independently demonstrate the same separation and ANVIL has a concrete use for it now.

Otherwise keep the idea inside the experiment that needs it.

## Promoted layers

```text
AUTHORED TRUTH
persistent semantic identity / intent
        │
        │ compile
        ▼
COMPILED REPRESENTATION
rigid islands / mass / collision / provenance
        │
        │ lower
        ▼
RUNTIME PHYSICS
solver-owned, disposable, reconstructible
        │
        │ observe
        ▼
EVIDENCE
measurements / lineage / continuity errors / verdict
```

The arrows are boundaries. Objects on one side must not silently become persistent truth on another side.

## 1. Solver-neutral spatial state

`src/foundation/spatial.ts`

Promoted:

- `Vec3`;
- `Quat` using neutral `x/y/z/w` representation;
- `RigidPose`;
- `RigidMotion`;
- minimal vector operations;
- `rigidVelocityAtWorldPoint` as a kinematic measurement primitive.

Reason: ANVIL-00 exposed Box3D quaternion types above the runtime boundary. Future CUT/FRAME work needs physical state that survives changing solver adapters and runtime IDs.

Not promoted: a complete transform library, matrix hierarchy, coordinate-frame ontology or solver-specific math types.

## 2. Deterministic mass properties

`src/foundation/mass-properties.ts`

Promoted for the current axis-aligned box-element dialect:

- deterministic canonical ordering by stable element ID;
- compensated summation for aggregate mass and weighted position;
- center of mass;
- axis-aligned inertia diagonal with parallel-axis contribution.

The implementation is adapted from the proven mass-property discipline in VAW, but rewritten as typed ANVIL code.

Important limitation: `inertiaDiagonalKgM2` is **not** a general inertia tensor contract for arbitrary rotated or continuous matter. Promotion beyond the current box-element model requires a new experiment/evidence gate.

## 3. Persistent provenance across disposable representations

`src/foundation/provenance.ts`

The foundation compares compiled entities through **persistent source IDs**, not through body IDs.

It can classify a transition as:

- `continued`;
- `split`;
- `merge`;
- `repartitioned`;
- `appeared`;
- `disappeared`.

It also records added and removed source IDs.

This is deliberately descriptive. A detected `split` does not prescribe how velocity, angular velocity, energy or constraints should transfer.

The current `PhysicalPlan` adapter uses cell IDs because COLLAPSE is a cell dialect. The lineage algorithm itself accepts generic source IDs so later representations do not need to become voxel-shaped.

## 4. Runtime boundary

`src/foundation/runtime.ts`

Promoted:

- runtime observations contain no solver handles;
- a physics runtime is step-able, observable and disposable;
- a future topology/state experiment must expose linear and angular velocity through a neutral `RuntimeBodyMotionState` before it can claim state continuity.

ANVIL-00's viewer still has a temporary compatibility quaternion alias inside the Box3D adapter. That compatibility shape is **not foundation** and should disappear when the viewer is next materially rewritten.

## 5. Continuity measurement primitives

`src/foundation/continuity.ts`

Promoted as measurement tools:

- pose / linear velocity / angular velocity error magnitudes;
- linear momentum;
- total linear momentum;
- translational kinetic energy.

These functions do not implement topology transfer. They exist so CUT can fail numerically instead of being judged only by whether the animation looks smooth.

Rotational energy and full angular-momentum accounting are intentionally deferred until the inertia representation is strong enough to support them without false precision.

## 6. Evidence report primitive

`src/foundation/evidence.ts`

Reusable gates have stable IDs, explicit pass/fail state, summaries and optional finite numeric metrics. Reports fail closed when any check fails.

This is a small common vocabulary for tests and experiment UIs. It is not a test framework replacement.

## What is deliberately NOT foundation yet

Do not add these globally until an experiment forces the issue:

- generic `Bond` / `Joint` / `Constraint` ontology;
- `SurfaceLaw` or custom contact law;
- damage/fracture model;
- compliant/deformable matter;
- mechanism inference;
- power/control networks;
- adaptive rigid ↔ deformable switching;
- universal material schema;
- universal voxel/grid requirement;
- vehicle-specific compiler concepts;
- a generic scene/entity framework.

VAW, JURE, JV and other donor projects contain useful versions of several of these ideas. They remain donors, not proof that ANVIL needs the same abstraction now.

## Immediate use

The foundation should make **ANVIL-01 / CUT** a narrow physics experiment rather than another architecture exercise:

1. observe complete neutral motion state;
2. create a topology change that does not rely on runtime body identity;
3. compile the new representation;
4. derive source-based body lineage;
5. perform one explicit state-transfer policy;
6. measure spatial, velocity, momentum and energy discontinuities;
7. fail if continuity exceeds declared tolerances.

The state-transfer policy itself is intentionally absent from the foundation. CUT must earn it.
