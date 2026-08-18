# ANVIL-08 / COMPLIANCE-RESOLUTION — preflight

Status: **FROZEN BEFORE IMPLEMENTATION / NO EXECUTABLE RESULT YET**

Strategic source: `docs/RESEARCH_COMPASS.md`.

## Primary question

Can the **same intended physical normal-compliance interface** retain the same macroscopic deformation and recovery when the authored matter/interface is represented at a different source resolution, without hand-retuning a spring per voxel/face and without forcing authored patch count to equal runtime relation count?

This experiment tests representation/scaling honesty after ANVIL-07. It does **not** ask again whether a spring can work.

## Why this is next

ANVIL-07 accepted one bounded local compliant seam for one seven-cell, one-dimensional fixture. Its authored coefficients were total connection values:

```text
normalStiffnessNPerM
normalDampingNsPerM
```

That result explicitly did not establish that one discrete seam coefficient can be copied across a different source resolution.

The strongest current architectural risk is therefore that apparently physical compliance is actually a hidden **spring-per-cell-face convention**. If so, refining the source representation would change macroscopic behavior unless the author manually retuned every patch.

ANVIL's long-horizon contract explicitly says:

- cells are a dialect, not ontology;
- authored and runtime representations may use different resolutions;
- physical parameters should survive scaling/representation challenges;
- solver convenience must not become authored ontology.

ANVIL-08 attacks those assumptions directly before richer control/composition is built on top of compliance.

## Experiment-local authored candidate

Candidate only for ANVIL-08:

```text
NormalCompliancePatch {
  id
  target: { cellId, face }
  normalStiffnessPerAreaNPerM3
  normalDampingPerAreaNsPerM3
}
```

The mark names **one local source face only**. The opposing source face/cell is resolved from authored matter adjacency; the source does not carry an explicit endpoint-B reference.

Deliberately absent:

- Box3D body/joint IDs;
- Box3D joint type;
- runtime relation IDs;
- solver hertz / damping ratio;
- explicit patch area;
- total per-interface `N/m` or `N*s/m` coefficients;
- authored runtime aggregation/group IDs;
- generic Bond / Relation / SurfaceLaw / property-field ontology;
- shear, bending, torsion, damage, plasticity, actuation, control or power semantics.

The field names above are experiment-local hypotheses, not promoted schema.

## Local physical meaning

For one marked face patch with physical area `A`:

```text
normal traction                 t = K_n * delta + C_n * v
K_n = normalStiffnessPerAreaNPerM3
C_n = normalDampingPerAreaNsPerM3
```

where:

```text
delta = normal separation [m]
v     = normal relative speed [m/s]
t     = normal traction [N/m^2]
```

Therefore:

```text
F_patch = t * A
        = (K_n * A) * delta + (C_n * A) * v

k_patch = K_n * A        [N/m]
c_patch = C_n * A        [N*s/m]
```

For several marked patches connecting the same two rigid islands in the **frozen isolated 1D mode**, every patch experiences the same normal separation and normal relative speed, so:

```text
k_total = sum(K_n_i * A_i)
c_total = sum(C_n_i * A_i)
```

This permits several authored patches to compile to one disposable runtime compliant relation.

### Critical validity boundary

The aggregation above is supported only for this experiment's isolated normal translation:

- world-X translation free;
- world-Y/Z translation locked;
- all rotations locked;
- all marked patches coplanar with the same normal;
- no contacts or gravity;
- no shear/tangential compliance.

If rotations, shear, bending, arbitrary anchors or coupled modes are later allowed, distributed patch position can create moments and different local separations. In that case one centroid relation is not generally equivalent and the actual constraint geometry/Jacobian must be respected.

ANVIL-08 must fail closed rather than silently generalize this reduction.

## Source-face resolution semantics

For each `NormalCompliancePatch`:

1. `id` must be non-empty and unique;
2. `target.cellId` must exist;
3. `target.face` must be a valid grid face;
4. the target face must have exactly one face-adjacent authored cell on its opposite side;
5. that adjacency must be an ordinary rigid connection in the unmarked baseline;
6. the opposite cell/face is inferred locally from geometry;
7. marking the face removes that adjacency from ordinary rigid connectivity;
8. the physical patch area is derived as `cellSizeM^2`;
9. stiffness-per-area must be finite and strictly positive;
10. damping-per-area must be finite and non-negative;
11. the same physical face adjacency must not be marked twice, including once from each side.

For C0, all marked patches must additionally resolve to one coplanar interface with one canonical normal and, after all marked adjacencies are blocked, exactly two rigid islands with no alternate rigid bypass.

Source serialization order must not change physical meaning.

## Same physical fixture at two authored resolutions

Use the accepted ANVIL-07 occupied geometry and material density as the physical reference, but represent it in two different source resolutions.

Material:

```text
density rho = 780 kg/m^3
```

### COARSE representation

```text
cellSizeM      = 0.5 m
source cells   = 7
```

Coordinates are the accepted seven-cell geometry:

```text
a:0  (-2,  0, 0)
a:1  (-2,  1, 0)
a:2  (-1,  0, 0)
b:0  ( 0,  0, 0)
b:1  ( 1,  0, 0)
b:2  ( 1, -1, 0)
b:3  ( 2,  0, 0)
```

Marked interface:

```text
a:2@x+
```

The compiler resolves the opposite neighbor `b:0@x-`.

Physical patch:

```text
plane       x = 0
extent Y    0.0 .. 0.5 m
extent Z    0.0 .. 0.5 m
area        0.25 m^2
centroid    (0, 0.25, 0.25) m
patches     1
```

### FINE representation

Every coarse cell is subdivided exactly `2 x 2 x 2` into eight fine cells:

```text
cellSizeM      = 0.25 m
source cells   = 56
```

For coarse grid coordinate `(x,y,z)`, fine cells occupy:

```text
(2x + dx, 2y + dy, 2z + dz)
where dx,dy,dz in {0,1}
```

Use deterministic child IDs:

```text
<coarse-id>/<dx><dy><dz>
```

The same physical interface is now four local face patches:

```text
a:2/100@x+
a:2/101@x+
a:2/110@x+
a:2/111@x+
```

They resolve locally to:

```text
b:0/000@x-
b:0/001@x-
b:0/010@x-
b:0/011@x-
```

Each fine patch area:

```text
0.25 * 0.25 = 0.0625 m^2
```

Total interface area remains:

```text
4 * 0.0625 = 0.25 m^2
```

## Frozen geometry/mass equivalence

The refinement must preserve the same occupied physical volume and mass:

```text
total occupied volume = 0.875 m^3
total mass            = 682.5 kg
```

After blocking the physical interface:

```text
left physical region
  coarse cells = 3
  fine cells   = 24
  mass         = 292.5 kg
  COM          = (-0.5833333333333334, 0.4166666666666667, 0.25) m

right physical region
  coarse cells = 4
  fine cells   = 32
  mass         = 390.0 kg
  COM          = (0.75, 0.125, 0.25) m
```

Generated body IDs and source-cell IDs are **not** required to match across resolutions. Compare physical region meaning using mass/COM/geometry, not runtime or compiler identifier equality.

## Frozen candidate interface coefficients

Choose area-normalized values so the physical `0.25 m^2` interface has the same aggregate coefficients as the accepted ANVIL-07 C0:

```text
K_n = 40000 N/m^3
C_n =  7200 N*s/m^3
```

### COARSE candidate derivation

```text
A       = 0.25 m^2
k_patch = 40000 * 0.25 = 10000 N/m
c_patch =  7200 * 0.25 =  1800 N*s/m

k_total = 10000 N/m
c_total =  1800 N*s/m
```

### FINE candidate derivation

For each of four patches:

```text
A       = 0.0625 m^2
k_patch = 40000 * 0.0625 = 2500 N/m
c_patch =  7200 * 0.0625 =  450 N*s/m
```

Aggregate:

```text
k_total = 4 * 2500 = 10000 N/m
c_total = 4 *  450 =  1800 N*s/m
```

With the frozen island masses:

```text
m_eff              = 167.14285714285717 kg
candidate hertz    = 1.2310514975102163 Hz
candidate zeta     = 0.6961432213383856
static extension   = 1000 / 10000 = 0.1 m
```

These are calibration values for the experiment, not universal material constants.

## Negative control — fixed spring per source patch

A false-positive implementation could copy the old discrete ANVIL-07 totals onto every fine face:

```text
per fine patch
  k = 10000 N/m
  c =  1800 N*s/m
```

This control is intentionally **not** the candidate authored semantics. It is a test-harness/lowering control representing the spring-per-voxel mistake ANVIL-08 is trying to expose.

With four fine patches:

```text
naive k_total = 40000 N/m
naive c_total =  7200 N*s/m
naive hertz   = 2.4621029950204325 Hz
naive zeta    = 1.3922864426767712
naive static extension under 1000 N = 0.025 m
```

If this naive control is not materially distinguishable from the area-normalized fine candidate, the fixture is non-discriminating and must not be used to claim resolution honesty.

## Runtime lowering hypothesis

For C0 only:

- block all marked source-face adjacencies before rigid-component compilation;
- both COARSE and FINE must compile to exactly two physical rigid islands;
- each candidate patch contributes `K_n*A` and `C_n*A`;
- sum patch contributions after source-to-body resolution;
- aggregate the coplanar patches connecting the same two islands into **one** disposable compliant runtime relation at the physical interface centroid;
- derive hertz/damping ratio from aggregate `k_total`, `c_total` and effective island mass;
- do not persist Box3D handles or solver tuning in authored truth.

The FINE source therefore has four authored compliance patches but one runtime compliant relation. This asymmetry is part of the hypothesis, not an optimization side effect.

The existing ANVIL-07 weld spring may be reused internally as a bounded lowering mechanism or donor implementation, but its schema/runtime object must not become authored ANVIL-08 ontology merely for code convenience.

## Frozen laboratory isolation

Use the same isolated physical mode as ANVIL-07 so source resolution is the only new physical variable:

```text
gravity                    0
contacts                   disabled
sleep                      disabled
body linear damping        0
body angular damping       0
world-X translation        free
world-Y/Z translation      locked
all angular DOF            locked
fixed timestep             1/60 s
substeps                   4
```

Apply the same external equal/opposite load at the same **physical interface centroid**, independent of source patch count:

```text
load magnitude per side    1000 N
loaded phase               180 steps
unloaded phase             120 steps
```

The recovery phase has zero external force.

## Executable variants

### COARSE_AREA

7 cells / 0.5 m cells / 1 area-normalized compliance patch.

Expected compiled meaning:

```text
2 rigid bodies
1 runtime compliant relation
k_total = 10000 N/m
c_total = 1800 N*s/m
```

### FINE_AREA

56 cells / 0.25 m cells / 4 area-normalized compliance patches.

Expected compiled meaning:

```text
2 rigid bodies
1 runtime compliant relation
k_total = 10000 N/m
c_total = 1800 N*s/m
```

### FINE_FIXED_PATCH_CONTROL

Same 56-cell physical source geometry and same four interface patches, but the control lowering assigns the old whole-seam `10000 N/m` and `1800 N*s/m` to **each** fine patch before aggregation.

Expected compiled meaning:

```text
2 rigid bodies
1 runtime compliant relation
k_total = 40000 N/m
c_total = 7200 N*s/m
```

This is a deliberately wrong resolution-dependent control, not an authored candidate.

## Frozen gates

All gates below are frozen before implementation and before any executable ANVIL-08 result.

### A — authored/source integrity

For candidate COARSE_AREA and FINE_AREA:

- exact source cell counts: `7` and `56`;
- exact `cellSizeM`: `0.5 m` and `0.25 m`;
- same material density `780 kg/m^3`;
- patch counts: `1` and `4`;
- source contains no Box3D IDs/types, body IDs, hertz, damping ratio, explicit runtime relation ID or authored total interface `N/m` / `N*s/m`;
- patch area is derived from geometry, not authored as a tuning parameter;
- each patch names only one local source face; the opposite side is resolved from adjacency;
- mark ID non-empty and unique;
- stiffness-per-area finite and `> 0`;
- damping-per-area finite and `>= 0`;
- missing cell, invalid face, exterior/non-adjacent target, duplicate physical face pair or duplicate mark ID fails closed;
- marking both sides of the same physical adjacency as two patches fails closed rather than double-counting;
- non-coplanar or mixed-normal patch sets fail closed in this C0 compiler;
- source compilation is non-mutating;
- source array ordering does not change physical meaning.

### B — physical representation and compiled meaning

Candidate COARSE_AREA and FINE_AREA must independently derive:

- occupied volume `0.875 m^3` within `1e-12 m^3`;
- total mass `682.5 kg` within `1e-9 kg`;
- exactly two rigid islands after all marked connections are blocked;
- left/right masses `292.5 kg` / `390.0 kg` within `1e-9 kg`;
- left/right COM equality across resolutions within `1e-12 m` per component;
- total physical interface area `0.25 m^2` within `1e-12 m^2`;
- patch counts remain `1` versus `4` at authored/compiled provenance level;
- runtime compliant relation count is exactly `1` for both resolutions;
- candidate aggregate `k_total = 10000 N/m` within `1e-9 N/m`;
- candidate aggregate `c_total = 1800 N*s/m` within `1e-9 N*s/m`;
- candidate effective mass `167.14285714285717 kg` within `1e-10 kg`;
- candidate derived hertz and damping ratio match the frozen equations within compiler-side numerical tolerance;
- runtime/compiler IDs are not required to be equal across coarse/fine representations.

FINE_FIXED_PATCH_CONTROL must independently derive:

- the same physical bodies/masses/COM as FINE_AREA;
- one runtime relation;
- `k_total = 40000 N/m` within `1e-9 N/m`;
- `c_total = 7200 N*s/m` within `1e-9 N*s/m`;
- hertz `2.4621029950204325 Hz` and damping ratio `1.3922864426767712` within compiler-side numerical tolerance.

If coarse/fine physical mass or COM differs materially before compliance lowering, stop: the representation fixture itself is invalid.

### C — real-solver loaded equivalence and discrimination

After the frozen 180-step load phase, all states must be finite.

COARSE_AREA:

- normal extension between `0.07 m` and `0.13 m`;
- absolute relative normal speed `<= 0.10 m/s`.

FINE_AREA:

- normal extension between `0.07 m` and `0.13 m`;
- absolute relative normal speed `<= 0.10 m/s`.

Resolution equivalence:

- absolute loaded extension difference `|x_coarse - x_fine| <= 0.001 m`.

FINE_FIXED_PATCH_CONTROL:

- loaded extension between `0.015 m` and `0.040 m`;
- `FINE_AREA extension - control extension >= 0.040 m`.

The control gate is essential: it demonstrates that simply copying a fixed spring to each fine source patch would change macroscopic behavior and that the fixture can observe the error.

### D — unloaded recovery equivalence

After the frozen additional 120 steps with zero external load:

COARSE_AREA and FINE_AREA independently:

- absolute extension `<= 0.015 m`;
- absolute relative normal speed `<= 0.15 m/s`;
- loaded-to-recovered reduction in extension magnitude `>= 0.06 m`.

Across resolutions:

- absolute recovered extension difference `<= 0.001 m`.

The naive control is not required to match candidate recovery; its role is loaded resolution discrimination.

### E — no hidden whole-system propulsion / harness help

For COARSE_AREA and FINE_AREA during loaded and recovered observations:

- total linear momentum magnitude `<= 0.05 kg*m/s`;
- barycenter displacement `<= 0.0005 m`;
- direct runtime receipt verifies zero gravity;
- direct runtime receipt verifies no body linear/angular damping;
- direct runtime receipt verifies sleep disabled;
- direct runtime receipt verifies X free, Y/Z and all angular axes locked;
- direct runtime receipt verifies contacts disabled;
- direct runtime receipt verifies runtime body count `2` and runtime compliant relation count `1`.

External force schedule and physical load points must be identical across all variants.

## Evidence classes

Initial decision requires:

- **A** static/source validation;
- **B** pure compiler/representation derivation;
- **C** real pinned Box3D runtime evidence for candidate equivalence and naive-control discrimination.

Dedicated browser evidence is not part of the ANVIL-08 physics claim. Existing Ready/candidate browser + launcher gates may still be used later as exact whole-product regression before promotion.

Owner/manual evidence is not required unless a genuinely human-only uncertainty appears.

## Failure interpretation

Do not change frozen thresholds merely to obtain PASS.

- coarse/fine occupied volume, mass or COM mismatch -> **fixture/compiler representation defect**; stop before interpreting compliance;
- local marked face cannot resolve its neighbor deterministically -> **semantic/locality failure**;
- duplicate/opposite-face marking can double-count one adjacency -> **semantic/compiler failure**;
- fine source remains one rigid island because not all physical interface adjacencies are blocked -> **semantic/compiler failure**;
- candidate aggregate `k,c` changes with patch count -> **primary scaling falsification / semantic failure**;
- candidate coarse/fine compile to equal aggregate meaning but real solver differs materially -> **runtime/lowering representation failure**;
- FINE_FIXED_PATCH_CONTROL does not materially diverge -> **non-discriminating fixture or control defect**;
- both candidate representations match each other only because both behave outside the absolute elastic/recovery gates -> **false equivalence; physical regression/failure**;
- implementation requires authored runtime IDs, explicit Box3D joint semantics or one runtime relation per source patch merely to proceed -> **solver-shadow / architecture warning; stop and reassess before adding abstraction**;
- exact pinned binding cannot execute the planned aggregate relation -> **toolchain/lowering block**, not evidence against area-normalized authored meaning.

Classify any red result before modifying code, fixture or gates.

## Explicit non-claims

A green ANVIL-08 would **not** prove:

- general mesh/objectivity or continuum convergence;
- resolution independence beyond this exact 2x refinement and fixture;
- that the candidate field names are final Machine Matter ontology;
- a generic local-property field system;
- generic compliant/deformable matter;
- arbitrary interface geometry;
- arbitrary patch orientation;
- shear, bending or torsional compliance;
- rotationally free distributed compliance;
- heterogeneous compliance patches;
- contact-loaded compliance;
- damage, fracture, plasticity or fatigue;
- compliant CUT/REBIND continuity;
- transient control, signals or power;
- that one aggregated runtime relation remains valid outside the frozen 1D mode;
- a reason to promote `NormalCompliancePatch` or `ElasticSeam` into `src/foundation`.

A green result would support only this narrower statement:

> in the frozen one-dimensional fixture, local normal-compliance meaning can be expressed per physical source-face area so a 2x source refinement preserves the same macroscopic compliant response without per-patch retuning, while four authored patches may compile to one disposable runtime relation.

## Stop rule

If the frozen candidate equivalence and naive-control discrimination resolve cleanly:

- stop ANVIL-08;
- do not add a third resolution merely to collect another PASS;
- do not add stiffness sweeps, heterogeneity, rotation, shear, contact, damage or REBIND;
- do not promote a generic property-field or compliant-surface foundation schema from this one result.

After ANVIL-08 resolves, the strategic default is to force a **composition checkpoint** (currently ACTIVATE is the leading candidate) unless the result itself exposes a more consequential contradiction.
