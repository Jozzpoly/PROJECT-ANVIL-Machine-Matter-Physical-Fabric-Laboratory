# ANVIL Recovery R2 — Direct World Grammar

Status: **R2-A FROZEN GRAMMAR CANDIDATE** for `recovery/r2-direct-world-grammar`.
Base: R1 qualified seal `5eba8d70bb2192675651bf06ab9768c1fb7518a8`.

R2 does not change the R1 authority contract. It asks whether that contract can be exposed through a world-first interaction grammar without rebuilding a permission/repair workflow in the UI.

## Governing rule

> **Owner decides. ANVIL interprets. Runtime attempts. Evidence reports. The world is the primary interface.**

## Hard failures

R2 is RED if any normal owner loop requires:

- `READY`, `ELIGIBLE`, or another permission state before RUN;
- a mandatory repair panel before unrelated work can continue;
- a permanent `Matter / Meaning / Select` top-level mode hierarchy;
- a permanent `Surface / Cells / Meaning` lens hierarchy to access local authored intent;
- hidden starter Bearing/Torque meaning;
- default cascade deletion;
- a separate `BREAK RUN` permission escape hatch;
- authoring by runtime/body IDs;
- runtime pose write-back into source;
- a diagnostics/dashboard surface that dominates the world.

## Minimal grammar

### Neutral authored world

There is one default authored state: **the world**. Selection/hover may exist, but the Owner does not enter a `Select` mode to use it.

### Matter

- LMB click an exposed Matter face → add one cell adjacent to that face.
- LMB drag from an exposed Matter face → preview extrusion along that face normal.
- Release → one authored extrusion transaction.
- Escape during drag → cancel preview with no authored mutation.
- Alt+LMB on Matter → exact-delete that Matter cell only.
- Explicit cascade deletion may exist later, but must be a separately named/confirmed command and is not required for RC1.

The click and drag paths are one grammar: click is extrusion length 1, not a second authoring subsystem.

### Local meaning

Meaning is authored at a spatial interface, not through a hierarchy browser.

- `B` is a one-shot Bearing intent. The next compatible shared interface click authors a Bearing, then the tool returns to neutral world state.
- `T` is a one-shot Torque intent. The next compatible existing Bearing/interface click authors a TorquePatch, then returns to neutral.
- Escape cancels the one-shot intent.
- Existing Bearing/Torque meaning remains directly selectable at its world location.
- Alt+LMB on a meaning performs exact deletion of that meaning only.

For RC1, repeated authoring may use repeated B/T. A persistent paint mode is deliberately not introduced until evidence shows repeated one-shot intent is the dominant bottleneck.

### Existing meaning edits

Selecting an existing Bearing/Torque may expose a small contextual island for local parameters such as axis/effort and explicit rebind/retarget. The island is optional instrumentation around a selected spatial meaning; it must not become a required workflow to continue using the world.

Unresolved/conflicting meaning remains spatially present and selectable whenever at least one truthful spatial referent survives. It must not be moved into an issue list as its only representation.

For a `TorquePatch`, its authored `target = cellId@face` is itself a truthful spatial referent while that target Matter cell survives. If no current Bearing/shared-interface representation carries that Torque and the target face is exposed, the same Torque identity remains directly selectable at that authored face; R2 must not hide it merely because realization reports `UNRESOLVED_TARGET`.

If an authored meaning has **zero surviving spatial referents**, R2 must not fabricate a world position merely to keep it clickable. The same authored identity remains directly reachable through a small conditional **Loose** tray exposing the existing Rebind / Retarget / Delete paths. Loose is not a repair queue, has no permission or severity role, does not block RUN, is hidden during RUN, and disappears when a truthful spatial referent is restored.

### Camera

- MMB drag → orbit.
- Shift+MMB drag → pan.
- wheel → zoom.
- F → focus authored/runtime world.

Camera control remains available in BUILD and RUN.

### Runtime

- RUN is always an attempt to realize the current authored source.
- COMPLETE / PARTIAL / MATTER_ONLY are receipts, not permissions.
- During RUN, LMB on a realized body → physical Runtime Hand grab.
- Pointer drag moves the Hand target; release ends the grab.
- STOP disposes runtime and returns to the same authored source.
- Restart starts a fresh runtime from the same authored source with transient forces/Hand state reset.
- Force/Torque activation is transient runtime state and starts OFF.

### Evidence presentation

Evidence is primarily local and spatial:

- realized meaning: normal semantic presentation;
- unresolved meaning with a surviving truthful referent: still visible there, visually muted/broken rather than deleted;
- a standalone unresolved Torque with a surviving authored `cellId@face` target remains directly reachable at that face even when no Bearing currently realizes or carries it;
- fully unanchored meaning: directly reachable through Loose without inventing a world position;
- conflicted meaning: all conflicting authored meanings remain visible/reachable rather than one being selected for the Owner;
- selected local or Loose meaning may reveal the diagnostic text in a small contextual island;
- a compact global receipt may say e.g. `PARTIAL · 4/6 meanings realized`, but never becomes a task list or blocks RUN.

## Friction telemetry for synthetic-owner validation

R2 browser evidence will record, but not gate by arbitrary thresholds:

- authored transaction count;
- number of top-level tool/intention changes;
- number of context-island openings;
- number of RUN attempts and whether any were disabled;
- number of automatic authored mutations not directly requested by the simulated Owner (expected zero);
- source generation across RUN/STOP;
- realized vs omitted meaning counts;
- whether unresolved/conflicted meanings remain directly targetable, including a surviving single-anchor Torque target and Loose when zero truthful spatial referents survive;
- input channels used for build, meaning, camera, hand, delete, undo/redo.

The telemetry is evidence for later grammar changes, not another permission system.

## Synthetic Owner Session target

Before any Owner package, real Chromium must complete one continuous session using pointer/keyboard paths:

`empty → seed/build → multi-direction extrusion → several Bearings → several Torques → RUN → Hand + orbit/zoom → STOP → exact-delete Bearing → orphan Torque remains → RUN PARTIAL → STOP → rebind/retarget → RUN → STOP → create seam conflict → RUN despite conflict → STOP → exact-delete Matter → Undo → Redo → continue building → RUN again`

The session is RED if it discovers any hidden permission gate, mandatory repair workflow, automatic destructive cleanup, or runtime-to-source write-back.

## D6 reachability qualification boundary

The earlier exact head `399c8606cf0d0ec19f998617e8e023292b316d0e` passed its then-current `26/26` Chromium suite, but later falsification showed that result was narrower than the claim recorded for D6. A legal Owner sequence could preserve a standalone Torque on an exposed surviving target face while making it unreachable through both the world and Loose.

D6 therefore is not qualified by that historical green alone. Qualification requires explicit real-browser evidence for all three current recovery classes:

1. shared/spatial or orphan world representation while a truthful world referent survives;
2. standalone Torque directly reachable at its own surviving authored `cellId@face` target when no Bearing/interface representation carries it;
3. Loose only when no truthful spatial referent remains.

The D6C correction is presentation-only: it must not change R1 source semantics, realization, physics, RUN policy, authored identity, or Loose eligibility merely to make the world representation work.

## Scope

R2 may implement only the minimum browser/world layer necessary to falsify this grammar over the already-qualified R1 core.

R2 does not add gravity/ground physics, new meaning kinds, Save/Open, arbitrary composition claims, final Machine Matter ontology, mobile controls, multi-select, move/copy, or dashboard instrumentation.

## Owner gate boundary

No Owner package is produced at R2-A/B micro-checkpoints. The first Owner-facing artifact is **RC1**, only after core + production build + real browser synthetic session + destructive red-team + visual review pass on one exact head.
