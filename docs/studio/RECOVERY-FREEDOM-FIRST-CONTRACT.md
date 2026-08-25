# ANVIL Studio Recovery — Freedom First Contract

Status: active recovery contract for `recovery/studio-freedom-first`.
Base: sealed `main@a87f33f6adcefddf9356d09301299591cb362568`.

## Why this recovery exists

The previous Studio line incorrectly allowed evidence classification to become a permission system. `SUPPORTED / UNSUPPORTED / INCOMPLETE` were used to decide what the Owner was allowed to run, and deletion/repair semantics could leave authored intent in states that blocked play. That violated the product intent.

This recovery does not patch that policy. It replaces it.

## Product authority

The Owner controls the authored world.

Evidence tells the Owner what ANVIL knows. Evidence does not grant permission.

A classification such as `UNSUPPORTED`, `INCOMPLETE`, `PARTIAL`, `UNRESOLVED`, or `EXPERIMENTAL` must never by itself disable an action the runtime can attempt safely enough to observe. When only a subset can be realized, ANVIL should realize that subset and report what was omitted rather than hold the whole world hostage.

## Freedom-first laws

1. **RUN is an attempt, not a permission.** If any physical realization can be produced, RUN remains available. Runtime failure is evidence, not misconduct by the Owner.
2. **No hidden repair debt.** Removing authored meaning must not silently strand invisible dependencies that then block the world. Destructive actions must have direct, understandable consequences and remain undoable.
3. **Local failure stays local.** One unresolved Bearing, Torque, or other local meaning must not prevent unrelated realizable parts from running.
4. **Preserve intent without imprisoning the Owner.** Unsupported authored intent may remain in source, but it is annotation/provenance, not a global gate.
5. **World first.** The world canvas is the primary interface. Status/classification UI is secondary instrumentation and must not dominate interaction.
6. **Direct manipulation over mode ceremony.** Prefer clicking, dragging, grabbing, drawing, extruding, deleting, and editing in the world over procedural mode switching.
7. **Physical runtime is disposable.** Runtime motion never silently becomes authored truth; STOP returns to authored source.
8. **The Owner may break the laboratory.** Deliberately weird topology, overconstraint, contradictory local meaning, excessive forces, and unsupported composition are valid experiments.
9. **Warnings are not locks.** ANVIL may say `experimental`, `unresolved`, `partial realization`, `solver fault`, or `not yet qualified`; it must not translate those labels into infantilizing prohibition when an observation can still be attempted.
10. **Undo is the safety net.** Prefer reversible authoring transactions over preventive permission gates.

## Recovery implementation boundary

The new Studio line starts from sealed main rather than inheriting the old product branch.

Old branches/PRs are donors only:
- accepted science and compiler behavior may be reused where still valid;
- semantic world picking may be reused;
- simultaneous multi-Bearing decomposition may be reused as experimental lowering evidence;
- the Box3D Runtime Hand may be reused;
- old classifier-gated RUN policy, `BREAK RUN` as a permission escape hatch, hidden repair debt, and UI organized around qualification are rejected.

## Minimum recovery owner loop

The first recovery candidate must allow the Owner to:

`BUILD freely → add/remove local meaning → RUN whatever can be realized → physically grab the live mechanism → STOP → continue editing`

without requiring READY, without a separate permission-oriented BREAK mode, and without a stale dependent meaning globally disabling RUN.

## First falsifiers

The recovery is not acceptable unless all of these are demonstrated:

- removing a Bearing that owns/anchors Torque cannot leave the Owner trapped behind a disabled RUN;
- multiple Bearings can be attempted from the same authored world without changing their epistemic classification into generic support;
- one bad/unresolved local meaning does not stop an otherwise realizable physical subset from running;
- runtime Hand is direct physical solver interaction, not mesh teleport;
- STOP restores the same authored world and no runtime pose writes back;
- ordinary building/editing remains possible without a qualification workflow.

## Non-claims

This recovery does not declare arbitrary multi-Bearing/multi-Torque composition scientifically solved, does not create ANVIL-11, does not promote Box3D objects into authored ontology, and does not make the current cell dialect final Machine Matter.

Its first obligation is simpler: restore Owner agency while preserving honest evidence.