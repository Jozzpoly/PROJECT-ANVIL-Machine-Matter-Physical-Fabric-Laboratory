# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18.

## Identity and source of truth

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live repository/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. canonical documentation;
5. historical conversation/branch names only as leads.

Resolve live Git before meaningful work. Do not let later documentation/tooling commits redefine which artifact the owner actually tested.

## Current state

- `main` accepted checkpoint at last grounding: `f03a6f09c090ca0f20bc492de8de72150ca5945b` — ANVIL-00 / COLLAPSE + laboratory foundation.
- active research branch: `experiment/anvil-01-cut`.
- integrated CUT/Forge branch head before this grounding commit: `95dabaf2d28439d82550566d83cfb1c221c09130`.
- exact owner-accepted CUT package remains `9c4b3372ad60e20ade2d7d9a31dd373a356263d0`.
- Forge V0.1 hardening PR `#3` is merged into the CUT branch.

**ANVIL-01 / CUT is OWNER ACCEPTED for its declared bounded claim.**

**Forge V0.1 is an AUTOMATED-VALIDATED FIELD-TRIAL BASELINE.** It is not yet a universal framework and does not need a dedicated re-test of accepted CUT merely for tooling polish.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Machines should increasingly emerge from matter, local relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies/colliders/solver constructs are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into universal ontology because one fixture passes.

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

Still non-foundation:

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
- TypeScript `7.0.2`, Vite `8.1.5`, Playwright `1.61.1`.

Do not mix a binding upgrade into an experiment unless the pinned binding is a reproduced blocker.

## ANVIL-01 / CUT — accepted bounded result

Authoritative docs:

- `docs/experiments/ANVIL-01-CUT-PREFLIGHT.md`;
- `docs/experiments/ANVIL-01-CUT.md`;
- `docs/experiments/ANVIL-01-CUT-OWNER-GATE.md`.

Primary mass-preserving split keeps all 51 source cells and blocks only:

`cell:-1:0:0 <-> cell:0:0:0`

through experiment-local `blockedFaceConnections`. This is not a promoted generic Bond.

Automated progression already validated:

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

Key evidence retained:

- topology `51 cells / 1 body → 51 cells / 2 bodies`, no source additions/removals, one provenance split;
- experiment-local transfer `v_child = v_parent + ω_parent × r_world`, with child orientation/angular velocity inherited from parent;
- rotated COM sensitivity `0.4195247840 m`, `ω×r` effect `1.4641147108 m/s`;
- rotation momentum error ≈ `4.219e-5 kg·m/s`;
- gravity barycenter error `3.212e-8 m`;
- settled support 30-step barycenter error ≈ `4.596e-5 m`;
- dynamic impact reconstructed-vs-reference errors around `10^-7 m` / `10^-7 m/s`;
- one-lobe active contact corrected fixture produced external ground impulse `61.1181 kg·m/s` after an earlier fixture correctly failed sensitivity.

Do not claim full angular-momentum/rotational-energy conservation for arbitrary rotation.

### Exact owner acceptance

```text
source head      9c4b3372ad60e20ade2d7d9a31dd373a356263d0
Actions run      32073741628
artifact ID      9302675515
artifact SHA256  34c0365c403a229e5c4e53a304d23d331e0872601850a0d190f318a98340de40
owner             ACCEPT after 10 observed CUT runs
owner environment Windows 10 / Chrome 151 / 1920×911 DPR1
```

Screenshot and screen recording were supplied. No obvious large teleport, whole-scene reset, freeze, explosive jump or immediate runaway was seen in manual/video inspection.

### Evidence boundary

Current CUT reconstructs isolated disposable world/runtime A → B around persistent source state. It does not prove:

- in-place replacement inside one persistent populated Box3D world;
- Box3D manifold internal migration;
- external joint/constraint state transfer;
- arbitrary cut topology/fracture geometry;
- full angular momentum/rotational energy conservation;
- damage, debris, toughness, plasticity or deformables;
- universal material/connection ontology.

CUT is a continuity experiment, not a destruction roadmap.

## Forge — owner validation transport

Forge reduces the handoff cost between agent-completed browser work and owner-visible manual validation:

```text
agent build + automated evidence
  → canonical browser artifact
  → double-click launcher
  → focused owner observation
  → ACCEPT / REJECT / INCONCLUSIVE
  → paste-ready report
  → agent cross-checks reported identity live on GitHub
```

Do not build a universal hub yet. Forge must earn its durable shape through repeated real ANVIL gates first.

### Forge V0 field evidence

The `9c4b337...` owner package proved the real Windows path: ZIP extraction, `.cmd`, localhost PowerShell/.NET server, browser launch, repeated CUT/RESET, verdict and report generation.

That field test exposed:

- missing exact build provenance in report;
- successful fallback strings for missing required metrics;
- insufficient ACCEPT gating;
- mostly happy-path browser coverage;
- no launcher manifest validation;
- visually small fixed CUT framing.

### Forge V0.1 integrated hardening

Merged via PR `#3` into `experiment/anvil-01-cut`.

Final pre-merge validation:

```text
proposal head     0f8533a7641608960dc504642644664cf5f9f8ec
PR checkout       04a59b56f9bbc42e8c8b87f819ed342662e1d3bf
validated tree    2486a339388f69b26bd3c32d7edb9167c29f86ac
Actions run       32076959012
artifact ID       9303786754
artifact SHA256   27150515907128f6f5e60eb21c52fc04fd2d62211797defe4a9c10d965f41b51
```

Actual merge:

```text
merge commit      95dabaf2d28439d82550566d83cfb1c221c09130
integrated tree   2486a339388f69b26bd3c32d7edb9167c29f86ac
```

The tested PR checkout and actual integrated merge have the same tree SHA. Final CI passed strict TS, **20/20** solver/compiler/foundation tests, build, launcher self-test, **7/7** Chromium tests and artifact upload.

Forge V0.1 now:

- generates `forge-gate.json` with proposal source SHA, actual checkout SHA, ref, CI event/run, artifact name and Forge revision;
- uses no successful fallback values for required evidence;
- checks exact expected core metric values;
- checks exact required eight-gate set;
- blocks ACCEPT on missing/duplicate/mismatched evidence;
- revokes already-selected ACCEPT if evidence later becomes inconsistent;
- blocks canonical ACCEPT for local/unverified builds;
- keeps REJECT/INCONCLUSIVE available when evidence itself is broken;
- keeps owner launcher dependency-free (PowerShell/.NET only);
- uses fixed larger framing without camera-follow that could hide a discontinuity.

First hardening head `4270162b...` failed strict TS (`acceptButton` possibly null). Strictness was not relaxed. Preserve this negative evidence.

### Provenance handshake

Embedded `forge-gate.json` is **identity metadata, not a cryptographic trust root**. UI therefore says `BUILD IDENTIFIED`, not `BUILD VERIFIED`.

After owner copies a report, the agent must cross-check reported source/run/artifact against live GitHub and obtain GitHub's artifact digest before treating provenance as externally confirmed. The owner should not be asked to inspect Actions/SHA manually.

When tools permit, the agent should hand the owner the exact validation artifact directly rather than instructing them to navigate Actions.

### Forge scope discipline

Do not add plugin architecture, validation hub, backend, cross-project DSL, screenshot database or automatic transport merely because they might be useful later. Add complexity only when a real owner gate exposes the need.

The next genuine Forge field trial should be the next ANVIL owner gate.

## JURE donor lesson

Use JURE as process evidence, not imported ontology:

- small vertical slices + targeted tests + owner gates produced useful checkpoints;
- exact SOURCE revision/hash and fail-closed provenance mattered;
- owner acceptance stayed scoped to inspected behavior;
- BIND-00 owner testing falsified singleton binding, and JURE correctly did not generalize it mechanically into a framework;
- SOURCE/provenance/authored/binding/preview/evaluated/runtime meanings remain distinct.

Apply the same discipline to Forge: repeated real consumers reveal durable abstractions.

## Immediate next direction

1. Promote accepted ANVIL-01 to `main` through a final evidence-oriented PR and exact PR CI.
2. Preserve `9c4b337...` as the owner acceptance artifact even though Forge V0.1 is now integrated later in branch history.
3. After promotion, return to Machine Matter rather than extending CUT into a destruction roadmap.
4. Likely next falsifier: bounded **RELATION/HINGE-like** experiment where two material structures plus a local physical property/interface cause the compiler to derive the required solver relation.
5. Frame semantics should be earned by the physical relation that needs them, not imported abstractly from JURE.
6. Use Forge V0.1 naturally for that next owner gate; its report provenance must be externally cross-checked by the agent after handoff.
