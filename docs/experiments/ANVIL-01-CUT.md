# ANVIL-01 / CUT

Status: **IN PROGRESS**

Current branch: `experiment/anvil-01-cut`

ANVIL-01 tests whether a physical runtime can be replaced after a topology change while authored matter identity and measured physical state remain continuous. It is not a destruction-system milestone; it is a test of the claim that runtime bodies are disposable interpretations of persistent matter.

The experiment is intentionally staged so one failure has one main cause:

```text
binding round-trip
    ↓
mass-preserving topology
    ↓
free translation transfer
    ↓
free rotation transfer
    ↓
gravity
    ↓
contact
```

Later stages must not be treated as implied by an earlier PASS.

## Fixed control

- exact `box3d.js@0.0.2`;
- runtime reports Box3D `0.1.0`;
- accepted ANVIL-00 compiler/runtime remains the regression control;
- no binding/solver upgrade is mixed into CUT unless the pinned boundary becomes a reproduced blocker.

The upstream binding has newer breaking API generations, but changing the binding during CUT would add an independent experimental variable and is therefore deferred.

## CUT-0 — binding state round-trip

Evidence class: **REAL SOLVER**.

Test: `tests/cut-binding-capability.mjs`.

The exact pinned binding was required to demonstrate:

- explicit initial position and orientation;
- explicit initial linear and angular velocity;
- read-back of position/orientation/linear/angular velocity;
- mass/COM observation;
- explicit transform and velocity mutation;
- a subsequent real Box3D step with finite advancing state.

### Calibration result

The first deliberately over-tight probe failed only on quaternion round-trip precision:

```text
1 - abs(dot(q_expected, q_actual)) = 5.383741452646973e-9
initial threshold                  = 1e-10
```

All pre-existing tests passed in that failed run. This was classified as an unrealistic numeric threshold, not absence of a binding capability.

The gate was then calibrated to the observed single-precision state representation:

- vector state tolerance: `2e-6`;
- quaternion alignment tolerance: `1e-7`.

The recalibrated exact-binding probe passed together with the full existing test/build/Chromium regression pipeline.

Verdict: **SUPPORTED FOR EXACT PINNED BINDING**.

This proves state access/initialization capability. It does not prove topology transfer.

## CUT-1 — mass-preserving topology split

Evidence class: **PURE SYNTHETIC / COMPILER**.

Tests: `tests/cut-topology.test.mjs`.

ANVIL-00 removed the bridge center cell and therefore changed mass. CUT must isolate topology from material deletion.

The compiler now accepts an experiment-local `blockedFaceConnections` option. It suppresses one otherwise implicit rigid face adjacency between two existing cells. The option:

- is not persisted in `MatterDocument`;
- is not a generic `Bond`, `Joint`, or `Constraint` ontology;
- validates both source IDs;
- requires the pair to be truly face-adjacent;
- canonicalizes pair direction and rejects duplicate blocks.

Primary CUT fixture uses all original 51 cells before and after the intervention and blocks the adjacency:

```text
cell:-1:0:0  <->  cell:0:0:0
```

Validated gates:

- before: `51 authored cells → 1 rigid body`;
- after: `51 authored cells → 2 rigid bodies`;
- source IDs before/after: identical;
- added source IDs: `0`;
- removed source IDs: `0`;
- total compiled mass: unchanged within `1e-9 kg` test tolerance;
- provenance: exactly one `split` component;
- split lineage covers all 51 source IDs;
- output remains deterministic under reversed authored cell order and reversed cut-pair order.

The full CI pipeline, including accepted ANVIL-00 Chromium regression, passed after this gate was added.

Verdict: **SUPPORTED FOR FIXTURE**.

This is a topology/compiler result. It still does not prove runtime state continuity.

## CUT-2A — free translation runtime transfer

Evidence class: **REAL SOLVER**.

Test: `tests/cut-translation-transfer.mjs`.

This is the first runtime reconstruction probe and deliberately sets:

- zero gravity;
- no ground/contact geometry;
- non-zero parent linear velocity;
- identity orientation;
- zero angular velocity.

Procedure:

1. compile the intact 51-cell source into one body;
2. create a real Box3D runtime with explicit neutral motion state;
3. step it for 23 solver frames;
4. snapshot the actual parent state;
5. retire runtime A;
6. compile the same 51 source cells with one blocked face connection into two bodies;
7. place each new body COM at the old parent COM plus its authored COM offset;
8. inherit parent orientation, linear velocity and zero angular velocity;
9. create runtime B from those explicit states;
10. measure immediate continuity;
11. execute the next real solver step and measure again.

Hard gates currently include:

- child COM position error `< 5e-5 m`;
- linear velocity error `< 5e-6 m/s`;
- angular velocity error `< 5e-6 rad/s`;
- total Box3D mass delta `<= 0.1 kg`;
- immediate total linear-momentum error `< 0.5 kg·m/s`;
- post-step total linear-momentum error `< 1.0 kg·m/s`;
- all post-step state remains finite.

The test passed on the exact pinned Box3D binding, and the same commit also passed strict TypeScript, all previous foundation/compiler/real-Box3D tests, production build and real Chromium ANVIL-00 regression.

Verdict: **SUPPORTED FOR FREE-TRANSLATION FIXTURE**.

### Important evidence boundary

This test reconstructs an **isolated whole runtime/world A → runtime/world B**. It demonstrates that the disposable runtime can be rebuilt around persistent matter while transferring a simple moving state.

It does **not** yet demonstrate:

- non-zero angular velocity;
- rotated child COM placement;
- rigid velocity-field transfer `v_child = v_parent + ω × r`;
- gravity continuity;
- contact-manifold continuity;
- in-place body replacement inside an already populated world;
- constraint/joint state transfer;
- angular-momentum or rotational-energy conservation;
- damage, fracture propagation, crack geometry or debris.

## Next falsifier — CUT-2B / free rotation

Do not add gravity or contact yet.

Next fixture should keep the same mass-preserving split but give the parent both linear and angular velocity. New child state candidate remains experiment-local:

```text
child COM position = parent pose applied to authored child-COM offset
child rotation     = parent rotation
child angular vel  = parent angular vel
child linear vel   = v_parent + ω_parent × worldOffset
```

Required measurements should include:

- rotated child-COM pose error;
- child linear-velocity field error;
- angular-velocity error;
- mass and linear momentum;
- post-step impulse/drift;
- translational kinetic-energy delta as diagnostic.

Full angular momentum and rotational energy must remain non-claims until ANVIL has an inertia representation capable of supporting those calculations honestly for rotated bodies.

## Current experiment verdict

ANVIL-01 as a whole is **IN PROGRESS**.

What is currently supported is narrower:

1. exact pinned browser binding can round-trip required rigid state;
2. the compiler can split one rigid island into two without deleting authored matter or mass;
3. an isolated translating Box3D runtime can be rebuilt across that split with bounded measured linear-state discontinuity.

The central moving+rotating CUT hypothesis is not yet proven.
