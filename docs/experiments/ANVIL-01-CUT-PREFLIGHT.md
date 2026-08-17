# ANVIL-01 / CUT — Preflight

Status: **PLANNED — not implemented, no verdict**

This document reduces startup ambiguity for the next experiment. It does not promote fracture/state-transfer behavior into foundation.

## Research question

Can a **moving and rotating** compiled rigid island undergo a mass-preserving topology transaction into two rigid bodies at a controlled physics-step boundary while preserving persistent source identity and bounded physical-state discontinuity?

## Why CUT is different from COLLAPSE

ANVIL-00 changed topology by deleting one authored bridge cell and rebuilding from a neutral initial state. That was sufficient to prove semantic → rigid/collision compilation, but it is deliberately unsuitable for state-continuity evidence because:

- matter/mass disappears;
- the old runtime state is discarded;
- no moving body is transferred into the new representation.

CUT must isolate **representation/topology change**, not mix it with mass deletion.

## Minimal topology mechanism

For the first CUT fixture, keep all authored cells/material mass.

Use an **experiment-local cut mask over one structural adjacency edge** (or equivalent minimal connectivity override) so the same source cells compile from one rigid component into two.

This is intentionally not a promoted universal `Bond` object. Generic bond semantics belong to a later experiment if CUT demonstrates a real need.

## Required runtime capability gate

Before implementing transfer, prove that the exact current Box3D browser binding can round-trip the neutral state needed by CUT:

- world position;
- world rotation;
- linear velocity;
- angular velocity;
- body mass/COM observation;
- creation of replacement bodies at explicit transforms/velocities.

If the exact `box3d.js@0.0.2` boundary cannot expose one of these reliably, record that as a binding limitation before deciding whether to extend the binding, use a thin fork, or move the specific physics experiment to native Box3D.

## Transaction boundary

First version should transact **between solver steps**, never while Box3D is stepping:

```text
step N complete
    ↓
snapshot old runtime state
    ↓
authored topology edit / compile new plan
    ↓
source-provenance lineage
    ↓
construct replacement runtime + apply candidate transferred state
    ↓
destroy/retire old runtime representation
    ↓
measure immediate discontinuity
    ↓
step N+1
```

No hidden damping, reset-to-rest or interpolation may be used to make the transaction look smooth unless a later experiment explicitly tests such a mechanism.

## Source lineage gate

The foundation `analyzeProvenanceLineage` must report:

- exactly one `split` component;
- one old body → exactly two new bodies;
- zero added source IDs;
- zero removed source IDs.

This gate must pass before physical state transfer is attempted.

## Candidate no-impulse rigid-field policy

This is a **hypothesis to test inside CUT**, not foundation truth.

For old body COM `c₀`, old linear velocity `v₀`, old angular velocity `ω₀`, and new child COM `cᵢ` expressed in the same authored/body frame:

```text
child world position = old pose applied to (cᵢ - c₀)
child rotation       = old rotation
child angular vel    = ω₀
child linear vel     = v₀ + ω₀ × worldOffset(cᵢ - c₀)
```

This is the instantaneous velocity field of the unsplit rigid body evaluated at each child COM. The experiment must determine whether applying it through runtime reconstruction produces the intended continuity in the actual solver.

## Initial gates

### CUT.IDENTITY

All authored source IDs exist before and after the transaction. No cell/mass deletion is allowed in the primary fixture.

### CUT.LINEAGE

Foundation provenance analysis reports exactly `1 → 2 split` with no source additions/removals.

### CUT.POSE

Immediately after reconstruction, each child's world COM and orientation match the old rigid transform applied to its compiled local COM within a declared numeric tolerance.

Suggested starting measurement scale: micrometre-to-sub-millimetre numerical error, but the exact gate must be justified after observing binding precision rather than copied blindly.

### CUT.VELOCITY_FIELD

Each child's reconstructed linear velocity matches the old body's rigid velocity field evaluated at the child COM; angular velocity matches the old body's angular velocity.

### CUT.MASS

Sum of child compiled/Box3D masses equals old body mass within the already validated mass-property tolerance, with zero authored mass removed.

### CUT.LINEAR_MOMENTUM

Total child linear momentum immediately after transfer matches the pre-cut body linear momentum within a declared relative/absolute tolerance.

### CUT.POST_STEP

After at least one real Box3D step, no child produces NaN/invalid state or solver rejection. Additional drift/impulse metrics should be recorded rather than visually hidden.

## Diagnostics, not yet promotion gates

Record from the first implementation even if they are not initially hard gates:

- translational kinetic energy delta;
- separation impulse after the first solver step;
- contact count/state if the cut occurs during contact;
- angular-momentum delta once inertia representation is sufficient to compute it honestly;
- runtime rebuild duration.

Do not claim energy/angular-momentum conservation from the current inertia diagonal alone for arbitrary rotated states.

## Fixture progression

Run increasingly difficult fixtures only after the previous one is understood:

1. free body translating, zero angular velocity;
2. free body translating + rotating;
3. body falling under gravity;
4. cut while one lobe is in ground contact;
5. only then consider external forces/constraints.

Do not start with a vehicle or mechanism.

## Explicit non-goals

CUT v1 does not need:

- damage accumulation;
- stress propagation;
- arbitrary crack surfaces;
- particle/debris generation;
- generic joints;
- deformable bodies;
- custom contact law;
- Box3D kernel modification unless the binding/solver produces a reproduced blocker;
- polished destruction visuals.

## Expected output

A successful CUT should leave ANVIL with one specific demonstrated capability:

> a disposable runtime body can be replaced by multiple newly compiled bodies at a step boundary while persistent matter identity survives and the measured physical state remains continuous within explicit tolerances.

Anything broader must be earned separately.
