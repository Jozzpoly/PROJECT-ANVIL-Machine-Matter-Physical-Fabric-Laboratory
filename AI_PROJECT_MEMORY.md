# AI Project Memory — PROJECT ANVIL

Last grounding: 2026-08-17.

## Repository identity

- Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.
- `main` was intentionally initialized from an empty public repository.
- Active first experiment: `experiment/anvil-00-collapse`.
- `main` is intended to mean the latest verified checkpoint, not an agent worktree.

Always resolve live Git before changes; do not treat commit hashes in this file as moving truth.

## Research intent

ANVIL is an R&D laboratory for **Machine Matter / Physical Fabric**. The current central hypothesis is narrower than the long-horizon vision:

> Persistent authored matter can retain stable semantic identity while compiling deterministically into a much smaller, disposable physical representation.

Authored resolution, mass representation, collision representation, runtime rigid bodies and visual representation are not required to be identical.

## ANVIL-00 / COLLAPSE

The first experimental dialect is deliberately simple: sparse cubic cells with stable IDs and material properties. Face-adjacent cells imply a rigid structural bond only for this experiment.

Current implementation under test:

1. `MatterDocument` contains stable authored cells/materials and no Box3D IDs.
2. Compiler finds face-connected rigid components.
3. Each component becomes one `RigidBodyPlan` with integrated mass and COM.
4. Exact occupied volume is greedily compacted into fewer material-homogeneous cuboid collider plans.
5. Box3D lowering creates dynamic bodies and hull shapes from the disposable plan.
6. Compiler mass is cross-checked against mass independently computed by Box3D from the generated hulls.
7. Removing one bridge cell is an authoring-time topology probe: intact fixture should compile to one body; edited fixture to two.

This is **not runtime fracture** and does not yet test physical state migration across a topology transaction.

## Donor evidence worth preserving

- VAW recovery confirms a real authoring → structural/mechanical compilation → rigid-island → runtime boundary and separate persistent/runtime identity domains.
- JURE confirms value in source/authored/evaluated separation and neutral local frames/rig intent.
- JES is primarily a creator-workflow and evidence-discipline donor, not a codebase to merge.
- Native JV has already crossed the stock-Box3D boundary with a custom `b3Wheel` and dedicated collision paths. Deep Box3D modification is therefore a demonstrated capability in our ecosystem, but ANVIL should still require a concrete falsifier before forking the kernel.
- JV-Web provides the proven browser boundary currently reused here: `box3d.js@0.0.2` pinned to Box3D `0.1.0`.

## Current epistemic status

Implementation exists on the experiment branch. Until CI and the headless Box3D smoke pass, ANVIL-00 is **UNVALIDATED**. A passing CI run will prove only the stated compiler/runtime invariants, not visual quality, general Machine Matter viability, dynamic fracture, vehicle-grade physics or owner acceptance.

## Next gates

1. CI: TypeScript, deterministic compiler tests, headless Box3D mass/step smoke, production build.
2. Inspect failures and fix only evidence-backed defects.
3. Open/retain a reviewable PR and provide a browser demo path for owner validation.
4. If COLLAPSE is accepted, next research package should attack topology/state continuity rather than add more ontology: runtime rebuild / **CUT**.
