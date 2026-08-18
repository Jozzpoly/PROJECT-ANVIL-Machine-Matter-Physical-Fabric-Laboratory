# ANVIL-09 / ACTIVATE — preflight

Status: **FROZEN BEFORE IMPLEMENTATION / NO EXECUTABLE RESULT YET**

Strategic source: `docs/RESEARCH_COMPASS.md`.
Accepted base at freeze: `c1d9a42dd8668d98eefed847f649628af99a1c2e`.

## Decision record — why this falsifier

ANVIL-08 completed the planned representation/scaling challenge. The Research Compass composition rule now favors composing already-earned semantics instead of adding another isolated primitive.

The leading candidates were challenged before selecting this experiment.

### Candidate A — ACTIVATE

Test whether transient activation can modulate an already-earned persistent local function/action without mutating authored construction/function meaning or becoming solver motor state.

Information value:

- opens the almost-untested Control/Signal frontier with the smallest possible state;
- composes TORQUE-PATCH + TORQUE + BEARING rather than inventing a new actuator;
- directly attacks the current conflation between persistent authored active intent and whether that intent is presently being applied;
- establishes lifecycle semantics needed before a later command-through-REBIND experiment can be interpreted cleanly.

Risk:

- a naive `command * torque` demo could be nearly tautological and therefore low-information;
- an `OFF / FORWARD / REVERSE` design would silently reinterpret the already-supported signed `effortNm` as a bidirectional capacity, which ANVIL-05/06 did not establish.

Resolution:

- keep the accepted signed `+100 N*m` TORQUE-PATCH unchanged;
- test **OFF / ON only**;
- require one-runtime state transitions plus reconstruction reset, so the experiment tests actual transient lifecycle rather than merely comparing two constructor configurations.

### Candidate B — TORQUE x REBIND

Test whether persistent active torque semantics follow the correct source matter across a runtime topology rebuild.

Strengths:

- very high composition value;
- uses already-earned TORQUE/TORQUE-PATCH and REBIND semantics;
- would close a real continuity non-claim.

Why not first:

- topology/continuity is already substantially tested by REBIND and LOAD-REBIND;
- Control/Signal remains almost completely untested;
- without first defining whether activation is persistent or transient, a later active-command rebind result would mix two lifecycle questions.

Disposition: strong successor after ACTIVATE if the macro audit still ranks it highly.

### Candidate C — FUNCTION x COMPLIANCE

Test active function composed with the new compliant binding result.

Strengths:

- high long-horizon vision alignment;
- would force two recently earned semantics to interact.

Why not first:

- failure could come from active-function lowering, compliant lowering, distributed anchors, rotational coupling or their composition;
- ANVIL-08 is intentionally one-dimensional and does not yet support the distributed rotational modes a torque/compliance composition would naturally excite;
- information attribution is therefore weaker and implementation cost higher.

Disposition: later composition candidate, not the next falsifier.

### Candidate D — another isolated Surface / Signal / Sensor primitive

Rejected for now. It would add vocabulary before the current stack has paid its composition debt.

## Primary question

Can one **unchanged persistent local TORQUE-PATCH with signed `+100 N*m` effort** be compiled once and then transiently switched `OFF -> ON -> OFF` inside runtime such that:

1. initial OFF is mechanically inert;
2. ON reproduces the already-earned causal torque response;
3. returning to OFF removes further active torque **without braking or commanding zero velocity**;
4. a fresh runtime reconstructed from the same persistent compilation defaults to OFF;
5. authored source and compiled construction/function meaning never change; and
6. Box3D revolute motor state is not used as the control ontology or actuation mechanism?

This is one uncertainty: **whether persistent function/action meaning and transient activation state can occupy separate lifecycle domains.**

## Existing evidence this experiment may reuse

Already supported and not retested as new hypotheses:

- BEARING resolves one local persistent rotational interface to a passive revolute runtime relation;
- TORQUE lowers a signed persistent authored effort to equal/opposite world-space body torques and causes signed mechanical rotation without using Box3D revolute motor mode;
- TORQUE-PATCH resolves that accepted torque action from one local source face without an authored `bearingId`;
- the accepted TORQUE fixture and thresholds discriminate active `+100 N*m` from authored zero effort.

ACTIVATE must reuse these mechanics where possible. A regression in them is not evidence for or against activation semantics; it is a regression to classify separately.

## Important semantic correction

ANVIL-09 does **not** introduce transient reverse command.

The accepted TORQUE/TORQUE-PATCH source contains signed `effortNm`. Its sign is already persistent authored meaning. Allowing transient `-1` to invert a persistent `+100 N*m` action would silently change that meaning into a bidirectional rating/capacity, which previous evidence did not establish.

For ANVIL-09:

```text
persistent authored effort = +100 N*m
OFF                         = apply no active torque
ON                          = apply the accepted +100 N*m action
```

`OFF` never means:

- brake;
- target zero angular speed;
- lock the bearing;
- set body velocity;
- use a servo/motor target.

If the mechanism is already rotating, OFF should leave ordinary inertia and passive bearing dynamics in control.

## Experiment-local transient state

Candidate only for ANVIL-09:

```text
ActivationState = "OFF" | "ON"
```

This is runtime-only state associated with the single compiled action in this fixture.

It must **not** be added to:

- `TorquePatch`;
- authored Matter documents;
- persistent bearing identity;
- `TorquePatchCompilation` / accepted compiled action schemas;
- foundation;
- project serialization.

No generic controller, signal, port, bus, device, channel or power object is introduced.

Because the fixture contains exactly one compiled action, ANVIL-09 does not test routing or addressing. The runtime may hold the activation directly; no command target ID is required.

### Lifecycle

Frozen lifecycle semantics:

- a newly created ACTIVATE runtime starts `OFF`;
- changing `OFF -> ON` does not recompile source or rebuild the world;
- changing `ON -> OFF` does not recompile source or rebuild the world;
- disposing the runtime discards activation state;
- creating a fresh runtime from the same persistent compilation starts `OFF` again unless a future experiment explicitly introduces state restoration.

This reset behavior is deliberate: ANVIL-09 tests transient state, not persistence/restoration of control state.

## Feasibility boundary

The experiment is feasible with already-demonstrated mechanisms:

- the exact pinned binding is `box3d.js@0.0.2`;
- accepted TORQUE already creates the BEARING revolute relation and calls `b3Body_ApplyTorque` directly every fixed step;
- ACTIVATE needs only the ability to conditionally apply that already-supported torque pair before stepping the same real solver.

No new Box3D primitive is required.

### Motor anti-shadow rule

The revolute relation must remain passive.

ANVIL-09 must not use:

- `motorSpeed`;
- `maxMotorTorque` as the activation mechanism;
- revolute motor enable/disable calls as command state;
- velocity setters as an actuator substitute.

If the exact pinned binding exposes readable/assignable `enableMotor`, it should be explicitly false and may be recorded. If it lacks a direct motor-state getter, that absence is **not** a toolchain block: Class A source/definition evidence plus absence of motor API calls is sufficient for this experiment. Do not fabricate a solver readback that the binding cannot provide.

## Implementation boundary before work begins

Preferred implementation shape:

- a new experiment-local ACTIVATE runtime consumes the already-supported `TorquePatchCompilation` / compiled torque action;
- it owns only transient activation and real-solver execution;
- accepted ANVIL-05/06 source semantics remain unchanged.

Do **not** modify `src/foundation` for ANVIL-09.

Do **not** refactor accepted TORQUE/TORQUE-PATCH merely to make ACTIVATE elegant unless implementation proves a minimal adapter is impossible. If such a refactor becomes necessary, stop and re-audit scope before changing accepted code.

## Frozen physical fixture

Reuse the accepted single-bearing TORQUE-PATCH fixture.

Persistent authored input:

```text
one accepted seven-cell BEARING matter fixture
one TORQUE-PATCH
  target   = accepted local bearing face a:2@x+
  effort   = +100 N*m
```

Compile the source **once** before runtime execution.

Laboratory isolation:

```text
gravity                 0
contacts                disabled
sleep                   disabled
body linear damping     0
body angular damping    0
fixed timestep           1/60 s
substeps                 4
initial bodies           at rest
runtime bodies           2
runtime revolute joints  1
```

Explicit zero damping is laboratory isolation for interpreting OFF as absence of actuation rather than active braking. It is not authored Machine Matter meaning.

## Executable runtime schedules

All variants use the **same authored source and the same compiled object**.

### DEACTIVATED sequence

One runtime instance:

```text
phase O0  OFF  60 steps
phase A0  ON   60 steps
phase O1  OFF  30 steps
```

Purpose:

- O0 proves default OFF is inert;
- A0 proves the same compiled action can become active without recompilation;
- O1 proves deactivation removes further torque without braking away existing motion.

### CONTINUED_ON control

A second runtime from the same compilation:

```text
phase O0  OFF  60 steps
phase A0  ON   60 steps
phase C1  ON   30 steps
```

It is identical to DEACTIVATED until the final 30-step branch.

Purpose:

- proves that the final 30-step interval is long enough to observe continued actuation;
- prevents a false-positive interpretation where `setActivation("OFF")` is ignored but the mechanism remains positively rotating anyway.

### RECONSTRUCTED_DEFAULT_OFF lifecycle probe

After disposing an activated runtime, create a **fresh runtime from the exact same compiled object** and issue no activation change.

```text
phase R0  default OFF  60 steps
```

Purpose:

- tests that transient activation does not silently persist in authored/compiled truth or leak across runtime reconstruction.

No CUT/REBIND occurs in ANVIL-09.

## Frozen gates

All gates below are frozen before implementation and before any executable ANVIL-09 result.

### A — persistent/transient boundary

The accepted authored TORQUE-PATCH fixture must show:

- exactly one local `TorquePatch`;
- target remains the accepted local bearing face;
- persistent `effortNm = +100 N*m` for every runtime schedule;
- no `activation`, command, signal, motor, runtime body ID or runtime joint ID field is added to authored source;
- compilation contains the same accepted signed torque action for every schedule;
- activation state is absent from persistent compilation;
- source is not mutated by runtime creation, activation changes, stepping or disposal;
- compilation is not mutated by runtime creation, activation changes, stepping or disposal;
- source is compiled exactly once for the C0/C1 experiment and the same compilation object is reused;
- runtime activation supports only `OFF` and `ON` for C0; invalid runtime activation values fail closed;
- a newly created runtime reports/defaults `OFF`;
- activation changes do not rebuild or recompile the authored source.

### B — actuation lowering and solver-shadow boundary

For the same compiled `+100 N*m` action:

```text
OFF
  active torque applied by ACTIVATE = 0

ON
  body A torque = accepted compiled torque A
  body B torque = accepted compiled torque B
  |tau_A + tau_B| <= 1e-12 N*m
```

Additionally:

- runtime body count = `2`;
- runtime revolute relation count = `1`;
- gravity readback = zero;
- contacts are disabled;
- body linear/angular damping readback = zero;
- sleep is disabled;
- all runtime states and receipts are finite;
- the activation representation contains no Box3D body or joint identifiers;
- the implementation does not enable or drive a Box3D revolute motor;
- the implementation does not set body angular velocity as an actuation substitute.

A direct motor-state getter is not required if the pinned binding does not expose one. Do not upgrade source inspection into fake Class C solver evidence.

### C0 — default OFF is inert

At the end of O0 (60 OFF steps), independently for DEACTIVATED and CONTINUED_ON:

```text
|bearing angle|                 <= 0.01 rad
|relative angular speed|        <= 0.01 rad/s
bearing gap                     <= 0.0025 m
```

The two worlds must agree at the O0 checkpoint within:

```text
angle delta                     <= 1e-6 rad
relative-speed delta            <= 1e-6 rad/s
bearing-gap delta               <= 1e-6 m
```

If default OFF already produces material actuation, the primary hypothesis fails.

### C1 — ON reproduces accepted causal torque

After the shared 60-step A0 phase:

```text
angle increase from O0          >= +0.35 rad
relative angular speed          >= +0.35 rad/s
bearing gap                     <= 0.0025 m
linear momentum magnitude       <= 0.05 kg*m/s
barycenter drift                <= 0.0005 m
```

Both runtime worlds must still agree at the A0 branch point within:

```text
angle delta                     <= 1e-6 rad
relative-speed delta            <= 1e-6 rad/s
bearing-gap delta               <= 1e-6 m
```

These are deliberately the already-earned broad TORQUE causal/isolation thresholds rather than newly loosened ACTIVATE thresholds.

If ON cannot reproduce the accepted action through the same persistent compilation, classify a TORQUE/adapter regression before interpreting activation semantics.

### C2 — OFF removes actuation without braking

After DEACTIVATED changes `ON -> OFF` and runs 30 additional steps:

```text
post-OFF relative speed remains positive        >= +0.35 rad/s
absolute speed change from A0                    <= 0.15 rad/s
angle continues in the existing direction       increase >= +0.10 rad
bearing gap                                      <= 0.0025 m
linear momentum magnitude                        <= 0.05 kg*m/s
barycenter drift                                 <= 0.0005 m
```

Interpretation:

- remaining positive motion demonstrates that OFF is not a hidden brake/servo/velocity reset;
- small speed change demonstrates that active torque is no longer being continuously added in the isolated zero-damping fixture.

### C3 — continued-ON control discriminates deactivation

After CONTINUED_ON remains ON for the same additional 30 steps:

```text
continued-ON final speed - DEACTIVATED final speed >= 0.25 rad/s
```

Both final states must be finite and preserve the bearing/isolation gates above.

If the continued-ON control is not materially distinguishable from deactivation, the final phase is non-discriminating and ANVIL-09 must not claim successful deactivation from that fixture.

### C4 — reconstructed runtime forgets transient activation

Create a fresh runtime from the same persistent compilation after an activated runtime has existed and been disposed. Do not inject any activation state.

After 60 steps:

```text
reported/default activation       OFF
|bearing angle|                   <= 0.01 rad
|relative angular speed|          <= 0.01 rad/s
bearing gap                       <= 0.0025 m
```

Authored source and compiled action must remain byte/deep-meaning equivalent to their pre-runtime state.

If the fresh runtime acts without a new ON command, transient state has leaked into a longer-lived domain and the primary hypothesis fails.

## Evidence classes

Initial scientific decision requires:

- **A — static/structural:** authored-vs-transient boundary, immutability, no motor/control ontology leakage, fail-closed command domain;
- **B — pure/semantic:** one compilation, same action meaning, equal/opposite torque identities, schedule/control identity;
- **C — real pinned Box3D:** O0/A0/O1 versus continued-ON control plus reconstructed-default-OFF lifecycle behavior.

A dedicated browser route is **not** required for the ACTIVATE scientific claim. If the experiment later reaches Ready, the existing candidate browser/launcher gate may be used as whole-product regression evidence unless a browser-specific uncertainty emerges.

Owner/manual evidence is not required for this quantitative causal/lifecycle claim.

## Failure interpretation

Classify a red result before changing source, schedule or thresholds.

- activation can only be changed by editing `TorquePatch.effortNm` or recompiling -> **semantic lifecycle failure**;
- activation state appears in authored Matter/TorquePatch or accepted persistent compilation -> **persistent/transient boundary failure**;
- command requires runtime body/joint IDs -> **runtime-identity leak**;
- implementation requires enabling a revolute motor, motor speed/torque targets or direct velocity edits -> **solver-shadow / wrong actuation model**;
- default OFF moves materially -> **activation failure or hidden harness force**;
- ON fails the accepted TORQUE causal gates -> **TORQUE/adapter physical regression**, not evidence against transient-state separation until classified;
- ON -> OFF immediately stops or materially brakes the mechanism -> **OFF semantics collapsed into servo/brake behavior**;
- ON -> OFF behaves like continued ON and the control separates strongly -> **deactivation state ignored / runtime state failure**;
- continued-ON control does not separate from OFF -> **non-discriminating fixture/control**;
- fresh runtime starts active without explicit restoration -> **transient-state persistence leak**;
- exact pinned solver cannot execute conditional body-torque application despite accepted TORQUE evidence -> **implementation/toolchain regression or adapter defect**, not automatic falsification of the architectural hypothesis.

Do not weaken a frozen discriminator merely to obtain PASS.

## Explicit non-claims

A green ANVIL-09 would **not** establish:

- transient reverse/directional command;
- analog throttle or command magnitude scaling;
- that `effortNm` is a motor rating, capacity or maximum torque;
- generic FUNCTION/device ontology;
- generic Control / Signal / Port / Bus architecture;
- multiple command targets or routing;
- sensors, logic or feedback;
- user input mapping;
- servo speed/angle targets;
- braking semantics;
- saturation, efficiency, thermal limits or damage;
- energy source/storage, conservation, power networks or batteries;
- command persistence/restoration across saved sessions;
- command continuity across CUT/REBIND;
- active function continuity across topology rebuild;
- contact-loaded activation;
- arbitrary orientation/covariance of active lowering;
- multiple bearings or mechanisms;
- function through compliant matter;
- a reason to promote ACTIVATE, TorquePatch, FUNCTION or Control into `src/foundation`.

A green result would support only:

> In the accepted single-bearing TORQUE-PATCH fixture, one unchanged persistent signed torque action can be compiled once and transiently switched OFF/ON/OFF at runtime; OFF supplies no active torque rather than braking, ON reproduces the accepted causal torque response, and a fresh runtime reconstructed from the same compilation defaults OFF, without moving activation into authored/compiled truth or using Box3D motor semantics.

## Stop rule

If A/B and C0-C4 resolve cleanly:

- **stop ANVIL-09**;
- do not add reverse command;
- do not add analog throttle;
- do not add command IDs/routing, ports, buses, controllers or signals;
- do not add UI/keyboard input merely to demonstrate activation;
- do not add power/energy semantics;
- do not combine ACTIVATE with CUT/REBIND inside this experiment;
- do not combine ACTIVATE with compliance inside this experiment;
- do not promote a generic Control/FUNCTION foundation abstraction from this result.

Run a new meso/macro audit after the bounded result. The strongest likely successor is active command/function continuity through REBIND, but it must be selected again by information gain rather than assumed.

## Implementation checkpoints after this preflight

Implementation has **not** started at preflight freeze.

If work proceeds, use these natural checkpoints:

1. **Micro A/B:** experiment-local activation/runtime boundary + structural/compiler tests only; Draft/core.
2. **Micro C0-C3:** real Box3D OFF/ON/OFF versus continued-ON control; Draft/core.
3. **Micro C4:** reconstruction-default-OFF lifecycle probe; Draft/core.
4. **Meso audit:** decide whether the primary question is already resolved; if yes, stop research and do not enrich.
5. **Ready candidate only if justified:** exact integration regression, not additional ACTIVATE physics unless a new product-runtime uncertainty appears.

Any need for foundation changes, accepted TORQUE semantic rewrite, motorized-joint actuation, routing architecture or scope expansion triggers a stop-and-reassess before implementation continues.
