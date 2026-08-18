# PROJECT ANVIL — Laboratory Foundation

This document records only the **small set of reusable boundaries already earned by evidence** or neutral measurement/process infrastructure required to falsify experiments. It is not a roadmap and it does not describe the current active experiment.

Promotion to foundation does **not** mean a concept is final Machine Matter ontology.

## Foundation rule

A reusable abstraction belongs here only when at least one of these is true:

1. accepted experiment evidence already supports reuse; or
2. it is solver/domain-neutral measurement or process infrastructure directly required to falsify a bounded experiment.

Otherwise keep the concept inside the experiment that needs it. Do not promote incidental fixture structure because several experiments happen to use similar vocabulary.

## Promoted separation

```text
AUTHORED TRUTH
persistent semantic identity / physical intent
        │ compile
        ▼
COMPILED REPRESENTATION
runtime-ready topology / mass / collision / provenance
        │ lower
        ▼
RUNTIME PHYSICS
solver-owned, disposable, reconstructible
        │ observe
        ▼
EVIDENCE
measurements / lineage / verdict
```

Objects on one side must not silently become persistent truth on another side.

## 1. Solver-neutral spatial state

`src/foundation/spatial.ts`

Promoted:

- `Vec3`;
- neutral `Quat` (`x/y/z/w`);
- `RigidPose`;
- `RigidMotion`;
- minimal vector operations;
- `rigidVelocityAtWorldPoint`.

Not promoted: a complete transform library, universal frame ontology or solver-specific math types.

## 2. Deterministic mass properties

`src/foundation/mass-properties.ts`

Promoted for the current axis-aligned box-element laboratory dialect:

- canonical ordering by stable source element ID;
- compensated aggregate mass/weighted position;
- center of mass;
- axis-aligned inertia diagonal with parallel-axis contribution.

`inertiaDiagonalKgM2` is not a universal inertia-tensor contract.

## 3. Persistent provenance

`src/foundation/provenance.ts`

Compiled entities are compared through persistent source IDs rather than runtime IDs. Supported descriptive lineage includes:

- `continued`;
- `split`;
- `merge`;
- `repartitioned`;
- `appeared`;
- `disappeared`;
- added/removed source IDs.

The current `PhysicalPlan` adapter uses cell IDs because the present authored dialect is cell-based; the lineage principle itself is not voxel-specific.

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

- pose / linear-velocity / angular-velocity error;
- linear momentum;
- total linear momentum;
- translational kinetic energy.

Rotational energy and full angular-momentum accounting remain deferred until the inertia representation can support them without false precision.

## 6. Evidence primitive

`src/foundation/evidence.ts`

Reusable gates have stable IDs, explicit pass/fail state, summaries and optional finite numeric metrics. Reports fail closed when any check fails.

## 7. Process boundaries

- `docs/EXPERIMENT_PROTOCOL.md` — promoted per-experiment Lean Evidence Loop.
- `docs/RESEARCH_COMPASS.md` — durable macro anti-drift validation method.
- `.anvil/project-state.json` + `docs/CURRENT_HANDOFF.md` — takeover checkpoint mechanism; these are operational state, not scientific foundation.

## Earned experiment semantics that remain experiment-local

Evidence supports these bounded capabilities, but they are **not** generic foundation contracts:

- BEARING authored interface and passive revolute lowering;
- REBIND runtime reconstruction policy;
- LOAD-REBIND laboratory load fixture;
- TORQUE authored mark / compiled torque action;
- TORQUE-PATCH local source-face targeting and bearing resolution;
- Forge owner-gate presentation/transport details.

Their accepted evidence may inform future abstractions, but one or two successful slices are not enough to freeze a universal schema.

## Deliberately not foundation

Do not add these globally until experiments force them:

- generic `Bond` / `Joint` / `Constraint` / `Relation` ontology;
- generic FUNCTION / Device ontology;
- generic local-property field system;
- `SurfaceLaw` or custom contact law;
- compliant/deformable matter as a universal model;
- damage/fracture/plasticity/fatigue model;
- mechanism inference;
- power/control/signal networks;
- adaptive rigid ↔ deformable switching;
- universal material schema;
- universal voxel/grid requirement;
- vehicle-specific compiler concepts;
- generic scene/entity framework.

VAW, JURE, JV and other donor projects are evidence and donor sources, not proof that ANVIL needs their architecture.

## Stability rule

This document should change only when a reusable boundary is actually promoted, narrowed or revoked. Current experiment selection, live PR state, next actions and frontier ranking belong in `.anvil/project-state.json`, `docs/CURRENT_HANDOFF.md` and `AI_PROJECT_MEMORY.md`, not here.
