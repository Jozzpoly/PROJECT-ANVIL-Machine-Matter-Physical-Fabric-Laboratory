# P06 / C5B — ANVIL Studio Product Interaction

Status: **C5B PASS — PRODUCT INTERACTION GROUNDED**

Work type: integration / product design. This document freezes attention, spatial interaction, state choreography, failure/instrumentation and workspace-continuity behavior. It does not implement Studio, create ANVIL-11, freeze final visual styling or promote new Foundation semantics.

Base truth at grounding: `main@fbaca90b546bd83f864f76760f54e14adbe337ab` with C5A / Product Behavior already grounded in `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`.

## 1. Why C5B exists

C5A answered what the Studio user is doing and what the product means:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

C5B answers the next question:

> **How must attention, interaction surfaces, state transitions, failure handling, instrumentation and workspace continuity behave so implementation does not have to invent the product while coding it?**

The governing rule remains:

> **The world is the product. Matter carries the primary truth. UI supplies the minimum currently-needed truth and tools, then reveals deeper truth only in response to user intention, ambiguity, failure or investigation.**

## 2. P06.3 — Attention Architecture

### 2.1 Information does not imply permanent visibility

Studio may know much more than the user needs to see at once. Compiler state, runtime decomposition, provenance and solver internals may all exist without competing with matter in the normal view.

The accepted attention hierarchy is:

1. **AMBIENT TRUTH** — continuously legible world/state/focus;
2. **CONTEXT TRUTH** — revealed because the user is acting on a specific target;
3. **INVESTIGATION TRUTH** — explicitly requested to answer "why/how?";
4. **ENGINEERING TRUTH** — implementation/debug evidence normally absent from product experience.

### 2.2 Ambient truth

The user must always be able to understand, without opening diagnostics:

- the persistent construction or current physical realization;
- whether the world is in BUILD, RUN or PAUSE;
- current selection/focus if one exists;
- that authored local meaning exists in relevant places, without requiring every meaning to be fully expanded.

`READY` is intentionally quiet. Successful normal operation must not create permanent green status banners, gate checklists or telemetry walls. Readiness is primarily communicated through the availability of the appropriate action, especially RUN.

### 2.3 Context truth

Contextual information becomes more explicit as user intention narrows:

`ambient → hover → focus → selection → active draft/operation`

Examples:

- selected face reveals exact local target;
- BEARING authoring reveals seam + axis preview;
- TORQUE-PATCH authoring reveals target face, sign/direction and magnitude preview;
- INVALID highlights the exact offending target/intent;
- UNSUPPORTED highlights the meaningful authored elements whose joint execution has not been qualified.

### 2.4 Investigation truth

PAUSE and explicit Inspect/Trace make deeper truth easy to request, but do not automatically enable every diagnostic overlay.

Investigation can reveal:

- runtime body decomposition;
- pivot/axis/anchor manifestation;
- velocity/trajectory/ghost poses;
- source ↔ compiled ↔ runtime relationship;
- provenance across rebuild, split, merge or repartition;
- current environment/profile compatibility where it matters.

The world answers spatially before text explains the same fact.

### 2.5 Engineering truth normally hidden

The normal Studio experience must not surface as first-class information:

- Box3D handles;
- `planBodyId` or runtime session IDs;
- source/compile generation numbers;
- raw collider/joint IDs;
- CI runs, test counts, scientific gate UI or evidence dashboards;
- raw compiler/runtime logs;
- frame timings unless explicitly entering developer/performance diagnostics.

### 2.6 RUN quiets the UI; PAUSE opens investigation

BUILD is the state of intention and authored change.

RUN is the state of physical consequence. Starting RUN should reduce authoring chrome and give more attention to the physical behavior rather than automatically adding telemetry.

PAUSE keeps the same runtime session alive but makes investigation more discoverable. PAUSE does not silently become a second authoring mode.

### 2.7 Authored meaning visibility levels

Local meaning has progressive visibility:

- **presence** — a discoverable spatial mark says meaning exists here;
- **focus** — identifies the meaning type;
- **active editing** — exposes target, axis/direction and currently editable draft properties;
- **investigation** — reveals how that authored meaning is currently interpreted/realized.

This avoids both extremes: invisible semantics and icon-saturated worlds.

## 3. P06.4 — Spatial Interaction Architecture

### 3.1 Compared interaction families

Three pure families were considered and rejected as sole architecture:

- **tool-first editor** — discoverable but exerts strong CAD/editor gravity and permanent chrome pressure;
- **pure context-first** — world-clean but too undiscoverable for new users and new capabilities;
- **command-first** — efficient for experts but requires knowledge before discovery.

The accepted direction is a hybrid organized by **semantic distance from matter** rather than by a preselected screen layout.

### 3.2 Four interaction surfaces

#### WORLD-ATTACHED LAYER

Closest to matter and highest priority for local work:

- hover target;
- exact cell/face/seam highlight;
- selection;
- authored meaning marks;
- draft/ghost matter placement;
- bearing axes/pivots;
- torque direction/magnitude manifestation;
- local invalid/unsupported feedback;
- transform/editor preview handles where later qualified.

#### CONTEXT-ACTION LAYER

A compact transient action surface derived from the current target/selection and current work state.

It must expose only relevant actions rather than a permanent list of every capability. The exact visual form (near-target palette, compact popover, edge-adjacent context strip, etc.) is intentionally deferred to Product Surface design.

#### WORKSPACE-GLOBAL LAYER

A small stable surface for actions without a local spatial target:

- BUILD/RUN/PAUSE/STOP/RESTART state/control;
- Undo/Redo for authored history;
- entry into a small number of top-level authoring/investigation intents;
- save/load/workspace actions;
- global view/help/settings only where genuinely required.

This surface must remain subordinate to the world.

#### INVESTIGATION LAYER

A larger but conditional surface opened by Inspect/Trace when spatial overlays alone are insufficient. It may explain selected authored/compiled/runtime relationships or numeric properties, but it is not a permanent second world or dashboard.

### 3.3 Tool, state, lens and selection remain separate axes

Do not collapse:

- **Work State** — BUILD / RUN / PAUSE;
- **Tool/Intent** — what user is trying to do;
- **Lens/Investigation** — what truth the user wants revealed;
- **Selection/Focus** — what local thing the user is talking about.

The active tool changes target interpretation, not the identity model of the project.

### 3.4 Picking semantics by context

BUILD default targeting prioritizes authored matter. A local-meaning authoring intent narrows targeting to eligible face/interface/seam semantics.

RUN prioritizes the physical runtime realization. Authored meaning remains spatially discoverable where it produces a current runtime manifestation.

PAUSE still centers the runtime realization while making source/runtime tracing easy.

TRACE explicitly crosses layers using provenance/reference relationships. It must not rely on one Generic Entity or on matching disposable IDs.

Exact hit-test tie-breaking and pointer bindings are implementation/product-surface details as long as these semantic priorities are preserved.

### 3.5 View navigation is an independent presentation channel

Orbit / pan / zoom / focus / reframe are view commands only:

- they do not mutate authored source;
- they do not mutate physics;
- they remain available across tools and BUILD/RUN/PAUSE;
- camera state persists through work-state changes unless the user explicitly chooses a view command;
- Studio must not perform cinematic camera jumps merely because lifetime/state changed.

`Focus selection` and `Reframe/Return to construction` are explicit view actions.

### 3.6 Expert command channel

Keyboard shortcuts / command palette may become a parallel efficiency channel. They must not be the only discoverable path to core actions.

### 3.7 First-envelope scope decision: move/copy/multi-select

Generic Move / Copy / Duplicate / Multi-select are **not requirements of the first Studio implementation envelope**.

This is a deliberate scope decision, not an unresolved implementation omission. The architecture must not preclude future editor selection sets/transactions, but C5B does not invent copy semantics for local meaning or identity merely to imitate a mature CAD tool.

The first envelope earns real agency through add/remove matter, material editing and local physical meaning authoring.

## 4. P06.5 — State Choreography

### 4.1 BUILD

The authored construction is the primary world representation. Source changes recompile/reclassify in place without route changes or camera resets.

### 4.2 BUILD → RUN

RUN creates a **fresh runtime session** from the current valid/supported authored composition.

- same workspace;
- same camera/spatial reference;
- no page/route transition;
- authoring chrome becomes quieter;
- runtime starts from its qualified initial transient state;
- source is not mutated.

The transition must communicate a new physical realization, not imply that the authored document itself became a Box3D body set.

### 4.3 RUN

Runtime geometry and motion are the primary visible physical representation.

Authored meaning may have a **runtime manifestation/annotation** attached to where its effect is currently realized, but this manifestation is not the authored mark itself. Future visual language must distinguish authored source meaning from its realized runtime manifestation.

### 4.4 RUN → PAUSE

The same runtime session is retained and stepping stops. Selection/inspection becomes easier; authored structural commits remain unavailable without returning to BUILD.

### 4.5 PAUSE → TRACE

TRACE overlays relationships onto the same world:

`runtime observation ← compiled interpretation ← persistent source/meaning`

No separate Analysis/Provenance page is required.

### 4.6 PAUSE/RUN persistent edit request

A request to make a persistent edit produces `REQUIRES BUILD`, not a generic error.

The product may offer an explicit action equivalent to **Stop realization and edit construction**. It must be clear that transient runtime state will be discarded.

### 4.7 STOP

STOP disposes the runtime session and restores the persistent construction as the primary representation.

It must **not** animate the runtime body physically "back" to authored pose, because that would visually fake reverse physics or one-object continuity.

If useful, the last runtime state may briefly remain as a fading ghost/trace while the persistent construction reappears as primary. Exact motion/style is deferred, but the semantic rule is fixed: **representation lifetime changes; the physical runtime is not traveling back in time.**

Camera does not automatically jump. If the persistent construction is outside the current view after following a distant runtime object, Studio offers an explicit reframe/return-to-construction action.

Runtime selection expires on STOP. Surviving authored selection may persist.

### 4.8 RESTART

RESTART disposes the current runtime and creates another fresh runtime realization from the same current authored source/profile. Transient runtime activation returns to its qualified initial state.

### 4.9 Selection continuity

Never silently transfer selection identity across source/compiled/runtime lifetime boundaries.

If an authored selection has clear runtime descendants they may cross-highlight. If recompilation produces split/merge/repartition, show lineage/set relationships rather than selecting an arbitrary object as "the same body".

### 4.10 Qualified topology intervention

Accepted CUT remains a specific exception with earned continuity:

`old runtime → explicit qualified intervention → authored topology replacement → dispose old runtime → qualified transfer → rebuild/rebind/relower → fresh runtime → optional old/new trace`

The transition must be visibly understood as **reconstruction**, not generic live authoring. Do not infer arbitrary CUT semantics or arbitrary continuity.

## 5. P06.6 — Failure & Research Instrumentation UX

### 5.1 Failure is semantically classified before presentation

#### READY

Quiet normal state. No success-dashboard pressure.

#### INVALID

The authored intent is currently malformed or violates accepted authored semantics.

Primary response:

- highlight exact offending target/meaning spatially;
- concise reason;
- recovery through repair, explicit removal or authored Undo.

#### UNSUPPORTED

The authored intent may be meaningful, but ANVIL has not qualified the requested composition.

Primary response:

- preserve the authored intent;
- spatially identify the meanings/relationship that create the boundary;
- block only the unsupported execution path;
- allow further editing/inspection;
- communicate **not qualified yet**, not user error.

The final visual language must distinguish UNSUPPORTED from INVALID rather than using generic error-red semantics for both.

#### REQUIRES BUILD

The requested persistent edit conflicts with a live realization lifetime.

Primary response:

- explain that the construction must be edited in BUILD;
- offer an explicit transition such as Stop & Edit where appropriate;
- do not pretend arbitrary live continuity exists.

#### RUNTIME FAULT

Source/composition passed validation but execution failed technically.

Primary response:

- stop further stepping;
- preserve a readable last/failed presentation snapshot where possible;
- concise "realization failed" message;
- recovery actions: Retry fresh realization / Stop / Details;
- raw stack/log/solver details remain behind explicit technical reveal.

### 5.2 Instrumentation grammar

Instrumentation begins with a user question:

`BEHAVIOR QUESTION → TEMPORARY LENS/OVERLAY → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

Examples:

- "how is it moving?" → trajectory / velocity / ghost pose;
- "where is the bearing acting?" → pivot / axis / realized relation;
- "where did this body come from?" → source cross-highlight + lineage;
- "what changed in rebuild?" → old/new ghosts + provenance;
- "why can I not RUN?" → only the current invalid/unsupported boundary.

### 5.3 Instrumentation lifetime

Default instrumentation is:

- opt-in;
- temporary;
- scoped to current focus/selection;
- non-authoritative over physics;
- presentation-only.

Pinning/combining may later be supported deliberately, but a user must not accidentally accumulate many global overlays until the world becomes unreadable.

### 5.4 Attention arbitration

When visual layers compete, use the following semantic priority:

1. active authored draft / blocking failure;
2. current selection/focus;
3. explicit investigation overlay;
4. ambient authored-meaning presence;
5. background/developer diagnostics.

Lower-priority layers may visually quiet while a higher-priority question is active. Exact styling belongs to later P06.

## 6. P06.6b — Workspace Continuity & Recovery

C5B distinguishes **semantic persistence across simulations** from **durable storage across application sessions**.

### 6.1 Three persistence classes

#### AUTHORED WORKSPACE

Persistent construction and app-level authored meanings. This is what document/workspace save must preserve.

#### RUNTIME SESSION

Always disposable. Runtime body/joint/action state is not canonical document state and is not resurrected after reopen/crash.

#### EDITOR / VIEW STATE

Camera, tool, lens, selection and other workspace conveniences may be preserved as editor/session metadata where useful, but they are not physical truth.

### 6.2 Save/load contract

- Save persists authored workspace/source plus necessary app metadata, not Box3D runtime state.
- Matter/Bearing/TorquePatch authored changes create document dirty state.
- RUN/ACTIVATE/PAUSE/STEP/runtime motion do not dirty the authored document.
- Saving while RUN may be allowed because it serializes construction, not transient physics.
- Reopen/reload returns to BUILD, reconstructs/validates the authored workspace and creates runtime only when the user next asks to RUN.
- Workspace serialization may be explicitly provisional + versioned and app-owned; it must not pretend to be final Machine Matter ontology.
- Load must not silently delete/repair INVALID or UNSUPPORTED authored intent merely for convenience.

Exact storage backend, file field layout and migration mechanism are not frozen by C5B.

### 6.3 Undo/redo contract

Authored Undo/Redo covers persistent authored commands.

Runtime evolution — RUN, motion, ACTIVATE, PAUSE, STEP, runtime selection — is not part of authored undo history.

Persistent Undo/Redo against a live realization requires returning to BUILD rather than rewinding solver state.

Implementation mechanism for history remains intentionally unfrozen.

## 7. C5B red-team

C5B passes only because all of the following remain true:

- world remains the primary surface;
- discoverability does not require permanent capability walls;
- contextual UI does not require hidden-only expert gestures;
- authored / compiled / runtime / render identities stay separate;
- RUN/PAUSE/STOP remain lifetime/state changes inside one workspace, not separate applications;
- STOP does not fake reverse physics;
- selection/provenance does not fake persistent runtime identity;
- INVALID, UNSUPPORTED, REQUIRES BUILD and RUNTIME FAULT produce different honest recovery paths;
- research instrumentation is immediately reachable but not permanently dominant;
- workspace Save/Reload/Undo does not require canonical runtime serialization;
- view/camera remains presentation-only;
- no new multi-bearing, multi-patch, generic CUT, generic runtime or ontology semantics are invented;
- no exact pixel layout, typography, palette, iconography or visual style is frozen yet.

## 8. Open questions after C5B

### A — BLOCKER before Product Surface

None identified.

### B — SAFE IMPLEMENTATION DETAIL

- internal compile scheduling/caching;
- exact STEP timestep implementation;
- exact renderer hit-test implementation provided C5B semantic priority is preserved;
- internal serialization field layout/storage backend provided the Save/Load contract is preserved;
- internal IDs not exposed as product identity.

### C — RESEARCH BOUNDARY

- multi-bearing physics/runtime composition;
- multiple TorquePatch composition beyond accepted evidence;
- generic CUT/free-runtime editing;
- arbitrary state continuity/transfer;
- representation-independent locality ontology.

### D — OWNER CHOICE / PRODUCT-SURFACE CHOICE

Not blockers to C5B, but they must be resolved before final Product Design acceptance:

- exact visual/emotional character of Studio;
- exact visible wording for BUILD/RUN/STOP concepts;
- onboarding: blank world vs editable starter construction / first-run experience;
- manual save/export vs autosave emphasis and exact recovery expectations.

### E — DEFERRED DESIGN QUESTION WITH A NAMED OWNER

To be owned by P06.7A / Product Surface Architecture or P06.7B / Visual Language:

- exact physical arrangement of world-attached/context/global/investigation surfaces;
- exact form of context actions (near-target palette, popover, edge surface, etc.);
- material-selection/library surface;
- simulation-profile control/reveal surface;
- exact UI treatment of authored mark vs runtime manifestation;
- exact STOP transition visuals/ghost treatment;
- exact minimum desktop viewport and responsive behavior;
- iconography, typography, palette, spacing, motion and semantic-state styling.

Generic Move/Copy/Duplicate/Multi-select are intentionally **out of first-envelope scope**, not deferred C5B requirements.

## 9. C5B verdict

**C5B PASS — PRODUCT INTERACTION GROUNDED.**

C5A + C5B now define the Studio product independently of final layout/style:

> **Build persistent matter, give physical meaning to places, create a fresh disposable realization, observe it in the same world, investigate only when curiosity requires deeper truth, discard the realization without losing the construction, and preserve unsupported intent as an honest research frontier.**

## 10. Next stage correction

The previous roadmap bundled "Product Surface + Visual Language" into one stage. C5B red-team shows this is still too broad after the corrupted P06 attempt.

Split it:

### P06.7A — PRODUCT SURFACE ARCHITECTURE

Freeze the complete desktop working surface and its behavior without aesthetic polishing:

- actual relative placement/containment of viewport, global state controls, authoring intents, context actions and investigation details;
- default/selected/authoring/RUN/PAUSE/UNSUPPORTED/TRACE surfaces;
- panel/drawer/popover decisions;
- minimum desktop viewport + overflow/responsive strategy;
- first-run/onboarding surface;
- save/load/material/profile entry points;
- discoverability and keyboard/command complement.

### P06.7B — VISUAL LANGUAGE

Only after 7A passes:

- typography;
- palette and semantic-state colors;
- material/world lighting character;
- authored vs runtime manifestation grammar;
- selection/hover/invalid/unsupported styling;
- icons;
- spacing/radius/container treatment;
- motion/transition language.

ImageGen/Build Web Apps remain non-authoritative during product discovery. A visual image may later illustrate an already-frozen surface, but must not invent product structure.

After P06.7A + P06.7B, perform P06.8 / Complete Product Contract + adversarial red-team before PRODUCT DESIGN ACCEPTED / C6.
