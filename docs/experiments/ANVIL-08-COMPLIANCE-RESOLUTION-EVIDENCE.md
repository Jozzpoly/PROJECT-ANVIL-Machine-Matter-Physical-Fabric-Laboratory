# ANVIL-08 / COMPLIANCE-RESOLUTION — evidence

Status: **PROMOTED / ACCEPTED FOR THE FROZEN FIXTURE**

This file records the exact evidence chain for ANVIL-08. It does not broaden the frozen preflight claim.

## Frozen question

Can the same intended physical normal-compliance interface retain the same macroscopic deformation and recovery under an exact 2x authored source refinement, without hand-retuning a spring per voxel/face and without forcing authored patch count to equal runtime relation count?

Frozen contract:

- `docs/experiments/ANVIL-08-COMPLIANCE-RESOLUTION-PREFLIGHT.md`
- pre-implementation frozen head `a1e1000cfd6b40c9e84e2d86a4f735f37205af9f`

## Promotion identity

```text
preflight head          a1e1000cfd6b40c9e84e2d86a4f735f37205af9f
A/B source              60efa6a7b526223eb5de58d294dee03563dc64ff
A/B Draft/core run      32190374538
C0 source               e0cdb9e4e1397042f012ae532dddc7e0e5816d05
C0 Draft/core run       32190721229
hardening source        5f0c0db3cdf7eed79c9c1fc00e3c7e1ef1817201
hardening Draft run     32190959941
Ready source            5f0c0db3cdf7eed79c9c1fc00e3c7e1ef1817201
Ready run               32191041240
Ready synthetic merge   92d4eb6677a9029bafea0a19b2185c4de479a95d
qualified tree          00230b73e283bdb39eedc3df00299b6d14c5aba9
actual material merge   78bcee7665b7a1642ca5f70014a3d0fb25c0aa1a
actual merge tree       00230b73e283bdb39eedc3df00299b6d14c5aba9
```

The Ready synthetic merge and actual material merge have the **same tree**. The actual merge parents are the qualified base `f4c37dc39fabfe06a29522e60128edf3da9c3d43` and qualified source head `5f0c0db3cdf7eed79c9c1fc00e3c7e1ef1817201`.

## Evidence progression

### A/B — source and compiler

Source `60efa6a7b526223eb5de58d294dee03563dc64ff`, Draft/core run `32190374538`:

- **43/43 Node tests PASS**;
- production build PASS;
- candidate skipped because the PR was Draft.

This established source/compiler behavior only. It was not treated as ANVIL-08 physics evidence.

### C0 — first real-solver result

Source `e0cdb9e4e1397042f012ae532dddc7e0e5816d05`, Draft/core run `32190721229`:

- **44/44 Node tests PASS**;
- production build PASS;
- real pinned Box3D execution produced the frozen C0 telemetry below.

### Post-C0 evidence hardening

Source `5f0c0db3cdf7eed79c9c1fc00e3c7e1ef1817201`, Draft/core run `32190959941`:

- **44/44 Node tests PASS**;
- production build PASS;
- C0 telemetry reproduced unchanged.

The hardening changed only the two ANVIL-08 test files. It added explicit evidence for:

- `780 kg/m^3` density at both source resolutions;
- exact locally resolved opposite faces;
- cell-array order and patch-array order invariance independently;
- physical identity of FINE_AREA and the naive control apart from compliant coefficients;
- complete two-body coverage of per-body runtime receipt maps.

No source/runtime/preflight physics was changed.

### Ready candidate / integration regression

Ready run `32191041240` on source `5f0c0db3cdf7eed79c9c1fc00e3c7e1ef1817201` and synthetic merge `92d4eb6677a9029bafea0a19b2185c4de479a95d`:

Core:

- **44/44 Node tests PASS**;
- production build PASS;
- C0 telemetry reproduced unchanged;
- staging artifact `anvil-browser-staging`, artifact ID `9344193210`, size `424994` bytes, SHA256 `6b5e9e712839c5c2aa1f7eeb54d9f1fb3d8c109f8ef859d606858d43f059aa57`.

Candidate:

- downloaded that exact staging artifact and verified the same SHA256;
- packaged Windows owner launcher self-test PASS;
- **19/19 Chromium tests PASS**;
- final artifact `anvil-browser-laboratory`, artifact ID `9344233036`, size `424994` bytes, SHA256 `343e57b021b5c9e0839d592dabbfc9c467289c0373b5cd246adeadfa6493e4ce`.

The launcher/Chromium result is **whole-product integration/regression evidence only**. ANVIL-08's compliance claim comes from the frozen structural/compiler and real-solver C0 gates, not from browser presentation.

## Frozen physical representations

### COARSE_AREA

```text
cellSizeM          0.5 m
source cells       7
authored patches   1
occupied volume    0.875 m^3
interface area     0.25 m^2
aggregate k        10000 N/m
aggregate c        1800 N*s/m
runtime bodies     2
runtime joints     1
```

### FINE_AREA

```text
cellSizeM          0.25 m
source cells       56
authored patches   4
occupied volume    0.875 m^3
interface area     0.25 m^2
aggregate k        10000 N/m
aggregate c        1800 N*s/m
runtime bodies     2
runtime joints     1
```

The fine authored source has four local compliance patches while the frozen 1D lowering has one disposable runtime compliant relation.

### FINE_FIXED_PATCH_CONTROL

Same 56-cell matter, same four physical interface patches, same two physical bodies and same load point, but the intentionally wrong control copies the old whole-seam coefficients onto each fine patch:

```text
aggregate k        40000 N/m
aggregate c        7200 N*s/m
runtime bodies     2
runtime joints     1
```

This is a negative harness/lowering control, not accepted authored semantics.

## Physical equivalence before compliance

Both candidate resolutions preserve:

```text
total occupied volume   0.875 m^3
total mass              682.5 kg

left region mass        292.5 kg
left region COM         (-0.5833333333333334, 0.4166666666666667, 0.25) m

right region mass       390.0 kg
right region COM        (0.75, 0.125, 0.25) m

interface centroid      (0, 0.25, 0.25) m
interface normal        +X
interface area          0.25 m^2
```

Generated compiler/body IDs differ across source resolutions and are not part of the equivalence claim.

## Candidate constitutive derivation in this experiment

Frozen area-normalized authored candidate:

```text
K_n = 40000 N/m^3
C_n =  7200 N*s/m^3
```

For patch area `A`:

```text
k_patch = K_n * A
c_patch = C_n * A
```

Thus one coarse `0.25 m^2` patch and four fine `0.0625 m^2` patches both aggregate to:

```text
k_total = 10000 N/m
c_total =  1800 N*s/m
m_eff   = 167.14285714285717 kg
hertz   = 1.2310514975102163
zeta    = 0.6961432213383856
```

The naive control instead aggregates to:

```text
k_total = 40000 N/m
c_total =  7200 N*s/m
hertz   = 2.4621029950204325
zeta    = 1.3922864426767712
```

## Raw C0 discrimination

Frozen load schedule:

```text
force per side    1000 N, equal/opposite
loaded phase      180 steps
unloaded phase    120 steps
step              1/60 s
substeps          4
```

Loaded result:

```text
COARSE_AREA extension                 0.09999978542327881 m
FINE_AREA extension                   0.09999978542327881 m
absolute coarse/fine loaded delta     0 m
FINE_FIXED_PATCH_CONTROL extension    0.024999499320983887 m
FINE_AREA - control                   0.07500028610229492 m
```

Recovered result:

```text
COARSE_AREA extension                 -0.0000023245811462402344 m
FINE_AREA extension                   -0.0000023245811462402344 m
absolute coarse/fine recovered delta  0 m
```

The naive control is strongly discriminating: copying a fixed whole-seam spring onto every fine source patch materially changes the macroscopic loaded response, while area-normalized authored meaning preserves the frozen candidate response across this exact 2x refinement.

## Direct solver-state receipt

For COARSE_AREA and FINE_AREA the exact pinned solver reported:

- Box3D `0.1.0`;
- `2` runtime bodies;
- `1` runtime joint;
- zero gravity;
- contacts disabled;
- zero linear/angular body damping;
- sleep disabled;
- world-X translation free;
- world-Y/Z translation locked;
- all angular axes locked;
- zero runtime mass error for both physical regions;
- local COM error at approximately `1.30417e-8 m` on one region and `0` on the other;
- weld linear hertz / damping-ratio readback matching compiled intent within the frozen runtime observation tolerance.

Candidate hidden-help diagnostics remained far inside frozen guards. Representative candidate values:

```text
loaded momentum magnitude      0.00012676231563091278 kg*m/s
loaded barycenter drift        4.172325134277344e-7 m
recovered momentum magnitude   0.00016803741118565085 kg*m/s
recovered barycenter drift     8.514949253468629e-7 m
```

## Accepted interpretation

ANVIL-08 supports this bounded statement:

> In the frozen one-dimensional fixture, local normal-compliance meaning expressed per physical source-face area survives an exact 2x authored source refinement without manual per-patch retuning, while four authored patches may compile to one disposable runtime compliant relation.

The result also demonstrates a concrete representation-decoupling property important to ANVIL: **authored source resolution and runtime relation resolution need not be one-to-one** in this bounded case.

## Non-claims

This result does **not** establish:

- continuum convergence;
- arbitrary or repeated resolution independence beyond this exact 2x probe;
- generic deformable matter;
- a generic SurfaceLaw, Bond, Relation or local-property field architecture;
- arbitrary interface geometry/orientation;
- rotationally free distributed compliance;
- shear, bending or torsional compliance;
- heterogeneous compliance fields;
- contact-loaded compliance;
- damage, fracture, plasticity or fatigue;
- compliant CUT/REBIND continuity;
- transient control, signals or power;
- general validity of aggregating distributed patches into one runtime joint outside the frozen 1D mode.

`NormalCompliancePatch`, its area-normalized coefficient names, the ANVIL-08 relation schema, the ANVIL-07 compatibility adapter and the 4-authored-patches -> 1-runtime-relation lowering remain **experiment-local**. This promotion does not move them into `src/foundation`.

## Stop rule disposition

The frozen question resolved cleanly. ANVIL-08 stops here:

- no third resolution;
- no stiffness/damping sweep;
- no heterogeneity;
- no rotation/shear/contact/damage;
- no REBIND or ACTIVATE enrichment inside ANVIL-08.

Per the Research Compass composition rule, the leading next strategic candidate is now **ACTIVATE**, to force composition of already-earned semantics. It is not active or frozen merely because ANVIL-08 passed.
