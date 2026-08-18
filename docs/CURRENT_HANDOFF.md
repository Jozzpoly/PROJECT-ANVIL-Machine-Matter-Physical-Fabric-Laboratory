# PROJECT ANVIL — Current Handoff

Status: **COLD-TAKEOVER CHECKPOINT / ANVIL-07 PRE-C0**

Prepared: 2026-08-18 after ANVIL-06 grounding, ANVIL-07 capability precheck and pre-C0 hardening.

This file exists so a new conversation can recover the live project state from Git without reconstructing it from chat history.

## 1. First action in a new conversation

Do **not** start implementation from this document alone.

Perform a cold takeover:

1. fetch live `main`;
2. verify that all commits after the accepted material checkpoint below are documentation-only handoff/grounding changes unless newer material work is explicitly present;
3. fetch PR #12 metadata;
4. verify the live experiment branch head and base;
5. compare the experiment branch against its base;
6. read `AGENTS.md`, `AI_PROJECT_MEMORY.md`, `docs/RESEARCH_COMPASS.md`, `docs/EXPERIMENT_PROTOCOL.md`;
7. read both ANVIL-07 preflight documents from the experiment branch;
8. inspect the capability test and latest CI run;
9. only if live state is consistent with the checkpoint below, continue the declared C0.

If any SHA/state differs, treat live Git as authority and reconcile the delta before writing code.

## 2. Accepted truth vs active experiment

### Accepted material checkpoint

The latest accepted **material/code** checkpoint before handoff documentation is:

```text
accepted material checkpoint  e236f6a8b00858fa4d35f4fc32189f78b9cb33b2
parent ANVIL-06 merge          68f68104734084e0e284c77776a42e954e783d4d
accepted through              ANVIL-06 / TORQUE-PATCH
```

The deliberate handoff preparation adds documentation-only commits on top of this checkpoint. Therefore the incoming agent must resolve the **live** `main` SHA rather than expecting it to equal `e236...`, then mechanically confirm that the delta back to `e236...` is documentation-only unless new work has occurred after this handoff.

ANVIL-06 supports only the bounded claim that, in the single-bearing fixture, local source-face active intent can resolve the existing authored BEARING without an authored `bearingId`, fail closed off-interface and preserve the accepted TORQUE physical behavior.

It does **not** prove mechanism discovery, a generic property field, multiple-bearing inference, control/power, non-grid matter or a universal Machine Matter ontology.

### Active work — not accepted

At handoff preparation:

```text
PR                    #12
branch                experiment/anvil-07-elastic-seam
base                  e236f6a8b00858fa4d35f4fc32189f78b9cb33b2
head                  af93a116ab59bf4d32ac58956cd9a719b86175cc
state                 OPEN / DRAFT
```

**Critical boundary:** ANVIL-07 has no implemented semantic/compiler/runtime C0 yet. There is no evidence that ELASTIC-SEAM physics works.

The branch contains only:

- frozen original preflight;
- exact-binding capability test + package test registration;
- pre-C0 hardening amendment.

Do not describe the current state as `ELASTIC-SEAM SUPPORTED`.

## 3. ANVIL-07 evidence already earned

### Original preflight

Committed before the first executable capability result:

```text
preflight source  c7006b4f63a85ba36fb67af70460149866bb5527
```

Canonical file:

`docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT.md`

It freezes the primary question, physical coefficients, `RIGID / ELASTIC / FREE` controls, load/unload schedule, thresholds, evidence classes, failure interpretation and non-claims.

### Lowering capability only

```text
capability source     58c4580702d4604f2effcdc501cde09d796becea
Draft/core run        32151014026
synthetic checkout    1f3a34da0c8d14e9d9beb1892932300b6917e1bb
result                40/40 PASS + production build PASS
```

This proves the pinned `box3d.js@0.0.2` / runtime Box3D `0.1.0` binding exposes and can step the required weld-spring path, including:

- `b3DefaultWeldJointDef`;
- `b3CreateWeldJoint`;
- linear/angular hertz and damping-ratio fields;
- `b3Body_ApplyForce`.

This is **not elasticity evidence**.

### Pre-C0 amendment

Independent review found additional invariants before any C0 implementation. They were added in a separate docs-only commit:

```text
branch head after amendment  af93a116ab59bf4d32ac58956cd9a719b86175cc
hardening CI run             32159805481
result                       SUCCESS
```

Canonical file:

`docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT-AMENDMENT-01.md`

The amendment does not loosen any frozen threshold. It adds:

- source-cell ordering invariance;
- endpoint-swap invariance;
- degenerate/duplicate fail-closed behavior;
- explicit bounded validity of the scalar reduced-mass mapping;
- exact fixture calibration values;
- anti-hidden-help requirements;
- mandatory raw diagnostic reporting.

The commit from capability head to amendment head changes only that documentation file.

## 4. ANVIL-07 physical grounding already checked

Exact Box3D v0.1.0 source was re-inspected before handoff:

- weld exposes independent linear/angular spring tuning;
- the solver converts hertz/damping ratio through its softness model;
- full angular motion lock produces fixed rotation / zero inverse inertia;
- motion locks are enforced by the solver integration path.

Therefore the scalar conversion below is defensible for the deliberately isolated one-dimensional C0, but **not** as a universal compliance compiler.

## 5. Frozen C0 meaning

Primary question:

> Can one persistent local binding property between neighboring authored matter express bounded **normal compliance** — deformation under load plus restoring behavior after unload — instead of rigid union or free separation, without promoting a generic Bond ontology or storing Box3D spring tuning in authored truth?

Experiment-local source candidate:

```text
ElasticSeam {
  id
  endpointA: { cellId, face }
  endpointB: { cellId, face }
  normalStiffnessNPerM
  normalDampingNsPerM
}
```

Do not introduce authored:

- Box3D joint type;
- solver hertz;
- damping ratio;
- runtime body/joint IDs;
- generic Bond/Constraint type;
- damage/breakage/plasticity;
- actuation/control.

## 6. Frozen fixture and calibration

Same seven-cell topology used around the accepted BEARING seam, but with no BEARING semantics.

```text
seam                a:2@x+ <-> b:0@x-
cell size           0.5 m
material density    780 kg/m^3
left island         3 cells = 292.5 kg
right island        4 cells = 390.0 kg
m_eff               167.142857142857 kg
k                   10000 N/m
c                   1800 N*s/m
pull                1000 N per side, equal/opposite
load                 180 steps @ 60 Hz
recovery             120 steps @ 60 Hz
expected hertz      ~1.2310515 Hz
expected zeta       ~0.6961432
ideal F/k extension 0.100 m
```

C0 isolates one world-X translational normal mode. World-Y/Z translation and all rotations are locked as **laboratory instrumentation**, not authored binding semantics. Gravity and contacts are disabled; body damping must remain zero.

The `k,c -> hertz,zeta` reduction is valid only for this isolated scalar C0. Do not promote it as a universal compliance compiler.

## 7. Frozen causal controls

### RIGID

- unmarked ordinary rigid adjacency;
- 7 cells -> 1 runtime body;
- seam extension <= 0.001 m.

### ELASTIC

- seam removed from rigid union and replaced by one experiment-local compliant relation;
- 7 cells -> 2 runtime bodies + 1 elastic relation;
- after load: extension 0.07–0.13 m and |relative normal speed| <= 0.10 m/s;
- after unload/recovery: |extension| <= 0.015 m, |relative normal speed| <= 0.15 m/s and at least 0.06 m recovery from the loaded state.

### FREE

- same seam removed from rigid union;
- 7 cells -> 2 runtime bodies + no restoring relation;
- after load: extension >= 2.0 m and at least 1.0 m greater than ELASTIC;
- during recovery it must not spontaneously converge toward the rest seam.

For ELASTIC, also require finite state, total linear momentum magnitude <= 0.05 kg*m/s and barycenter drift <= 0.0005 m.

Read the preflight files for the complete exact gates. Do not substitute this summary for them.

## 8. Exact next implementation scope

Continue PR #12 in Draft after cold takeover.

Implement only the smallest experiment-local ANVIL-07 compiler/runtime/test path needed to execute the frozen C0:

1. validate/canonicalize `ElasticSeam` source endpoints and physical coefficients;
2. compile the unmarked fixture as RIGID and the blocked seam as the two-island basis for ELASTIC/FREE;
3. fail closed on invalid geometry and alternate rigid bypass;
4. resolve the two runtime islands from persistent source provenance;
5. derive `m_eff`, hertz and damping ratio from compiled/source mass + authored `k,c`;
6. lower ELASTIC to the pinned weld-spring runtime representation only inside this experiment;
7. run the exact equal/opposite load/unload schedule;
8. measure and report the frozen diagnostics for RIGID/ELASTIC/FREE;
9. classify any red result before changing implementation or thresholds.

Do **not** before C0 resolves:

- mark PR Ready;
- merge PR #12;
- change frozen thresholds merely to get PASS;
- add Chromium/Forge/owner ceremony;
- add breakage, plasticity, torque, ACTIVATE, contacts or generic Bond architecture;
- promote anything into foundation.

## 9. Decision after C0

If the declared A/B/C/D/E evidence strongly passes, stop C0 and rerun the Research Compass before selecting another experiment.

A pass supports only:

> In the isolated one-dimensional fixture, a local authored seam property can represent bounded compliant deformation and restoring behavior while remaining distinct from rigid union and free separation.

It will **not** yet prove full 3D compliant matter, shear/bending/torsion, continuum elasticity, resolution-independent material law, damage, adaptive deformables or generic bindings.

If C0 is red, preserve the useful failure and classify it as source/compiler, physical mapping, solver lowering, fixture discrimination or infrastructure before redesigning.

## 10. Why this handoff exists

Conversation history is useful context but is not project truth. The next conversation should be able to reconstruct the project from live Git + exact evidence, verify this checkpoint, and continue without asking the owner to repeat technical history.
