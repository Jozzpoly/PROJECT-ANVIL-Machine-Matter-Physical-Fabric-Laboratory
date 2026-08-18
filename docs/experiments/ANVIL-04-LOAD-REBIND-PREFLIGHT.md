# ANVIL-04 / LOAD-REBIND — preflight

Status: **DRAFT / NOT YET SUPPORTED**

## Primary question

Can the accepted ANVIL-03 semantic bearing rebind survive a runtime rebuild while the old bearing is carrying a meaningful static gravitational load, without a gross first-step shock when the old Box3D joint and its internal solver history are discarded?

This is a bounded **cold relation reconstruction under load** experiment. It is not joint-cache migration.

## Why this is the next falsifier

ANVIL-03 already proved more than a purely unloaded hinge: its free rotating fixture required real constraint work to keep the pivot coincident. What it did not establish is a bearing that has been solving a sustained environmental load immediately before rebuild.

ANVIL-04 therefore changes one primary physical assumption: the relation is preloaded by gravity against a fixed environmental support.

Do not add contact manifolds, motors, limits, authored power/function or generic relation architecture to the first fixture.

## Fixture C0 — static support / hanging matter

Reuse the accepted seven-cell BEARING/REBIND authored fixture and the same nearby CUT:

```text
bearing seam: a:2@x+ <-> b:0@x-
CUT:          a:0 <-> a:2
```

Before CUT:

- source cells: 7;
- runtime decomposition: 2 bodies + 1 bearing;
- the B-side runtime body is an **experiment-only environmental static support**;
- the A-side body remains dynamic;
- gravity is `(0, -9.81, 0) m/s²`;
- A is placed with its center of mass directly below the bearing pivot and starts at rest;
- no contacts are enabled;
- the solver steps long enough to establish a quiet loaded state.

The static support is a laboratory boundary condition, not new authored Machine Matter semantics. Its infinite-mass runtime behavior must not be promoted to foundation.

After CUT:

- the same seven source cells remain;
- runtime decomposition becomes 3 bodies;
- the source bearing remains one bearing;
- the A bearing endpoint must resolve to the new child containing `a:2` rather than the old runtime body;
- that bearing is reconstructed as a fresh Box3D revolute joint;
- the detached A child is free to fall;
- an A/B control rebuilds the same after-CUT state without recreating the bearing.

## Frozen gates

All numeric thresholds below are declared before the first executable result.

### Structural / semantic

- source cells: exactly `7 -> 7`;
- runtime bodies: exactly `2 -> 3`;
- source bearing: exactly `1 -> 1`;
- bearing endpoint runtime body must change across CUT;
- no source additions/removals;
- no contacts are allowed in C0.

### Pre-CUT loaded state

- dynamic supported mass must imply gravitational weight **> 2000 N**;
- after settling, dynamic A COM speed <= `0.001 m/s`;
- after settling, dynamic A angular speed <= `0.001 rad/s`;
- pre-CUT bearing gap <= `0.0025 m`.

The weight value is an analytical fixture demand `m * |g|`; it is evidence that the joint must support a sustained external load if the body remains settled. It is **not** a direct measurement of Box3D's hidden joint impulse cache.

### Immediate rebuild continuity

- maximum bearing-anchor position jump <= `0.00007 m` (0.07 mm);
- maximum bearing-anchor material-point velocity jump <= `0.00007 m/s` (0.07 mm/s).

### First post-rebuild solver step — primary new falsifier

- bearing anchor gap <= `0.0005 m` (0.5 mm);
- relative bearing-anchor velocity <= `0.02 m/s` (20 mm/s);
- maximum linear speed of a dynamic after-CUT body <= `0.5 m/s`.

The fixture starts from rest. Gravity alone changes a freely falling body's speed by about `9.81 / 60 = 0.1635 m/s` in one 60 Hz step. The 0.5 m/s ceiling deliberately leaves solver margin while still rejecting a gross artificial kick.

### Continued behavior / causal control

After 60 post-CUT steps (~1 s):

- reconstructed-bearing anchor gap <= `0.0025 m`;
- no-bearing control anchor gap >= `1.0 m`;
- all observed runtime state must remain finite.

The control is required so a passing constrained fixture cannot be explained by geometry or coincident ballistic motion alone.

## Failure interpretation

A failure must not be hidden by interpolation, extra damping, a looser threshold, delayed measurement or a reset.

Interpretation guide:

- immediate jump failure -> state-transfer/rebind kinematics are wrong before the solver even acts;
- first-step gap/velocity/speed failure with immediate continuity passing -> fresh constraint reconstruction under load is introducing a solver-visible shock;
- control fails to separate -> fixture is non-discriminating and must be redesigned, not accepted;
- settled precondition fails -> the fixture never established the intended sustained load and is inconclusive.

## Explicit non-claims

A pass will **not** prove:

- Box3D warm-start/joint-cache migration;
- exact equality with uninterrupted solver history;
- contact-manifold continuity;
- active ground/support contact during CUT;
- arbitrary load magnitude or impact load;
- multiple relations or closed loops;
- motors, limits, power or FUNCTION semantics;
- cutting through the bearing itself;
- generic Relation/Constraint architecture;
- in-place mutation of one persistent populated Box3D world.

## Continuation if C0 passes

Do not automatically add many load variants.

The next question should be chosen from the remaining uncertainty:

1. **C1 contact-loaded rebind** only if active contact/manifold loss is still the highest-value continuity risk; or
2. move to **local FUNCTION / actuation** if C0 demonstrates that the cold reconstructed bearing remains stable under sustained external load and contact continuity is not yet needed by the next machine hypothesis.

Choose by information gain, not by sequence ritual.
