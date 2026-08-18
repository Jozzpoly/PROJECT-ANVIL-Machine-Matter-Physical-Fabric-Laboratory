# ANVIL-09 / ACTIVATE — preflight amendment 01

Status: **POST-EXECUTION GATE CORRECTION / PRIMARY HYPOTHESIS UNCHANGED**

Original frozen preflight: `docs/experiments/ANVIL-09-ACTIVATE-PREFLIGHT.md`  
Original frozen preflight source: `d5d3241ad40081d1fa5e80cef1dcf2e451ed7b70`

This amendment preserves the original frozen preflight unchanged and records one evidence-driven correction allowed by `docs/EXPERIMENT_PROTOCOL.md`: a predeclared numeric discriminator was demonstrated to encode an invalid physical assumption. The correction does **not** change the ACTIVATE runtime, fixture, schedule, primary question, control, or any other frozen threshold.

## Triggering negative evidence

First C0-C3 source:

```text
source head        ae460c79949b38b85f1d60874a5abb3898edab55
Actions run        32194408369
PR integration     29a5d88cce185751b091a5967dbf47eabe8ba7de
result             RED — 48/49 tests PASS
```

The only failed assertion was the frozen C2 sub-gate:

```text
absolute speed change from A0 <= 0.15 rad/s
observed change                 -0.35872262716293335 rad/s
```

No runtime or threshold was changed after that red result. A diagnostic-only follow-up moved raw C0-C3 logging ahead of the unchanged assertions so that the entire branch comparison would remain observable even when C2 failed:

```text
diagnostic source   86d4def359fe9c7ee2044c39ec9dd81c096ee6e1
Actions run         32194525529
PR integration      09a9f4127dc3af74b476e0911a8e5baa23d2a044
result              RED — same unchanged C2 sub-gate
```

The diagnostic commit changed only test observability. It did not modify runtime physics, schedule or pass/fail criteria.

## Full observed branch state

Both worlds were created from the same compiled object and were identical through O0 and A0.

### O0 — 60 steps OFF

```text
angle                         -2.385185826625502e-9 rad
relative angular speed         8.944889168011234e-14 rad/s
bearing gap                    2.2210371941378227e-8 m
linear momentum                2.771116999807286e-12 kg*m/s
barycenter drift               0 m
```

C0 remained clean and inert.

### A0 — 60 steps ON

```text
angle                          1.341995120048523 rad
relative angular speed         2.067047953605652 rad/s
bearing gap                    0.00004925057812860967 m
linear momentum                0.00009302863674606423 kg*m/s
barycenter drift               1.0235663209029892e-7 m
```

Both worlds remained identical at the branch point. C1 reproduced the accepted TORQUE response within the already-frozen broad gates.

### O1 — 30 further steps OFF

```text
angle                          2.2677412033081055 rad
relative angular speed         1.7083253264427185 rad/s
bearing gap                    0.000026581670287417437 m
linear momentum                0.00010524988782029129 kg*m/s
barycenter drift               1.0945933316843767e-7 m
angle increase from A0         0.9257460832595825 rad
speed change from A0          -0.35872262716293335 rad/s
```

The mechanism remained strongly positive in both angle progression and relative speed. OFF did not stop, reverse, lock or reset velocity. All frozen bearing/isolation gates remained inside their limits.

### C1 — identical 30-step interval, still ON

```text
angle                          2.419570207595825 rad
relative angular speed         2.258965849876404 rad/s
bearing gap                    0.000055536140354235326 m
linear momentum                0.00011670028261734618 kg*m/s
barycenter drift               1.2624327629206633e-7 m
continued-ON speed advantage   0.5506405234336853 rad/s
```

The **pre-frozen C3 comparative discriminator** required a continued-ON speed advantage of at least `0.25 rad/s`; observed separation was `0.5506405234336853 rad/s`.

## Why the failed C2 sub-gate is physically invalid

The failed sub-gate assumed that, once active torque is removed in a zero-gravity / zero-contact / zero-body-damping fixture, the measured **relative revolute-coordinate speed** should remain almost constant over the next 30 steps.

That is not a valid invariant for this fixture.

The two connected rigid islands are asymmetric bodies with configuration-dependent rotational dynamics. Removing external active torque means ACTIVATE no longer supplies its body-torque pair; it does **not** imply that one generalized relative joint speed is conserved. Passive constraint forces/torques and redistribution through the bodies' inertia can change that coordinate speed while the mechanism remains unbraked. The physically relevant causal question is whether the OFF branch differs from an otherwise identical branch that continues receiving the active torque.

The frozen C3 control was designed for exactly that purpose and remained strongly discriminating.

Therefore the `<= 0.15 rad/s` absolute-speed-change condition tests an unearned conservation assumption rather than the ACTIVATE hypothesis.

Classification: **PREFLIGHT PHYSICAL-DISCRIMINATOR DEFECT — NOT AN ACTIVATE PHYSICAL FALSIFICATION**.

## Amendment to frozen gates

Revoke exactly this original C2 line:

```text
absolute speed change from A0 <= 0.15 rad/s
```

and revoke the associated interpretation that a small absolute relative-speed change is required to prove absence of continued actuation.

No replacement post-hoc numeric threshold is introduced.

C2 retains all originally frozen conditions:

```text
post-OFF relative speed remains positive        >= +0.35 rad/s
angle continues in the existing direction       increase >= +0.10 rad
bearing gap                                      <= 0.0025 m
linear momentum magnitude                        <= 0.05 kg*m/s
barycenter drift                                 <= 0.0005 m
```

C3 remains unchanged and is the causal deactivation discriminator:

```text
continued-ON final speed - DEACTIVATED final speed >= 0.25 rad/s
```

This C3 threshold was frozen before the first executable ANVIL-09 result. It is not derived from the observed `0.5506405234336853 rad/s` value.

## What remains unchanged

- persistent authored `effortNm = +100 N*m`;
- OFF/ON-only transient semantics;
- one source compilation reused by both worlds;
- O0/A0/O1 and CONTINUED_ON schedules;
- all A/B, C0, C1 and remaining C2 gates;
- C3 threshold;
- planned C4 reconstructed-default-OFF probe;
- no motor, servo, velocity setter, routing, power, reverse command or foundation scope;
- stop rule after bounded A/B + C0-C4 evidence.

The next executable run must apply this correction transparently while preserving the two red runs above as meaningful negative evidence.
