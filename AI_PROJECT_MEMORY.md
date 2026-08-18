# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18 after ANVIL-03 owner acceptance.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. canonical documentation;
5. conversation/branch names only as leads.

Always resolve live Git before meaningful work. Never let later docs or tooling redefine which exact artifact the owner actually tested.

## Current live state at this grounding

Accepted `main` before ANVIL-03 promotion:

`36d363d5c828fa8f1bf96f183bd7393573dec216`

It contains:

- ANVIL-00 / COLLAPSE — owner accepted and promoted;
- laboratory foundation — promoted;
- ANVIL-01 / CUT — owner accepted and promoted;
- ANVIL-02 / BEARING — owner accepted and promoted;
- Forge V0.2.1 human-owner communication layer — merged and automated-validated.

Active research branch:

`experiment/anvil-03-rebind`

PR:

`#7 — ANVIL-03: rebind a persistent bearing across moving CUT`

**ANVIL-03 / REBIND is OWNER ACCEPTED for its declared bounded claim and awaits docs-grounded promotion.**

Immutable owner-tested identity:

```text
source head      e03e227df073ec45946f9e83a9716ca6d7fe8af3
PR checkout      72ea1e01c3d5b5fe268933449c5d4a48a1aad3f3
Actions run      32085543984 attempt 1
artifact ID      9306595449
artifact SHA256  98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
Forge revision   v0.2.1-human-owner-copy
owner            ACCEPT after 14 observed REBIND runs
owner env        Windows 10 / Chrome 151 / 1920x911 DPR1
```

External GitHub provenance handshake after handoff passed. A user-supplied screenshot also visibly supported the intended left-connected/right-separated terminal state.

If this memory is read after promotion, resolve live `main`; the exact owner-tested source/artifact above remains the acceptance identity even though a later documentation commit and merge may become the repository head.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**.

Working premise:

> persistent authored matter and physical intent can compile into disposable runtime representations whose resolution and runtime identity differ from authored truth.

Machines should increasingly emerge from matter, local physical relations, interfaces and function rather than from a catalog of ready-made parts. Runtime bodies, colliders, joints and solver objects are interpretations, not authoritative construction identity.

Do not promote experiment-local tricks into universal ontology because one fixture passes.

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

## Accepted experiment stack

### ANVIL-00 / COLLAPSE

Bounded proof that persistent authored cells/material can deterministically compile to a coarser disposable rigid-body/collider representation. One source edit changes compiled topology. Not dynamic state migration.

### ANVIL-01 / CUT

Owner accepted mass-preserving topology continuity:

`51 source cells / 1 body -> same 51 source cells / 2 bodies`.

The accepted rigid-field transfer is:

```text
child COM = parent COM + R_parent * authored COM offset
v_child   = v_parent + omega_parent x r_world
R_child   = R_parent
omega     = omega_parent
```

CUT does not prove contact-manifold migration, arbitrary fracture, in-place world mutation or relation migration.

### ANVIL-02 / BEARING

Owner accepted one experiment-local authored bearing interface:

```text
stable source bearing ID
endpoint A = persistent cell ID + face
endpoint B = persistent cell ID + opposite face
free axis  = x | y | z
```

The same seven source cells compile from one rigid island to two bodies plus one Box3D revolute relation. The relation keeps a shared pivot while allowing free relative rotation, with a strong no-relation A/B control. An arbitrary common 3D rigid transform also passed without earning a generic authored-frame ontology.

### ANVIL-03 / REBIND

Canonical docs:

- `docs/experiments/ANVIL-03-REBIND-PREFLIGHT.md`;
- `docs/experiments/ANVIL-03-REBIND-EVIDENCE.md`;
- `docs/experiments/ANVIL-03-REBIND-OWNER-GATE.md`.

REBIND composes the two previous capabilities instead of adding a new Box3D feature.

Declared transaction:

```text
same 7 source cells
2 runtime bodies + 1 source bearing
          ↓ nearby CUT while moving
3 runtime bodies + same source bearing
bearing endpoint runtime body: body:a:0 -> body:a:2
```

The new endpoint body is resolved from persistent source-cell provenance, not from the old disposable body ID.

C0 moving fixture and C1 arbitrary common-3D-transform fixture both passed the same frozen tolerances. Final owner candidate passed **31/31** real-Box3D/Node tests and **17/17** Chromium tests. Owner then repeated the real package 14 times and accepted the intended visual result.

Strongest correct claim:

> persistent source provenance + persistent authored bearing endpoints are sufficient to reconstruct the correct relation onto a changed disposable body decomposition for the declared moving fixtures, while maintaining observable pose/velocity/pivot continuity and free relative rotation.

Architectural implication earned by evidence:

- source matter and authored physical intent may outlive disposable body and joint identities;
- runtime body IDs are not suitable construction identity;
- a relation can be **re-derived** after topology compilation from persistent source semantics rather than migrated as an authoritative solver object;
- CUT and BEARING therefore compose at the semantic/compiler boundary for this bounded case.

Important boundary: REBIND creates a **fresh Box3D world and fresh revolute joint**. It does not migrate internal joint impulse/warm-start caches. Call this semantic relation continuity, not joint-state migration.

## Forge — current truth after third field trial

Forge exists only to reduce owner-validation friction:

`agent evidence -> packaged browser build -> double-click launcher -> simple visual owner decision -> generated technical report -> agent verifies provenance live`.

Do **not** build a universal hub yet. Forge must keep earning its shape from actual ANVIL owner gates.

BEARING field trial exposed a communication failure: technical terms such as schema/provenance/canonical/fail-closed were unreadable in the primary owner flow.

Forge V0.2.1 changed only the human-facing layer while preserving strict internal verdict/provenance semantics.

REBIND is its first real field trial and **passed for this gate**:

- correct Windows launcher/path;
- plain Polish visual instruction;
- ordinary decisions `DZIAŁA / NIE DZIAŁA / NIE WIEM`;
- technical details not required for the owner decision;
- exact technical report still sufficient for external provenance verification;
- owner correctly restated the intended A/B behavior and selected `DZIAŁA` after 14 runs.

Do not infer universal usability from one successful V0.2.1 consumer. Keep future improvements evidence-driven and ANVIL-specific.

## Preserved boundaries after REBIND

Do not claim that ANVIL currently has:

- generic Relation/Joint/Constraint ontology;
- universal authored frames;
- in-place mutation of a populated persistent Box3D world;
- Box3D warm-start/joint-cache migration;
- contact-manifold migration;
- arbitrary load/contact continuity through topology transactions;
- arbitrary cuts/fracture/merge topology;
- multiple-relation or closed-loop mechanism continuity;
- motors/limits/power/control state migration;
- deformable/compliant matter;
- damage/plasticity/debris systems.

## Immediate next actions

1. Treat `e03e227d...` + artifact `9306595449` as the immutable owner-tested ANVIL-03 identity.
2. Run one final docs-grounded CI on the owner-acceptance head; do not change REBIND physics or thresholds.
3. Promote PR #7 only if that final CI is green and the PR head/base have not moved unexpectedly.
4. After merge, compare the tested synthetic-merge tree with the actual `main` merge tree.
5. Only then select ANVIL-04.

## Next research decision after promotion

Do not automatically build more fracture or a generic mechanism framework.

The two highest-value next falsifiers are:

1. **loaded relation continuity** — repeat relation reconstruction while the bearing carries a meaningful external/constraint load, attacking the current absence of solver-cache/contact/load continuity evidence;
2. **local actuation/function** — add the smallest experiment-local authored torque/actuation intent to an already-earned bearing, beginning the `FUNCTION` part of Machine Matter without creating a generic power/control network.

Prefer the first if we need to harden the continuity foundation before introducing active machine semantics. Prefer the second if the current semantic-rebuild model remains stable enough and the goal is to advance from passive structure toward an actual machine. Do not combine both in one first falsifier.
