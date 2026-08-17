# ANVIL-01 / CUT

Status: **READY FOR OWNER VALIDATION — AUTOMATED SOLVER + PRODUCTION-BROWSER EVIDENCE SUPPORTED FOR FIXTURES; NOT YET OWNER-ACCEPTED**

Current branch: `experiment/anvil-01-cut`

ANVIL-01 asks whether a physical runtime can be replaced after a **mass-preserving topology change** while persistent authored matter identity survives and measured physical state remains continuous within explicit tolerances.

CUT is not a destruction-system milestone. It tests a narrower architectural claim:

> authored matter may remain authoritative while disposable runtime bodies are rebuilt when topology changes.

The experiment currently reconstructs an isolated Box3D runtime/world around persistent source state. It does **not** yet prove arbitrary in-place fracture inside a populated persistent world.

## Progression and evidence classes

The falsifier was deliberately escalated one variable at a time:

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
one-lobe active contact at transaction
    ↓
production-browser CUT transaction
    ↓
owner manual validation          ← pending
```

Evidence accumulated across:

- compiler/synthetic gates;
- real Box3D solver tests;
- production build;
- real Chromium product runtime;
- packaged Windows owner launcher self-test;
- owner manual validation — **pending**.

## Fixed control

- exact `box3d.js@0.0.2`;
- runtime asserts Box3D `0.1.0`;
- accepted ANVIL-00 / COLLAPSE remains an independent regression control;
- no Box3D/binding upgrade is mixed into CUT;
- production build and browser regression are required for the owner package.

Upstream `box3d.js` has newer breaking API generations. Upgrading it during CUT would add an independent experimental variable and is therefore deferred.

---

## CUT-0 — exact binding state round-trip

Evidence class: **REAL SOLVER**.

Test: `tests/cut-binding-capability.mjs`.

The exact pinned binding demonstrated:

- explicit initial position/orientation;
- explicit initial linear/angular velocity;
- read-back of pose and motion state;
- mass/COM observation;
- explicit transform and velocity mutation;
- subsequent real Box3D stepping with finite advancing state.

### Negative/calibration evidence

The first deliberately over-tight quaternion gate failed at:

```text
1 - abs(dot(q_expected, q_actual)) = 5.383741452646973e-9
initial threshold                  = 1e-10
```

All pre-existing tests remained green. The failure was classified as a numerical-threshold calibration problem rather than missing API capability. The final probe uses tolerances compatible with the observed single-precision representation:

- vector state: `2e-6`;
- quaternion alignment: `1e-7`.

Verdict: **SUPPORTED FOR EXACT PINNED BINDING**.

---

## CUT-1 — mass-preserving topology split

Evidence class: **PURE SYNTHETIC / COMPILER**.

Test: `tests/cut-topology.test.mjs`.

ANVIL-00 removed a bridge cell and therefore changed mass. CUT instead retains all authored matter and blocks one otherwise implicit face-rigidity connection:

```text
cell:-1:0:0 <-> cell:0:0:0
```

The compiler option `blockedFaceConnections` is intentionally experiment-local:

- not persisted in `MatterDocument`;
- not promoted as a generic Bond/Joint/Constraint ontology;
- validates source IDs and true face adjacency;
- canonicalizes pair direction;
- rejects duplicate/invalid connections.

Validated:

- `51 cells / 1 body → 51 cells / 2 bodies`;
- identical source-ID set;
- zero source additions/removals;
- unchanged total compiled mass within `1e-9 kg` test tolerance;
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

The intact parent runs for 23 real Box3D frames, its actual state is measured, runtime A is retired, the same 51 source cells are compiled as two bodies, runtime B is initialized from the transferred state, and the replacement world takes a real solver step.

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

Experiment-local candidate transfer:

```text
r_world     = R_parent · (COM_child_authored - COM_parent_authored)
COM_child   = COM_parent_world + r_world
R_child     = R_parent
ω_child     = ω_parent
v_child     = v_parent + ω_parent × r_world
```

The test includes sensitivity gates so a near-translational fixture cannot accidentally pass. It also measures the instantaneous rigid velocity field at the severed interface, not only at child COMs.

Measured:

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

The translational-energy increase is diagnostic, not a conservation failure claim: part of the parent rotational field becomes translational motion of separated child COMs. Current ANVIL inertia representation is insufficient for an honest arbitrary-orientation total rotational-energy/angular-momentum claim.

Verdict: **SUPPORTED FOR FREE ROTATING FIXTURE**.

---

## CUT-2C — uniform gravity matched control

Evidence class: **REAL SOLVER**.

Test: `tests/cut-gravity-transfer.mjs`.

The source runs under non-zero gravity. From one measured state:

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

The source must really fall onto the Box3D ground and satisfy support/settling sensitivity gates before its state is accepted.

Measured source evidence:

```text
real fall distance                     2.8505166985 m
lowest source point                    -1.6698486e-5 m relative to ground y=0
source linear speed                    7.8240253e-8 m/s
source angular speed                   1.7986223e-7 rad/s
```

Fresh unsplit and split reconstructions were compared after one step and over 30 steps:

```text
one-step barycenter error              3.9496909e-5 m
one-step mean velocity error           1.8130976e-4 m/s
one-step momentum error                0.27207796 kg·m/s
30-step barycenter error               4.5956406e-5 m
30-step mean velocity error            3.4675068e-7 m/s
30-step momentum error                 5.2034273e-4 kg·m/s
max child support gap                  1.0258910e-4 m
```

Boundary: the unsplit body is not a perfect physical oracle after topology changes. This stage primarily demonstrates no artificial launch, sink, or numerical collapse when reconstructing a supported state.

Verdict: **SUPPORTED FOR SETTLED-CONTACT FIXTURE**.

---

## CUT-2D2 — dynamic impact after reconstruction

Evidence class: **REAL SOLVER**.

Test: `tests/cut-contact-support-transfer.mjs`.

A stronger reference is used:

- reference: split topology exists throughout free fall;
- candidate: the same split topology is reconstructed from the parent immediately before impact.

Thus both worlds have identical post-cut topology; their meaningful difference is runtime history/reconstruction.

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

Boundary: reconstruction happens before contact begins. This is not preservation/migration of an existing Box3D contact manifold.

---

## CUT-2D3 — active one-lobe contact at transaction boundary

Evidence class: **REAL SOLVER**.

Test: `tests/cut-contact-one-lobe-transfer.mjs`.

This stage was retained because the preflight explicitly called for a CUT while one future lobe is already in ground contact.

### Negative evidence from first fixture

The first tilted-plane fixture selected a parent state that had experienced contact but was effectively post-impulse/bounce. After split reconstruction, `ground` vs `no-ground` worlds differed by only:

```text
external momentum difference = 1.9413948e-4 kg·m/s
```

The hard gate required `>= 5 kg·m/s`, so the test correctly failed. The threshold was not relaxed.

### Corrected edge-contact fixture

The replacement fixture uses the finite ground-box edge (`x=-8`). Placement is derived from compiled child bounds:

- future left child is raised and completely outside the ground footprint;
- future right child is lowered and extends over the ground;
- the old parent must already differ measurably from an otherwise identical no-ground control before its snapshot is accepted.

Measured active contact:

```text
source step                            5
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

The airborne child is allowed to receive some response because the replacement bodies can contact one another at their new interface; forbidding this would prescribe physics rather than measure it.

Verdict: **SUPPORTED FOR ACTIVE ONE-LOBE CONTACT FIXTURE**.

---

## CUT-D — production-browser product-runtime evidence

Evidence class: **D — REAL PRODUCT RUNTIME**.

Files:

- `src/bootstrap.ts`;
- `src/cut-demo.ts`;
- `tests/browser/cut.spec.ts`.

The accepted ANVIL-00 path was deliberately preserved. `src/main.ts` and `tests/browser/collapse.spec.ts` remain the COLLAPSE control. `index.html` now loads a minimal bootstrap:

- normal `/` → unchanged ANVIL-00 `main.ts`;
- `/?experiment=cut` → isolated CUT evidence path.

The CUT browser path executes the central nontrivial transaction in the **production Vite bundle**:

1. 51 persistent source cells compile to one moving + rotating Box3D body;
2. the real browser runtime warms up for Box3D solver steps;
3. state is snapshotted at a step boundary;
4. the same 51 source cells compile as two bodies through the mass-preserving connectivity cut;
5. the old disposable runtime is destroyed;
6. the two replacement bodies are initialized with the tested rigid-field transfer;
7. immediate continuity metrics are measured;
8. a real post-transaction Box3D step runs;
9. the replacement runtime continues visibly.

The page exposes eight falsification gates:

1. persistent source identity;
2. mass-preserving 1→2 split;
3. nontrivial rotating fixture;
4. runtime mass continuity;
5. child pose continuity;
6. rigid velocity field including severed-interface velocity;
7. total linear momentum;
8. post-transaction solver step.

### Negative product evidence

The first browser implementation head `112f0166c1c563b21f3a9c68d926a3fef5558514` failed strict TypeScript because `parentPlan` narrowing was not retained inside later closures. No browser/physics success was inferred from that head.

Instead of weakening `strict` or adding unchecked assertions, the demo was simplified and an explicit `requireSingleBody()` fixture validation was introduced.

### Browser PASS

The corrected browser head `e9882d5c00474046534f1c3ebf143d82949c240c` passed:

- strict TypeScript;
- all 20 solver/compiler/foundation tests;
- production Vite build;
- `2/2` real Chromium tests:
  - accepted ANVIL-00/COLLAPSE regression;
  - new CUT product-runtime transaction;
- zero CUT page errors;
- browser artifact upload.

Verdict: **SUPPORTED FOR CUT PRODUCTION-BROWSER FIXTURE**.

---

## CUT-E preparation — packaged Windows owner gate

Evidence class: **OWNER MANUAL VALIDATION — PENDING**.

The validated production artifact now contains:

- `START_ANVIL_CUT.cmd` — double-click Windows launcher;
- `serve-anvil.ps1` — dependency-free localhost static server using built-in PowerShell/.NET.

The launcher:

- does not require npm, Node, Python, or terminal commands from the owner;
- does not modify an existing project folder;
- selects an available localhost port in `4173..4199`;
- opens `/?experiment=cut` automatically;
- serves only the extracted validated static artifact.

A `-SelfTest` mode was added and CI executes **the script already copied into `dist`**, validating that the packaged artifact contains the required files and can open its local listener before upload.

Exact owner package checkpoint:

```text
code/package head   e1a0b4b0ff6570897603f51ea54cc2d953ae1a2d
Actions run         32071241142
artifact            anvil-browser-laboratory
artifact ID         9301831216
artifact size       376477 bytes
SHA-256             9fa1ba669408e52462334ca1a72aad57a4582ef7e6dba8c7fa122b518a389dac
expires             2026-08-31T21:29:32Z
```

CI for this **same exact package head** passed:

- canonical Node/npm;
- strict TypeScript;
- **20/20** foundation/compiler/real-Box3D tests;
- production build;
- packaged Windows launcher self-test from `dist`;
- Chromium installation;
- **2/2** real browser tests: COLLAPSE control + CUT product runtime;
- final artifact upload.

Manual validation instructions and acceptance criteria are recorded in:

`docs/experiments/ANVIL-01-CUT-OWNER-GATE.md`

Important: documentation commits after `e1a0b4b...` do not redefine the validated package. Owner validation must refer to the exact artifact above unless a later code/package build is intentionally promoted and fully revalidated.

---

## Current verdict

The following bounded claim is supported by compiler, real Box3D and real production-browser evidence:

> A moving and rotating rigid island can be recompiled from one runtime body into two mass-preserving bodies at a solver-step boundary while the same authored source matter survives and measured pose, velocity-field and linear-momentum continuity remain bounded across the tested free-motion, gravity and contact fixtures.

Automated verdict: **SUPPORTED FOR FIXTURES**.

Product-runtime verdict: **SUPPORTED FOR CUT PRODUCTION-BROWSER FIXTURE**.

ANVIL-01 lifecycle verdict: **NOT YET ACCEPTED — OWNER MANUAL VALIDATION PENDING**.

## Explicit evidence boundary

Current evidence does **not** prove:

- in-place body replacement inside one persistent populated Box3D world;
- preservation/migration of Box3D contact-manifold internals;
- external joint/constraint state transfer;
- arbitrary topology edits or arbitrary cut surfaces;
- full angular-momentum or rotational-energy conservation;
- damage/fracture propagation, crack geometry, debris, toughness, plasticity or general failure mechanics;
- deformable/compliant matter;
- universal material/connection ontology.

The runtime-transfer fixtures rebuild a disposable Box3D world/runtime around persistent source state. Ground geometry is recreated identically when required.

## Immediate next gate

**Stop implementation expansion here.**

Do not add joints, constraints, damage, new CUT physics or merge this branch before owner verdict.

Next action is Evidence Class E:

1. owner runs exact artifact from Actions run `32071241142`;
2. owner performs `ANVIL-01-CUT-OWNER-GATE.md`;
3. owner records `ACCEPT`, `REJECT`, or `INCONCLUSIVE`;
4. only an `ACCEPT` permits evaluating ANVIL-01 for merge/promotion.

## Strategic direction after a possible CUT acceptance

Do not turn CUT into a long destruction roadmap by default.

A likely next falsifier should return to the broader Machine Matter question, e.g. a bounded **RELATION/HINGE-like** experiment where two material structures plus a local mechanical property/interface cause the compiler to derive the needed solver relation. Do not introduce an abstract FRAME/JURE architecture phase merely because a donor has one; frame semantics should be earned by a real physical relation that requires them.
