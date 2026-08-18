# ANVIL-05 / TORQUE — Evidence Log

Status: **C0 + D0 SUPPORTED / PROMOTED**

Canonical preflight: `docs/experiments/ANVIL-05-TORQUE-PREFLIGHT.md`.

## Research question

Can one minimal persistent authored torque function act through the already-earned BEARING semantics and produce controlled mechanical work without encoding a Box3D joint motor, runtime body/joint IDs, signal graph or power network in authored source?

## Bounded authored contract

Experiment-local only:

```text
TorqueMark {
  id
  bearingId
  effortNm
}
```

`bearingId` references persistent authored BEARING identity. `effortNm` is signed finite torque. The mark contains no Box3D body/joint IDs.

For a compiled bearing axis `a` and signed authored effort `T`, the experiment lowers to:

```text
tau_A = -T * a
tau_B = +T * a
```

The runtime uses a passive stock revolute relation and applies the two world-space body torques every fixed step. It does **not** enable Box3D revolute motor mode.

An ideal external energy reservoir is assumed. Energy source/storage/efficiency/control are outside the claim.

## Binding capability precheck

Exact pinned `box3d.js@0.0.2` exposes `b3Body_ApplyTorque`.

```text
source head   9f6ec8374b33b16107cc8936fe036d605726b19a
Actions run   32136766823
Node suite    35/35 PASS
```

No angular-velocity edit or synthetic actuator was substituted.

## C0 — signed causal torque

Common fixture:

```text
same accepted 7-cell BEARING matter
2 dynamic runtime bodies
1 passive revolute relation
bearing axis Z
initial state at rest
gravity 0
contacts disabled
60 fixed 60 Hz steps
```

Three otherwise identical authored variants:

```text
POSITIVE  +100 N*m
CONTROL      0 N*m
NEGATIVE  -100 N*m
```

Final supported core checkpoint:

```text
source head      771fa2405f5710350f0cca0a3083f7b988a9d9c3
PR checkout      01a2a26b00ce0b8dc6077f9dc92edd0ea4af5409
Actions run      32137161758
Node suite       37/37 PASS
```

Observed C0:

```text
POSITIVE
  angle                         +1.3419954776763916 rad
  relative angular speed        +2.0670482516288757 rad/s
  bearing gap                    0.000049233987869452365 m
  linear momentum magnitude      0.000019761076191093114 kg*m/s
  barycenter drift               8.981152564359765e-8 m

CONTROL
  angle                         -2.385185826625502e-9 rad
  relative angular speed         8.944889168011234e-14 rad/s
  bearing gap                    2.2210371941378227e-8 m
  linear momentum magnitude      2.771116999807286e-12 kg*m/s
  barycenter drift               0 m

NEGATIVE
  angle                         -1.435699701309204 rad
  relative angular speed        -2.223932206630707 rad/s
  bearing gap                    0.000056575156412026675 m
  linear momentum magnitude      0.00019186597667621014 kg*m/s
  barycenter drift               5.1969100827768783e-8 m
```

All frozen physical gates passed with large margin. The sign of authored effort causally changes the sign of relative rotation; zero effort remains near rest. The equal/opposite pair does not create material linear thrust in this bounded fixture.

### Historical red run — classification

The first full C0 source `7b43946103893c36f475dc6a4b3b02dad04f26d5` ran as Actions `32137053186` and was red `36/37` even though the physical C0 test passed with the same metrics later accepted above.

The only failure was a test assertion comparing the zero control vector with `deepStrictEqual`:

```text
actual   { x: -0, y: -0, z: -0 }
expected { x:  0, y:  0, z:  0 }
```

IEEE signed zero arose naturally from `-1 * 0`. The correction changed only the representation-level assertion to `magnitude <= 1e-12`; runtime code and all frozen physical thresholds were unchanged.

Classification: **TEST REPRESENTATION DEFECT / NOT A PHYSICAL FALSIFICATION**.

## D0 — production Chromium

A technical production route exists at:

`/?experiment=torque`

It executes all three variants through the production bundle and publishes fail-closed raw metrics. A separate Playwright observer independently parses those raw values and re-applies the frozen thresholds instead of trusting the page's PASS state.

Frozen promoted candidate:

```text
source head       9ed7623df32ca30c147a585b43e43d008c772508
base main         3b422cd7e085c656cc2f91f3a60ca08be5ec1c8f
synthetic merge   49f145a56c5c9aee7ad73017eeca89548055cee1
synthetic tree    482cb40ac131fc16b22fba72eb0ed202a63d38ee
Ready run         32137653388
Node suite        37/37 PASS
Chromium suite    19/19 PASS
```

Lean exact-build handoff:

```text
staging artifact ID      9324599263
staging SHA256            2f3a1760e8df2375b877c869a4149c879be1c57efa5a4bdaf3f6a23945c1e134
final artifact ID        9324665656
final artifact SHA256    28ea22c513d741b4224c3deb32ee99bac03a044f8808e5096aae35158a29e602
```

The candidate job downloaded the exact staging artifact produced by core before launcher and Chromium validation.

Observed TORQUE-D0 metrics match supported C0 exactly:

```text
positive angle                 +1.3419954776763916 rad
control angle                  -2.385185826625502e-9 rad
negative angle                 -1.435699701309204 rad
positive speed                 +2.0670482516288757 rad/s
control speed                   8.944889168011234e-14 rad/s
negative speed                 -2.223932206630707 rad/s
positive gap                    0.000049233987869452365 m
negative gap                    0.000056575156412026675 m
positive linear momentum        0.000019761076191093114 kg*m/s
negative linear momentum        0.00019186597667621014 kg*m/s
positive barycenter drift       8.981152564359765e-8 m
negative barycenter drift       5.1969100827768783e-8 m
```

D0 result: **SUPPORTED**.

## Promotion identity

PR #10 was merged with expected-head protection after verifying candidate head/base identity.

```text
promoted source head   9ed7623df32ca30c147a585b43e43d008c772508
actual merge           aee8b210758be82b1cfefe8d8ac2fb3ca94d27c6
actual merge tree      482cb40ac131fc16b22fba72eb0ed202a63d38ee
```

The actual merge tree is identical to the synthetic merge tree that passed the Ready candidate gate.

## Supported interpretation

For this bounded two-body bearing fixture, a persistent authored signed torque intent can be resolved through persistent BEARING identity and lowered to a disposable equal/opposite runtime torque pair. The sign of authored effort causally controls the sign of mechanical relative motion, zero effort remains inactive, the passive bearing remains intact, and no material linear thrust is introduced by the internal torque pair within the declared bounds.

This is the first supported **active Machine Matter** result in ANVIL, but it is intentionally much narrower than a generic FUNCTION system.

## Owner validation decision

No Forge owner gate was used. The new evidence is quantitative and causal (`+ / 0 / -` with direct solver measurements), and production Chromium can verify it more precisely than another manual visual A/B repetition. Owner validation remains available if a later experiment introduces feel, usability or ambiguous visible continuity.

## Explicit non-claims

ANVIL-05 does not prove:

- a generic FUNCTION/device ontology;
- electrical/mechanical power generation or storage;
- actuator energy conservation or efficiency;
- signals, ports, buses, logic or control runtime;
- runtime command/activation semantics;
- user input mapping;
- servo/target-speed behavior;
- Box3D joint motor correctness;
- torque saturation, thermal behavior or damage;
- arbitrary orientation/covariance of active-function lowering;
- contact-loaded actuation;
- actuation continuity through CUT/REBIND;
- multiple bearings, closed loops or arbitrary mechanisms;
- universal spatial inference of function from nearby matter.

## Next decision boundary

Do not turn TORQUE into a device catalog or power network.

Two high-value next questions are now distinct:

1. **activation/command separation** — can the same persistent authored torque capability remain unchanged while transient runtime command changes `off / forward / reverse`, proving that construction semantics and control state are separate; or
2. **TORQUE + REBIND** — can active intent follow persistent bearing identity when disposable runtime body IDs change during CUT.

Choose between them by information gain before coding. Do not combine command semantics and runtime rebuild in the same first follow-up.
