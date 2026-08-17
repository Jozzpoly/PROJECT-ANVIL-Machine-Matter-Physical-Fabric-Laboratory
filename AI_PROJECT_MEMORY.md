# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-17.

## Repository identity

- Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.
- `main` is the latest accepted checkpoint, not an agent worktree.
- ANVIL-00 / COLLAPSE is owner-accepted within its stated scope.
- Reusable laboratory foundation is accepted on `main`.
- Active research branch: `experiment/anvil-01-cut`.
- ANVIL-01 is **IN PROGRESS** and must not be described as accepted/merged until its eventual experiment gate and owner-facing evidence justify that.

Historical hashes are useful checkpoint identifiers only. Always resolve live Git before work.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> Persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

The long-horizon goal is not a catalog of vehicle/machine parts. Machines should increasingly emerge from matter, relations, interfaces and function. Runtime bodies, colliders and later solver constructs are interpretations, not authoritative construction identity.

ANVIL is falsification-driven. Do not promote an experiment-local trick into universal ontology merely because it makes one demo work.

## Accepted baseline — ANVIL-00 / COLLAPSE

For its bounded sparse-cell fixture ANVIL-00 demonstrated:

- persistent cell/material identity with no Box3D IDs in `MatterDocument`;
- deterministic face-connectivity rigidification;
- integrated mass/COM;
- separate compact collision representation;
- disposable Box3D runtime lowering;
- independent Box3D mass/COM cross-checks;
- intact `51 cells → 1 body → 8 collision boxes`;
- authoring edit `50 cells → 2 bodies → 9 collision boxes`;
- strict TS, semantic tests, real Box3D stepping, production build and Chromium runtime PASS;
- owner manual execution/visual validation of the packaged artifact.

Boundary: COLLAPSE deletes one bridge cell and rebuilds from neutral state. It is **not dynamic fracture/state migration**.

## Accepted laboratory foundation

Read `docs/FOUNDATION.md`, `AGENTS.md`, `docs/EXPERIMENT_PROTOCOL.md` and `docs/DONOR_MAP.md` before expanding architecture.

Promoted building blocks:

- solver-neutral `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic compensated mass/COM and current limited inertia diagonal;
- source-based provenance lineage independent of disposable body IDs;
- solver-neutral runtime observation/motion contracts;
- continuity primitives for pose/velocity, linear momentum and translational kinetic energy;
- fail-closed evidence report primitives.

Explicitly **not foundation yet**:

- generic Bond/Joint/Constraint ontology;
- SurfaceLaw/custom contact model;
- damage/fracture propagation;
- deformable/compliant matter;
- mechanism inference;
- power/control networks;
- adaptive rigid↔deformable switching;
- universal materials or universal voxels;
- vehicle-specific compiler concepts;
- generic scene/entity framework.

## Toolchain control

- Node `24.16.0`.
- npm `>=11.13.0 <12`, tracked lockfile, CI uses `npm ci`.
- exact browser binding `box3d.js@0.0.2`.
- runtime version asserted as Box3D `0.1.0`.
- TypeScript `7.0.2`, Vite `8.1.5`, Playwright `1.61.1`.

Upstream `box3d.js` was observed on 2026-08-17 to have newer breaking API generations. Do **not** mix a binding upgrade into CUT unless the pinned boundary becomes a reproduced blocker. Binding upgrade should be a separate controlled change/experiment.

## ANVIL-01 / CUT — current evidence

Read both:

- `docs/experiments/ANVIL-01-CUT-PREFLIGHT.md` — planned falsifier/boundaries;
- `docs/experiments/ANVIL-01-CUT.md` — actual evolving evidence.

CUT exists to test disposable runtime continuity, not to begin a destruction-game roadmap.

Current staged sequence:

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

Do not skip stages casually; the sequence isolates failure causes.

### CUT-0 — exact binding round-trip — SUPPORTED

`tests/cut-binding-capability.mjs` uses real Box3D and proves on exact `box3d.js@0.0.2`:

- explicit initial position/rotation;
- explicit initial linear/angular velocity;
- read-back of position/rotation/linear/angular velocity;
- mass/COM observation;
- explicit `SetTransform`, linear-velocity and angular-velocity mutation;
- subsequent real solver stepping with finite advancing state.

The first deliberately over-tight quaternion gate failed at:

`1 - abs(dot(q_expected, q_actual)) = 5.383741452646973e-9`

against threshold `1e-10`, while all prior tests passed. This was classified as float-state precision calibration, not missing capability. Current binding probe tolerances are `2e-6` vector state and `1e-7` quaternion alignment. Re-run passed full CI including Chromium regression.

### CUT-1 — mass-preserving topology — SUPPORTED FOR FIXTURE

Compiler gained an **experiment-local** `blockedFaceConnections` option. It suppresses one implicit rigid face connection but does not modify/persist `MatterDocument` and is not a promoted generic Bond object.

Primary cut blocks:

`cell:-1:0:0 <-> cell:0:0:0`

with all source cells retained.

`tests/cut-topology.test.mjs` validates:

- `51 cells / 1 body → 51 cells / 2 bodies`;
- identical source-ID set;
- zero source IDs added/removed;
- unchanged total compiled mass within `1e-9 kg` test tolerance;
- exactly one provenance `split` covering all 51 source IDs;
- deterministic output under source-array and connection-pair reversal;
- invalid/non-face/duplicate blocked connections fail closed.

Full CI including ANVIL-00 browser regression passed.

### CUT-2A — free translation state transfer — SUPPORTED FOR FIXTURE

`src/physics.ts` now exposes neutral linear/angular velocity and accepts explicit solver-neutral initial body motion. Defaults preserve accepted ANVIL-00 behavior.

`tests/cut-translation-transfer.mjs` is a **REAL SOLVER** test:

1. create one-body intact runtime with non-zero linear velocity, zero gravity/contact and `ω=0`;
2. step 23 real Box3D frames;
3. snapshot actual parent state;
4. retire runtime A;
5. compile same 51 cells as two bodies through blocked connectivity;
6. reconstruct child COM positions from the parent COM plus authored child-COM offsets;
7. inherit orientation/linear velocity/zero angular velocity;
8. create runtime B from explicit state;
9. measure immediate mass, position, velocity and total linear momentum;
10. execute the next real Box3D step and measure post-step state/momentum.

Hard gate scales currently encoded:

- position `< 5e-5 m`;
- linear velocity `< 5e-6 m/s`;
- angular velocity `< 5e-6 rad/s`;
- total runtime mass delta `<= 0.1 kg`;
- immediate linear momentum error `< 0.5 kg·m/s`;
- post-step linear momentum error `< 1.0 kg·m/s`;
- all post-step state finite.

Exact branch-head CI passed strict TypeScript, all foundation/compiler/real-Box3D tests including this transfer, production build and real Chromium ANVIL-00 regression.

Important boundary: CUT-2A rebuilds an **isolated whole runtime/world A → runtime/world B**. It does not prove in-place body replacement inside a populated world, contact-manifold transfer or constraint state continuity.

## Next falsifier — CUT-2B / free rotation

Do not add gravity/contact before this is understood.

Use the same mass-preserving split with non-zero parent linear and angular velocity. Candidate policy remains experiment-local:

```text
child world COM = parent pose applied to authored child-COM offset
child rotation  = parent rotation
child ω         = parent ω
child v         = parent v + parent ω × worldOffset
```

Required next evidence:

- rotated child-COM pose continuity;
- rigid velocity-field continuity at child COMs;
- angular-velocity continuity;
- mass and total linear momentum;
- post-step solver validity and impulse/drift diagnostics;
- translational kinetic-energy delta as diagnostic.

Do not claim full angular-momentum or rotational-energy conservation from the current inertia diagonal for arbitrary rotated bodies. A stronger inertia representation/measurement gate is required first.

## Critical roadmap interpretation

CUT is valuable because it tests that runtime body identity is temporary. It should **not** pull the project into a long damage/crack/debris track by default.

After CUT earns the minimum topology/state-continuity capability, the project should return toward the broader Machine Matter question: how material properties, structural relations, interfaces and function compile into mechanical behavior without requiring a catalog of ready-made parts.

Donor repos remain evidence/capability sources, not architectures to merge:

- VAW — rigid-island/provenance/mass-property lessons;
- JURE — solver-neutral frames/relations/source discipline when FRAME actually needs them;
- Native JV — evidence that deeper Box3D modification is possible when justified;
- JV-Web — browser/Box3D and runtime-validation discipline;
- JES — workflow/evidence discipline.

## Current branch status

`experiment/anvil-01-cut` is deliberately **not merged**. Current supported sub-results are CUT-0, CUT-1 and CUT-2A only. CUT-2B (non-zero rotation) is the immediate next experimental task.
