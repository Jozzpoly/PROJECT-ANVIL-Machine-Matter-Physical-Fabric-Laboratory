# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18.

## Identity and source of truth

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Always resolve live Git before meaningful work. Authority order:

1. live repository/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. canonical documentation;
5. historical chat/branch names only as leads.

Do not treat an agent work branch as `main`, and do not let later documentation/tooling commits redefine which artifact the owner actually tested.

## Current repository state

- `main` accepted checkpoint: ANVIL-00 / COLLAPSE + promoted laboratory foundation.
- accepted `main` head at last grounding: `f03a6f09c090ca0f20bc492de8de72150ca5945b`.
- ANVIL-01 research branch: `experiment/anvil-01-cut`.
- exact CUT owner-accepted package head: `9c4b3372ad60e20ade2d7d9a31dd373a356263d0`.
- Forge hardening branch: `foundation/forge-cut-field-trial`, draft PR `#3` into `experiment/anvil-01-cut`.
- Forge V0.1 validated proposal head before documentation grounding: `fbe08910f9ac5423b89210b80541b38a7f4ce432`.

ANVIL-01 / CUT is now **OWNER ACCEPTED FOR ITS DECLARED BOUNDED CLAIM**. Do not continue saying it awaits Evidence Class E.

Forge V0.1 is **AUTOMATED-VALIDATED / FIELD-TRIAL CANDIDATE**, not owner-accepted as a mature system and not a universal validation framework.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Long-horizon direction: machines should increasingly emerge from matter, local relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies, colliders and solver constructs are interpretations, not authoritative construction identity.

Never promote an experiment-local trick into universal ontology because one fixture passes.

## Accepted ANVIL-00 / COLLAPSE baseline

For its bounded sparse-cell fixture ANVIL-00 established:

- persistent cell/material identity without Box3D IDs in `MatterDocument`;
- deterministic rigid-island compilation;
- integrated mass/COM;
- collision representation distinct from authored resolution;
- disposable Box3D lowering;
- independent Box3D mass/COM cross-checks;
- intact `51 cells → 1 body → 8 collision boxes`;
- authoring edit `50 cells → 2 bodies → 9 collision boxes`;
- strict TS, semantic tests, real Box3D, production build, Chromium runtime PASS;
- owner manual acceptance.

Boundary: COLLAPSE deletes one source cell and rebuilds neutral state. It is not dynamic state migration.

## Accepted laboratory foundation

Read `AGENTS.md`, `docs/EXPERIMENT_PROTOCOL.md`, `docs/FOUNDATION.md` and `docs/DONOR_MAP.md` before broad architecture work.

Promoted neutral capabilities:

- `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic compensated mass/COM and current limited inertia diagonal;
- source-provenance lineage independent of disposable runtime IDs;
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

- Node `24.16.0`;
- npm `>=11.13.0 <12`, tracked lockfile, CI uses `npm ci`;
- exact `box3d.js@0.0.2`, runtime asserts Box3D `0.1.0`;
- TypeScript `7.0.2`;
- Vite `8.1.5`;
- Playwright `1.61.1`.

Do not mix a Box3D binding upgrade into an experiment unless the pinned binding is a reproduced blocker. Upstream API migration is a separate controlled change.

## ANVIL-01 / CUT — accepted bounded result

Authoritative experiment docs:

- `docs/experiments/ANVIL-01-CUT-PREFLIGHT.md` — historical plan/boundaries;
- `docs/experiments/ANVIL-01-CUT.md` — accumulated automated evidence/failures;
- `docs/experiments/ANVIL-01-CUT-OWNER-GATE.md` — exact owner artifact and manual verdict.

CUT tests continuity when persistent source topology is recompiled into a different disposable runtime. It is not a destruction-game roadmap.

Primary mass-preserving split keeps all 51 source cells and blocks only:

`cell:-1:0:0 <-> cell:0:0:0`

through experiment-local `blockedFaceConnections`. This is not a promoted generic Bond.

### Automated solver progression

Validated progression:

```text
binding round-trip
  → mass-preserving topology
  → free translation
  → free rotation / rigid velocity field
  → uniform gravity
  → settled support
  → dynamic impact
  → one-lobe active contact at transaction
```

Key bounded evidence retained from the experiment:

- topology: `51 cells / 1 body → 51 cells / 2 bodies`, no source additions/removals, one provenance split;
- rotating transfer uses experiment-local rigid field:
  - `r_world = R_parent · authored_child_COM_offset`
  - `COM_child = COM_parent + r_world`
  - `R_child = R_parent`
  - `ω_child = ω_parent`
  - `v_child = v_parent + ω_parent × r_world`;
- rotation sensitivity: rotated COM effect `0.4195247840 m`, `ω×r` effect `1.4641147108 m/s`;
- immediate/post-step rotation momentum error ≈ `4.219e-5 kg·m/s`;
- gravity control: barycenter error `3.212e-8 m`, max child position error `1.574e-7 m`;
- settled support: source falls `2.8505167 m`, 30-step barycenter error ≈ `4.596e-5 m`, max support gap ≈ `1.026e-4 m`;
- dynamic impact: contact response `8.0958188 m/s`, reconstructed-vs-reference errors around `10^-7 m` / `10^-7 m/s`;
- one-lobe active contact: first fixture correctly failed sensitivity; corrected finite-ground-edge fixture produced asymmetric active contact and external ground impulse `61.1181 kg·m/s` without relaxing the failed threshold.

Do not claim full angular-momentum or rotational-energy conservation: current inertia representation does not support that honestly for arbitrary rotation.

### Production browser path

Normal `/` remains the accepted COLLAPSE control. `?experiment=cut` runs the dedicated moving+rotating CUT product path.

CUT browser gate checks eight conditions:

1. persistent source identity;
2. mass-preserving 1→2 split;
3. nontrivial rotating fixture;
4. runtime mass continuity;
5. child pose continuity;
6. rigid velocity field including severed-interface velocity;
7. total linear momentum;
8. post-transaction solver step.

### Exact owner acceptance

Canonical owner-tested artifact:

```text
source head      9c4b3372ad60e20ade2d7d9a31dd373a356263d0
Actions run      32073741628
artifact         anvil-browser-laboratory
artifact ID      9302675515
artifact SHA256  34c0365c403a229e5c4e53a304d23d331e0872601850a0d190f318a98340de40
```

Real owner evidence:

- Windows 10 / Chrome 151;
- viewport `1920×911 @ DPR 1`;
- 10 observed CUT repetitions;
- page automated evidence PASS;
- owner verdict **ACCEPT**;
- screenshot + screen recording supplied;
- no obvious large teleport, whole-scene reset, freeze, explosive jump or immediate runaway seen in manual/video inspection.

Owner acceptance is scoped only to this bounded artifact/claim.

## Current CUT evidence boundary

Current fixtures rebuild an isolated disposable Box3D world/runtime A → B around persistent source state. They do not prove:

- in-place replacement inside one persistent populated Box3D world;
- migration of Box3D manifold internals;
- external joint/constraint state transfer;
- arbitrary cut surfaces/topologies;
- full angular-momentum/rotational-energy conservation;
- damage/fracture propagation, debris, toughness or plasticity;
- deformable/compliant matter;
- universal material/connection ontology.

## Forge — owner validation transport, not product ontology

Forge exists to reduce the recurring handoff cost between agent-completed browser work and owner-visible manual validation.

Current intended loop:

```text
agent builds + automated evidence
  → canonical browser artifact
  → double-click owner launcher
  → focused owner observation
  → ACCEPT / REJECT / INCONCLUSIVE
  → paste-ready provenance-complete report
```

Do not build a universal hub yet. Forge is being proven inside ANVIL first. Reuse elsewhere only after several real ANVIL field trials justify which parts are actually stable.

### Forge V0 field result

The `9c4b337...` package proved real end-to-end usability on the owner's Windows machine: artifact extraction, `.cmd`, localhost PowerShell/.NET server, browser launch, CUT/RESET repetitions, verdict and report generation all worked.

The field test exposed real defects:

- owner report lacked exact build provenance;
- required metric lookup had successful fallback text if DOM evidence was missing;
- ACCEPT was not fail-closed against incomplete provenance/evidence;
- browser coverage was primarily happy-path;
- launcher did not validate package identity;
- CUT framing was visually small.

### Forge V0.1 hardening

Hardening lives on `foundation/forge-cut-field-trial`, draft PR `#3` into `experiment/anvil-01-cut`. It intentionally starts from the exact accepted CUT head so physics evidence stays separable from validation-tool changes.

Validated proposal before this documentation commit:

```text
source head      fbe08910f9ac5423b89210b80541b38a7f4ce432
PR checkout      b2ce9bce700c8e431f92fe75edbd11021934f549
Actions run      32076544898
artifact ID      9303653778
artifact SHA256  2773c2aa324613bb682dd2296bf4e1356c4be06a8567b9e376206ce82a75b8e9
```

Evidence:

- strict TypeScript PASS;
- **20/20** solver/compiler/foundation tests PASS;
- production build PASS;
- CI-generated `forge-gate.json` recorded proposal source SHA and actual PR checkout SHA separately;
- launcher manifest validation/self-test PASS;
- **5/5** Chromium tests PASS;
- negative browser evidence deliberately removes a required metric and proves ACCEPT becomes disabled and report becomes INVALID/UNAVAILABLE;
- local/unverified manifest deliberately proves ACCEPT remains disabled;
- artifact upload PASS.

The first hardening attempt at `4270162b...` correctly failed strict TypeScript (`acceptButton` possibly null). Strictness was not weakened; the implementation was fixed and revalidated. Preserve this negative evidence.

Forge V0.1 status: **AUTOMATED-VALIDATED FIELD-TRIAL CANDIDATE**. Do not call it owner-accepted until a future real owner gate exercises it naturally.

### Forge invariants earned so far

- canonical owner evidence must identify exact build provenance;
- missing required evidence fails closed, never substitutes expected successful values;
- local developer builds cannot masquerade as canonical owner-acceptance packages;
- ACCEPT is impossible unless automated evidence is terminal PASS and required provenance/gates exist;
- REJECT/INCONCLUSIVE must remain possible when evidence itself is broken;
- owner report should capture machine context automatically rather than require manual SHA/log transcription;
- launcher stays dependency-free for the owner when feasible;
- owner-facing visualization may improve readability, but must not use camera behavior that hides discontinuities being judged;
- every next owner gate should require no more manual engineering work from the owner than the previous one.

These are ANVIL/Forge working invariants, not yet a cross-project universal contract.

## JURE donor lesson for Forge

JURE's history is evidence for process, not imported ontology:

- small vertical slices + targeted tests + real owner gates produced useful checkpoints;
- exact SOURCE revision/hash and fail-closed provenance mattered;
- owner acceptance was explicitly scoped to inspected behavior;
- BIND-00's real owner test falsified the singleton binding model, and JURE correctly did not generalize it mechanically into a framework;
- JURE keeps authored truth, source provenance, representation binding, preview/evaluated/runtime state as distinct meanings.

Apply the same discipline here: let repeated real Forge gates reveal the durable abstraction. Do not invent a plugin system, validation hub, cross-project DSL or backend before a concrete consumer requires it.

## Immediate next direction

1. Finish grounding/CI for Forge V0.1 PR #3.
2. If still green, integrate that hardening into the active CUT branch without rewriting the exact `9c4b337...` owner evidence.
3. Promote/merge accepted ANVIL-01 to `main` with evidence boundaries intact.
4. Return to Machine Matter research rather than expanding CUT into a destruction roadmap.
5. A likely next falsifier is a bounded **RELATION/HINGE-like** experiment: two material structures plus a local physical property/interface cause the compiler to derive the required solver relation. Frame semantics should be earned by the real relation that needs them, not imported abstractly from JURE.
6. Use Forge V0.1 naturally for that next owner gate. That will be its first meaningful real field trial.
