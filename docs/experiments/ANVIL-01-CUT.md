# ANVIL-01 / CUT

Status: **IN PROGRESS — AUTOMATED REAL-SOLVER CORE SUPPORTED; CUT-SPECIFIC PRODUCT/OWNER GATE PENDING**

Current branch: `experiment/anvil-01-cut`

ANVIL-01 asks whether a physical runtime can be replaced after a mass-preserving topology change while persistent authored matter identity survives and measured physical state remains continuous within explicit tolerances.

This is **not** a destruction-system milestone. CUT exists to test the claim that runtime bodies are disposable interpretations of persistent matter.

## Experiment progression

The experiment was deliberately staged so each failure had one main class of explanation:

```text
exact binding round-trip
    ↓
mass-preserving topology
    ↓
free translation
    ↓
free translation + rotation
    ↓
uniform gravity
    ↓
settled contact
    ↓
dynamic impact after reconstruction
    ↓
one-lobe contact at the transaction boundary
```

All stages above are now supported for their declared fixtures by real Box3D tests on the experiment branch. This does **not** imply general fracture, arbitrary-world in-place replacement, joint/constraint transfer, or deformable matter.

## Fixed control

- exact `box3d.js@0.0.2`;
- runtime reports Box3D `0.1.0`;
- accepted ANVIL-00 compiler/runtime remains regression control;
- no solver/binding upgrade is mixed into CUT;
- production build and the existing ANVIL-00 Chromium runtime regression remain required on every checkpoint.

Upstream `box3d.js` has newer breaking API generations. Upgrading it inside CUT would add an independent experimental variable and is therefore deferred.

---

## CUT-0 — exact binding state round-trip

Evidence class: **REAL SOLVER**.

Test: `tests/cut-binding-capability.mjs`.

Demonstrated on the exact pinned binding:

- explicit initial position/orientation;
- explicit initial linear/angular velocity;
- read-back of pose and motion state;
- mass/COM observation;
- explicit transform and velocity mutation;
- subsequent real solver stepping with finite advancing state.

### Negative/calibration evidence

The first deliberately over-tight quaternion gate failed only at:

```text
1 - abs(dot(q_expected, q_actual)) = 5.383741452646973e-9
initial threshold                  = 1e-10
```

All prior tests remained green. The threshold was classified as incompatible with the actual single-precision state representation rather than evidence of missing API capability.

Final binding gates:

- vector state tolerance: `2e-6`;
- quaternion alignment tolerance: `1e-7`.

Verdict: **SUPPORTED FOR EXACT PINNED BINDING**.

---

## CUT-1 — mass-preserving topology split

Evidence class: **PURE SYNTHETIC / COMPILER**.

Test: `tests/cut-topology.test.mjs`.

ANVIL-00 deleted a bridge cell and therefore changed mass. CUT instead keeps all authored matter and blocks one otherwise implicit face-rigidity connection:

```text
cell:-1:0:0 <-> cell:0:0:0
```

The compiler option `blockedFaceConnections` is experiment-local:

- it is not persisted in `MatterDocument`;
- it is not a generic `Bond`, `Joint`, or `Constraint` ontology;
- it validates source IDs and face adjacency;
- pair direction is canonical;
- duplicate/invalid connections fail closed.

Validated:

- `51 cells / 1 body → 51 cells / 2 bodies`;
- identical source-ID set;
- zero source additions/removals;
- unchanged compiled mass within `1e-9 kg` test tolerance;
- exactly one provenance `split` covering all 51 source IDs;
- deterministic output under source and pair reordering.

Verdict: **SUPPORTED FOR FIXTURE**.

---

## CUT-2A — free translation transfer

Evidence class: **REAL SOLVER**.

Test: `tests/cut-translation-transfer.mjs`.

Fixture:

- non-zero parent linear velocity;
- identity orientation;
- `ω = 0`;
- zero gravity;
- no ground/contact.

The parent runs for 23 real Box3D frames, its actual state is snapshotted, runtime A is retired, the same 51 source cells are compiled as two bodies, and runtime B is initialized from the transferred state.

Hard gates include:

- child COM position error `< 5e-5 m`;
- linear velocity error `< 5e-6 m/s`;
- angular velocity error `< 5e-6 rad/s`;
- total Box3D mass delta `<= 0.1 kg`;
- immediate total linear-momentum error `< 0.5 kg·m/s`;
- post-step total linear-momentum error `< 1.0 kg·m/s`;
- finite post-step state.

Verdict: **SUPPORTED FOR FREE-TRANSLATION FIXTURE**.

---

## CUT-2B — free rotating rigid-field transfer

Evidence class: **REAL SOLVER**.

Test: `tests/cut-rotation-transfer.mjs`.

Candidate transfer policy remains experiment-local:

```text
r_world     = R_parent · (COM_child_authored - COM_parent_authored)
COM_child   = COM_parent_world + r_world
R_child     = R_parent
ω_child     = ω_parent
v_child     = v_parent + ω_parent × r_world
```

The test contains sensitivity gates so a near-translational fixture cannot accidentally pass. It also checks the instantaneous rigid velocity field at the actual severed interface, not only at the child COMs.

Measured on the accepted run:

```text
max rotated-COM effect                 0.4195247840 m
max ω×r child-velocity effect          1.4641147108 m/s
immediate total momentum error         4.2190387e-5 kg·m/s
post-step total momentum error         4.2190387e-5 kg·m/s
max post-step child COM Δv             0 m/s
parent translational KE                2928.0945 J
child-COM translational KE             4429.8546 J
child-COM translational KE delta       +1501.7600 J
```

The translational-energy increase is **diagnostic, not a conservation failure claim**: parent rotational motion is repartitioned into child COM translational motion. Current ANVIL inertia representation is insufficient for an honest arbitrary-orientation total rotational-energy/angular-momentum claim.

Verdict: **SUPPORTED FOR FREE ROTATING FIXTURE**.

---

## CUT-2C — uniform gravity matched control

Evidence class: **REAL SOLVER**.

Test: `tests/cut-gravity-transfer.mjs`.

The source runs under non-zero gravity. From the same measured snapshot:

- a fresh unsplit control is reconstructed and stepped once;
- the split candidate is reconstructed and stepped once.

This compares topology replacement against the actual Box3D integration result instead of analytically guessing the integrator.

Measured:

```text
gravity velocity effect                0.1636449357 m/s
split-vs-control momentum error        1.9939918e-4 kg·m/s
barycenter error                       3.2117069e-8 m
mean velocity error                    0 m/s
max child velocity error               0 m/s
max child position error               1.5736746e-7 m
```

Verdict: **SUPPORTED FOR UNIFORM-GRAVITY FIXTURE**.

---

## CUT-2D1 — settled supported contact reconstruction

Evidence class: **REAL SOLVER**.

Test: `tests/cut-contact-support-transfer.mjs`.

The source is not assumed to be in contact: it must actually fall onto the real Box3D ground and satisfy support/settling sensitivity gates before its state is accepted.

Measured source evidence:

```text
real fall distance                     2.8505166985 m
lowest source point                    -1.6698486e-5 m relative to ground y=0
source linear speed                    7.8240253e-8 m/s
source angular speed                   1.7986223e-7 rad/s
```

Fresh unsplit and split reconstructions from the same supported state were compared after one step and over 30 steps.

Measured split-vs-unsplit differences:

```text
one-step barycenter error              3.9496909e-5 m
one-step mean velocity error           1.8130976e-4 m/s
one-step momentum error                0.27207796 kg·m/s
30-step barycenter error               4.5956406e-5 m
30-step mean velocity error            3.4675068e-7 m/s
30-step momentum error                 5.2034273e-4 kg·m/s
max child support gap                  1.0258910e-4 m
```

Boundary: unsplit is not a perfect physical oracle after topology changes; this stage primarily demonstrates no artificial launch, sink, or numerical collapse from reconstructing a supported state.

Verdict: **SUPPORTED FOR SETTLED-CONTACT FIXTURE**.

---

## CUT-2D2 — dynamic impact after reconstruction

Evidence class: **REAL SOLVER**.

Test: `tests/cut-contact-support-transfer.mjs`.

A stronger oracle is used than in D1:

- reference world: split topology exists throughout free fall;
- candidate world: the same split topology is reconstructed from the parent immediately before impact.

Thus both worlds have identical post-cut topology. Their meaningful difference is runtime history/reconstruction, not a legitimate change in collision topology.

Measured:

```text
pre-impact source step                 44
pre-impact gap                         0.1463343506 m
pre-impact downward speed              7.3333234787 m/s
max pre-impact child position error    8.9406967e-8 m
max pre-impact child velocity error    6.7501560e-13 m/s
impact after reconstruction            4 steps
contact velocity-response effect       8.0958188283 m/s
impact barycenter error                2.1168852e-7 m
impact mean velocity error             2.6283642e-7 m/s
impact momentum error                  3.9441889e-4 kg·m/s
post-impact barycenter error           2.4495549e-7 m
post-impact mean velocity error        2.5039557e-7 m/s
post-impact momentum error             3.7574984e-4 kg·m/s
max post-impact child position error   2.4733410e-7 m
max post-impact child velocity error   5.0253762e-7 m/s
```

Verdict: **SUPPORTED FOR PRE-IMPACT RECONSTRUCTION FIXTURE**.

Boundary: this proves reconstruction immediately **before** a strong contact event, not preservation of an already-existing contact manifold.

---

## CUT-2D3 — one-lobe contact at transaction boundary

Evidence class: **REAL SOLVER**.

Test: `tests/cut-contact-one-lobe-transfer.mjs`.

This stage was added after re-reading the preflight, which explicitly called for a CUT while one future lobe is already in ground contact.

### Negative evidence from first fixture

The first tilted-plane fixture found a parent state that had already experienced contact, but it was effectively a post-impulse/bounce state. After split reconstruction, `ground` and `no-ground` worlds differed by only:

```text
external momentum difference = 1.9413948e-4 kg·m/s
```

The hard gate required `>= 5 kg·m/s`, so the test correctly failed. The threshold was **not** relaxed.

### Corrected fixture

The second fixture uses the real finite ground-box edge (`x=-8`). Placement is derived from compiled child bounds rather than a guessed absolute pose:

- future left child is raised and completely outside the ground footprint;
- future right child is lowered and extends over the ground;
- the old parent must already differ measurably from an otherwise identical no-ground control before the snapshot is accepted.

This produced an actual active one-lobe contact at step 5.

Measured:

```text
contact child                          body:cell:0:0:0
airborne child                         body:cell:-1:0:0
source contact bottom                  -0.0002895686 m
source airborne bottom                  0.3427233285 m
source airborne max X                  -8.0646117370 m
source contact max X                   -5.9356045346 m
source ground linear effect             0.5644119566 m/s
source ground angular effect            0.4599841644 rad/s
reconstructed external ground impulse  61.11805735 kg·m/s
contact-child velocity effect           0.0768644029 m/s
airborne-child velocity effect          0.0244554880 m/s
contact-child upward effect             0.0741645098 m/s
contact bottom after one step          -0.0001693423 m
airborne bottom after one step          0.3254897366 m
minimum bottom after follow-up           0.0002238864 m
```

The airborne child is allowed to receive some response because the newly split bodies still contact one another at the severed interface; forbidding that transfer would prescribe physics rather than measure it.

Verdict: **SUPPORTED FOR ACTIVE ONE-LOBE CONTACT FIXTURE**.

---

## Latest automated checkpoint

Exact validated head before documentation checkpoint:

```text
6e227b4dab96d774d278162fa9da0fe14791fe2f
```

GitHub Actions run `32070074736`:

- canonical Node/npm: PASS;
- strict TypeScript: PASS;
- **20/20** foundation/compiler/real-Box3D tests: PASS;
- production Vite build: PASS;
- real Chromium ANVIL-00 regression: PASS;
- browser artifact upload: PASS.

The Chromium gate at this checkpoint is still the accepted **ANVIL-00 / COLLAPSE** product-runtime regression. CUT itself is not yet represented by a dedicated browser/owner-facing experiment path.

---

## Current verdict

The original automated core research question is now supported for the bounded CUT fixtures:

> A moving and rotating rigid island can be recompiled from one runtime body into two mass-preserving bodies at a solver-step boundary while persistent source identity survives and measured pose/velocity/linear-momentum continuity remains bounded across free motion, gravity and the tested contact cases.

Verdict for that bounded automated claim: **SUPPORTED FOR FIXTURES**.

ANVIL-01 as a branch/lifecycle remains **IN PROGRESS** because CUT-specific real-product-runtime and owner manual validation have not yet occurred.

## Explicit evidence boundary

Current evidence does **not** prove:

- in-place replacement of bodies inside one persistent populated Box3D world;
- preservation/migration of Box3D contact-manifold internals;
- external joint/constraint state transfer;
- arbitrary topology edits or arbitrary cut surfaces;
- full angular-momentum or rotational-energy conservation;
- damage/fracture propagation, crack geometry, debris, toughness, plasticity or failure mechanics;
- deformable/compliant matter;
- universal material/connection ontology.

All runtime transfer fixtures currently reconstruct a disposable Box3D world/runtime around persistent source state. Ground geometry is recreated identically when used.

## Next operational gate

Do **not** expand into joints, constraints or damage yet.

Next work should create a bounded **CUT-specific browser/product-runtime evidence path** that visibly and automatically demonstrates the central transaction with real Box3D in the production browser build, while keeping accepted ANVIL-00/COLLAPSE as an independent regression control.

After that gate and owner inspection, decide whether ANVIL-01 is ready for acceptance/promotion and only then select the next physical falsifier.
