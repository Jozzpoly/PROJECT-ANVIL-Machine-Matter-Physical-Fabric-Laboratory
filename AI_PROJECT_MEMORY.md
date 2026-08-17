# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-17.

## Repository identity and current gate

- Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.
- `main` is the latest owner-accepted checkpoint; do not treat it as an agent worktree.
- ANVIL-00 / COLLAPSE and the reusable laboratory foundation are accepted on `main`.
- Active research branch: `experiment/anvil-01-cut`.
- ANVIL-01 solver core and CUT-specific production-browser path are **SUPPORTED FOR THEIR BOUNDED FIXTURES**.
- ANVIL-01 is **NOT YET OWNER-ACCEPTED** and must not be merged/promoted before Evidence Class E owner validation.

Always resolve live Git before changes. Documentation heads after the validated package do not redefine the package checkpoint.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> Persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Long-horizon direction: machines should increasingly emerge from matter, local relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies/colliders/solver constructs are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into universal ontology merely because one fixture passes.

## Accepted baseline — ANVIL-00 / COLLAPSE

ANVIL-00 established, for its bounded sparse-cell fixture:

- persistent cell/material identity without Box3D IDs in `MatterDocument`;
- deterministic rigid-island compilation;
- integrated mass/COM;
- collision representation distinct from authored resolution;
- disposable Box3D lowering;
- independent Box3D mass/COM cross-checks;
- intact `51 cells → 1 body → 8 collision boxes`;
- authoring edit `50 cells → 2 bodies → 9 collision boxes`;
- strict TS, semantic tests, real Box3D, production build, Chromium runtime PASS;
- owner manual validation.

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

Still explicitly non-foundation:

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
- exact `box3d.js@0.0.2`; runtime asserts Box3D `0.1.0`.
- TypeScript `7.0.2`, Vite `8.1.5`, Playwright `1.61.1`.

Upstream `box3d.js` has newer breaking API generations. Do not mix an upgrade into CUT unless the pinned binding becomes a reproduced blocker. Treat an upgrade as a separate controlled change.

## ANVIL-01 / CUT — authoritative experiment files

Read:

- `docs/experiments/ANVIL-01-CUT-PREFLIGHT.md` — historical plan and original boundaries;
- `docs/experiments/ANVIL-01-CUT.md` — actual accumulated evidence, including failures and metrics;
- `docs/experiments/ANVIL-01-CUT-OWNER-GATE.md` — exact owner validation procedure/package.

CUT tests disposable runtime continuity. It is not a destruction-game roadmap.

The primary mass-preserving split keeps all 51 source cells and blocks only:

`cell:-1:0:0 <-> cell:0:0:0`

through experiment-local `blockedFaceConnections`. This is not a promoted generic Bond.

## CUT automated solver evidence — SUPPORTED FOR FIXTURES

Completed progression:

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
settled support
    ↓
dynamic impact
    ↓
one-lobe active contact at transaction
```

Key results:

### CUT-0 — exact binding

Real Box3D proves explicit/read-back pose, linear/angular velocity, mass/COM, mutation and continued stepping on the exact pinned browser binding.

Negative evidence matters: initial quaternion threshold `1e-10` failed at alignment deficit `5.383741452646973e-9` while prior tests stayed green. It was calibrated to observed single-precision behavior (`2e-6` vector, `1e-7` quaternion alignment), not weakened to hide a physics failure.

### CUT-1 — topology

`51 cells / 1 body → 51 cells / 2 bodies`, identical source IDs, zero additions/removals, unchanged compiled mass, exactly one provenance split covering all sources, deterministic/fail-closed connectivity seam.

### CUT-2A — translation

Real one-body world runs 23 steps; actual parent state is measured; disposable world A is retired; the same 51 source cells are rebuilt as two bodies in world B and stepped. Pose/velocity/mass/linear-momentum gates pass.

### CUT-2B — rotation

Experiment-local rigid-field transfer:

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
- immediate/post-step total momentum error ≈ `4.219e-5 kg·m/s`;
- severed-interface rigid velocity field agrees.

Do not claim full angular-momentum or rotational-energy conservation; the current inertia representation cannot support that honestly for arbitrary rotation.

### CUT-2C — gravity

Matched split/unsplit next-step control under uniform gravity:

- real gravity velocity effect `0.1636449357 m/s`;
- momentum error `1.994e-4 kg·m/s`;
- barycenter error `3.212e-8 m`;
- mean velocity error `0`;
- max child position error `1.574e-7 m`.

### CUT-2D1 — settled support

Source really falls `2.8505167 m` onto Box3D ground and settles. Split reconstruction remains supported/stable; 30-step barycenter error ≈ `4.596e-5 m`, max child support gap ≈ `1.026e-4 m`.

### CUT-2D2 — dynamic impact

Reference = split throughout free fall; candidate = same split reconstructed immediately before impact. Strong contact response `8.0958188 m/s`; reconstructed-vs-reference impact/post-impact errors remain around `10^-7 m` / `10^-7 m/s`, momentum error ≈ `4e-4 kg·m/s`.

Boundary: reconstruction occurs before contact begins; no existing-manifold migration claim.

### CUT-2D3 — active one-lobe contact

Added because preflight explicitly required CUT while one future lobe is already contacting ground.

First fixture correctly **FAILED**: it selected a post-impulse near-ground state; reconstructed ground-vs-no-ground momentum difference was only `1.941e-4 kg·m/s` against hard threshold `5 kg·m/s`. Threshold was not relaxed.

Corrected finite-ground-edge fixture (`x=-8`) uses compiled child bounds and produced real active asymmetric contact:

- source step 5;
- contact child bottom `-0.0002896 m`;
- airborne child bottom `0.3427233 m`, fully off ground (`maxX=-8.0646117`);
- source ground effect `0.564412 m/s` linear and `0.459984 rad/s` angular;
- reconstructed external ground impulse `61.1181 kg·m/s`;
- supported-child effect `0.0768644 m/s`, upward `0.0741645 m/s`;
- follow-up finite and non-penetrating.

Strong solver checkpoint before product work:

- head `6e227b4dab96d774d278162fa9da0fe14791fe2f`;
- CI run `32070074736`;
- 20/20 solver/compiler/foundation tests, strict TS, build, old browser regression and artifact PASS.

## CUT production-browser evidence — SUPPORTED FOR FIXTURE

A dedicated Class D path now exists without replacing the accepted COLLAPSE viewer:

- `src/bootstrap.ts`: normal `/` loads unchanged `main.ts`; `?experiment=cut` loads `cut-demo.ts`;
- `src/cut-demo.ts`: real production-browser moving+rotating 51→51 / 1→2 transaction;
- `tests/browser/cut.spec.ts`: validates visible/numeric CUT gates;
- `tests/browser/collapse.spec.ts`: unchanged independent ANVIL-00 control.

The CUT browser path warms up real Box3D, snapshots at a solver-step boundary, recompiles the same 51 source cells into two bodies, destroys/rebuilds the disposable runtime with rigid-field transfer, checks eight gates, takes a real post-transaction Box3D step and continues visibly.

Eight browser gates:

1. persistent source identity;
2. mass-preserving 1→2 split;
3. nontrivial rotating fixture;
4. runtime mass continuity;
5. child pose continuity;
6. rigid velocity field including severed-interface velocity;
7. total linear momentum;
8. post-transaction solver step.

Negative product evidence: first implementation head `112f0166...` failed strict TypeScript due unresolved fixture narrowing. No success was inferred. The demo was simplified and explicit fixture validation added; `strict` was not weakened.

Corrected product head `e9882d5c00474046534f1c3ebf143d82949c240c` passed 20/20 solver tests, production build and **2/2** real Chromium tests (COLLAPSE + CUT), with no CUT page errors.

## Exact owner validation package — READY

Final package/code checkpoint:

```text
head            e1a0b4b0ff6570897603f51ea54cc2d953ae1a2d
Actions run     32071241142
artifact        anvil-browser-laboratory
artifact ID     9301831216
artifact size   376477 bytes
SHA-256         9fa1ba669408e52462334ca1a72aad57a4582ef7e6dba8c7fa122b518a389dac
expires         2026-08-31T21:29:32Z
```

This exact package passed:

- canonical Node/npm;
- strict TypeScript;
- 20/20 foundation/compiler/real-Box3D tests;
- production Vite build;
- packaged Windows owner-launcher self-test from `dist`;
- 2/2 real Chromium tests: COLLAPSE control + CUT product runtime;
- artifact upload.

Owner package includes:

- `START_ANVIL_CUT.cmd` — double-click launcher;
- `serve-anvil.ps1` — dependency-free localhost server using PowerShell/.NET.

The runner uses no npm/Node/Python installation and does not modify a project folder. CI self-tests the script after it is copied to `dist`, including opening a real local listener.

Manual gate: `docs/experiments/ANVIL-01-CUT-OWNER-GATE.md`.

Documentation commits after `e1a0b4b...` are bookkeeping only; do not present them as a different validated package unless a later build is intentionally revalidated.

## Current evidence boundary

Current CUT runtime fixtures rebuild an isolated disposable Box3D world/runtime A → B around persistent source state. They do not prove:

- in-place replacement inside one persistent populated Box3D world;
- migration of Box3D manifold internals;
- external joint/constraint state transfer;
- arbitrary cut surfaces/topologies;
- full angular-momentum/rotational-energy conservation;
- damage/fracture propagation, debris, toughness, plasticity;
- deformable/compliant matter;
- universal material/connection ontology.

## Immediate next action — STOP IMPLEMENTATION

Do **not** add new CUT physics, joints, constraints, damage, or merge/promotion before owner verdict.

Next action is exclusively Evidence Class E:

1. owner downloads artifact from Actions run `32071241142`;
2. extracts it;
3. double-clicks `START_ANVIL_CUT.cmd`;
4. clicks `RUN CUT`, observes transaction and eight PASS gates, repeats via RESET;
5. records `ACCEPT`, `REJECT`, or `INCONCLUSIVE` per `ANVIL-01-CUT-OWNER-GATE.md`.

Only owner `ACCEPT` permits evaluating ANVIL-01 for merge/promotion.

## Strategic direction after a possible CUT acceptance

Do not turn CUT into a long destruction roadmap by default.

A likely next falsifier should return to the broader Machine Matter question: a bounded **RELATION/HINGE-like** experiment where two material structures plus a local mechanical property/interface cause the compiler to derive the needed solver relation. Do not introduce an abstract FRAME/JURE architecture phase merely because a donor has one; frame semantics should be earned by a real physical relation that requires them.
