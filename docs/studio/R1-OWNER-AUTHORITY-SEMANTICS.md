# ANVIL Recovery R1 — Owner Authority Semantics Freeze

Status: **R1 ACTIVE CONTRACT** for `recovery/r1-owner-authority-core`.

Recovery ancestry: sealed `main@a87f33f6adcefddf9356d09301299591cb362568` plus the last green pre-UI recovery checkpoint `7b1df1a8fc5eb09848935a56b7cb91df023179c7`.

This contract supersedes `RECOVERY-FREEDOM-FIRST-CONTRACT.md` for all new recovery work.

## Authority rule

**The Owner decides what exists in authored source.**

ANVIL may interpret authored intent, diagnose it, partially realize it, fail to realize it, or fail at runtime. ANVIL must not silently broaden a destructive command, choose between conflicting authored intents, or convert evidence labels into permission.

Operational shorthand:

> Owner decides. ANVIL interprets. Runtime attempts. Evidence reports.

## Non-negotiable invariants

1. `authored != compiled != runtime != render` remains unchanged.
2. Runtime pose never silently writes back into authored source.
3. `UNSUPPORTED`, `INCOMPLETE`, `PARTIAL`, `UNRESOLVED`, `EXPERIMENTAL`, or solver failure are evidence states, not permission states.
4. A local problem stays local whenever an independent useful realization exists.
5. Default destructive operations are exact: they remove only what the Owner explicitly named.
6. Cascade deletion is allowed only as a separate explicit destructive command.
7. Orphaned/unresolved authored intent may remain in source. Its existence must not globally disable useful RUN attempts.
8. Conflicting authored intents remain authored; ANVIL must not arbitrarily choose a winner for runtime.
9. Rebind/retarget edits preserve authored meaning identity unless the Owner explicitly creates a replacement.
10. Undo/Redo reverses authored transactions; it is not justification for hidden automatic cleanup.

## Operational truth table

| Owner action / authored state | Authored mutation ANVIL may perform | What ANVIL must preserve | Runtime / evidence behavior |
| --- | --- | --- | --- |
| Delete Bearing | Remove exactly that Bearing | TorquePatches and unrelated meanings | Matching Torque may become `UNRESOLVED_TARGET`; unrelated realization still attempts |
| Delete Bearing **with dependents** | Remove named Bearing plus Torque meanings currently anchored to its endpoints | Unrelated meanings | Explicit cascade; one undoable transaction |
| Delete Matter | Remove exactly that Matter cell | Bearings/Torques that referenced it | Affected meanings may become `INVALID_LOCALITY` / `UNRESOLVED_TARGET`; unrelated realization still attempts |
| Delete Matter **with dependents** | Remove named cell plus meanings directly losing that referent | Unrelated meanings | Explicit cascade; one undoable transaction |
| Orphan Torque | No automatic authored mutation | Torque identity, target, effort | Omit only that Torque from current runtime; diagnose locally |
| Orphan Bearing endpoint | No automatic authored mutation | Bearing identity, endpoints, axis | Omit only that Bearing from current runtime; dependent Torque may also be unresolved |
| Rebind Bearing | Change endpoints/axis of the named Bearing | Bearing ID and unrelated meanings | Re-evaluate normally on next realization |
| Retarget Torque | Change target of the named TorquePatch | Torque ID and effort | Re-evaluate normally on next realization |
| Two Bearings on one seam | No automatic authored mutation | Both Bearings | Do not choose a winner; omit the conflicted seam realization and report both conflicts |
| Multiple independent Bearings | No automatic restriction | All authored Bearings | Attempt simultaneous lowering; qualification claims remain separate from ability to attempt |
| Multiple TorquePatches | No automatic restriction | All authored TorquePatches | Apply every locally resolved finite action in the same runtime |
| One bad meaning among good meanings | No authored cleanup | All authored intent | Best-effort realization of the good subset; diagnostics for omitted meanings |
| Solver/runtime fault | No source mutation | Entire authored source | Fault is evidence; dispose transient runtime; next RUN starts fresh from source |
| Undo / Redo | Reverse/reapply exactly one authored transaction | Identity as represented in the transaction snapshot | Runtime is not migrated implicitly |

## Explicitly rejected semantics

The following are R1 failures:

- `RUN disabled` merely because composition is unsupported/incomplete/unresolved;
- deleting a Bearing and silently deleting Torque by default;
- deleting Matter and silently cleaning all dependent meanings by default;
- auto-selecting one of two conflicting Bearings;
- silently rewriting runtime pose into source;
- hidden starter Bearing/Torque that changes the meaning of the Owner's first authored action;
- a repair workflow that must be completed before unrelated parts may run.

## R1 falsifier

R1 is not complete merely because the API compiles. It must demonstrate the full semantic cycle:

`author valid meanings → exact delete → preserve orphan intent → best-effort partial realization → rebind/retarget same IDs → complete realization → Undo restores exact prior authored snapshot`

and must preserve all existing accepted/core tests plus the unified runtime evidence inherited from the green recovery checkpoint.

## Boundary

R1 does **not** design the final Studio UI, does not add a new physics capability, does not claim arbitrary composition solved, does not create ANVIL-11, and does not merge recovery to `main`.

The next product/UI stage may use this contract; it may not weaken it for convenience.