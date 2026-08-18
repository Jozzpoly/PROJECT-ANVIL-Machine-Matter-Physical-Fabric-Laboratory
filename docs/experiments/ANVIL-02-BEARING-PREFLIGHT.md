# ANVIL-02 / BEARING — Preflight

Status: **ACTIVE FALSIFIER — NO VERDICT YET**

Branch: `experiment/anvil-02-bearing`

Base checkpoint: live `main` at `6e936dd5934fffb3c7de3482a7aca9dc985102e5`.

## Research question

> Can one local authored rotational interface between two otherwise rigidly face-connected source regions cause ANVIL to compile the same persistent matter into two rigid islands plus one solver-neutral bearing relation, and can stock Box3D lower that relation so the shared pivot remains coincident while relative rotation about the declared axis remains free?

The question is deliberately narrower than "build joints" or "build the Machine Matter relation system".

## Why this is the next falsifier

ANVIL-00 demonstrated authored matter → disposable rigid/collision representation.
ANVIL-01 demonstrated a mass-preserving change in rigid topology with bounded motion-state continuity.

The missing capability is not whether Box3D has a revolute joint. The important uncertainty is whether a **local physical-interface signal in authored truth** can be sufficient to derive both:

1. a change in rigid connectivity; and
2. a separate mechanical relation between the resulting compiled bodies.

If ANVIL has to author a Box3D joint/body ID or a machine-specific compiler to achieve this fixture, the hypothesis fails in its intended form.

## Critical anti-goals

This experiment must not introduce any of the following as foundation:

- generic `Joint`, `Constraint`, `Relation` or mechanical-graph ontology;
- JURE frame/relation schema;
- VAW `mechanicalLink` schema or assembly-space system;
- motors, limits, friction torque, break force or damage;
- power/control networks;
- machine/vehicle-specific compiler concepts;
- persistent Box3D body/joint IDs.

The experiment may discover that one of these concepts is eventually required. It may not assume that answer in advance.

## Authored signal under test

ANVIL-02 adds an **experiment-local authored dialect**, not a promoted `MatterDocument` schema revision:

```text
matter: existing MatterDocument
bearing:
  id
  endpoint A = persistent cell ID + face
  endpoint B = persistent cell ID + opposite face
  free axis = x | y | z
```

Semantics for this experiment only:

- endpoints must be opposite faces of two face-adjacent source cells;
- the marked adjacency ceases to be an implicit rigid connection;
- the free axis must lie in the shared face plane;
- the source cells themselves remain unchanged;
- compilation must map each endpoint through source provenance to two different disposable rigid bodies;
- the compiled bearing owns a pivot and body-local anchor/axis data, but no solver handle.

This is intentionally closer to "paint a local bearing interface" than to "place a HingePart".

## Fixture

Cell size: `0.5 m`.

Seven equal-material cells form two asymmetric lobes joined by exactly one face adjacency:

```text
A lobe: 3 cells
B lobe: 4 cells
single seam: a:2 x+ <-> b:0 x-
bearing free axis: z
```

Without the bearing mark, ordinary `compileMatter()` must see one rigid body.
With the bearing mark, the same seven source cells must compile into two bodies plus one bearing plan.

The asymmetric 3/4-cell lobes reduce the chance that a wrong pivot/body mapping is hidden by symmetry.

## Gates declared before implementation

### A02-A1 — authored/source integrity — Evidence B

- source cells before/after: `7 → 7`;
- added source IDs: `0`;
- removed source IDs: `0`;
- authored bearing contains no Box3D/runtime body or joint IDs.

### A02-A2 — rigid topology causality — Evidence B

- no bearing mark / ordinary compiler: endpoint cells belong to the same rigid body;
- bearing compile: endpoint cells belong to different rigid bodies;
- the bearing seam must actually be the separator: if an alternate rigid path keeps the endpoints in one island, compilation fails closed.

### A02-A3 — interface geometry validation — Evidence B

Compilation rejects:

- unknown endpoint cell;
- non-adjacent endpoints;
- non-opposite endpoint faces;
- axis normal to the shared face;
- empty bearing ID.

### A02-A4 — deterministic relation compilation — Evidence B

Reordering source cells or swapping the two symmetric bearing endpoints must not change the canonical compiled result.

### A02-C1 — exact binding capability — Evidence C

Pinned `box3d.js@0.0.2` / Box3D `0.1.0` must expose and execute:

- `b3DefaultRevoluteJointDef`;
- `b3CreateRevoluteJoint`;
- local joint frames;
- `b3RevoluteJoint_GetAngle`.

The binding repository commit that bumps npm package `0.0.2` is `isaac-mason/box3d.js@2617a0ff763a60c9f17cee57c6ea72aab75a5077`; its shipped type declarations and joint example explicitly contain this API. Runtime execution in this repository remains the authoritative capability gate.

### A02-C2 — pivot constraint vs no-relation control — Evidence C

Both compiled bodies start with angular/linear velocities chosen so the authored pivot has zero instantaneous velocity on each body while the two angular velocities differ.

After `120` fixed 60 Hz steps:

- bearing runtime shared-anchor gap ≤ **0.0025 m**;
- identical runtime with the bearing lowering disabled shared-anchor gap ≥ **0.25 m**.

Reason: `2.5 mm` is 0.5% of the 0.5 m authored cell size and should be comfortably above expected floating-point noise while still being mechanically discriminating. The no-relation control must separate by half a cell or more so a weak/non-operative relation cannot pass accidentally.

### A02-C3 — rotational DOF remains free — Evidence C

After the same excitation:

- absolute revolute relative angle ≥ **0.35 rad** (~20°).

This prevents a weld-like implementation from satisfying the anchor constraint gate.

### A02-C4 — current mass lowering invariant — Evidence C

The relation experiment must preserve the existing compiled-vs-Box3D body mass and local COM cross-checks within the current ANVIL tolerances. The bearing must not hide a body-lowering regression.

## Evidence progression

```text
A/B source semantics
  → exact pinned binding capability
  → real Box3D relation vs no-relation control
  → transformed-frame stress test if base relation survives
  → production browser gate
  → Forge V0.1 owner field trial
```

Do not build the browser/owner presentation before the solver falsifier survives. A polished UI is not evidence for the physical hypothesis.

## Donor findings — used only as process evidence

### VAW

Live `recovery/playable-truth` separates mechanical authoring resolution from rigid-island compilation and only then maps a resolved link to body-local constraint data. Its minimal workshop path uses two adjacent faces plus a signed axis and compiles them into separate bodies plus a real hinge.

Transferred lesson: **authored local interface → cut rigid edge → resolve body provenance → compile body-local relation frame**.

Not transferred: VAW's `mechanicalLinkId`, `kind: hinge`, assembly spaces, mechanical graph, limits, forces or runtime architecture.

### JURE

Transferred lesson remains process-level: do not import a generic frame/relation schema before this experiment demonstrates the exact spatial semantics Machine Matter needs.

### box3d.js

The exact `0.0.2` source exposes a stock revolute joint whose axis is the local joint frame Z-axis. ANVIL-02 starts at the shallowest intervention level: stock primitive + experiment-local compiler/lowering.

## Falsification interpretations

- **Source semantics fail:** the interface mark cannot unambiguously identify a physical seam/axis without importing a larger frame ontology. Narrow or redesign authored semantics.
- **Topology gate fails:** the bearing mark does not actually separate rigid connectivity. The fixture/compiler model is insufficient.
- **Binding gate fails:** pinned browser binding lacks required joint behavior. Reproduce before considering binding upgrade/native Box3D.
- **Anchor gate fails but binding control passes:** ANVIL relation compilation/lowering is wrong.
- **Anchor gate passes but angle gate fails:** relation behaves too rigidly; likely wrong frame or wrong joint semantics.
- **Identity fixture passes but transformed-frame fixture later fails:** frame semantics have now been earned as the next research problem; do not hide it with camera/interpolation.

## Browser / Build Web Apps boundary

The Build Web Apps workflow is deliberately deferred until Evidence C supports the relation. When reached:

- preserve the existing ANVIL visual language rather than redesigning the laboratory;
- build a focused owner surface that makes pivot error and free rotation visually legible;
- use Forge V0.1 for identity/report transport;
- Browser plugin is not available in the current session, so rendered QA will use the repository Playwright workflow as the documented fallback unless Browser becomes available later.
