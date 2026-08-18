# ANVIL-07 / ELASTIC-SEAM — preflight

Status: **DRAFT / CAPABILITY PRECHECK PENDING / NOT YET EXECUTED**

Strategic source: `docs/RESEARCH_COMPASS.md`.

## Primary question

Can one persistent **local binding property** between neighboring authored matter express bounded normal compliance — deformation under load plus restoring behavior after unload — instead of forcing the connection to be either rigid union or free separation, without promoting a generic Bond ontology or encoding Box3D spring parameters in authored truth?

This is the first BINDINGS-frontier experiment. It is deliberately much narrower than deformable matter.

## Why this is next

ANVIL-05 and ANVIL-06 established the first active FUNCTION slice and then removed its immediate authored cross-component locality debt. The macro frontier audit now shows a major imbalance:

- INTERFACE and topology continuity have multiple bounded results;
- FUNCTION has signed torque + local placement;
- authored connectivity is still effectively **rigid adjacency or separation/interface split**.

A machine-matter system that cannot express even one compliant local connection would remain structurally close to a rigid-part assembler regardless of how good its control layer becomes.

Therefore ANVIL-07 opens a new physical category before ACTIVATE/control is deepened.

## Experiment-local authored concept

Candidate only for ANVIL-07:

```text
ElasticSeam {
  id
  endpointA: { cellId, face }
  endpointB: { cellId, face }
  normalStiffnessNPerM
  normalDampingNsPerM
}
```

The source deliberately uses physical coefficients rather than solver frequency/tuning vocabulary.

Deliberately absent:

- Box3D joint type;
- `hertz` / solver spring frequency;
- damping ratio;
- runtime body/joint IDs;
- generic Bond/Constraint kind;
- damage/break strength;
- plasticity;
- actuation/control.

## Source semantics

The two endpoints must be persistent source-cell faces that:

1. exist;
2. are adjacent;
3. face each other;
4. are connected by ordinary rigid adjacency in the unmarked baseline;
5. have no alternate rigid path bypassing the seam in the bounded fixture.

Marking the seam means:

> this local connection is not part of the rigid-connectivity union; it carries a finite normal elastic restoring law instead.

For ANVIL-07 C0 only, tangential/rotational behavior is intentionally outside the authored claim and constrained by experiment instrumentation.

## Solver-lowering hypothesis

Exact Box3D v0.1.0 source exposes a weld joint with linear spring tuning and coincident local frames. The first lowering candidate therefore uses a fresh weld relation only as the **runtime representation** of the local normal compliant law.

Authored physical coefficients are converted to solver tuning from the compiled runtime masses:

```text
m_eff = 1 / (1/m_A + 1/m_B)
omega_n = sqrt(k / m_eff)
hertz = omega_n / (2*pi)
dampingRatio = c / (2 * sqrt(k * m_eff))
```

where:

```text
k = normalStiffnessNPerM
c = normalDampingNsPerM
```

The derived `hertz` and damping ratio are **compiled/runtime values only**. They must not appear in authored source.

The weld's angular constraint and non-normal linear degrees are not evidence for ELASTIC-SEAM. C0 locks those degrees at body creation as laboratory isolation so the experiment measures one normal compliant mode only.

If the exact `box3d.js@0.0.2` binding does not expose the required weld creation/tuning path on runtime Box3D 0.1.0, stop before implementing the semantic model and redesign the lowering.

## C0 matter fixture

Reuse the accepted seven-cell topology from BEARING but remove the bearing mark.

Seam under test:

```text
a:2@x+ <-> b:0@x-
```

Material/cell geometry remains the existing ANVIL alloy fixture:

```text
cell size      0.5 m
material rho   780 kg/m^3
left island    3 cells
right island   4 cells
```

For the elastic/free variants, blocking the seam produces exactly two rigid islands. There must be no alternate rigid path.

Runtime fixture:

- both islands dynamic;
- gravity zero;
- contacts disabled;
- sleep disabled;
- only world-X translation enabled;
- world-Y/Z translation and all rotations locked as experiment instrumentation;
- no body damping used to fake restoring behavior.

## Physical coefficients and load

Frozen before first C0 result:

```text
normal stiffness k   = 10000 N/m
normal damping c     = 1800 N*s/m
external pull F      = 1000 N per side, equal/opposite
loaded duration      = 180 steps at 60 Hz
unloaded duration    = 120 steps at 60 Hz
```

The ideal static extension of the declared 1D spring law is:

```text
x_eq = F / k = 0.1 m
```

The exact solver need not equal the ideal value bit-for-bit, but ELASTIC must land in the declared bounded neighborhood while RIGID and FREE remain causally distinct.

## Three causal variants

### RIGID control

Unmarked ordinary matter; seam participates in rigid connectivity.

Expected compile result: `7 cells -> 1 runtime body`.

Apply the equal/opposite laboratory forces at the two seam material points. Net force and torque on the single rigid body are zero; the source seam cannot deform relative to itself.

### ELASTIC candidate

Same matter plus `ElasticSeam`.

Expected compile result: `7 cells -> 2 runtime bodies + 1 experiment-local elastic relation`.

Apply the same ±1000 N force pair during load phase, then remove it entirely for recovery phase.

### FREE control

Same seam is removed from rigid connectivity but no elastic relation is created.

Expected compile result: `7 cells -> 2 runtime bodies + 0 restoring relation`.

Apply the identical load/unload schedule.

FREE must not accidentally receive damping/restoring behavior from the experimental harness.

## Frozen gates

All gates are declared before first executable C0 result.

### A — authored/source integrity

- exactly 7 persistent source cells in all variants;
- ELASTIC seam source contains no runtime IDs or solver hertz/damping-ratio fields;
- seam ID non-empty;
- stiffness finite and strictly > 0;
- damping coefficient finite and >= 0;
- endpoint cells exist;
- endpoint faces are opposite and adjacent;
- source seam is a real rigid connection in the unmarked baseline;
- invalid/non-adjacent endpoint geometry fails closed;
- alternate rigid bypass around the marked seam fails closed.

### B — compiled structural meaning

- RIGID: exactly 1 runtime body;
- ELASTIC: exactly 2 runtime bodies + 1 elastic relation;
- FREE: exactly 2 runtime bodies + 0 elastic relation;
- source cells/mass identical across all variants;
- ELASTIC relation endpoints resolve to the two compiled islands containing `a:2` and `b:0`;
- derived effective mass, hertz and damping ratio are finite and positive where applicable;
- compiler-derived spring tuning matches the frozen physical conversion equations within numerical tolerance;
- authored source remains unchanged by lowering.

### C — loaded discrimination after 180 steps

Define seam normal extension as separation of the two authored seam-face material points along world X relative to their coincident rest configuration.

RIGID:

- absolute seam extension <= `0.001 m`;
- finite state.

ELASTIC:

- extension between `0.07 m` and `0.13 m`;
- absolute relative normal speed <= `0.10 m/s` at end of load phase;
- finite state.

FREE:

- extension >= `2.0 m`;
- extension must exceed ELASTIC extension by at least `1.0 m`;
- finite state.

These gates distinguish bounded elastic deformation from both rigid non-deformation and unconstrained separation.

### D — restoring behavior after load removal

After the 120-step unloaded recovery phase:

ELASTIC:

- absolute seam extension <= `0.015 m`;
- absolute relative normal speed <= `0.15 m/s`;
- recovery magnitude from loaded extension >= `0.06 m`;
- finite state.

FREE:

- seam extension must remain >= its loaded-phase extension (within `0.05 m` numerical allowance) or continue increasing;
- it must not converge toward the rest seam by more than `0.20 m` without a restoring relation.

RIGID remains within `0.001 m`.

The restoring phase is the primary falsifier against interpreting mere bounded displacement/damping as elasticity.

### E — no fake whole-system propulsion

For ELASTIC during both phases:

- total linear momentum magnitude <= `0.05 kg*m/s` after the equal/opposite loaded schedule and after recovery;
- barycenter displacement <= `0.0005 m`;

This checks that the internal seam plus equal/opposite instrumentation does not manufacture whole-system thrust.

## Evidence classes

Initial decision requires:

- A structural/source checks;
- B compiler/derived-physics checks;
- C/D/E real pinned Box3D runtime evidence.

Dedicated Chromium and owner gates are **not assumed**. Add Class D browser evidence only if browser-specific lowering/runtime uncertainty appears; add Class E only if human observation contributes information not captured by quantitative deformation/restoration gates.

## Failure interpretation

Do not loosen thresholds after a red physical result merely to obtain PASS.

- binding capability absent -> current JS lowering path is unsupported; redesign before semantic architecture;
- ELASTIC fails to split rigid topology -> binding semantics are not actually replacing rigid connectivity;
- ELASTIC behaves like RIGID -> spring lowering too stiff/incorrect or authored compliance not represented;
- ELASTIC behaves like FREE -> restoring relation ineffective/incorrect;
- loaded extension plausible but no unload restoration -> damping/bounded motion was mistaken for elasticity;
- RIGID or FREE control becomes non-discriminating -> redesign fixture, do not weaken candidate gates;
- barycenter/momentum gate fails -> instrumentation/lowering introduces external net action;
- only representation/test bookkeeping fails while physical gates pass -> classify separately before touching physics.

## Explicit non-claims

A C0 PASS will not prove:

- generic Bond ontology;
- full 3D compliant seam behavior;
- shear compliance;
- bending/torsional compliance;
- continuum elasticity;
- deformable bodies;
- spatially distributed strain/stress;
- breakage, yield, plasticity, fatigue or damage;
- nonlinear stiffness;
- arbitrary material scaling/resolution independence;
- contact-loaded compliance;
- compliant behavior through CUT/REBIND;
- actuation through compliant matter;
- non-grid authored matter.

## Stop rule

If RIGID / ELASTIC / FREE remain strongly discriminated and ELASTIC both deforms under load and restores after unload, stop ANVIL-07 C0. Do not add breakage, plasticity or torque to make the demo richer.

Rerun the Research Compass. A strong pass should make **ACTIVATE** and a first composition experiment (for example active function through compliant matter) the leading comparison rather than immediately inventing another binding type.
