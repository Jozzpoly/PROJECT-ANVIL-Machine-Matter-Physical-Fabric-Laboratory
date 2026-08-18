# PROJECT ANVIL — Laboratory Foundation

This document records the **small set of concepts promoted out of individual experiments**. Promotion means the concept has either been demonstrated by evidence already in this repository or is a neutral measurement/process boundary required to falsify the next experiment.

It does **not** mean the concept is final Machine Matter ontology.

## Foundation rule

A reusable abstraction belongs here only when at least one of these is true:

1. completed experiment evidence already supports keeping it;
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

Reason: topology replacement, relation reconstruction and future representation changes need physical state that survives changing solver adapters and runtime IDs.

Not promoted: a complete transform library, matrix hierarchy, coordinate-frame ontology or solver-specific math types.

## 2. Deterministic mass properties

`src/foundation/mass-properties.ts`

Promoted for the current axis-aligned box-element dialect:

- deterministic canonical ordering by stable element ID;
- compensated summation for aggregate mass and weighted position;
- center of mass;
- axis-aligned inertia diagonal with parallel-axis contribution.

The implementation is adapted from proven mass-property discipline in VAW, but rewritten as typed ANVIL code.

Important limitation: `inertiaDiagonalKgM2` is **not** a general inertia tensor contract for arbitrary rotated or continuous matter. Promotion beyond the current box-element model requires new evidence.

## 3. Persistent provenance across disposable representations

`src/foundation/provenance.ts`

The foundation compares compiled entities through **persistent source IDs**, not runtime body IDs.

It can classify a transition as:

- `continued`;
- `split`;
- `merge`;
- `repartitioned`;
- `appeared`;
- `disappeared`.

It also records added and removed source IDs.

This is deliberately descriptive. A detected `split` does not prescribe how velocity, angular velocity, energy, contacts or relations transfer.

The current `PhysicalPlan` adapter uses cell IDs because COLLAPSE is a cell dialect. The lineage algorithm itself accepts generic source IDs so later representations do not need to become voxel-shaped.

## 4. Runtime boundary

`src/foundation/runtime.ts`

Promoted:

- runtime observations contain no solver handles;
- a physics runtime is step-able, observable and disposable;
- neutral motion state exposes linear/angular velocity without making solver objects authoritative.

Experiment runtimes may still contain solver-specific implementation internally. That implementation is not foundation.

## 5. Continuity measurement primitives

`src/foundation/continuity.ts`

Promoted as measurement tools:

- pose / linear velocity / angular velocity error magnitudes;
- linear momentum;
- total linear momentum;
- translational kinetic energy.

These functions do not implement topology transfer or relation reconstruction. They exist so continuity claims can fail numerically instead of relying only on animation.

Rotational energy and full angular-momentum accounting remain deferred until the inertia representation is strong enough to support them without false precision.

## 6. Evidence report primitive

`src/foundation/evidence.ts`

Reusable gates have stable IDs, explicit pass/fail state, summaries and optional finite numeric metrics. Reports fail closed when any check fails.

This is a small common vocabulary for tests and experiment UIs, not a test-framework replacement.

## 7. Process boundary — Lean Evidence Loop

The Draft/core → Ready/candidate lifecycle in `docs/EXPERIMENT_PROTOCOL.md` is promoted process infrastructure because ANVIL-04 and ANVIL-05 demonstrated that it reduces validation cost without weakening exact-head evidence identity.

The macro strategic loop lives in `docs/RESEARCH_COMPASS.md` and exists to prevent repeated successful experiments from drifting away from the project vision.

## Earned experiment semantics that are NOT foundation

The following capabilities are supported in bounded experiments but remain deliberately experiment-local:

- BEARING authored interface mark and revolute relation lowering;
- REBIND transaction policy;
- LOAD-REBIND laboratory force-pair fixture;
- TORQUE authored mark / compiled torque action;
- Forge owner-gate presentation details.

Their evidence is real, but one successful semantic slice is not enough to freeze a universal architecture.

## What is deliberately NOT foundation yet

Do not add these globally until an experiment forces the issue:

- generic `Bond` / `Joint` / `Constraint` / `Relation` ontology;
- generic FUNCTION / Device ontology;
- `SurfaceLaw` or custom contact law;
- damage/fracture/plasticity/fatigue model;
- compliant/deformable matter;
- mechanism inference;
- power/control/signal networks;
- adaptive rigid ↔ deformable switching;
- universal material schema;
- universal voxel/grid requirement;
- vehicle-specific compiler concepts;
- generic scene/entity framework.

VAW, JURE, JV and other donor projects contain useful versions of several of these ideas. They remain donors, not proof that ANVIL needs the same abstraction now.

## Current use after ANVIL-05

The immediate frontier is no longer CUT.

ANVIL-05 proved one bounded active torque path, but its authored `TorqueMark` directly names persistent `bearingId`. This is valid bounded evidence and not a runtime-ID leak; however, it creates an architectural question that should be attacked before a control system is built on top.

**ANVIL-06 / TORQUE-PATCH** should test whether active intent can be authored as a local source-face property, resolve the already-earned BEARING through locality/topology, and fail closed when placed on a non-bearing face.

No new foundation abstraction is required in advance. If the local-binding experiment passes, promotion should still wait until a second use demonstrates what reusable semantic boundary actually exists.
