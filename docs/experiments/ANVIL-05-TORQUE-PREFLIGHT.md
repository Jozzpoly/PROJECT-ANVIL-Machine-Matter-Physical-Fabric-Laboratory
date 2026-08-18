# ANVIL-05 / TORQUE — preflight

Status: **DRAFT / NOT YET EXECUTED**

## Primary question

Can one minimal persistent authored **torque function** act through the already-earned BEARING semantics and produce controlled mechanical work without encoding a Box3D motor, runtime body/joint IDs, a signal graph or a power network in authored source?

This is the first bounded **active Machine Matter** experiment.

## Why this is next

ANVIL-00..04 established progressively stronger disposable-runtime structure and relation continuity:

- matter can compile to a reduced rigid runtime;
- runtime topology can be rebuilt while preserving bounded motion;
- a local authored bearing can derive a revolute relation;
- that bearing can be rebound after CUT while moving;
- the fresh relation can immediately resume the declared multi-kN constraint load without migrating hidden joint cache.

A contact+relation combination remains a known continuity risk, but extending reconstruction indefinitely would add less new information than testing the next major premise of Machine Matter: **local function can create behavior through already-derived mechanics**.

Do not combine TORQUE with contact, CUT/REBIND, signals, batteries, controllers, motors or generic device architecture in the first fixture.

## Authored signal — experiment-local only

Introduce one experiment-local mark conceptually equivalent to:

```text
TorqueMark {
  id
  bearingId
  effortNm
}
```

Requirements:

- `bearingId` references persistent authored BEARING identity only;
- no runtime body ID or Box3D joint ID may appear in authored source;
- `effortNm` is signed finite torque in N*m;
- the bearing supplies the allowed axis and the canonical A/B ordering;
- positive effort means `-T * axis` on canonical side A and `+T * axis` on canonical side B;
- negative effort reverses both torques;
- zero effort is a valid inactive control.

The mark is intentionally not promoted to the generic `MatterDocument` model or foundation. ANVIL-05 must earn any wider ontology first.

## Runtime lowering

The first runtime must **not** use Box3D revolute-joint motor mode.

Instead, for each solver step:

1. resolve the persistent authored bearing through its compiled relation;
2. resolve current disposable runtime bodies from that relation;
3. apply equal and opposite world-space torques along the compiled bearing axis;
4. step stock Box3D.

Expected pair for `effortNm = T`:

```text
tau_A = -T * bearing.axisWorld
tau_B = +T * bearing.axisWorld
tau_A + tau_B = 0
```

This deliberately tests **physical active intent -> runtime force/torque action**, not `enableMotor`/`motorSpeed` configuration.

An ideal external energy reservoir is assumed for this experiment. Energy source, storage, efficiency, power limits and control are explicit non-claims.

## Fixture C0 — signed causal torque

Reuse the accepted seven-cell ANVIL-02 bearing fixture without CUT:

```text
source cells     7
runtime bodies   2
source bearing   1
bearing axis     z
initial motion   rest
gravity          zero
contacts         disabled
```

Run three otherwise identical variants for 60 fixed 60 Hz steps:

```text
POSITIVE   effort = +100 N*m
CONTROL    effort =    0 N*m
NEGATIVE   effort = -100 N*m
```

All start from the same compiled pose and zero linear/angular velocity.

## Binding capability precheck

Exact pinned `box3d.js@0.0.2` must expose real body torque application (`b3Body_ApplyTorque`) before C0 is implemented.

Do not substitute a fake angular-velocity edit if the binding lacks the capability.

## Frozen gates

All thresholds below are declared before the first executable C0 result.

### Structural / compilation

- source cells remain exactly `7` in all variants;
- physical plan remains exactly `2` runtime bodies;
- exactly one persistent source bearing is present;
- positive/zero/negative variants compile to the same mechanical body/relation plan;
- one torque-function source identity resolves to that persistent bearing;
- no authored runtime body/joint IDs;
- compiled applied torque pair is finite and exactly equal/opposite within numerical construction precision;
- zero effort compiles to a zero torque pair without removing/changing the bearing.

### Relation integrity

After 60 steps:

- bearing anchor gap <= `0.0025 m` for positive and negative variants;
- all observed runtime state finite.

### Causal active behavior

At 60 steps:

- positive effort relative bearing angle >= `+0.35 rad`;
- negative effort relative bearing angle <= `-0.35 rad`;
- zero-control absolute relative bearing angle <= `0.01 rad`;
- positive relative angular speed >= `+0.35 rad/s`;
- negative relative angular speed <= `-0.35 rad/s`;
- zero-control absolute relative angular speed <= `0.01 rad/s`.

The sign gates are primary: they reject a fixture that merely moves but does not respond causally to authored torque sign.

### Internal-pair / no-thrust sanity

Because the commanded torques are equal/opposite and no external linear force is applied:

- total linear momentum magnitude after 60 steps <= `0.05 kg*m/s` for positive and negative variants;
- combined mass-weighted barycenter displacement from its initial position <= `0.0005 m` for positive and negative variants.

These are sanity gates against accidentally implementing torque as a one-sided external thrust-like action. They are not a full angular-momentum or energy-conservation proof.

### Discriminating control

The zero-effort control must remain near rest while the two signed variants exceed the active-motion thresholds. If control moves materially, redesign the fixture rather than weakening the control gate.

## Failure interpretation

Do not loosen thresholds after observing a red result merely to obtain PASS.

- binding failure -> current Box3D binding cannot directly support the intended lowering; redesign before architecture work;
- compiler/source failure -> authored function contract is ambiguous or incorrectly tied to runtime identity;
- positive/negative sign failure -> function-to-runtime lowering is not causally respecting authored intent;
- pivot-gap failure -> active action is incompatible with the earned bearing relation or runtime implementation;
- linear momentum/barycenter failure -> torque pair is not actually internal/equal-opposite as intended;
- zero-control failure -> fixture is non-discriminating.

## Explicit non-claims

A C0 PASS will **not** prove:

- a generic FUNCTION/device ontology;
- electrical/mechanical power generation or storage;
- energy conservation/efficiency of an actuator;
- signals, ports, buses, logic or control runtime;
- user input mapping;
- servo/target-speed behavior;
- Box3D joint motor correctness;
- torque limits, saturation, thermal behavior or damage;
- contact-loaded actuation;
- actuation continuity through CUT/REBIND;
- multiple bearings, closed loops or arbitrary mechanisms;
- universal spatial inference of function from nearby matter.

## Continuation rule

If C0 strongly passes, do not immediately build a power network or controller.

Choose the next falsifier by the remaining uncertainty. Likely candidates:

1. **TORQUE + REBIND** only if active-function continuity across runtime rebuild is the highest-value risk; or
2. a second orthogonal local function such as linear force only if it tests a genuinely new compiler/runtime principle; or
3. minimal command/activation separation if constant authored effort has already established the active-function premise.

Do not turn the first PASS into a device catalog.
