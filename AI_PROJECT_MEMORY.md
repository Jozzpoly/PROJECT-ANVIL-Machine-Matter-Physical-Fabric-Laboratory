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

Implemented pipeline:

1. `MatterDocument` contains stable authored cells/materials and no Box3D IDs.
2. Compiler finds face-connected rigid components deterministically.
3. Each component becomes one `RigidBodyPlan` with integrated mass and COM.
4. Exact occupied volume is greedily compacted into fewer material-homogeneous cuboid collider plans.
5. Box3D lowering creates dynamic bodies and convex hull shapes from the disposable plan.
6. Compiler mass is cross-checked against mass independently computed by Box3D from generated hulls.
7. Because runtime body origins are placed at compiler COM, Box3D's independently computed local COM is also checked against zero.
8. Removing one bridge cell is an authoring-time topology probe: intact fixture compiles to one body; edited fixture to two.
9. A real Chromium gate runs the production bundle and exercises both states.

Fixture evidence currently encoded in tests:

- intact: `51 authored cells → 1 rigid body → 8 collision boxes`;
- one-cell edit: `50 surviving authored cells → 2 rigid bodies → 9 collision boxes`;
- deterministic compilation survives authored array reordering;
- every surviving authored cell remains mapped;
- Box3D mass delta must be `< 0.05 kg` per body;
- Box3D local COM delta must be `< 1e-5 m` per body;
- real solver stepping under gravity must move generated bodies;
- production Chromium must reach `LIVE EVIDENCE` for intact and edited states without page errors.

This is **not runtime fracture**. The cut is an authoring-time recompile from a neutral fixture and does not test physical state migration across a topology transaction.

## Toolchain truth

- Node: `24.16.0`.
- npm: `>=11.13.0 <12`; lockfile was generated on canonical npm 11.13 in GitHub Actions and is tracked.
- CI uses `npm ci`.
- Browser physics binding: exact `box3d.js@0.0.2`, validated at runtime as Box3D `0.1.0`.
- TypeScript: `7.0.2`; Vite: `8.1.5`; Playwright: `1.61.1`.

## Donor evidence worth preserving

- VAW recovery confirms a real authoring → structural/mechanical compilation → rigid-island → runtime boundary and separate persistent/runtime identity domains. Its current rigid-island compiler collapses structural connectivity but still emits collider-per-block; ANVIL-00 independently adds a separate compact collision projection.
- JURE confirms value in source/authored/evaluated separation and neutral local frames/rig intent. Current kernel types keep frames and relations solver-neutral.
- JES is primarily a creator-workflow and evidence-discipline donor, not a codebase to merge.
- Native JV has already crossed the stock-Box3D boundary with a custom `b3Wheel` and dedicated collision paths. Deep Box3D modification is therefore a demonstrated capability in our ecosystem, but ANVIL should still require a concrete falsifier before forking the kernel.
- JV-Web provides the proven browser boundary currently reused here: `box3d.js@0.0.2` pinned to Box3D `0.1.0`.
- Planet Matter / HomeScan / Splat reinforce representation-separation and source-of-truth discipline but are not implementation dependencies of COLLAPSE.

## Current epistemic status

ANVIL-00 is **AUTOMATED-VALIDATED WITHIN ITS STATED SCOPE** on the experiment branch.

Evidence includes strict TypeScript, deterministic semantic tests, headless real Box3D mass/COM/step tests, production Vite build, locked dependency install and a real Chromium runtime gate. This does **not** constitute owner visual acceptance, general Machine Matter validation, dynamic fracture proof, vehicle-grade physics proof or evidence that sparse cubic cells are the correct long-term representation.

## Next gates

1. Open/retain a reviewable PR from `experiment/anvil-00-collapse` to `main` with the precise evidence boundary.
2. Provide a convenient owner-visible browser demo path; do not treat headless Chromium as owner acceptance.
3. Owner validates whether COLLAPSE communicates the intended concept clearly enough to become the first `main` checkpoint.
4. If accepted, the next research package should attack topology/state continuity rather than add more ontology: runtime rebuild / **ANVIL-01 CUT**.
