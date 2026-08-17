# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-17.

## Repository identity

- Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.
- `main` is the latest accepted checkpoint, not an agent worktree.
- `ANVIL-00 / COLLAPSE` was owner-accepted within its stated scope and squash-merged to `main` on 2026-08-17.
- Historical ANVIL-00 checkpoint merge: `d67d8270839d713c6f2f5b78890b0172d6afb5c0`.
- The reusable laboratory foundation was validated on branch + exact PR head + post-merge `main` and squash-merged as PR #2 on 2026-08-17.
- Historical foundation checkpoint merge: `0f35241001799c00a66629946b3252886b1a4d30`.

Commit hashes here are historical checkpoint identifiers only. Always resolve live Git before changes.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**. Its working premise is:

> Persistent authored matter/physical intent may compile into disposable runtime representations whose resolution and identity domains differ from authored truth.

Authored resolution, mass representation, collision representation, runtime rigid bodies and visual representation are not required to be identical.

This is a research direction, not proof that one universal ontology or one solver can span every future physical domain.

## Accepted evidence — ANVIL-00 / COLLAPSE

ANVIL-00 demonstrated, for its bounded sparse-cell fixture:

1. `MatterDocument` contains stable authored cells/materials and no Box3D IDs.
2. Compiler finds face-connected rigid components deterministically.
3. Each component becomes one `RigidBodyPlan` with integrated mass and COM.
4. Exact occupied volume is compacted into fewer material-homogeneous cuboid collider plans.
5. Box3D lowering creates dynamic bodies and convex hull shapes from the disposable plan.
6. Compiler mass agrees with mass independently reconstructed by Box3D within the experiment tolerance.
7. Compiler-selected COM agrees with Box3D's independently reconstructed local COM within the experiment tolerance.
8. Intact fixture: `51 authored cells → 1 rigid body → 8 collision boxes`.
9. One-cell authoring edit: `50 surviving authored cells → 2 rigid bodies → 9 collision boxes`.
10. Strict TypeScript, semantic tests, real Box3D stepping, production build and real Chromium runtime all passed.
11. The owner manually ran the packaged validated browser artifact and supplied visual evidence showing `LIVE EVIDENCE`, the edited `50 / 2 / 9` state, all displayed gates PASS and continued runtime stepping.

Verdict: **SUPPORTED FOR THE ANVIL-00 FIXTURE AND OWNER-ACCEPTED WITHIN ITS STATED SCOPE**.

This is **not runtime fracture**. The COLLAPSE cut deletes an authored bridge cell and rebuilds from a neutral fixture; it does not preserve mass or migrate a moving body's state.

## Toolchain truth

- Node: `24.16.0`.
- npm: `>=11.13.0 <12`; tracked lockfile; CI uses `npm ci`.
- Browser physics binding: exact `box3d.js@0.0.2`, validated at runtime as Box3D `0.1.0`.
- TypeScript: `7.0.2`; Vite: `8.1.5`; Playwright: `1.61.1`.
- GitHub Actions may be used freely in this public laboratory.

## Promoted laboratory foundation

Read `docs/FOUNDATION.md` before expanding the global architecture.

### `src/foundation/spatial.ts`

Solver-neutral `Vec3`, `Quat` (`x/y/z/w`), `RigidPose`, `RigidMotion`, minimal vector operations and `rigidVelocityAtWorldPoint`.

`rigidVelocityAtWorldPoint` is a **measurement/kinematics primitive**, not an accepted topology-transfer policy.

### `src/foundation/mass-properties.ts`

Deterministic mass/COM calculation for the current axis-aligned box-element model:

- stable-ID canonical ordering;
- compensated/Kahan summation;
- COM;
- axis-aligned inertia diagonal with parallel-axis contribution.

The numerical discipline is adapted from VAW's proven mass-property implementation but rewritten as typed ANVIL code.

Important: `inertiaDiagonalKgM2` is not yet a universal inertia tensor for arbitrary rotated/continuous matter.

### `src/foundation/provenance.ts`

Persistent-source provenance analysis independent of disposable body IDs. Compiled lineage classifications:

- `continued`;
- `split`;
- `merge`;
- `repartitioned`;
- `appeared`;
- `disappeared`.

The ANVIL-00 intact→edited comparison is correctly described as a body `split` plus one removed source ID. CUT must use a mass-preserving topology change so its primary lineage gate becomes one `split` with zero source additions/removals.

### `src/foundation/runtime.ts`

Solver-neutral runtime observation contracts and a generic step/snapshot/dispose boundary. Future continuity work requires neutral linear/angular velocity (`RuntimeBodyMotionState`) before it may claim state transfer.

No Box3D handle or Box3D math type is foundation truth. ANVIL-00's viewer retains a local compatibility quaternion alias only so the accepted demo does not need an unrelated rewrite.

### `src/foundation/continuity.ts`

Measurement primitives for:

- pose/linear/angular velocity errors;
- linear momentum;
- total linear momentum;
- translational kinetic energy.

Rotational energy and full angular-momentum accounting are deliberately deferred until the inertia representation can support them honestly.

### `src/foundation/evidence.ts`

Stable evidence-check IDs, pass/fail state, summaries, finite numeric metrics and fail-closed aggregate reports. This is a small experiment vocabulary, not a test-framework replacement.

### `src/foundation/index.ts`

Stable import surface for promoted foundation modules.

## Foundation validation — ACCEPTED

`tests/foundation.test.mjs` checks:

- mass-property determinism under input reordering;
- current COLLAPSE lineage: intact→cut = `split`, reverse = `merge`, unchanged = `continued`;
- rigid point-velocity kinematics;
- momentum/translational-energy primitives;
- fail-closed evidence reports and duplicate check-ID rejection.

Promotion validation passed at three useful levels:

1. foundation branch head: strict TS, foundation + semantic tests, real Box3D smoke, production build and Chromium regression — PASS;
2. exact PR #2 head: the same full pipeline — PASS;
3. squash-merged `main` checkpoint `0f35241001799c00a66629946b3252886b1a4d30`: full post-merge pipeline including real Chromium — PASS.

Therefore the laboratory foundation is **accepted infrastructure**, but it adds no new general physics verdict beyond ANVIL-00.

## Process foundation

Read these files before material experiments:

- `AGENTS.md` — truth hierarchy, Git/architecture/promotion rules;
- `docs/EXPERIMENT_PROTOCOL.md` — falsification-first workflow and evidence classes;
- `docs/FOUNDATION.md` — promoted global boundaries and explicit non-promotions;
- `docs/DONOR_MAP.md` — current evidence-backed donor capabilities;
- `docs/experiments/TEMPLATE.md` — experiment record skeleton;
- `.github/pull_request_template.md` — evidence-focused PR contract.

Evidence classes are explicitly separated: static/structural, pure synthetic, real solver, real product runtime and owner manual validation.

Verdict vocabulary: `SUPPORTED FOR FIXTURE`, `REJECTED`, `INCONCLUSIVE`, `BLOCKED`, `REGRESSION`.

## Explicit non-foundation

Do **not** globally add these until a bounded experiment earns them:

- generic `Bond` / `Joint` / `Constraint` ontology;
- SurfaceLaw/custom contact law;
- damage/fracture propagation;
- compliant/deformable matter;
- mechanism inference;
- power/control networks;
- adaptive rigid↔deformable switching;
- universal material schema;
- universal voxel/grid requirement;
- vehicle-specific compiler concepts;
- generic scene/entity framework.

Sparse cubic cells and face-adjacency-as-rigidity remain ANVIL-00 fixture choices, not Machine Matter doctrine.

## Donor evidence

- **VAW**: authored→structural/mechanical→rigid-island→runtime separation, provenance, assembly ownership, compensated mass properties and diagnostics. Harvest techniques minimally; do not merge the craft compiler.
- **JURE**: solver-neutral authored poses/frames/relations, stable IDs, source provenance, validation and canonical serialization. Use its discipline; do not import its frame ontology before FRAME demonstrates ANVIL needs it.
- **Native JV / Box3D**: proves deep Box3D modification is practical in this ecosystem. ANVIL still follows the shallowest-sufficient intervention ladder.
- **JV-Web**: proven browser/TypeScript `box3d.js` boundary and production-runtime validation discipline.
- **JES**: workflow/evidence/source-of-truth donor rather than physics code donor.
- **HomeScan / Splat / Planet Matter**: reinforce representation separation; not implementation dependencies until an experiment needs their representation class.

See `docs/DONOR_MAP.md` for the current harvest boundary.

## Prepared next falsifier — ANVIL-01 / CUT

Read `docs/experiments/ANVIL-01-CUT-PREFLIGHT.md` before implementation.

The key correction relative to COLLAPSE is **mass preservation**: CUT v1 must keep all authored matter and sever only structural connectivity (e.g. an experiment-local cut mask over one adjacency edge). Do not delete a cell in the primary CUT fixture because mass loss would confound continuity evidence.

Planned transaction boundary is between solver steps:

1. finish step N;
2. snapshot neutral old runtime state;
3. apply authored topology intervention and compile new plan;
4. analyze source-provenance lineage;
5. construct replacement runtime and apply one explicit candidate transfer policy;
6. retire old runtime representation;
7. measure immediate discontinuities;
8. run step N+1 and measure post-step behavior.

Before state transfer, probe the exact current Box3D binding for reliable round-trip access to position, rotation, linear velocity, angular velocity, mass/COM observation and explicit replacement-body initialization. A binding limitation is evidence, not permission to guess APIs.

CUT's candidate rigid-field transfer (`v_child = v_old + ω × r`, inherited angular velocity/orientation, transformed child COM) is only a hypothesis to test inside CUT, not foundation truth.

Initial CUT gates should cover source identity, 1→2 lineage with zero source additions/removals, pose continuity, velocity-field continuity, mass, linear momentum and post-step solver validity. Energy and angular-momentum metrics must not claim more precision than the inertia representation supports.

Fixture escalation should be: translating free body → translating+rotating → gravity → contact → only then external constraints/mechanisms.

## Next operational starting point

Start ANVIL-01 on a fresh `experiment/anvil-01-cut` branch from the latest accepted `main` foundation checkpoint.

First executable task is **not state transfer**. It is the Box3D binding capability probe required by CUT: prove observation and explicit initialization of neutral pose, linear velocity and angular velocity on the exact current browser binding. Only after that gate passes should the mass-preserving connectivity cut and topology transaction be implemented.
