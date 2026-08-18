# ANVIL-04 / LOAD-REBIND — preflight

Status: **DRAFT / C0 + C1 SUPPORTED / D0 CHROMIUM PENDING**

## Primary question

Can the accepted ANVIL-03 semantic bearing rebind survive a runtime rebuild while the old bearing is carrying a sustained external constraint load, without a gross first-step shock when the old Box3D joint and its internal solver history are discarded?

This is a bounded **cold relation reconstruction under load** experiment. It is not joint-cache migration.

## Why this is the next falsifier

ANVIL-03 already proved more than a purely unloaded hinge: its free rotating fixture required real constraint work to keep the pivot coincident. What it did not establish is a bearing that has been solving a strong, sustained externally imposed load immediately before rebuild.

ANVIL-04 changes one primary physical assumption: the relation is deliberately preloaded by an experiment-harness force pair.

Do not add contact manifolds, static/infinite-mass supports, motors, limits, authored power/function or generic relation architecture to C0/C1.

## Common fixture — direct tensile preload at the bearing

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

The pair has zero net external force. Because each force is applied at the material bearing anchor, the bearing constraint must carry the tensile load without introducing an authored motor/function or environmental support body.

This external force pair is **test instrumentation only**. It is not Machine Matter FUNCTION semantics and must not be promoted as authored actuation.

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

Exact pinned `box3d.js@0.0.2` must expose:

- `b3Body_ApplyForce`;
- `b3Joint_GetConstraintForce`.

This capability precheck passed before C0 implementation. If either capability disappears in a later binding change, ANVIL-04 evidence must not be silently substituted with a synthetic force model.

# C0 — loaded equilibrium

C0 starts both bodies at rest and applies the force pair for 120 solver steps before CUT. This is the cleanest direct test that a warm old joint carrying a known 2.5 kN tensile load can be replaced by a fresh relation without an immediate solver kick.

## C0 frozen gates

### Structural / semantic

- source cells: exactly `7 -> 7`;
- runtime bodies: exactly `2 -> 3`;
- source bearing: exactly `1 -> 1`;
- bearing endpoint runtime body must change across CUT;
- no source additions/removals;
- all runtime bodies remain dynamic;
- gravity is zero;
- no contacts.

### Pre-CUT loaded state

After 120 loaded steps:

- commanded tensile load exactly `2500 N` per side;
- measured Box3D bearing constraint-force magnitude `2000..3000 N`;
- maximum body COM speed <= `0.001 m/s`;
- maximum body angular speed <= `0.001 rad/s`;
- bearing gap <= `0.0025 m`.

### Immediate rebuild continuity

Before the new solver takes a step:

- maximum bearing-anchor position jump <= `0.00007 m`;
- maximum bearing-anchor material-point velocity jump <= `0.00007 m/s`.

### First post-rebuild solver step

- bearing anchor gap <= `0.0005 m`;
- relative bearing-anchor velocity <= `0.02 m/s`;
- maximum linear speed of any after-CUT body <= `0.1 m/s`;
- measured fresh-bearing constraint-force magnitude `1500..3500 N`.

### Continued behavior / control

After 60 loaded post-CUT steps:

- reconstructed-bearing anchor gap <= `0.0025 m`;
- all constrained runtime state finite;
- no-bearing control anchor gap >= `1.0 m`.

## C0 result boundary

C0 executed and passed all gates. Its strong result did **not** close ANVIL-04 because equilibrium at the exact constrained anchor could be unusually easy for a cold solver. C1 was added only to attack that remaining live assumption.

# C1 — moving + loaded rebind

C1 combines the accepted ANVIL-03 moving rigid-field fixture with the same 2.5 kN external preload.

Before CUT:

- use the same two-body motion family as ANVIL-03 C0:
  - common drift `(0.8, -0.25, 0.35) m/s`;
  - A angular velocity `(0, 0, -0.65) rad/s`;
  - B angular velocity `(0, 0, +0.95) rad/s`;
  - COM velocities chosen from the rigid velocity field around the shared pivot;
- apply the 2.5 kN force pair at the moving bearing anchors for 31 steps;
- CUT and reconstruct exactly as C0;
- continue the same load on the new endpoints.

The load at the shared anchor has no intended generalized torque about the revolute degree of freedom. Therefore C1 stresses simultaneous **motion continuity + constraint reaction**, rather than introducing a motor.

## C1 frozen gates

These thresholds were declared after C0 but **before the first C1 execution**.

### Pre-CUT sensitivity

- measured constraint-force magnitude `2000..6000 N`;
- bearing gap <= `0.0025 m`;
- relative angular speed about Z >= `1.0 rad/s`;
- all state finite.

### Immediate rebuild continuity

- max anchor position jump <= `0.00007 m`;
- max anchor material-point velocity jump <= `0.00007 m/s`.

### First fresh solver step under load

- bearing anchor gap <= `0.0005 m`;
- relative anchor velocity <= `0.02 m/s`;
- measured constraint-force magnitude `1500..7000 N`;
- all state finite.

No absolute body-speed ceiling is used in C1 because the fixture is intentionally moving before the transaction.

### Continued behavior / causal control

After 60 loaded post-CUT steps:

- constrained bearing gap <= `0.0025 m`;
- no-bearing control gap >= `1.0 m`;
- constrained relative angular speed about Z >= `0.2 rad/s` so the relation has not become a hidden weld/freeze;
- all constrained/control state finite.

## C1 result boundary

C1 executed and passed all frozen gates. The exact measurements and source/run identities are recorded in `ANVIL-04-LOAD-REBIND-EVIDENCE.md`.

C0 + C1 are sufficient for the solver-level load question. Do **not** add arbitrary force levels or more motion variants just to accumulate green tests.

The remaining ANVIL-04 uncertainty is Class D only: the new force-application and joint-force-observation path must execute through the production browser bundle and be independently re-checked by Chromium. Manual owner validation is not required unless that browser gate exposes a genuinely visual ambiguity.

## Failure interpretation

A failure must not be hidden by interpolation, damping, threshold loosening, delayed measurement or reset.

- precondition failure -> fixture did not establish the intended loaded state;
- immediate jump failure -> transfer/rebind kinematics are wrong before solver response;
- first-step failure with immediate continuity passing -> cold relation reconstruction under external load produces a solver-visible transient outside the declared bound;
- control failure -> fixture is non-discriminating;
- C0 PASS + C1 FAIL -> static load reconstruction works, but loaded moving continuity remains unsupported.

## Explicit non-claims

A C0+C1 pass will **not** prove:

- migration of Box3D warm-start/joint-cache internals;
- exact equality with uninterrupted solver history;
- contact-manifold continuity;
- active contact during CUT;
- arbitrary load magnitude/direction or impact load;
- multiple relations or closed loops;
- motors, limits, power or FUNCTION semantics;
- cutting through the bearing itself;
- generic Relation/Constraint architecture;
- in-place mutation of one persistent populated Box3D world.

## Continuation after D0

If production Chromium reproduces C1 with the independent observer:

- do not create a redundant Forge owner package;
- promote the exact Ready head after checking unchanged base/head identity and candidate evidence;
- record final D0 metrics in the evidence log after merge;
- choose the next research question by information gain.

The two leading next questions remain:

1. contact-loaded continuity, if active contact/manifold loss is still the highest-value blocker; or
2. local FUNCTION / actuation, if external-load continuity is sufficient foundation for the next machine hypothesis.
