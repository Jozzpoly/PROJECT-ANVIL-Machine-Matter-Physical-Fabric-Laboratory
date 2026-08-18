# ANVIL-07 / ELASTIC-SEAM — Preflight Amendment 01

Status: **FROZEN BEFORE C0 IMPLEMENTATION / NO PHYSICAL RESULT YET**

This amendment was added after the lowering-capability precheck and before implementation or execution of the actual `RIGID / ELASTIC / FREE` C0 physics experiment.

It does **not** loosen, replace or reinterpret any threshold in `ANVIL-07-ELASTIC-SEAM-PREFLIGHT.md`. It adds stricter structural requirements discovered during independent review.

## Evidence boundary at amendment time

Already known:

- exact `box3d.js@0.0.2` runtime reports Box3D `0.1.0`;
- weld creation and linear/angular spring-tuning fields are exposed by the binding;
- one finite weld step succeeds;
- full accepted regression suite remains green in Draft/core.

Not yet known:

- whether authored `ElasticSeam` compiles correctly;
- whether physical `k,c` map to the intended bounded response;
- whether `ELASTIC` discriminates from `RIGID` and `FREE`;
- whether the seam restores after unloading.

The capability result must not be cited as elasticity evidence.

## A1 — canonical local-binding semantics

The C0 implementation must additionally prove:

1. reversing the order of authored source cells does not change the compiled physical meaning;
2. swapping `endpointA` and `endpointB` for the same physical seam does not change the compiled physical meaning;
3. canonicalization does not change persistent source identity or the sign/axis of measured normal extension;
4. duplicate/degenerate endpoint declarations fail closed rather than creating ambiguous semantics.

A local symmetric binding must not depend on serialization order.

## A2 — bounded validity of the `k,c -> hertz,zeta` reduction

The scalar conversion frozen in the original preflight is valid for **this C0 only** because the laboratory fixture isolates a single translational normal mode.

The implementation must set and verify:

- world-X translation free;
- world-Y and world-Z translation locked;
- all three angular degrees of freedom locked for both dynamic islands;
- zero body damping;
- zero gravity and disabled contacts.

Exact Box3D v0.1.0 applies full angular lock as fixed rotation and zeroes inverse inertia. With rotation removed, the world-X weld constraint reduces to the translational two-mass mode used by:

```text
m_eff = 1 / (1/m_A + 1/m_B)
omega_n = sqrt(k / m_eff)
hertz = omega_n / (2*pi)
zeta = c / (2*sqrt(k*m_eff))
```

This formula is **not promoted as a universal compliance compiler**. If later experiments permit rotation, shear, bending, arbitrary anchors or several coupled constraints, effective stiffness/mass must be derived from the actual constraint Jacobian/model rather than reusing this scalar reduction.

## A3 — frozen C0 calibration values

For the declared seven-cell fixture:

```text
cell size                  0.5 m
cell volume                0.125 m^3
material density           780 kg/m^3
mass per source cell       97.5 kg
left island cells          3
right island cells         4
m_A                        292.5 kg
m_B                        390.0 kg
m_eff                      167.142857142857 kg
k                          10000 N/m
c                          1800 N*s/m
omega_n                    ~7.73492468 rad/s
hertz                      ~1.23105150 Hz
zeta                       ~0.69614322
ideal static extension     0.100 m under 1000 N
```

The C0 test must derive these values from compiled/source data and assert them within explicit floating-point tolerance; it must not hard-code runtime masses independently of the authored matter.

These values are calibration/evidence for the bounded fixture, not universal material constants.

## A4 — no hidden help from the laboratory harness

The implementation must explicitly demonstrate that:

- `FREE` creates no weld/spring/restoring relation;
- no linear or angular body damping is used in any variant to manufacture recovery;
- no contact, gravity or hidden kinematic body supplies restoring force;
- the equal/opposite external force schedule is identical for `ELASTIC` and `FREE`;
- removing the load means external force becomes exactly zero during recovery.

The `RIGID` control may receive the same coincident equal/opposite force pair, but its single-body topology itself prevents seam extension.

## A5 — measurement contract

The test must report, not merely assert:

- compiled body count for all three variants;
- `m_A`, `m_B`, `m_eff`;
- derived solver `hertz` and damping ratio;
- loaded seam extension and relative normal speed;
- recovered seam extension and relative normal speed;
- `FREE` loaded and recovered separation;
- total linear momentum and barycenter drift for `ELASTIC`.

This makes a future red/green result diagnosable without inferring physics from animation or one boolean gate.

## Stop rule remains unchanged

Do not add stiffness sweeps, breakage, plasticity, torque, control, contacts or browser presentation to C0 before the frozen three-way causal test resolves.
