# ANVIL-00 / COLLAPSE

Status: **ACCEPTED — automated validation + owner manual validation within stated scope**

## Research question

Can a high-resolution authored construction retain stable semantic identity while compiling deterministically into a substantially smaller physical representation, without persisting Box3D/runtime identity in the authored model?

## Why this is first

Earlier ANVIL brainstorming contained many attractive but coupled hypotheses: generic bonds, compliant matter, mechanism inference, dynamic fracture, custom contact laws, adaptive physics and Box3D kernel modifications. Testing them together would make failure uninterpretable.

COLLAPSE isolates the smallest central claim:

```text
persistent authored matter
        ↓
structural connectivity
        ↓
rigidification
        ↓
independent mass / collision projections
        ↓
disposable Box3D runtime
```

The initial sparse cubic grid is an experimental authoring dialect only. It is not a decision that future Machine Matter must be voxel-based.

## Fixture

The fixture contains two rigid lobes connected by a one-cell-thick bridge.

- intact: 51 authored cells;
- one intentionally denser cell shifts mass properties away from simple geometric averages;
- edited: exactly the center bridge cell is removed, leaving 50 surviving authored cells;
- cell size: 0.35 m;
- structural material: 650 kg/m³;
- dense-core material: 2500 kg/m³.

This asymmetric density is deliberate. A uniform fixture would make a broken center-of-mass calculation harder to detect.

## Compiler under test

1. Validate stable authored IDs, occupancy and material references.
2. Build face-neighbor structural connectivity.
3. Find connected rigid components deterministically.
4. Integrate mass and world-space center of mass from authored material density.
5. Keep explicit `cellId → bodyPlanId` provenance.
6. Compact occupied cells into exact, material-homogeneous cuboid collision regions.
7. Emit a disposable `PhysicalPlan` with no Box3D IDs.
8. Lower each body plan to Box3D and each cuboid to a convex hull located relative to the compiler COM.

The compaction is intentionally conservative: it may reduce the number of collision shapes, but it may not add or remove occupied authored volume and it may not merge different materials.

## Automated evidence — PASS

### Semantic gates

- **Identity:** every surviving authored cell remains addressable and mapped after compilation.
- **Topology:** intact fixture → one rigid body; one-cell bridge edit → two rigid bodies.
- **Determinism:** authored array order does not change the resulting plan.
- **Reduction:** collision representation contains fewer shapes than authored cells.

For the current deterministic fixture, the compiler produces:

- intact: `51 cells → 1 body → 8 collision boxes` (`6.375×` cell/collider reduction);
- edited: `50 cells → 2 bodies → 9 collision boxes` (`5.556×` reduction).

These numbers are fixture evidence, not a performance claim for general geometry.

### Independent Box3D gates

Box3D reconstructs mass properties from the generated convex hulls and material densities. The compiler does not write its own mass result back into Box3D.

For every generated body:

- Box3D mass agrees with compiler mass within 0.05 kg;
- because the body origin is placed at the compiler COM, Box3D's independently computed local COM is within `1e-5 m` of the origin;
- after stepping the real solver under gravity, dynamic bodies move.

The canonical locked CI run passed these gates for intact and edited fixtures. Within this fixture, the high-resolution source matter and reduced collision view therefore agree on mass distribution within the stated tolerances.

### Real browser gate

A production Vite build is opened in headless Chromium. The automated browser test passed all of the following:

- no page-level runtime errors;
- `LIVE EVIDENCE` in the intact state;
- 51 authored cells / 1 body / all UI gates passing;
- interactive switch to the edited state;
- 50 authored cells / 2 bodies / all UI gates passing.

A successful bundle build alone was not accepted as browser evidence.

## Owner manual gate — PASS (2026-08-17)

The owner ran the packaged browser artifact produced from the validated PR build and supplied screenshots showing:

- `LIVE EVIDENCE`;
- edited state at `50 authored cells / 2 rigid bodies / 9 collision boxes`;
- PASS for identity, rigidification, reduction and mass cross-check;
- the Box3D runtime continuing to move under simulation after the topology probe.

Owner feedback accepted this as a successful first build and requested transition into fundamental reusable preparation. This closes the COLLAPSE owner gate **only within the scope defined by this document**.

## What COLLAPSE does **not** prove

It does not prove:

- runtime fracture or physical state migration;
- continuity through a topology transaction;
- compliant/flexible matter;
- authored mechanical freedom or generic joints;
- adaptive rigid ↔ deformable representation changes;
- vehicle-grade behavior;
- usefulness of a generic SurfaceLaw;
- superiority of sparse cells over graph, lattice, SDF, adaptive cells or hybrid representations;
- that one ontology can span every future ANVIL domain.

The current one-cell cut is an authoring-time recompile from a neutral fixture. Calling it dynamic destruction would be false.

## Relationship to donor projects

- **VAW** already demonstrates authored structural graphs → rigid connected components → mass/COM → runtime body mapping. ANVIL generalizes the experiment and adds a separate collision-reduction projection instead of assuming one collider per authored block.
- **JURE** reinforces the separation between persistent authored intent and evaluated/runtime geometry; future FRAME work may borrow its local-frame discipline.
- **JV-Web** supplies the already-proven browser Box3D boundary and exact `box3d.js@0.0.2` / Box3D 0.1.0 runtime contract.
- **Native JV** proves our wider project ecosystem is already capable of evidence-driven Box3D core modification (`b3Wheel` and dedicated collision paths). That capability is deliberately not used in COLLAPSE because stock Box3D is sufficient for this hypothesis.
- **JES / HomeScan / Splat / Planet Matter** reinforce creator-loop, truth-boundary and representation-separation requirements, but they do not need to be merged into this experiment.

## Verdict

**SUPPORTED FOR THIS FIXTURE.** Persistent authored cell identity, rigidification, independently reduced collision representation and disposable stock-Box3D lowering coexist without persisting runtime physics identity into authored truth.

The result is strong enough to promote the demonstrated boundaries into a small reusable laboratory foundation. It is not strong enough to promote sparse cells, rigid face bonding, or any fracture/state-transfer behavior into universal ANVIL doctrine.

## Next falsifier

**ANVIL-01 / CUT** should attack the strongest unproven assumption: can a moving runtime be transactionally recompiled from one rigid island into two while preserving authored identity, spatial continuity and physically sensible state?

The first CUT version should prefer a bounded topology barrier between physics steps over mutation inside the solver. If state migration produces visible impulses, teleports or frame discontinuities, the experiment should fail rather than hide them with damping or resets.
