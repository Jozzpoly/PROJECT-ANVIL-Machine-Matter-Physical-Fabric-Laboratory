# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18 after ANVIL-04 / LOAD-REBIND promotion.

## Identity and authority

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:

1. live Git/code and exact artifacts;
2. executed evidence;
3. direct owner feedback;
4. current canonical documentation;
5. historical conversations/branches only as leads.

Before significant work resolve live `main`, branch/PR and exact HEAD. After an interrupted connection, verify live state before writing anything.

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**: persistent authored matter and local physical intent compile into disposable runtime solver representations. Runtime bodies, colliders and joints are interpretations, not authoritative construction identity.

Do not promote an experiment-local trick into generic ontology because one fixture passes.

## Accepted stack

- **ANVIL-00 / COLLAPSE** — authored cells/material can deterministically compile into a coarser rigid runtime representation.
- **Foundation** — solver-neutral spatial/motion/provenance/evidence primitives.
- **ANVIL-01 / CUT** — bounded mass-preserving runtime topology replacement with rigid-field motion transfer.
- **ANVIL-02 / BEARING** — one local authored rotational interface can derive two rigid islands plus a revolute runtime relation.
- **ANVIL-03 / REBIND** — the persistent bearing can be re-derived onto the correct changed runtime body after a nearby CUT while moving.
- **ANVIL-04 / LOAD-REBIND** — that cold relation reconstruction remains stable for the declared multi-kN loaded fixtures, including moving C1, without migrating Box3D joint cache.
- **Forge V0.2.1** — owner-validation transport; human-facing language simplified and field-tested on REBIND.
- **Lean Evidence Loop** — two-speed Draft/core and Ready/candidate workflow is promoted and mandatory by default.

## ANVIL-01 / CUT — strongest boundary

Accepted rigid-field transfer for bounded split fixtures:

```text
child COM = parent COM + R_parent * authored COM offset
v_child   = v_parent + omega_parent x r_world
R_child   = R_parent
omega     = omega_parent
```

CUT does not prove arbitrary fracture, general contact-manifold migration, arbitrary topology or in-place world mutation.

## ANVIL-02 / BEARING — strongest boundary

A persistent experiment-local bearing mark is expressed through source-cell face endpoints and a free axis, not Box3D IDs. It splits rigid connectivity and derives a revolute runtime relation that keeps a shared pivot while permitting relative rotation.

A no-relation control and arbitrary common 3D transform passed. Do not infer generic Relation/Joint ontology or universal authored frame entities.

## ANVIL-03 / REBIND — strongest boundary

Declared transaction:

```text
same 7 source cells
2 runtime bodies + 1 source bearing
          ↓ nearby CUT while moving
3 runtime bodies + same source bearing
bearing endpoint runtime body: body:a:0 -> body:a:2
```

Persistent source provenance plus persistent bearing endpoints are sufficient to reconstruct the correct relation on the changed runtime body for the bounded moving fixtures while preserving observable continuity and free relative rotation.

This is **semantic relation continuity**, not Box3D joint-state migration. Fresh bodies/world/joint are created; old joint warm-start/cache is discarded.

Immutable owner-tested REBIND identity:

```text
source head      e03e227df073ec45946f9e83a9716ca6d7fe8af3
PR checkout      72ea1e01c3d5b5fe268933449c5d4a48a1aad3f3
Actions run      32085543984
artifact ID      9306595449
artifact SHA256  98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
owner verdict    ACCEPT
```

Do not replace this owner identity with later merge/docs commits.

## ANVIL-04 / LOAD-REBIND — strongest boundary

Research question: can a fresh post-CUT bearing resume a strong sustained constraint load without a gross first-step shock even though the old Box3D joint/cache is discarded?

Fixture:

```text
same 7 source cells
2 -> 3 dynamic runtime bodies
same source bearing; endpoint body changes body:a:0 -> body:a:2
gravity 0; contacts disabled
laboratory force pair: -2500 N / +2500 N at bearing anchors
```

The force pair is test instrumentation only, **not authored FUNCTION/actuation**.

C0 equilibrium and C1 moving+loaded both passed frozen gates. C1 key measurements:

```text
old joint force                 2551.6168 N
pre-CUT relative rotation       1.21146 rad/s
position jump                   7.24e-9 m
velocity jump                   1.61e-8 m/s
first-step gap                  0.0002455 m
fresh joint force               2527.2393 N
final gap                       0.0003379 m
final relative rotation         0.27029 rad/s
no-relation control gap         16.3315 m
```

Production Chromium independently reproduced C1 raw metrics.

Promoted identity:

```text
source head       88844f874ba64932418331c3c0a996a33490d85a
base main         eb5928994a2d04d039f8613b63275f349ba3a2a3
synthetic merge   ad8ea844eeb165af9fa95ac3a27d8da5b6168b7d
actual merge      2dfac4c79e7c12be2795e87bb5d51c12fc29e231
tested/merged tree e5a311462772c29c26074d9d92ec9041ef5db94e
Ready run         32135764502
Node              34/34 PASS
Chromium          18/18 PASS
staging artifact  9323900170 / e219ddf67620ff3acb191bfc159fbe633c50d3e44d1c3f999bf33a7c34ad06a2
final artifact    9323943419 / dd4e3c36554a41606825b66f9e7977945e90e65f8fce1fb5d8d23753226711ba
```

Synthetic and actual merge have identical Git tree.

Correct interpretation:

> For these bounded 2.5 kN force-pair fixtures, semantic relation reconstruction plus rigid-motion transfer is sufficient for a fresh revolute joint to immediately resume the declared mechanical responsibility without migrating hidden warm-start/joint-cache state.

Do **not** generalize this to arbitrary loads, impact/fatigue, contacts, closed loops or universal absence of solver-state migration needs.

No owner gate was used for ANVIL-04 by design: the new evidence was quantitative and real Chromium could directly verify it. A manual REBIND-like A/B repetition would have added little information.

Detailed numbers/history: `docs/experiments/ANVIL-04-LOAD-REBIND-EVIDENCE.md`.

## Current foundation boundary

Promoted neutral capabilities include:

- `Vec3`, `Quat`, `RigidPose`, `RigidMotion`;
- deterministic current mass/COM/inertia-diagonal measurements;
- source-provenance lineage independent of runtime IDs;
- solver-neutral runtime observation/motion boundary;
- continuity measurements for pose/velocity/linear momentum/translational energy;
- fail-closed evidence primitives;
- lean evidence workflow.

Still **not foundation**:

- generic Bond/Joint/Constraint/Relation ontology;
- universal authored frames;
- arbitrary fracture/damage/plasticity/debris;
- deformable/compliant matter;
- custom contact laws;
- mechanism inference;
- power/control networks;
- vehicle-specific concepts;
- generic scene/entity framework.

## Lean Evidence Loop — mandatory default

Read `docs/EXPERIMENT_PROTOCOL.md` and `AGENTS.md` for details.

### Research selection

Before implementation:

- ask one primary falsifiable question;
- prefer information gain over roadmap ritual;
- choose the smallest **discriminating** fixture;
- freeze material gates before results where practical;
- use a control when false-positive success is plausible;
- stop adding variants once the live uncertainty is resolved.

Donor/repository archaeology is optional, not ritual. Use it only when it can materially reduce uncertainty or prevent repeating a known design mistake.

### Draft PR = fast core loop

Open the experiment PR early as Draft.

Each Draft synchronization runs only:

- canonical Node/npm;
- strict TypeScript;
- complete Node/real-Box3D regression suite;
- production build.

No Chromium/Forge on every solver iteration.

### Ready PR = candidate loop

Mark Ready only after the core hypothesis deserves product/runtime validation.

Ready runs:

- core;
- exact staging build from core;
- separate candidate job downloading that exact build;
- launcher regression;
- real Chromium;
- final artifact.

If deep research resumes, return the PR to Draft.

### Owner gate is conditional

Require manual owner validation only when human observation contributes material evidence that A–D cannot establish efficiently: visual continuity, feel, usability, intermittent behavior or another genuinely human judgement.

Do not make owner testing a ceremony. For deterministic obvious visual A/B tests, about three meaningful runs are normally enough.

Forge primary UI must use plain language; SHA/schema/provenance are agent/report details.

### Promotion

For an owner-tested candidate, freeze and merge the exact owner-tested source head after live provenance checks.

For an automated-only candidate, freeze and merge the exact Ready head that passed candidate evidence.

Before merge verify:

1. candidate head unchanged;
2. base `main` unchanged relative to synthetic merge;
3. full required evidence PASS;
4. merge with expected-head protection;
5. synthetic-merge tree equals actual merge tree.

Ground evidence/memory **after** merge. Verified docs-only grounding does not requalify unchanged physics/browser code.

## Forge boundary

Forge exists only to reduce owner-validation friction:

`agent evidence -> packaged build -> simple human test -> report -> agent verifies provenance`.

Do not build a universal hub/plugin/DSL/backend unless repeated real consumers earn it.

ANVIL-04 intentionally did not become a Forge owner gate; this is evidence that the lean workflow is allowed to skip Forge when owner observation adds no useful information.

## Next research decision

ANVIL-04 is complete. Do not continue it by adding arbitrary load levels or more motion variants.

Known remaining risk:

- **contact-loaded relation continuity** — relation reconstruction while an active contact/manifold also matters.

But CUT already has bounded contact evidence, and ANVIL-04 was intentionally the last targeted continuity hardening before returning to the broader Machine Matter program unless a concrete next hypothesis requires contact continuity.

Current preferred next direction:

**local FUNCTION / actuation**.

Find the smallest experiment-local authored active signal that can act through the already-earned BEARING semantics and produce controlled runtime mechanical work without importing a generic motor/power/control ontology.

Before coding, critically compare this against contact-loaded continuity by information gain. Do not combine both in one first experiment.
