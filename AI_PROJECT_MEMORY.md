# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-17.

## Repository identity

- Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.
- `main` is the latest owner-accepted checkpoint and must not be treated as an agent worktree.
- ANVIL-00 / COLLAPSE and the reusable laboratory foundation are accepted on `main`.
- Active research branch: `experiment/anvil-01-cut`.
- ANVIL-01 automated core is now **SUPPORTED FOR FIXTURES**, but the branch remains **IN PROGRESS** until CUT-specific product-runtime evidence and owner validation are completed.

Always resolve live Git before changes; commit hashes below are checkpoint identifiers only.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> Persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Long-horizon direction: machines should increasingly emerge from matter, relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies/colliders/solver constructs are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into universal ontology merely because one fixture passes.

## Accepted baseline — ANVIL-00 / COLLAPSE

ANVIL-00 established for its bounded sparse-cell fixture:

- persistent cell/material identity without Box3D IDs in `MatterDocument`;
- deterministic rigid-island compilation;
- integrated mass/COM;
- collision representation separate from authored resolution;
- disposable Box3D lowering;
- independent Box3D mass/COM cross-checks;
- `51 cells → 1 body → 8 collision boxes` intact;
- authoring edit `50 cells → 2 bodies → 9 collision boxes`;
- strict TS, semantic tests, real Box3D, production build, Chromium runtime PASS;
- owner manual visual/runtime validation.

Boundary: COLLAPSE deletes one source cell and rebuilds neutral state. It is not dynamic state migration.

## Accepted laboratory foundation

Read `AGENTS.md`, `docs/EXPERIMENT_PROTOCOL.md`, `docs/FOUNDATION.md` and `docs/DONOR_MAP.md` before broad architecture work.

Promoted neutral capabilities:

- `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic compensated mass/COM and current limited inertia diagonal;
- source-provenance lineage independent of disposable IDs;
- solver-neutral runtime observation/motion boundary;
- pose/velocity, linear-momentum and translational-energy measurements;
- fail-closed evidence primitives.

Not foundation yet:

- generic Bond/Joint/Constraint ontology;
- custom SurfaceLaw/contact model;
- damage/fracture propagation;
- deformable/compliant matter;
- mechanism inference;
- power/control networks;
- adaptive rigid↔deformable switching;
- universal materials/voxels;
- vehicle-specific compiler concepts;
- generic scene/entity framework.

## Toolchain control

- Node `24.16.0`.
- npm `>=11.13.0 <12`; tracked lockfile; CI uses `npm ci`.
- exact `box3d.js@0.0.2`, runtime asserts Box3D `0.1.0`.
- TypeScript `7.0.2`, Vite `8.1.5`, Playwright `1.61.1`.

Upstream `box3d.js` has newer breaking API generations. Do not mix an upgrade into CUT unless the pinned binding becomes a reproduced blocker; treat upgrade as a separate controlled change.

## ANVIL-01 / CUT — read first

- historical plan/boundaries: `docs/experiments/ANVIL-01-CUT-PREFLIGHT.md`;
- actual evidence and metrics: `docs/experiments/ANVIL-01-CUT.md`.

CUT tests disposable runtime continuity. It is not a destruction-game roadmap.

Mass-preserving primary split keeps all 51 cells and blocks only:

`cell:-1:0:0 <-> cell:0:0:0`

through experiment-local `blockedFaceConnections`. This is not a promoted generic Bond.

## CUT automated evidence — SUPPORTED FOR FIXTURES

Progression completed:

```text
binding round-trip
    ↓
mass-preserving topology
    ↓
free translation
    ↓
free rotation / rigid velocity field
    ↓
uniform gravity
    ↓
settled contact
    ↓
dynamic impact
    ↓
one-lobe active contact at transaction
```

### CUT-0 — exact binding

Real Box3D proves explicit/read-back pose, linear/angular velocity, mass/COM, state mutation and continued stepping on pinned binding.

Important negative evidence: first quaternion threshold `1e-10` failed at only `5.383741452646973e-9` alignment deficit while prior tests stayed green. Threshold was calibrated to actual single-precision representation (`2e-6` vector, `1e-7` quaternion alignment), not relaxed to hide physics failure.

### CUT-1 — mass-preserving topology

`tests/cut-topology.test.mjs` proves:

- `51 cells / 1 body → 51 cells / 2 bodies`;
- identical source-ID set;
- zero source additions/removals;
- same compiled mass;
- exactly one provenance split covering all sources;
- deterministic/fail-closed connectivity seam.

### CUT-2A — free translation

Real Box3D world A runs 23 frames, parent state is measured, world A retired, same source matter rebuilt as two bodies in world B, state transferred and stepped. Position/velocity/mass/linear-momentum gates pass.

### CUT-2B — free rotation

Experiment-local transfer policy tested:

```text
r_world   = R_parent · authored_child_COM_offset
COM_child = COM_parent + r_world
R_child   = R_parent
ω_child   = ω_parent
v_child   = v_parent + ω_parent × r_world
```

Sensitivity/evidence:

- rotated COM effect `0.4195247840 m`;
- `ω×r` child velocity effect `1.4641147108 m/s`;
- immediate/post-step total linear-momentum error ≈ `4.219e-5 kg·m/s`;
- severed-interface rigid velocity field also agrees.

Do not claim total rotational-energy/angular-momentum conservation yet; current inertia representation cannot support that honestly for arbitrary rotation.

### CUT-2C — uniform gravity matched control

Source measured under gravity; fresh unsplit and split reconstructions take the same next Box3D step.

Measured:

- real gravity velocity effect `0.1636449357 m/s`;
- momentum error `1.994e-4 kg·m/s`;
- barycenter error `3.212e-8 m`;
- mean velocity error `0`;
- max child position error `1.574e-7 m`.

### CUT-2D1 — settled support

Source really falls `2.8505167 m` onto Box3D ground and settles. Split reconstruction does not artificially launch/sink; 30-step barycenter error ≈ `4.596e-5 m`, max child support gap ≈ `1.026e-4 m`.

### CUT-2D2 — dynamic impact

Reference = split topology throughout free fall. Candidate = same split topology reconstructed from parent immediately before impact. This isolates runtime-history loss from legitimate topology-response differences.

Measured strong impact response `8.0958188 m/s`; reconstructed-vs-reference impact/post-impact errors remain around `10^-7 m` / `10^-7 m/s`, momentum error ≈ `4e-4 kg·m/s`.

Boundary: reconstruction occurs before contact begins; this is not existing-manifold migration.

### CUT-2D3 — active one-lobe contact

Added because preflight explicitly required CUT while one future lobe is already in ground contact.

First tilted-plane fixture correctly **FAILED**: it selected a post-impulse near-ground state; reconstructed ground-vs-no-ground momentum difference was only `1.941e-4 kg·m/s` against a `5 kg·m/s` hard gate. Threshold was not relaxed.

Corrected fixture uses the real finite ground edge `x=-8`, with position derived from compiled child bounds:

- contact child `body:cell:0:0:0` at `-0.0002896 m` bottom;
- airborne child `body:cell:-1:0:0` at `0.3427233 m` and fully outside ground (`maxX=-8.0646117`);
- source already shows ground response: `0.564412 m/s` linear, `0.459984 rad/s` angular difference vs no-ground;
- reconstructed split external ground impulse `61.1181 kg·m/s`;
- supported-child velocity effect `0.0768644 m/s`, upward component `0.0741645 m/s`;
- airborne child also receives `0.0244555 m/s` through legitimate child-child contact at the new interface;
- follow-up remains finite and non-penetrating.

Verdict: **SUPPORTED FOR ACTIVE ONE-LOBE CONTACT FIXTURE**.

## Latest strong automated checkpoint

Exact solver/code head before documentation commits:

`6e227b4dab96d774d278162fa9da0fe14791fe2f`

GitHub Actions run `32070074736`:

- canonical Node/npm PASS;
- strict TypeScript PASS;
- **20/20** foundation/compiler/real-Box3D tests PASS;
- production build PASS;
- real Chromium ANVIL-00 regression PASS;
- artifact upload PASS.

The Chromium test is still ANVIL-00/COLLAPSE only. CUT-specific browser evidence is the immediate missing evidence class.

## Evidence boundary

Current CUT tests reconstruct an isolated disposable Box3D world/runtime A → B around persistent source state. They do not prove:

- in-place replacement inside one persistent populated Box3D world;
- migration of Box3D manifold internals;
- external joint/constraint state transfer;
- arbitrary cut surfaces/topologies;
- full angular-momentum/rotational-energy conservation;
- damage/fracture propagation, debris, toughness, plasticity;
- deformable/compliant matter.

## Immediate next work

Do **not** add joints, constraints or damage yet.

Create a bounded CUT-specific **real product/browser evidence path** in the production build that visibly and automatically exercises the central moving+rotating mass-preserving 1→2 transaction. Keep existing ANVIL-00/COLLAPSE browser test as an independent regression control.

After CUT browser evidence passes, prepare an owner-facing artifact/manual validation gate. Only after owner acceptance should the branch be considered for merge/promotion.

## Strategic direction after CUT

Do not turn CUT into a long destruction roadmap by default.

A likely next falsifier should return to the broader Machine Matter question, e.g. a bounded **RELATION/HINGE-like** experiment where two material structures plus a local mechanical property/interface cause the compiler to derive the necessary solver relation. Do not introduce an abstract FRAME/JURE architecture phase merely because a donor has one; frame semantics should be earned by a real physical relation that needs them.
