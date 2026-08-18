# PROJECT ANVIL — Laboratory Foundation

This document records the **small set of concepts promoted out of individual experiments**. Promotion means the concept has either been demonstrated by evidence already in this repository or is a neutral measurement/process boundary required to falsify the next experiment.

It does **not** mean the concept is final Machine Matter ontology.

## Foundation rule

A reusable abstraction belongs here only when at least one of these is true:

1. completed experiment evidence already supports keeping it;
2. it is necessary to measure the next falsifier without prescribing its answer;
3. multiple donor projects independently demonstrate the same separation and ANVIL has a concrete use for it now.

Otherwise keep the idea inside the experiment that needs it.

## Promoted layers

```text
AUTHORED TRUTH
persistent semantic identity / intent
        │ compile
        ▼
COMPILED REPRESENTATION
rigid islands / mass / collision / provenance
        │ lower
        ▼
RUNTIME PHYSICS
solver-owned, disposable, reconstructible
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
- neutral `Quat` (`x/y/z/w`);
- `RigidPose`;
- `RigidMotion`;
- minimal vector operations;
- `rigidVelocityAtWorldPoint`.

Not promoted: a complete transform library, frame ontology or solver-specific math types.

## 2. Deterministic mass properties

`src/foundation/mass-properties.ts`

Promoted for the current axis-aligned box-element dialect:

- canonical ordering by stable source element ID;
- compensated aggregate mass/weighted position;
- center of mass;
- axis-aligned inertia diagonal with parallel-axis contribution.

`inertiaDiagonalKgM2` is not a universal inertia-tensor contract.

## 3. Persistent provenance across disposable representations

`src/foundation/provenance.ts`

Compiled entities are compared through persistent source IDs rather than runtime IDs. Supported descriptive lineage includes `continued`, `split`, `merge`, `repartitioned`, `appeared`, `disappeared`, plus added/removed source IDs.

The current `PhysicalPlan` adapter uses cell IDs because the present authoring dialect is cell-based; the lineage concept itself is not voxel-specific.

## 4. Runtime boundary

`src/foundation/runtime.ts`

Promoted:

- runtime observations contain no solver handles;
- runtime can be stepped, observed and disposed;
- neutral motion state exposes linear/angular velocity independently of solver identity.

Experiment runtimes may contain solver-specific implementation internally. That implementation is not foundation.

## 5. Continuity measurements

`src/foundation/continuity.ts`

Promoted measurement primitives:

- pose / linear velocity / angular velocity error;
- linear momentum;
- total linear momentum;
- translational kinetic energy.

Rotational energy and full angular-momentum accounting remain deferred until the inertia representation can support them without false precision.

## 6. Evidence primitive

`src/foundation/evidence.ts`

Reusable gates have stable IDs, explicit pass/fail state, summaries and optional finite numeric metrics. Reports fail closed when any check fails.

## 7. Process boundaries

`docs/EXPERIMENT_PROTOCOL.md` defines the promoted per-experiment Draft/core → Ready/candidate Lean Evidence Loop.

`docs/RESEARCH_COMPASS.md` defines the macro loop that checks vision alignment, component drift, frontier balance and next-falsifier information gain.

## Earned experiment semantics that remain experiment-local

Evidence supports these bounded capabilities, but they are **not** generic foundation contracts:

- BEARING authored interface and passive revolute lowering;
- REBIND runtime reconstruction policy;
- LOAD-REBIND force-pair fixture;
- TORQUE direct-reference authored mark / compiled torque action;
- TORQUE-PATCH local source-face targeting and bearing resolution;
- Forge owner-gate presentation details.

ANVIL-06 is important because it shows that local authored function placement can resolve an existing mechanical interface without an authored cross-component `bearingId`. That is evidence for the design direction, not yet a reason to invent a generic local-property framework.

## Deliberately not foundation

Do not add these globally until experiments force them:

- generic `Bond` / `Joint` / `Constraint` / `Relation` ontology;
- generic FUNCTION / Device ontology;
- generic local-property field system;
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

VAW, JURE, JV and other donor projects are evidence and donors, not proof that ANVIL needs their abstractions now.

## Current use after ANVIL-06

The immediate FUNCTION locality debt is boundedly addressed. Do not keep refining TORQUE by default.

The most underdeveloped core physical frontier is **BINDINGS**. Current authored connectivity is effectively rigid union or explicit disconnection/interface splitting; no compliant local binding has earned semantics.

The selected next falsifier is **ANVIL-07 / ELASTIC-SEAM**: test whether one local authored seam property can produce bounded compliant relative motion plus restoring behavior, while keeping the concept experiment-local and avoiding a generic Bond architecture.

No new foundation abstraction should be added in advance. Let the experiment reveal which reusable boundary, if any, is actually needed.
