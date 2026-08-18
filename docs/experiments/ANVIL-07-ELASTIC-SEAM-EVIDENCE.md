# ANVIL-07 / ELASTIC-SEAM — Evidence Log

Status: **FROZEN C0 SUPPORTED / PROMOTED**

Canonical research contract:

- `docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT.md`
- `docs/experiments/ANVIL-07-ELASTIC-SEAM-PREFLIGHT-AMENDMENT-01.md`

## Research question

Can one persistent **local binding property** between neighboring authored matter express bounded normal compliance — deformation under load plus restoring behavior after unload — instead of forcing the connection to be either rigid union or free separation, without promoting a generic Bond ontology or storing Box3D spring tuning in authored truth?

ANVIL-07 is deliberately narrower than generic deformable matter. It tests one isolated translational normal mode on one seven-cell fixture.

## Authored contract under test

Experiment-local source:

```text
ElasticSeam {
  id
  endpointA: { cellId, face }
  endpointB: { cellId, face }
  normalStiffnessNPerM
  normalDampingNsPerM
}
```

Deliberately absent from authored source:

- Box3D joint/body IDs;
- Box3D joint type;
- solver `hertz`;
- solver damping ratio;
- generic Bond/Constraint kind;
- damage, plasticity, actuation, control or power semantics.

The marked adjacent source faces are removed from ordinary rigid connectivity for the ELASTIC/FREE variants. ELASTIC then compiles one disposable runtime compliant relation; FREE creates no restoring relation.

## Frozen research identity

Capability source and frozen pre-C0 checkpoints were established before the physical C0 result:

```text
capability source       58c4580702d4604f2effcdc501cde09d796becea
capability run          32151014026
pre-C0 hardening head   af93a116ab59bf4d32ac58956cd9a719b86175cc
pre-C0 hardening run    32159805481
C0 source               1a31a69096f48d2eccb08ba88d683607f15d0ce3
C0 run                  32166041812
```

Capability evidence proved only that exact `box3d.js@0.0.2` / runtime Box3D 0.1.0 exposed and stepped the candidate weld-spring lowering path. It was not treated as elasticity evidence.

The physical coefficients, load schedule and thresholds were frozen before C0 execution.

## Frozen C0 fixture

```text
source cells                 7
cell size                    0.5 m
material density             780 kg/m^3
left island                  3 cells / 292.5 kg
right island                 4 cells / 390.0 kg
effective mass               167.14285714285717 kg
normal stiffness             10000 N/m
normal damping               1800 N*s/m
derived linear hertz         1.2310514975102163
derived damping ratio        0.6961432213383856
ideal static extension       0.1 m
external load                +/-1000 N
loaded phase                 180 steps @ 60 Hz
unloaded phase               120 steps @ 60 Hz
```

Laboratory isolation:

- gravity zero;
- contacts disabled;
- sleep disabled;
- body damping zero;
- world-X translation free;
- world-Y/Z translation locked;
- all angular degrees of freedom locked.

The scalar `k,c -> hertz,zeta` reduction is supported only for this isolated one-dimensional mode. It is not a universal compliance compiler.

## A/B — source and compiled meaning

Supported structural result:

```text
RIGID    7 source cells -> 1 runtime body, 0 elastic relations
ELASTIC  7 source cells -> 2 runtime bodies, 1 elastic relation
FREE     7 source cells -> 2 runtime bodies, 0 elastic relations
```

Supported checks include:

- source contains no runtime IDs or solver tuning fields;
- seam ID must be non-empty;
- stiffness must be finite and `> 0`;
- damping must be finite and `>= 0`;
- damping `0` remains a valid boundary value;
- endpoint cells/faces must exist, be opposite and geometrically adjacent;
- same-cell/unknown/non-adjacent/wrong-face declarations fail closed;
- alternate rigid bypass around the marked seam fails closed;
- source compilation is non-mutating;
- source-cell ordering does not change physical meaning;
- endpoint A/B declaration order does not change physical meaning;
- the two perturbations are falsified independently and together;
- canonical seam identity, normal axis, source-cell-to-island mapping, masses and derived tuning remain invariant;
- compiled effective mass and solver tuning match the frozen physical conversion within numerical tolerance.

## C0 — real Box3D causal discrimination and restoration

Exact original physical C0 source:

```text
source head       1a31a69096f48d2eccb08ba88d683607f15d0ce3
Draft/core run    32166041812
Node suite        42/42 PASS
production build  PASS
```

Observed frozen causal result:

```text
RIGID
  loaded extension       0 m
  recovered extension    0 m

ELASTIC
  loaded extension       0.09999978542327881 m
  recovered extension   -0.0000023245811462402344 m

FREE
  loaded extension       26.96044415235519 m
  recovered extension    62.85781353712082 m
```

ELASTIC therefore deforms near the declared `F/k = 0.1 m` equilibrium under load and returns essentially to rest after unload. RIGID does not deform. FREE strongly separates and does not recover.

ELASTIC conservation diagnostics remained far inside frozen guards:

```text
loaded relative speed             5.6810677e-7 m/s
loaded linear momentum magnitude  0.00012676231563091278 kg*m/s
loaded barycenter drift            4.172325134277344e-7 m

recovered relative speed           0.00001725026822896325 m/s
recovered linear momentum          0.00016803741118565085 kg*m/s
recovered barycenter drift         8.514949253468629e-7 m
```

The C0 stop rule was reached. No stiffness sweep, breakage, plasticity, torque, control or contacts were added.

## Post-C0 evidence hardening

An independent audit found no physical falsification, but found evidence-quality gaps already implied by the frozen contract. They were closed without changing the physical model, coefficients, load schedule or frozen C0 thresholds.

Exact hardening identity:

```text
source head          a34a769e4892bb5a3c117389af7c2bba47866623
Draft/core run       32188332165
synthetic merge      c206a008458e2a244bf65663f0c11705a1d1c948
Node suite           42/42 PASS
production build     PASS
```

The test count remains 42 because hardening added independent assertions inside the existing ANVIL-07 test cases rather than inflating the suite with bookkeeping-only test wrappers.

Hardening added direct pinned-solver readback of:

- world gravity;
- runtime body and joint counts;
- body linear/angular damping;
- body sleep state;
- body motion locks;
- shape collision filter mask bits;
- weld linear/angular hertz and damping ratios.

Observed runtime isolation:

```text
body counts   RIGID/ELASTIC/FREE = 1/2/2
joint counts  RIGID/ELASTIC/FREE = 0/1/0
gravity       exactly (0,0,0)
contacts      all shape maskBits = 0
body damping  linear = 0, angular = 0
sleep         disabled
motion locks  X free; Y/Z and all angular axes locked
```

ELASTIC weld readback:

```text
linear hertz          1.2310514450073242
linear damping ratio  0.6961432099342346
angular hertz         0
angular damping       1
```

The small difference from compiler-side double-precision tuning is consistent with expected float32 solver representation and passed the preselected `1e-6` readback tolerance. This tolerance is an observation/representation tolerance, not a weakened physical gate.

The hardened run reproduced the original C0 physical values essentially exactly. Classification: **evidence hardening GREEN; no material C0 drift and no physical falsification identified**.

## Ready regression candidate

ANVIL-07 did **not** claim a dedicated browser elasticity evidence class. The experiment-local C0 is not browser-wired merely to repeat quantitative solver results.

Ready/candidate served as exact-build whole-product regression validation:

```text
Ready run           32188493917
source head         a34a769e4892bb5a3c117389af7c2bba47866623
base main           26ed99bcdbef163890212185f368965dae285755
synthetic merge     c206a008458e2a244bf65663f0c11705a1d1c948
synthetic tree      d9833ba637f11c11ca7f01f67924b128191e1ada
Node                42/42 PASS
existing Chromium   19/19 PASS
launcher self-test  PASS
```

Exact-build handoff:

```text
staging artifact    9343333289
staging SHA256      1e99657bf3afcb84a961518c0f1db422c9b2165975f12697cbaf1ab2e4df71bc
final artifact      9343370576
final SHA256        6597412f0720c8069b4b7d26cd2baee596180b5dfb4fa136256d7900fa6c8f4f
final size          424990 bytes
```

The candidate downloaded the build produced by the same core job, the packaged PowerShell launcher self-test passed, and all 19 existing Chromium tests passed. These are **integration/regression evidence**, not direct proof of elasticity.

No owner/manual gate was required because the frozen claim is quantitative and the existing browser gate added no human-only information.

## Promotion identity

PR #12 was merged using expected-head protection after rechecking live `main`, exact PR head, mergeability, Ready provenance and artifacts.

```text
promoted source head  a34a769e4892bb5a3c117389af7c2bba47866623
actual merge          62dcc651f73dc3f228109d3d8922afd534b75950
actual merge tree     d9833ba637f11c11ca7f01f67924b128191e1ada
```

The actual merge tree is **identical** to the synthetic merge tree tested by the Ready candidate.

## Supported interpretation

For the bounded seven-cell one-dimensional fixture, one persistent local authored compliant seam can replace rigid adjacency at a source interface, compile into disposable runtime representation, deform causally under load and restore after unload while remaining strongly distinct from both rigid union and free separation.

The authored source can stay in physical/local vocabulary (`stiffness`, `damping`, adjacent source faces) while Box3D-specific hertz/damping-ratio tuning remains derived runtime detail.

This is the first accepted non-rigid local BINDINGS slice in ANVIL. It is evidence that Machine Matter can move beyond binary rigid-connectivity semantics, but only within the frozen fixture and isolation assumptions above.

## Explicit non-claims

ANVIL-07 does **not** prove:

- generic deformable matter;
- a generic Bond/Relation ontology;
- resolution-independent material compliance;
- that `N/m` and `N*s/m` per discrete seam are constitutive material fields;
- arbitrary interface area/patch scaling;
- shear compliance;
- bending/torsional compliance;
- unconstrained rotational compliance;
- coupled multi-axis constraint reduction;
- arbitrary anchor geometry;
- plasticity, damage or breakage;
- contact-loaded compliant behavior;
- compliant behavior through CUT/REBIND;
- control, signals, power or active compliant behavior;
- non-grid authored matter;
- a reason to promote `ElasticSeam` into `src/foundation`.

The current weld spring is a disposable lowering for this bounded result, not project ontology.

## Strategic consequence

The immediate question “can one local authored connection be physically compliant rather than rigid/free?” is now boundedly supported.

The strongest remaining assumption is **representation/scaling honesty**: does the same physical compliant interface retain the same macroscopic meaning when source resolution or interface patch count changes, without hand-retuning a spring per voxel/face?

Therefore the leading next falsifier is **COMPLIANCE-RESOLUTION**. It should challenge coarse versus finer authored interface representation while preserving the same intended physical interface meaning and allowing authored resolution to differ from disposable solver resolution.

`ACTIVATE` remains the leading runner-up. After at most one deliberate compliance-resolution challenge, the next strategic experiment should force composition of already-earned semantics unless new evidence changes the frontier.
