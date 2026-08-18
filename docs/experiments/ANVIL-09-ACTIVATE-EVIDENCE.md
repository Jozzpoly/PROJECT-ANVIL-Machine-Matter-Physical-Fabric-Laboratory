# ANVIL-09 / ACTIVATE — Evidence Log

Status: **SUPPORTED FOR FROZEN FIXTURE / PROMOTED**

Canonical preflight: `docs/experiments/ANVIL-09-ACTIVATE-PREFLIGHT.md`.
Evidence-driven gate correction: `docs/experiments/ANVIL-09-ACTIVATE-PREFLIGHT-AMENDMENT-01.md`.

## Research question

Can one unchanged persistent local TORQUE-PATCH with signed `+100 N*m` effort be compiled once and then transiently switched `OFF -> ON -> OFF` inside runtime such that:

- default OFF is mechanically inert;
- ON reproduces the already-earned causal torque response;
- returning to OFF removes further active torque without braking, locking or commanding zero velocity;
- a fresh runtime reconstructed from the exact same persistent compilation defaults OFF;
- authored source and compiled construction/function meaning remain unchanged; and
- Box3D revolute motor state is not used as the control ontology or actuation mechanism?

The single uncertainty under test was whether **persistent function/action meaning and transient activation state can occupy separate lifecycle domains**.

## Frozen semantic boundary

ANVIL-09 deliberately preserved the already-supported signed authored action:

```text
persistent TORQUE-PATCH effort = +100 N*m
transient activation           = OFF | ON
OFF                            = apply no active torque
ON                             = apply the accepted +100 N*m torque pair
```

Transient reverse command was rejected before implementation because ANVIL-05/06 had already earned signed `effortNm` as persistent authored meaning. Allowing a runtime `-1` command to reverse a persistent `+100 N*m` action would have silently reinterpreted that meaning as a bidirectional actuator rating/capacity.

Activation remained experiment-local runtime state. It was not added to authored Matter, `TorquePatch`, persistent bearing identity, accepted compilation schemas, project serialization or `src/foundation`.

`OFF` never means brake, servo, target-zero-speed, bearing lock or direct velocity edit.

Original frozen preflight source:

```text
d5d3241ad40081d1fa5e80cef1dcf2e451ed7b70
```

## A/B — persistent/transient boundary

Exact source and Draft/core evidence:

```text
source head    60144f1a86de68128970da1c51a66ca4c296b53e
Actions run    32194089479
Node suite     47/47 PASS
production     build PASS
```

The experiment-local `ActivateControlState`:

- retained the exact `TorquePatchCompilation` object supplied to it;
- defaulted to `OFF`;
- accepted only `OFF` or `ON` and failed closed otherwise;
- returned zero active torque when OFF;
- returned clones of the already-compiled accepted equal/opposite torque pair when ON;
- did not compile source itself;
- did not expose Box3D body/joint IDs;
- contained no Box3D motor, motor-speed or direct angular-velocity control path;
- did not mutate authored source or persistent compilation.

No `src/foundation` file and no accepted ANVIL-05/06 source semantic was changed.

## C0-C3 — real Box3D activation lifecycle

ANVIL-09 introduced an experiment-local `ActivatePhysics` runtime rather than refactoring the accepted TORQUE runtime. It recreates the accepted two-body passive-BEARING fixture using the pinned real Box3D binding and conditionally supplies the already-compiled body-torque pair only while activation is ON.

Runtime isolation:

```text
Box3D version           0.1.0
gravity                 0
contacts                disabled
body linear damping     0
body angular damping    0
sleep                    disabled
runtime bodies           2
runtime revolute joints  1
fixed timestep           1/60 s
substeps                 4
```

Actuation uses `b3Body_ApplyTorque`. No revolute motor or angular-velocity setter is used.

### First executable C0-C3 result — meaningful RED

```text
source head      ae460c79949b38b85f1d60874a5abb3898edab55
Actions run      32194408369
PR integration   29a5d88cce185751b091a5967dbf47eabe8ba7de
result           RED — 48/49 tests PASS
```

The only failed assertion was one original frozen C2 sub-gate:

```text
absolute relative-speed change after ON -> OFF <= 0.15 rad/s
observed                                              0.35872262716293335 rad/s
```

No runtime code or threshold was changed in response to this first red result.

A diagnostic-only follow-up moved raw logging ahead of the unchanged C2/C3 assertions so the full branch behavior could be observed without changing runtime physics, schedule or gates:

```text
diagnostic source   86d4def359fe9c7ee2044c39ec9dd81c096ee6e1
Actions run         32194525529
PR integration      09a9f4127dc3af74b476e0911a8e5baa23d2a044
result              RED — same unchanged C2 sub-gate
```

### Full diagnostic metrics

Both worlds used the same authored source and the same compiled object. They were identical through the shared OFF and ON phases.

#### O0 — 60 steps OFF

```text
angle                          -2.385185826625502e-9 rad
relative angular speed          8.944889168011234e-14 rad/s
bearing gap                     2.2210371941378227e-8 m
linear momentum magnitude       2.771116999807286e-12 kg*m/s
barycenter drift                0 m
```

Default OFF was inert with large margin.

#### A0 — 60 steps ON

```text
angle                           1.341995120048523 rad
relative angular speed          2.067047953605652 rad/s
bearing gap                     0.00004925057812860967 m
linear momentum magnitude       0.00009302863674606423 kg*m/s
barycenter drift                1.0235663209029892e-7 m
```

Both runtime worlds remained numerically identical at the branch point and reproduced the accepted causal TORQUE behavior within the predeclared broad gates.

#### O1 — 30 further steps OFF

```text
angle                           2.2677412033081055 rad
relative angular speed          1.7083253264427185 rad/s
bearing gap                     0.000026581670287417437 m
linear momentum magnitude       0.00010524988782029129 kg*m/s
barycenter drift                1.0945933316843767e-7 m
angle increase from A0          0.9257460832595825 rad
speed change from A0           -0.35872262716293335 rad/s
```

The mechanism remained strongly positive in motion and continued rotating in the existing direction. OFF did not stop, reverse, lock or reset the mechanism.

#### C1 control — identical 30-step interval, still ON

```text
angle                           2.419570207595825 rad
relative angular speed          2.258965849876404 rad/s
bearing gap                     0.000055536140354235326 m
linear momentum magnitude       0.00011670028261734618 kg*m/s
barycenter drift                1.2624327629206633e-7 m
continued-ON speed advantage    0.5506405234336853 rad/s
```

The continued-ON control exceeded the OFF branch by `0.5506405234336853 rad/s`, comfortably above the **pre-frozen** C3 causal discriminator of `>= 0.25 rad/s`.

### Classification and correction of the red C2 sub-gate

The original `<= 0.15 rad/s` C2 sub-gate assumed that, after active torque is removed in the isolated fixture, the measured **relative revolute-coordinate speed** should remain almost constant.

That assumption is not a valid invariant for this asymmetric two-rigid-body revolute system. Removing the external active torque pair does not imply conservation of one generalized relative joint coordinate speed. Passive constraint dynamics and configuration-dependent redistribution through the bodies' inertia can change that coordinate speed without introducing a brake or servo.

The physically relevant causal discriminator is the difference between an otherwise identical world where active torque is removed and one where it continues. That comparison had already been frozen independently as C3 before any executable ANVIL-09 result, and it separated strongly.

Classification:

**PREFLIGHT PHYSICAL-DISCRIMINATOR DEFECT — NOT AN ACTIVATE PHYSICAL FALSIFICATION.**

The correction was recorded immutably in `ANVIL-09-ACTIVATE-PREFLIGHT-AMENDMENT-01.md`.

Correction checkpoint:

```text
source head    64498d2b1eeb84baaa158f979f27970fef4f5f20
Actions run    32194696873
result         C0-C3 PASS + production build PASS
```

Exactly one original C2 condition was revoked:

```text
absolute relative-speed change after OFF <= 0.15 rad/s
```

No replacement post-hoc numeric threshold was introduced. The runtime implementation was unchanged. All other frozen C0-C3 conditions, including the original `>= 0.25 rad/s` continued-ON separation gate, remained unchanged.

## C4 — reconstructed runtime forgets transient activation

Exact source and Draft/core result:

```text
source head      d0b8b95e345781d21c5296751dcccbba1d30522e
Actions run      32194805534
PR integration   867b80a1ea45849e695a5a86590581c80e9395b3
Node suite       50/50 PASS
production       build PASS
```

C4 first created a runtime from the persistent compilation, explicitly activated it and observed real positive motion. That runtime was then disposed. A fresh runtime was created from the **exact same persistent compilation object** with no activation restoration command.

Observed reconstructed-default-OFF state after 60 steps:

```text
activation                       OFF
angle                           -2.385185826625502e-9 rad
relative angular speed           8.944889168011234e-14 rad/s
bearing gap                      2.2210371941378227e-8 m
linear momentum magnitude        2.771116999807286e-12 kg*m/s
barycenter drift                 0 m
```

The fresh runtime therefore did not inherit transient ON state from the disposed runtime, while the authored source and persistent compilation remained unchanged.

## Meso stop decision

After A/B + corrected C0-C3 + C4, the primary bounded question was considered sufficiently resolved.

Research stop rule was activated before Ready qualification:

- no reverse command;
- no analog throttle;
- no routing, IDs, ports, buses or controllers;
- no sensors or feedback;
- no UI/keyboard input merely for demonstration;
- no power/energy semantics;
- no CUT/REBIND composition;
- no compliance composition;
- no additional solver variants merely to accumulate PASS results.

## Ready qualification — stale merge-ref incident

The first Ready-triggered run was **not** accepted as promotion evidence.

```text
Ready run       32195113438
source head     d0b8b95e345781d21c5296751dcccbba1d30522e
```

Although that run began after newer takeover metadata had landed on `main`, GitHub supplied an older PR merge ref based on the pre-grounding `main`. Its core job passed, but the integration tree was stale relative to the live base. The candidate job was later cancelled automatically by workflow concurrency when the branch was synchronized.

Classification:

**PROVENANCE / STALE PR MERGE-REF INCIDENT — NOT SCIENTIFIC OR PRODUCT FAILURE.**

This run is preserved as operational history but is not part of the promotion qualification.

To obtain an exact current integration candidate without changing the scientific PR diff, the branch was synchronized with grounded `main` using merge commit:

```text
synchronized source head   d61a6649be4a9f882bb717aabe07ac470ff542c1
current main parent         dac6fa160821bb028971cca3bfc9d18c4c0b8469
prior scientific parent    d0b8b95e345781d21c5296751dcccbba1d30522e
```

Relative to the prior scientific head, this synchronization added only the three already-existing takeover metadata files from `main`. Relative to current `main`, the PR still changed exactly the same seven ANVIL-09 files. No runtime, test criterion or scientific result changed.

## Qualified Ready candidate

Exact promotion-qualified identity:

```text
Ready run          32195221850
base main          dac6fa160821bb028971cca3bfc9d18c4c0b8469
source head        d61a6649be4a9f882bb717aabe07ac470ff542c1
synthetic merge    e7c7659ac9afc6ad29f4d2514bbaa1ec95f2a64e
qualified tree     e2adf2ef0a4c9c0ce461113cafc4fe7706ca0135
Node suite         50/50 PASS
production build   PASS
launcher self-test PASS
Chromium regression 19/19 PASS
```

Exact-build artifact handoff:

```text
staging artifact ID      9345607020
staging size             424986 bytes
staging SHA256           5e40bafdeded471a90b1a8996d97d5a02138935408d5b6c0c5a620daed7010f0

final artifact ID        9345638922
final size               424986 bytes
final SHA256             56891a302464530077bb29fd744001e33d97b27ae543003ee3725e4363669cb4
```

The candidate job downloaded artifact `9345607020` produced by the core job from the exact same run and verified the same staging SHA-256 before launcher and Chromium execution. It did not rebuild a parallel candidate.

The launcher self-test passed. The existing production Chromium regression suite passed `19/19`.

These launcher/Chromium results are **whole-product regression evidence only**. ANVIL-09 did not introduce a browser-specific scientific uncertainty or dedicated ACTIVATE browser route, so Class D is not misrepresented as direct activation-physics evidence.

## Promotion identity

PR #14 was merged only after re-locking live base/head and using expected-head protection.

```text
promoted source head   d61a6649be4a9f882bb717aabe07ac470ff542c1
actual material merge  a024c8cb134aabe0033ea2990068e6479c3da2b5
actual merge tree      e2adf2ef0a4c9c0ce461113cafc4fe7706ca0135
```

The actual material merge tree is **identical** to the Ready-qualified synthetic tree.

## Supported interpretation

ANVIL-09 supports the following bounded statement:

> In the accepted single-bearing TORQUE-PATCH fixture, one unchanged persistent signed torque action can be compiled once and transiently switched OFF/ON/OFF at runtime; OFF supplies no active torque rather than braking, ON reproduces the accepted causal torque response, and a fresh runtime reconstructed from the same persistent compilation defaults OFF, without moving activation into authored/compiled truth or using Box3D motor semantics.

This is the first supported ANVIL result in which one already-earned persistent active function/action and one explicitly shorter-lived transient activation state occupy different lifecycle domains.

It is not evidence for a generic Control architecture.

## Owner validation decision

No owner/manual gate was required. The unresolved claim was quantitative, causal and lifecycle-specific, and the direct real-solver observations plus negative/control branch discriminate it more precisely than a manual visual repetition would.

## Explicit non-claims

ANVIL-09 does not establish:

- transient reverse or directional command;
- analog throttle or command-magnitude scaling;
- that signed `effortNm` is a motor rating, capacity or maximum torque;
- generic FUNCTION/device ontology;
- generic Control, Signal, Port, Bus or Controller architecture;
- multiple command targets or routing;
- sensors, logic, feedback or user-input mapping;
- servo speed/angle targets or braking semantics;
- saturation, efficiency, thermal limits or damage;
- energy source/storage/conservation or power networks;
- persistence/restoration of control state across saved sessions;
- command continuity through CUT/REBIND;
- active-function continuity through runtime topology reconstruction;
- contact-loaded activation;
- arbitrary orientation/covariance of active lowering;
- multiple bearings or arbitrary mechanisms;
- function through compliant matter;
- a reason to promote ACTIVATE, TorquePatch, FUNCTION or Control into `src/foundation`.

## Next decision boundary

Do not extend ANVIL-09 with adjacent control features.

A fresh post-promotion Research Compass audit should compare composition candidates again. The current leading hypothesis is **active command/function continuity through REBIND**, because ANVIL now has separately earned transient activation semantics and topology reconstruction semantics. That direction is not frozen or active merely because it is currently leading.
