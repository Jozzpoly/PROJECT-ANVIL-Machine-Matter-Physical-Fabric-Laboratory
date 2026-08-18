# ANVIL-10 / TORQUE-PATCH-REBIND — preflight

Status: **FROZEN BEFORE IMPLEMENTATION / NO EXECUTABLE RESULT YET**

Strategic source: `docs/RESEARCH_COMPASS.md`.
Live `main` at branch creation: `755d351d21e622c8af6eb037e2edc1cf19a62ff5`.
Accepted material checkpoint at freeze: `a024c8cb134aabe0033ea2990068e6479c3da2b5` (**ANVIL-09 / ACTIVATE**).

## Decision record — why this falsifier

ANVIL-09 established one bounded separation between persistent local active meaning and shorter-lived runtime activation. The post-promotion composition debt is now whether the already-earned persistent local active meaning remains attached to the correct source matter when disposable rigid-body decomposition changes.

The original strategic label `FUNCTION-REBIND` was narrowed before implementation to **TORQUE-PATCH-REBIND**. Generic FUNCTION is not an earned foundation concept. The experiment tests exactly the local active semantic ANVIL has already earned rather than naming a broader abstraction in advance.

### Candidate A — TORQUE-PATCH-REBIND

Test whether one unchanged local persistent TORQUE-PATCH can be rebound from the accepted pre-CUT BEARING compilation to the accepted post-CUT rebound BEARING compilation while its disposable body binding changes.

Information value:

- directly composes TORQUE-PATCH with REBIND instead of adding a new primitive;
- attacks the central ANVIL rule that compiled/runtime identity is disposable;
- exercises a dangerous stale-binding case where an old body ID can remain valid after CUT while no longer containing the persistent bearing endpoint;
- separates semantic relowering from transient command-state migration;
- requires no new solver primitive, generic routing or power architecture.

### Candidate B — CONTROL-REBIND

Preserve or reapply a higher-lived transient activation session through reconstruction.

Why not first:

- adds another lifecycle/routing question before persistent action rebinding itself is proven;
- a red result would be ambiguous between action rebinding and transient state continuation;
- ANVIL-09 deliberately says a fresh runtime defaults OFF unless a later experiment earns restoration semantics.

Disposition: later candidate only if TORQUE-PATCH-REBIND is supported and macro ranking still favors it.

### Candidate C — active torque during the REBIND transaction

Keep the patch ON while the world is reconstructed.

Why not first:

- mixes action rebinding with active-load transaction continuity;
- REBIND/LOAD-REBIND already provide stronger isolated continuity evidence;
- the smallest current question is whether the action can be correctly regenerated for the new disposable representation.

Disposition: later stress candidate, not part of ANVIL-10.

### Candidate D — FUNCTION x COMPLIANCE or new SURFACE semantics

Both remain strategically important, but they either introduce rotational/distributed compliance confounding or open another primitive frontier before the current semantics have paid their composition debt.

## Primary question

Can one **unchanged persistent local TORQUE-PATCH** targeting `a:2@x+` with signed `+100 N*m` effort survive the accepted nearby CUT semantically such that:

1. the same persistent BEARING identity and patch target remain unchanged;
2. the pre-CUT compiled torque action is recognized as **stale** after the disposable body decomposition changes, even though its old `body:a:0` ID still exists;
3. a fresh post-CUT torque action is deterministically derived against the rebound BEARING and names the correct new endpoint body `body:a:2`;
4. the unchanged patch does not acquire runtime IDs or mutate to make this happen;
5. the accepted moving REBIND transaction remains continuous before active torque is applied; and
6. after reconstruction, explicit runtime activation of the fresh action produces a causal response distinguishable from an otherwise identical OFF control while the stale sibling body remains unaffected?

This is one uncertainty:

> **Can persistent local active meaning be re-lowered onto a changed disposable representation without stale runtime identity becoming semantic truth?**

## Why the stale-binding control matters

The accepted compiler gives body IDs from deterministic source components. In the declared fixture:

```text
before CUT
  bearing endpoint a:2 belongs to body:a:0

after nearby CUT a:0 <-> a:2
  {a:0, a:1} remains body:a:0
  {a:2} becomes body:a:2
```

Therefore the old torque action's `body:a:0` is not necessarily missing after reconstruction. It is a **valid-looking but semantically wrong binding** because it no longer contains persistent endpoint cell `a:2`.

ANVIL-10 must not treat "body ID still exists" as sufficient action validity.

## Existing evidence reused, not re-earned

Already accepted:

- BEARING: local persistent endpoint semantics lower to a passive revolute relation;
- REBIND: the same persistent bearing is reconstructed from `2 -> 3` disposable bodies while source cells remain unchanged, with endpoint body `body:a:0 -> body:a:2` and accepted rigid-motion transfer;
- LOAD-REBIND: joint cache migration is unnecessary for the bounded loaded fixtures;
- TORQUE: signed persistent effort lowers to equal/opposite body torques and causes causal rotation;
- TORQUE-PATCH: local source face `a:2@x+` resolves the persistent bearing without authored `bearingId`;
- ACTIVATE: fresh runtime activation is transient, defaults OFF, and explicit ON supplies the accepted compiled torque action.

A regression in one of these accepted boundaries must be classified separately from the ANVIL-10 hypothesis.

## Persistent source fixture

Reuse the accepted seven-cell BEARING/TORQUE-PATCH fixture.

```text
source cells       7
bearing             bearing:seam-0
bearing seam        a:2@x+ <-> b:0@x-
patch id            torque-patch:seam-0
patch target        a:2@x+
patch effort        +100 N*m
nearby CUT          a:0 <-> a:2
```

The authored TORQUE-PATCH is one persistent object for the complete experiment. Its `id`, `target` and `effortNm` do not change before/after CUT.

No activation state is authored into the patch.

## Experiment-local semantic relowering under test

Preferred future implementation shape, not implementation yet:

1. Create the accepted TORQUE-PATCH source fixture once.
2. Compile the accepted REBIND fixture from the same authored BEARING to obtain `before` and `after` `BearingCompilation` objects.
3. Introduce one experiment-local adapter that accepts:
   - the unchanged `TorquePatch`; and
   - one already-derived `BearingCompilation`.
4. Validate the patch against the supplied persistent relation endpoints.
5. Derive a `TorquePatchCompilation`-compatible result whose `TorqueCompilation.bearing` is exactly the supplied bearing compilation and whose `TorqueActionPlan` is derived from that relation's current body IDs and axis.
6. Against `before`, require parity with accepted `compileTorquePatch()`.
7. Against `after`, require remapping to the rebound relation rather than reusing the before action.
8. Reject any compilation/action pair whose action body IDs do not exactly match the supplied relation body IDs, even when those IDs still exist in the supplied physical plan.

The adapter is experiment-local. It does not introduce generic FUNCTION, action registry, cache version, routing or invalidation architecture.

### Before-parity requirement

When supplied `rebind.before`, the new adapter must be semantically equivalent to accepted ANVIL-06 output for the same source patch:

- same source patch ID and target;
- same resolved persistent bearing ID;
- same signed effort;
- same bearing physical plan/relation meaning;
- same action body IDs;
- same axis and equal/opposite torque vectors.

If before parity cannot be achieved without changing accepted ANVIL-05/06 semantics, stop and re-audit before any solver work.

## Stale-action negative control

Construct the accepted pre-CUT action, then pair/test it against the accepted post-CUT `after` bearing compilation.

Frozen expected facts:

```text
before action body A          body:a:0
after relation body A         body:a:2
after physical plan still has body:a:0
persistent patch target       a:2@x+
```

Expected result: **fail closed before runtime creation**.

The rejection must be based on semantic/body binding mismatch with the current relation, not merely on missing body IDs.

A validator that accepts the stale action because `body:a:0` still exists fails the primary ANVIL-10 hypothesis.

## Runtime implementation boundary

Accepted `ActivatePhysics` cannot start from the moving `transferRebindMotion()` state. Do not refactor it merely for reuse.

Preferred future runtime is a new experiment-local ANVIL-10 runtime that:

- consumes a correctly relowered post-CUT `TorquePatchCompilation`;
- consumes accepted REBIND transferred motion for every post-CUT plan body;
- creates the fresh passive rebound revolute relation;
- starts activation OFF;
- uses accepted `ActivateControlState` semantics for explicit OFF/ON;
- conditionally applies the fresh action's equal/opposite body torque pair with `b3Body_ApplyTorque`;
- exposes only measurements needed by the frozen gates.

Do not modify `src/foundation`.

Do not modify accepted ANVIL-03/05/06/09 semantics merely to make the composition elegant. If a minimal experiment-local adapter/runtime is impossible, STOP and re-audit scope.

## Moving REBIND transaction fixture

Use the accepted untransformed REBIND C0 moving fixture, not the arbitrary-common-transform C1 variant.

Initial pre-CUT motion:

```text
body A angular velocity   (0, 0, -0.65) rad/s
body B angular velocity   (0, 0, +0.95) rad/s
common linear drift       (0.8, -0.25, 0.35) m/s
pre-CUT steps             31 at 60 Hz
```

The arbitrary common-transform variant is deliberately excluded because TORQUE has not earned arbitrary world-orientation/covariance semantics; including it would mix a separate active-axis question into ANVIL-10.

### Transaction sequence

```text
P0  create passive pre-CUT REBIND runtime
P1  run 31 moving steps with no active torque
P2  snapshot pre-CUT state
P3  dispose old runtime
P4  transfer motion with accepted transferRebindMotion()
P5  create two fresh post-CUT ANVIL-10 runtimes from the same after compilation and transferred state
P6  verify both fresh runtimes default OFF and agree before branching
P7  set ACTIVE world ON; leave CONTROL world OFF
P8  step both worlds 30 fixed steps
```

No torque is active before or during the reconstruction transaction.

This prevents active-load continuity from becoming a second primary uncertainty.

## Laboratory isolation

Post-CUT runtime:

```text
gravity                 0
contacts                disabled
sleep                   disabled
body linear damping     0
body angular damping    0
fixed timestep           1/60 s
substeps                 4
runtime bodies           3
runtime revolute joints  1
```

The third post-CUT body `body:a:0` is the stale sibling. It is intentionally present and disconnected from the bearing endpoint child `body:a:2`.

## Frozen gates

All gates below are frozen before implementation and before any executable ANVIL-10 result.

### A — persistent-source / scope boundary

- exactly one persistent local `TorquePatch` exists;
- patch ID remains `torque-patch:seam-0`;
- patch target remains `a:2@x+` before/after CUT;
- patch effort remains signed `+100 N*m`;
- source patch contains no `bearingId`, runtime body ID, runtime joint ID, activation, command, signal or power field;
- persistent BEARING identity remains `bearing:seam-0`;
- source bearing endpoints remain unchanged;
- source cell identity remains exactly `7 -> 7`;
- no new generic FUNCTION, Device, Control, Signal, Port, routing or invalidation schema is introduced;
- no `src/foundation` change is required;
- accepted ANVIL-03/05/06/09 source semantics are not modified for convenience.

### B0 — accepted before parity

Relowering the unchanged patch against `rebind.before` must match accepted ANVIL-06 meaning:

- source patch ID equal;
- source target equal;
- resolved persistent bearing ID equal;
- signed effort equal;
- action source torque ID equal;
- action source bearing ID equal;
- action `bodyAId/bodyBId` equal;
- axis equal component-wise;
- torque A/B vectors equal component-wise;
- net torque pair magnitude <= `1e-12 N*m`.

A failure here is an adapter semantic failure, not evidence about rebinding.

### B1 — required disposable remap

For the accepted REBIND fixture:

```text
before bodies                   2
after bodies                    3
before relation body A          body:a:0
after relation body A           body:a:2
before relation body B          unchanged for the fixture
```

Required checks:

- `before.relation.sourceBearingId === after.relation.sourceBearingId`;
- persistent endpoints are identical before/after;
- patch target still matches exactly one endpoint of the after relation;
- `before.relation.bodyAId !== after.relation.bodyAId`;
- `after.physicalPlan.cellToBody["a:2"] === after.relation.bodyAId`;
- `after.physicalPlan` still contains `body:a:0`;
- the fresh after action `bodyAId/bodyBId` exactly equal the after relation body IDs;
- fresh after action source ID, bearing ID and effort remain unchanged;
- for this untransformed fixture, axis and torque vectors remain equal to before values;
- net fresh torque pair magnitude <= `1e-12 N*m`.

### B2 — stale action fails closed

An intentionally stale candidate consisting of the **after** bearing compilation plus the **before** torque action must be rejected before solver/runtime creation.

Rejection is mandatory even though stale `body:a:0` exists in the after physical plan.

At minimum validation must prove:

```text
staleAction.bodyAId !== after.relation.bodyAId
```

and reject the mismatch.

A runtime path that merely looks up stale body IDs and proceeds is a failure.

### C0 — passive moving reconstruction continuity

Before activation, retain the accepted REBIND C0 transaction gates:

```text
pre-CUT bearing gap                         <= 0.0025 m
A anchor position jump                      <= 0.00007 m
B anchor position jump                      <= 0.00007 m
A anchor material-point velocity jump       <= 0.00007 m/s
B anchor material-point velocity jump       <= 0.00007 m/s
immediate rebound bearing gap               <= 0.0025 m
total linear momentum error                 <= 0.75 kg*m/s
```

Additionally:

- both post-CUT runtimes contain exactly 3 bodies and 1 passive revolute relation;
- both start OFF;
- both initial post-CUT states are finite;
- both are constructed from the same relowered after compilation and the same transferred motion;
- before branching, their bearing-gap delta and relative-angular-speed delta are each <= `1e-6` in their respective units;
- OFF control remains finite and bearing gap <= `0.0025 m` after its first solver step.

If these gates fail before active torque is introduced, classify REBIND/harness regression before interpreting action rebinding.

### C1 — post-CUT ON/OFF causal discrimination

From the identical post-CUT branch point:

```text
ACTIVE   explicit ON   30 steps
CONTROL  remains OFF   30 steps
```

Frozen primary causal gate:

```text
ACTIVE final relative angular speed
  - CONTROL final relative angular speed       >= +0.25 rad/s
```

The `+0.25 rad/s` differential threshold is reused from the pre-result ANVIL-09 continued-ON discriminator. It is not derived from an ANVIL-10 result.

Both worlds must also satisfy:

```text
bearing gap                                   <= 0.0025 m
|total linear momentum ACTIVE - CONTROL|      <= 0.05 kg*m/s
complete-runtime barycenter separation        <= 0.0005 m
```

All states must remain finite.

Do **not** freeze an absolute post-CUT relative-speed-conservation gate. ANVIL-09 negative evidence established that relative revolute-coordinate speed is not a conserved invariant of the asymmetric mechanism.

### C2 — stale sibling remains physically uninvolved

The disconnected post-CUT `body:a:0` remains present in both ACTIVE and CONTROL worlds but is not the persistent bearing endpoint anymore.

After the same 30-step branch interval:

```text
angular-velocity vector delta of body:a:0     <= 1e-6 rad/s
linear-velocity vector delta of body:a:0      <= 1e-6 m/s
```

This is a direct physical guard against accidentally applying the remapped endpoint torque to the valid-looking stale sibling.

If ACTIVE and CONTROL differ materially on `body:a:0`, classify wrong-body/stale-binding actuation even if the bearing itself rotates.

## Evidence classes

Initial scientific decision requires:

- **A — static/structural:** source boundary, experiment-local dependency boundary, no authored runtime identity or generic FUNCTION/control architecture;
- **B — pure semantic/compiler:** before parity, required after remap, fresh action identity and the valid-looking stale-action fail-closed control;
- **C — real pinned Box3D:** accepted moving transaction continuity plus post-CUT ON/OFF causal separation and stale-sibling non-actuation.

A dedicated browser route is not required for the scientific claim. If ANVIL-10 later reaches Ready, existing launcher/Chromium execution may serve as exact-build whole-product regression evidence only unless a browser-specific uncertainty appears.

Owner/manual evidence is not required for this structural/causal claim.

## Failure interpretation

Classify RED before changing implementation or thresholds.

- before parity fails -> **semantic adapter defect / scope failure**; do not proceed to solver;
- unchanged source patch cannot resolve the rebound relation -> **persistent local binding hypothesis failure** or insufficient source vocabulary;
- relowering requires editing patch target/effort/ID -> **persistent meaning failure**;
- stale after+before-action candidate is accepted -> **primary stale-binding safety failure**;
- validator only rejects because a body ID is missing -> fixture/control implementation is wrong because the declared stale body must still exist;
- accepted REBIND continuity gates fail before ON -> **REBIND/runtime harness regression**, not action-rebinding evidence;
- mapping gates pass but ON/OFF differential is < `0.25 rad/s` -> **physical composition failure or non-discriminating runtime adapter**; classify before changing schedule or threshold;
- stale sibling diverges between ACTIVE/OFF -> **wrong-body actuation / stale identity leak**;
- bearing gap fails only under ON -> **active-action/constraint composition failure**;
- implementation requires modifying accepted ANVIL-03/05/06/09 semantics or foundation -> **scope/architecture escalation**; STOP and re-audit;
- later browser regression -> product/integration failure unless a browser-specific ANVIL-10 uncertainty is identified.

Do not weaken a frozen discriminator merely to obtain PASS.

## Explicit non-claims

Even a clean PASS will not prove:

- generic FUNCTION or Device ontology;
- generic compiled-action cache invalidation/versioning architecture;
- transient activation state migration or restoration through CUT/REBIND;
- torque active during the reconstruction transaction;
- loaded/contact actuation through CUT;
- command routing, multiple targets, ports, signals, buses or controllers;
- reverse/analog command or reinterpretation of signed `effortNm` as bidirectional capacity;
- power/energy/storage semantics;
- multiple bearings, multiple patches or mechanism graphs;
- cutting through the bearing seam itself;
- arbitrary common-transform / arbitrary actuator-axis covariance;
- body/joint handle or solver warm-start migration;
- function through compliant/deformable matter;
- alternate authored representation/resolution invariance;
- in-place mutation of one persistent populated Box3D world;
- foundation promotion of TORQUE-PATCH, FUNCTION, ACTIVATE or REBIND.

## Stop rule

If A + B0/B1/B2 + C0/C1/C2 cleanly support the primary question:

**STOP ANVIL-10 research.**

Do not add, inside this experiment:

- transient command migration;
- active torque during CUT;
- load/contact variants;
- arbitrary transforms;
- multiple patches/bearings;
- compliance;
- UI/keyboard input;
- generic FUNCTION/control abstractions;
- foundation promotion.

Run a meso/macro audit after the bounded result. CONTROL-REBIND may become a strong successor, but it must be re-ranked by information gain rather than inherited automatically.

## Implementation checkpoints after this freeze

Only after this preflight is frozen:

1. **Micro A/B:** implement the smallest experiment-local relowering/validation adapter; prove before parity, after remap and stale-action rejection. Do not create the solver runtime if this is red.
2. **Micro C0:** implement the experiment-local moving post-CUT runtime and prove passive reconstruction continuity with activation still OFF.
3. **Micro C1/C2:** branch identical post-CUT state into explicit ON vs OFF; evaluate causal separation and stale-sibling non-actuation.
4. **Meso stop-rule audit:** decide support/reject/inconclusive before any scope expansion.
5. **Ready candidate only if justified:** exact integration regression; browser remains regression evidence unless a browser-specific uncertainty emerges.
