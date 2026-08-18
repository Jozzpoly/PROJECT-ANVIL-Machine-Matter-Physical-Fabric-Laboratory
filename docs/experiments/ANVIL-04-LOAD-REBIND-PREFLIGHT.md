# ANVIL-04 / LOAD-REBIND — preflight

Status: **DRAFT / NOT YET SUPPORTED**

## Primary question

Can the accepted ANVIL-03 semantic bearing rebind survive a runtime rebuild while the old bearing is carrying a sustained external constraint load, without a gross first-step shock when the old Box3D joint and its internal solver history are discarded?

This is a bounded **cold relation reconstruction under load** experiment. It is not joint-cache migration.

## Why this is the next falsifier

ANVIL-03 already proved more than a purely unloaded hinge: its free rotating fixture required real constraint work to keep the pivot coincident. What it did not establish is a bearing that has been solving a strong, sustained externally imposed load immediately before rebuild.

ANVIL-04 changes one primary physical assumption: the relation is deliberately preloaded by an experiment-harness force pair.

Do not add contact manifolds, static/infinite-mass supports, motors, limits, authored power/function or generic relation architecture to C0.

## Fixture C0 — direct tensile preload at the bearing

Reuse the accepted seven-cell BEARING/REBIND authored fixture and the same nearby CUT:

```text
bearing seam: a:2@x+ <-> b:0@x-
CUT:          a:0 <-> a:2
```

Both runtime bodies remain ordinary dynamic bodies. Gravity is zero and contacts remain disabled.

Before each solver step the laboratory harness applies a pair of equal and opposite forces at the two current material bearing anchors:

```text
A endpoint: -2500 N along world X
B endpoint: +2500 N along world X
```

The pair has zero net external force. Because each force is applied at the material bearing anchor, the bearing constraint must carry the tensile load without introducing an authored motor/function or an environmental support body.

This external force pair is **test instrumentation only**. It is not Machine Matter FUNCTION semantics and must not be promoted as authored actuation.

Before CUT:

- source cells: 7;
- runtime decomposition: 2 dynamic bodies + 1 bearing;
- initial motion: rest;
- no gravity;
- no contacts;
- the force pair is applied for 120 solver steps so the old joint is repeatedly solving the sustained load.

After CUT:

- the same seven source cells remain;
- runtime decomposition becomes 3 dynamic bodies;
- source bearing remains one bearing;
- the A bearing endpoint must resolve to the new child containing `a:2` rather than the old runtime body;
- the bearing is reconstructed as a fresh Box3D revolute joint;
- the same 2500 N force pair is immediately applied to the new material endpoints;
- the detached A child receives no load;
- an A/B control rebuilds the same after-CUT state without recreating the bearing and receives the identical force pair.

## Binding capability precheck

Before implementing the full fixture, exact pinned `box3d.js@0.0.2` must expose the real Box3D calls needed by this falsifier:

- `b3Body_ApplyForce`;
- `b3Joint_GetConstraintForce`.

If either is unavailable, record the binding limitation before choosing an indirect measurement. Do not silently substitute a synthetic force model.

## Frozen gates

All numeric thresholds below are declared before the first executable C0 result.

### Structural / semantic

- source cells: exactly `7 -> 7`;
- runtime bodies: exactly `2 -> 3`;
- source bearing: exactly `1 -> 1`;
- bearing endpoint runtime body must change across CUT;
- no source additions/removals;
- all runtime bodies remain dynamic;
- gravity is zero;
- no contacts are allowed in C0.

### Pre-CUT loaded state

After 120 loaded steps:

- commanded tensile load is exactly `2500 N` per side;
- measured Box3D bearing constraint-force magnitude >= `2000 N` and <= `3000 N`;
- maximum body COM speed <= `0.001 m/s`;
- maximum body angular speed <= `0.001 rad/s`;
- bearing gap <= `0.0025 m`.

`b3Joint_GetConstraintForce` is used as real-solver evidence that the relation is actually carrying the load. It is not evidence that the internal warm-start cache itself is exposed or migrated.

### Immediate rebuild continuity

Before the new solver takes a step:

- maximum bearing-anchor position jump <= `0.00007 m` (0.07 mm);
- maximum bearing-anchor material-point velocity jump <= `0.00007 m/s` (0.07 mm/s).

### First post-rebuild solver step — primary new falsifier

After applying the same 2500 N pair and stepping the fresh after-CUT runtime once:

- bearing anchor gap <= `0.0005 m` (0.5 mm);
- relative bearing-anchor velocity <= `0.02 m/s` (20 mm/s);
- maximum linear speed of any after-CUT body <= `0.1 m/s`;
- measured fresh-bearing constraint-force magnitude >= `1500 N` and <= `3500 N`.

The ideal passive constrained fixture starts at rest and the load is applied at the constrained material anchors. A large velocity/gap spike therefore indicates solver-visible cold-reconstruction shock rather than intended free motion. The force interval is deliberately wider than the settled pre-CUT interval because the after-CUT bearing is cold and its connected mass decomposition changed.

### Continued behavior / causal control

After 60 loaded post-CUT steps (~1 s):

- reconstructed-bearing anchor gap <= `0.0025 m`;
- reconstructed-bearing runtime remains finite;
- no-bearing control anchor gap >= `1.0 m`.

The control is required so a passing constrained fixture cannot be explained by coincident motion or by the load harness accidentally applying no discriminating force.

## Failure interpretation

A failure must not be hidden by interpolation, damping, a looser threshold, delayed measurement or a reset.

Interpretation guide:

- binding capability failure -> exact JS binding cannot directly execute/observe the intended load test;
- pre-CUT force/gap/rest failure -> fixture did not establish the intended sustained constraint load and is inconclusive;
- immediate jump failure -> state-transfer/rebind kinematics are wrong before the solver acts;
- first-step gap/velocity/speed/force failure with immediate continuity passing -> fresh constraint reconstruction under load introduces a solver-visible transient outside the declared bound;
- control fails to separate -> fixture is non-discriminating and must be redesigned, not accepted.

## Explicit non-claims

A pass will **not** prove:

- migration of Box3D warm-start/joint-cache internals;
- exact equality with uninterrupted solver history;
- contact-manifold continuity;
- active contact during CUT;
- arbitrary load magnitude, direction or impact load;
- multiple relations or closed loops;
- motors, limits, power or FUNCTION semantics;
- cutting through the bearing itself;
- generic Relation/Constraint architecture;
- in-place mutation of one persistent populated Box3D world.

## Continuation if C0 passes

Do not automatically accumulate load variants.

Choose the next question from the remaining uncertainty:

1. **contact-loaded rebind** only if active contact/manifold loss is still the highest-value continuity risk; or
2. move to **local FUNCTION / actuation** if C0 establishes stable cold reconstruction under a strong sustained external relation load and contact continuity is not required by the next machine hypothesis.

Choose by information gain, not sequence ritual.
