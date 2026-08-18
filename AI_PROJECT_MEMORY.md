# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. canonical documentation;
5. historical conversation/branch names only as leads.

Always resolve live Git before meaningful work. Never let later tooling/docs redefine which exact artifact the owner actually tested.

## Current state

Accepted `main` at the start of ANVIL-02:

`6e936dd5934fffb3c7de3482a7aca9dc985102e5`

It contains:

- ANVIL-00 / COLLAPSE — owner accepted;
- promoted laboratory foundation;
- ANVIL-01 / CUT — owner accepted and promoted;
- Forge V0.1 baseline.

Active branch at this grounding:

`experiment/anvil-02-bearing`

PR:

`#5 — ANVIL-02: bearing from a local authored interface`

**ANVIL-02 / BEARING is OWNER ACCEPTED for its declared bounded claim.**

The exact owner-tested source remains immutable evidence:

```text
source head      3869cbb3ece204acd7f5c05cf7da43e53e219c0c
PR checkout      a107661d2f8854cf45a51047f93f06b2d5b8c0a4
Actions run      32080991801 attempt 1
artifact ID      9305115231
artifact SHA256  336987e773b643c1b25f472cf1f585c2724f98760412359015f7f464f381bdac
owner            ACCEPT after 17 observed BEARING runs
owner env        Windows 10 / Chrome 151 / 1920x911 DPR1
```

Live GitHub cross-check after handoff confirmed source, synthetic checkout, successful run, artifact ID and digest. An owner screen recording was also reviewed and visually supported the reported A/B behavior.

PR #5 may be promoted after a final docs-only promotion validation. If this memory is read after that merge, resolve live `main` and treat the actual merge commit as current truth; the exact owner-tested source above must still remain the acceptance artifact identity.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> persistent authored matter and physical intent may compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Machines should increasingly emerge from matter, local physical relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies, colliders, joints and solver objects are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into universal ontology because one fixture passes.

## Toolchain truth

- Node `24.16.0`;
- npm `>=11.13.0 <12`, lockfile, CI uses `npm ci`;
- exact `box3d.js@0.0.2`, runtime Box3D `0.1.0`;
- TypeScript `7.0.2`;
- Vite `8.1.5`;
- Playwright `1.61.1`.

Do not mix a Box3D binding upgrade into an experiment unless the pinned binding is a reproduced blocker.

## Accepted laboratory foundation

Read before broad architecture work:

- `AGENTS.md`;
- `docs/EXPERIMENT_PROTOCOL.md`;
- `docs/FOUNDATION.md`;
- `docs/DONOR_MAP.md`.

Promoted neutral capabilities include:

- `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic compensated mass/COM and current limited inertia diagonal;
- source-provenance lineage independent of disposable runtime IDs;
- solver-neutral runtime observation/motion boundary;
- pose/velocity, linear-momentum and translational-energy measurements;
- fail-closed evidence primitives.

Still not foundation:

- generic Bond/Joint/Constraint/Relation ontology;
- universal authored frame entities;
- custom contact laws;
- damage/fracture propagation;
- deformable/compliant matter;
- mechanism inference;
- power/control networks;
- vehicle-specific concepts;
- generic scene/entity framework.

## ANVIL-00 / COLLAPSE — accepted baseline

For its bounded sparse-cell fixture ANVIL-00 established:

- persistent cell/material identity without Box3D IDs in authored truth;
- deterministic rigid-island compilation;
- integrated mass/COM;
- collision representation distinct from authored resolution;
- disposable Box3D lowering;
- intact `51 cells -> 1 body -> 8 collision boxes`;
- one-cell authoring edit `50 cells -> 2 bodies -> 9 collision boxes`;
- strict TS, semantic tests, real Box3D, production browser and owner manual acceptance.

Boundary: COLLAPSE deletes a source cell and rebuilds neutral runtime state. It is not dynamic state migration.

## ANVIL-01 / CUT — accepted continuity result

Exact owner-tested artifact:

```text
source head      9c4b3372ad60e20ade2d7d9a31dd373a356263d0
Actions run      32073741628
artifact ID      9302675515
artifact SHA256  34c0365c403a229e5c4e53a304d23d331e0872601850a0d190f318a98340de40
owner            ACCEPT after 10 observed runs
owner env        Windows 10 / Chrome 151 / 1920x911 DPR1
```

CUT demonstrated a mass-preserving topology change with persistent source identity and bounded rigid motion-state continuity:

`51 source cells / 1 body -> same 51 source cells / 2 bodies`.

Important boundary: CUT does not prove in-place replacement in one populated persistent Box3D world, contact-manifold migration, external relation/joint migration, arbitrary fracture, full angular-momentum conservation, deformables or a generic connection ontology.

CUT is a continuity experiment, not a destruction roadmap.

## ANVIL-02 / BEARING — owner accepted

Canonical docs:

- `docs/experiments/ANVIL-02-BEARING-PREFLIGHT.md`;
- `docs/experiments/ANVIL-02-BEARING-EVIDENCE.md`;
- `docs/experiments/ANVIL-02-BEARING-OWNER-GATE.md`.

### Research question

Can one local authored rotational interface between two otherwise rigidly face-connected source regions cause ANVIL to compile the same persistent matter into two rigid islands plus one solver-neutral rotational relation, while Box3D keeps a shared pivot coincident and allows relative rotation?

### Why it matters

Before ANVIL-02, `MatterDocument` contained matter/material/grid information but no local mechanical signal. Hand-creating a Box3D revolute joint would test only Box3D.

ANVIL-02 introduced the smallest experiment-local authored signal needed to test the Machine Matter idea:

```text
stable bearing ID
endpoint A = persistent cell ID + face
endpoint B = persistent cell ID + opposite face
free axis  = x | y | z
```

It deliberately contains no Box3D IDs and is not promoted as a universal relation schema.

### Fixture and result

Seven equal-material `0.5 m` source cells form asymmetric 3-cell and 4-cell lobes with one rigid seam:

`a:2 x+ <-> b:0 x-`

Without the bearing mark: one rigid island.

With the mark: same seven source cells -> two rigid bodies + one derived bearing relation.

The compiler fails closed for invalid/non-adjacent/non-opposite endpoints, axis normal to the shared face, and an alternate rigid bypass around the seam.

Base real-solver evidence after 120 fixed 60 Hz steps:

```text
bearing anchor gap       0.00001546371140869226 m
no-relation control gap  1.3662249602059333 m
relative angle           2.010232448577881 rad
```

Predeclared gates were respectively `<= 0.0025 m`, `>= 0.25 m`, `>= 0.35 rad`.

The fixture therefore has large discrimination margin. No physical threshold was loosened.

### Common-transform falsifier

A harder gate was declared before execution: apply one arbitrary common 3D rigid transform to the complete compiled device without adding a general authored frame system.

Observed:

```text
initial transformed mismatch  1.7889085181965112e-7 m
bearing gap                   4.252712514504838e-6 m
no-relation control           1.2319540243918932 m
relative angle                1.0926251411437988 rad
```

Result: current body-local anchor/axis semantics are sufficient for this common-rigid-transform fixture. **Do not add a JURE-like frame ontology now.** The experiment has not earned that complexity.

### Browser + owner evidence

Final automated owner-tested source passed:

- strict TypeScript;
- **28/28** Node / exact real-Box3D tests;
- production build;
- Forge V0.2 launcher self-test;
- unsafe entry-path rejection checks;
- **12/12** real Chromium tests;
- artifact upload.

Owner then ran the package 17 times and reported the intended visual contrast:

- left: the structures remain connected at the green bearing marker and rotate relative to one another;
- right: the no-relation control separates and flies apart, with the red distance line making the separation visible.

Owner verdict: **ACCEPT**.

### Explicit non-claims

ANVIL-02 does not prove:

- arbitrary authored non-grid orientation semantics;
- multiple interacting bearings or closed kinematic loops;
- motors, limits, compliance, friction torque or breakage;
- power/control networks;
- relation continuity across CUT/recompile transactions;
- a generic Relation/Joint/Constraint ontology;
- universal authored frame entities;
- generality of `BearingMark` to other physical interfaces.

## Forge — current truth after second field trial

Forge exists to reduce owner-validation friction:

`agent evidence -> packaged browser build -> double-click launcher -> simple visual owner decision -> generated technical report -> agent verifies provenance live`.

Do **not** build a universal hub yet. Forge must keep earning its shape from actual ANVIL owner gates.

### Forge V0.2 functional result

BEARING was the second real consumer. It exposed and justified one cross-gate generalization: active gate + entry path could no longer be hardcoded to CUT.

V0.2 therefore added:

- `forge-owner-gate.config.json` for active gate/entry/revision/artifact;
- manifest schema `anvil-forge-owner-gate/v2` with `entryPath`;
- generic `START_ANVIL.cmd`;
- safe same-origin entry-path validation;
- BEARING-specific fail-closed owner report;
- negative browser tests for wrong gate, local/unverified artifact and evidence mutation after ACCEPT.

The real Windows handoff, 17 repetitions, verdict and generated report all worked. External GitHub provenance verification also succeeded.

### Forge V0.2 owner-UX defect

The owner found the opening Forge explanation difficult to understand and described it as technical jargon. This is a real product defect in Forge's communication layer, despite the functional pass.

The owner is a visual creator/non-programmer. Primary Forge instructions must therefore be written in ordinary Polish and explain only what must be observed.

**Earned rule for the next Forge revision:**

- primary UI: plain human language;
- say exactly what should visibly happen;
- explain visible failure signs;
- use ordinary action labels;
- hide `schema`, SHA, run ID, artifact, provenance, source-interface notation and similar implementation details under collapsed `Szczegóły techniczne`;
- generated report may remain fully technical because the agent, not the owner, consumes it.

Do not turn this into a generic UI framework. Apply the rule minimally to the next Forge owner surface and let another field trial validate it.

## Preserved negative evidence from ANVIL-02

Do not erase:

1. first browser slice failed strict TypeScript closure narrowing; fixed without weakening strictness;
2. browser initially showed default `300x150` canvases because experiment CSS did not load; fixed the CSS route rather than relaxing QA;
3. owner panel initially stretched the scene to ~1397 px at a 900 px viewport; fixed independent viewport/panel bounds and added upper layout gates;
4. first BEARING Forge V0.2 owner layer became a global TS script and failed strict checking; explicit module scope fixed it;
5. no physical threshold was relaxed to make failures green.

## Immediate next actions

1. Revalidate the docs-only owner-acceptance head of PR #5.
2. Promote ANVIL-02 to `main` only if that exact promotion gate is green and the PR head has not moved unexpectedly.
3. Preserve `3869cbb3...` + artifact `9305115231` as the immutable owner-tested identity even though promotion documentation comes later.
4. After promotion, handle the Forge communication defect separately; do not rewrite the accepted BEARING artifact and pretend it was owner-tested.
5. Before selecting ANVIL-03, critically compare at least these next falsifiers:
   - composition of multiple local bearing interfaces;
   - a local actuation/torque intent lowering onto an already-earned bearing;
   - continuity of a derived relation across a CUT/recompile transaction.
6. Prefer the smallest falsifier that advances Machine Matter rather than merely exercising another Box3D API. Do not build generic relation graphs, power networks or frame systems in advance.
