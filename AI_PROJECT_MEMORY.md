# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-18 after ANVIL-05 / TORQUE promotion.

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
- **ANVIL-04 / LOAD-REBIND** — cold relation reconstruction remains stable for the declared multi-kN loaded fixtures, including moving C1, without migrating Box3D joint cache.
- **ANVIL-05 / TORQUE** — a minimal experiment-local authored signed torque intent can act through persistent BEARING identity and create causal active mechanical motion via an equal/opposite runtime torque pair, without Box3D joint motor mode.
- **Forge V0.2.1** — owner-validation transport; human-facing language simplified and field-tested on REBIND.
- **Lean Evidence Loop** — two-speed Draft/core and Ready/candidate workflow is promoted and mandatory by default.

## CUT / BEARING / REBIND continuity boundary

Accepted rigid split motion transfer for bounded CUT fixtures:

```text
child COM = parent COM + R_parent * authored COM offset
v_child   = v_parent + omega_parent x r_world
R_child   = R_parent
omega     = omega_parent
```

BEARING is a persistent experiment-local source mark expressed by cell-face endpoints + free axis, not Box3D IDs. It derives a passive revolute relation.

REBIND proved **semantic relation continuity** for the bounded moving nearby-CUT fixture:

```text
same 7 source cells
2 runtime bodies + 1 source bearing
          ↓ nearby CUT while moving
3 runtime bodies + same source bearing
bearing endpoint runtime body: body:a:0 -> body:a:2
```

Fresh bodies/world/joint are created. This is not Box3D joint-cache migration.

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

Fixture uses the same nearby CUT/BEARING with all dynamic bodies, gravity/contact disabled, and a laboratory-only equal/opposite `2500 N` force pair at current bearing anchors. The force pair is instrumentation, not authored FUNCTION.

C0 equilibrium and C1 moving+loaded passed. C1 key values:

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

Production Chromium independently reproduced C1.

Promoted identity:

```text
source head        88844f874ba64932418331c3c0a996a33490d85a
synthetic merge    ad8ea844eeb165af9fa95ac3a27d8da5b6168b7d
actual merge       2dfac4c79e7c12be2795e87bb5d51c12fc29e231
tested/merged tree e5a311462772c29c26074d9d92ec9041ef5db94e
Ready run          32135764502
Node               34/34 PASS
Chromium           18/18 PASS
```

Correct bounded interpretation:

> For the declared 2.5 kN force-pair fixtures, semantic relation reconstruction plus rigid-motion transfer is sufficient for a fresh revolute joint to immediately resume the mechanical responsibility without migrating hidden warm-start/joint-cache state.

Do not generalize to arbitrary loads, impact/fatigue, active contacts, loops or universal absence of solver-state migration needs.

Detailed record: `docs/experiments/ANVIL-04-LOAD-REBIND-EVIDENCE.md`.

## ANVIL-05 / TORQUE — strongest boundary

Primary source idea is deliberately experiment-local:

```text
TorqueMark {
  id
  bearingId      // persistent authored bearing identity
  effortNm       // signed finite torque
}
```

No runtime body/joint ID exists in authored TORQUE source.

Lowering for compiled bearing axis `a`:

```text
tau_A = -T * a
tau_B = +T * a
```

Runtime uses the already-earned **passive** revolute relation plus `b3Body_ApplyTorque` on both disposable bodies each fixed step. It does not use revolute joint motor mode.

C0 compared identical `+100 / 0 / -100 N*m` fixtures from rest for 60 steps:

```text
+100: angle +1.341995 rad; speed +2.067048 rad/s; gap 0.049 mm
   0: angle ~0;          speed ~0
-100: angle -1.435700 rad; speed -2.223932 rad/s; gap 0.057 mm
max linear momentum magnitude 0.000192 kg*m/s   (limit 0.05)
max barycenter drift          < 9e-8 m          (limit 0.0005)
```

Thus sign of authored effort causally controls sign of relative motion, zero remains inactive, bearing integrity is preserved, and the equal/opposite pair does not create material linear thrust within the bounded fixture.

Historical first full C0 run was red only because `deepStrictEqual` distinguished IEEE `-0` from `+0` in the zero-vector compile check. Physical C0 already passed with the same metrics. Test was corrected to zero magnitude only; runtime and frozen thresholds were unchanged. Classification: **test representation defect, not physics falsification**.

Production Chromium independently reproduced C0 raw values.

Promoted identity:

```text
source head        9ed7623df32ca30c147a585b43e43d008c772508
base main          3b422cd7e085c656cc2f91f3a60ca08be5ec1c8f
synthetic merge    49f145a56c5c9aee7ad73017eeca89548055cee1
actual merge       aee8b210758be82b1cfefe8d8ac2fb3ca94d27c6
tested/merged tree 482cb40ac131fc16b22fba72eb0ed202a63d38ee
Ready run          32137653388
Node               37/37 PASS
Chromium           19/19 PASS
staging artifact   9324599263 / 2f3a1760e8df2375b877c869a4149c879be1c57efa5a4bdaf3f6a23945c1e134
final artifact     9324665656 / 28ea22c513d741b4224c3deb32ee99bac03a044f8808e5096aae35158a29e602
```

Synthetic and actual merge trees are identical.

Correct interpretation:

> ANVIL has its first bounded active Machine Matter result: persistent signed physical intent can compile through an existing mechanical relation into controlled runtime work without encoding a solver motor in authored source.

This does **not** establish generic FUNCTION/device ontology, energy/power systems, signals/control, servo semantics, arbitrary orientation, contact actuation or actuation continuity through runtime rebuild.

Detailed record: `docs/experiments/ANVIL-05-TORQUE-EVIDENCE.md`.

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
- generic FUNCTION/device ontology;
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

Donor/repository archaeology is optional, not ritual. Use it only when it materially reduces uncertainty or prevents a known design mistake.

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

If deep research resumes, return PR to Draft.

### Owner gate is conditional

Require manual owner validation only when human observation contributes material evidence A–D cannot establish efficiently: visual continuity, feel, usability, intermittent behavior or another genuinely human judgement.

Do not make owner testing a ceremony. For deterministic obvious visual A/B tests, about three meaningful runs are normally enough.

Forge primary UI must use plain language; SHA/schema/provenance are agent/report details.

ANVIL-04 and ANVIL-05 deliberately skipped Forge because their new evidence was quantitative and production Chromium could establish it directly.

### Promotion

For owner-tested candidate, freeze and merge the exact owner-tested source head after live provenance checks.

For automated-only candidate, freeze and merge the exact Ready head that passed candidate evidence.

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

## Next research decision

ANVIL-05 is complete. Do not extend it with arbitrary torque magnitudes just to accumulate passes.

Two distinct high-information follow-ups now exist:

1. **activation / command separation** — same persistent authored torque capability remains unchanged while transient runtime command changes `off / forward / reverse`, testing the boundary between construction semantics and control state;
2. **TORQUE + REBIND** — active intent remains attached to persistent bearing identity across CUT while runtime body IDs change, testing whether active function survives disposable-runtime reconstruction.

Current preference: critically compare these before coding. Do **not** combine transient command semantics and runtime rebuild in the same first follow-up.

Contact-loaded relation continuity remains a known future compositional risk but is not automatically next.
