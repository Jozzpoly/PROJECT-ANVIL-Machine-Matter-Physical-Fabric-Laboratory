# ANVIL-03 / REBIND — Preflight

Status: **ACTIVE — solver falsifier first; no browser/owner claim yet**

## Research question

Can one persistent authored BEARING interface remain attached to the correct source matter when a nearby mass-preserving CUT changes the disposable rigid-body decomposition of one side while the mechanism is already moving?

Plain-language version:

> Two pieces are connected by a bearing. While they are moving, one bearing-side piece is split into two without deleting source matter. Does the same authored bearing automatically reattach to the correct new child, without a position/velocity discontinuity, and keep working after the solver resumes?

## Why this is ANVIL-03

ANVIL-01 / CUT established bounded rigid motion transfer through `1 body -> 2 bodies` while source matter persists.

ANVIL-02 / BEARING established one local authored rotational interface compiling to `1 rigid island -> 2 bodies + 1 revolute relation`.

Both explicitly left relation continuity across topology change unclaimed. REBIND attacks exactly that intersection instead of adding a second bearing, motor, generic relation graph or frame ontology.

## Fixture

Reuse the accepted seven-cell BEARING source fixture.

Bearing seam:

`a:2 x+ <-> b:0 x-`

Nearby CUT seam on the A side:

`a:0 x+ <-> a:2 x-`

Before CUT:

`7 source cells -> 2 rigid bodies + 1 bearing`

After CUT:

`same 7 source cells -> 3 rigid bodies + same source bearing`

The CUT must change the runtime body containing bearing endpoint `a:2`; otherwise the fixture does not exercise rebinding.

## Experiment-local algorithm under test

1. Compile the accepted BEARING source state.
2. Run it in real Box3D with non-zero common drift and opposite relative angular motion.
3. At a non-trivial moving state, compile the same source matter with both the BEARING seam and nearby CUT seam blocked from rigid connectivity.
4. Derive child->parent lineage only from persistent `sourceCellIds` / `cellToBody` provenance.
5. Rebuild the same source bearing onto the new bodies selected by its persistent endpoint cell IDs.
6. Transfer each replacement body's pose/motion from its source parent using the accepted CUT rigid field:

   `child COM = parent COM + R_parent * authored COM offset`

   `v_child = v_parent + omega_parent x r_world`

   `R_child = R_parent`

   `omega_child = omega_parent`

7. Instantiate a fresh Box3D world and fresh revolute joint. No Box3D body/joint handles or solver warm-start caches are migrated.
8. Compare against an identical post-CUT control where the derived bearing is deliberately not recreated.

## Gates declared before execution

Topology / provenance:

- source identity exactly `7 -> 7`, no additions/removals;
- runtime bodies exactly `2 -> 3`;
- source bearing count/identity `1 -> 1`;
- endpoint `a:2` must map to a different disposable body ID after CUT;
- the rebound endpoint body's lineage must resolve uniquely to the old bearing-side parent;
- no after-body may combine cells from multiple before-bodies; merge topology is outside this experiment;
- cutting the bearing seam itself is rejected as a different experiment.

Immediate continuity at the transaction:

- pre-CUT bearing gap <= `0.0025 m`;
- each relation-side world anchor position after reconstruction differs from its corresponding pre-CUT anchor by <= `0.00007 m`;
- each relation-side material-point velocity differs by <= `0.00007 m/s`;
- immediate rebound bearing gap <= `0.0025 m`;
- total linear momentum error across the complete runtime <= `0.75 kg*m/s`.

Post-transaction discrimination:

- after one fixed 60 Hz step, rebound bearing gap <= `0.0025 m` and runtime state remains finite;
- after 120 fixed 60 Hz steps, rebound bearing gap <= `0.0025 m`;
- identical no-relation control gap >= `0.25 m`;
- absolute rebound revolute angle >= `0.35 rad`.

Thresholds are frozen before first execution. A red result must be classified as model failure, fixture weakness, lowering defect or numerical assumption before any threshold change.

## C1 — arbitrary common-transform stress declared before execution

C0 starts from the authored fixture orientation and then develops non-trivial rotation around the bearing axis. That is not sufficient to prove the REBIND transfer is independent of the global device orientation, because the transfer formula uses the full parent quaternion.

Before looking at C0 margins, add a second solver falsifier using exactly the same source topology, CUT, timing and thresholds, but start the entire mechanism under one common arbitrary rigid transform:

- common rotation: `0.91 rad` about axis proportional to `(0.37, -0.81, 0.44)`;
- common translation: `(2.4, -1.3, 1.7) m`;
- world bearing axis = the authored `z` axis rotated by that common quaternion;
- common drift remains non-zero;
- opposite A/B angular velocities are applied about the transformed world bearing axis.

C1 gets **no transformed-specific tolerance loosening**. The same limits remain in force:

- anchor position jump <= `0.00007 m` per side;
- anchor material-point velocity jump <= `0.00007 m/s` per side;
- total linear momentum error <= `0.75 kg*m/s`;
- pre/immediate/one-step/final bearing gaps <= `0.0025 m`;
- no-relation control gap >= `0.25 m` after 120 steps;
- absolute final relative angle >= `0.35 rad`.

A C1 failure would be evidence that the current rebinding/transfer is accidentally tied to the authored/global orientation and would earn further spatial semantics work. A pass means only covariance for this declared common-transform fixture; it still does not prove arbitrary independently authored body frames.

## Explicit non-claims

Even if REBIND passes, it will not prove:

- in-place mutation of one persistent Box3D world;
- transfer of Box3D revolute impulse/warm-start/internal solver cache;
- contact manifold migration;
- cutting through the bearing interface itself;
- multiple relations or closed loops;
- motor/limit/control state transfer;
- arbitrary fracture topology;
- generic Relation/Joint/Constraint ontology;
- universal authored frame entities.

A pass means only that persistent source provenance + a persistent authored bearing are sufficient to reconstruct the correct relation onto a changed disposable body decomposition for these bounded moving fixtures.
