# PROJECT ANVIL — Donor Map

ANVIL may read all relevant Jozzpoly repositories, but it should harvest **capabilities and proven patterns**, not merge products wholesale.

This map records the current high-value donors and the exact reason each matters.

## Voxel Aeronautics Workshop (VAW)

Repository: `Jozzpoly/voxel-aeronautics-workshop`

Current useful evidence from `recovery/playable-truth`:

- authored structural graph separated from runtime physics;
- mechanical authoring resolved before lowering;
- rigid-island connected-component compilation;
- persistent `blockId → bodyId` provenance;
- assembly-space ownership;
- mass/COM/inertia calculation with compensated summation;
- canonical diagnostics.

### Promoted now

The mass-property numerical discipline influenced `src/foundation/mass-properties.ts`. The authored/compiled/runtime separation and source-based body provenance are already independently supported by ANVIL-00.

### Deferred

Do not port the full VAW craft compiler, catalog, mechanical graph, assembly-space system or per-block collider model until an ANVIL experiment requires the corresponding capability.

The VAW compiler is a donor of techniques, not the ANVIL ontology.

## Jozz Universal Rig Editor (JURE)

Repository: `Jozzpoly/Jozz-Universal-Rig-Editor`

Current `main` demonstrates:

- solver-neutral `Vec3`, quaternion and `RigidPose` authored data;
- stable document/frame/relation IDs;
- source provenance and revision identity;
- authored frame ownership separated from resolved world pose;
- validation before canonical serialization;
- deterministic sorting/canonicalization.

### Promoted now

ANVIL adopts the same **solver-neutral spatial boundary** and the principle that validation/canonicalization belongs before persistence.

### Deferred

Do not import JURE's frame/relation schema into Machine Matter yet. FRAME should first demonstrate which frame semantics ANVIL actually needs.

## Native Jozz Vehicle / Box3D

Repository: `Jozzpoly/Box3d_FunProject`

Useful evidence:

- the project ecosystem is capable of modifying Box3D below its public stock abstractions;
- custom `b3Wheel` and dedicated collision paths demonstrate that kernel work is practical when justified;
- native Box3D remains the fastest laboratory when browser binding limitations obstruct a physics hypothesis.

### Promoted now

Only the **intervention ladder** is promoted: start shallow, move into the kernel only after a reproduced limitation.

### Deferred

No vehicle-specific suspension, tire, steering or wheel concepts belong in ANVIL foundation. JV becomes a future stress fixture after generic matter/mechanics earn enough capability.

## JV-Web

Repositories:

- `Jozzpoly/JV-Box3D-Web-experiment`
- `Jozzpoly/JV-Box3D-Web-Public`

Useful evidence:

- browser/TypeScript boundary around `box3d.js`;
- proven production build + browser validation workflow;
- practical experience keeping authored/product state above disposable Box3D runtime state.

### Promoted now

ANVIL continues to use the exact proven `box3d.js@0.0.2` / Box3D `0.1.0` browser boundary until a concrete experiment requires something else.

## JES

JES is primarily a **workflow/evidence donor** for ANVIL rather than a physics code donor.

Useful patterns:

- explicit source-of-truth hierarchy;
- creator-facing workflow over implementation detail;
- evidence packages/checkpoints;
- avoiding false completion claims;
- separating user validation from automated validation.

### Promoted now

These principles are encoded in `AGENTS.md` and `docs/EXPERIMENT_PROTOCOL.md`.

## HomeScan / Splat / Planet Matter work

These projects reinforce a broader representation lesson:

> the authored/source representation, visual representation, collision representation and simulation representation do not have to be the same data structure or the same resolution.

ANVIL-00 now provides its own executable evidence for that principle on the physics side.

### Deferred

Do not introduce meshes, Gaussian splats, SDFs, adaptive cells or planetary data structures merely because they exist elsewhere. They become candidate fixtures when a specific ANVIL hypothesis needs them.

## Harvest checklist

Before porting anything substantial from a donor:

1. verify the donor's live branch/file and current evidence;
2. identify the smallest transferable capability;
3. list assumptions that are donor-specific;
4. prefer rewriting the small idea against ANVIL contracts over importing a subsystem;
5. add a test that proves the harvested capability matters here;
6. record third-party licensing when applicable.

If step 5 has no credible test, the code probably does not belong in ANVIL yet.
