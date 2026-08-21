# P06 — ANVIL Studio Product Design Gate

Work type: **integration / product design**.

P06 does not implement Studio, create ANVIL-11 or promote new Foundation semantics. It freezes the complete product/visual/interaction contract so later implementation becomes execution rather than product invention.

Base at opening: `main@d80a7e281ae7be73c3d39885360294f1a4dedbd9`.

## 1. Design question

> **How do we design ANVIL Studio so well that implementation can mostly become faithful construction of an already-understood product?**

P06 must remove high-cost ambiguity about what the user sees, touches, understands and expects across the core loop:

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

The product must make that loop feel direct and creative while preserving the technical truth that authored, compiled, runtime and presentation identities are different.

## 2. Product essence

ANVIL Studio is a **living physical workshop**.

It should feel closer to shaping and testing a strange new material than operating a dashboard. The user should spend most attention on the world itself. UI exists to put tools in the hand, reveal meaning, control simulation and inspect consequences.

The emotional target is:

- creation first;
- curiosity rewarded quickly;
- physical behavior visible and legible;
- technical precision available without dominating the first read;
- rapid `Edit → Run → Observe → Change` rhythm;
- the world can feel alive in RUN without becoming visually theatrical or game-like.

The visual character must be authored, calm and distinctive — not generic SaaS, not decorative sci-fi HUD, not a clone of CAD/Blender/Houdini.

## 3. Owner-fit filter

The design should support the established owner working style:

- direct visual/spatial manipulation is preferable to form-driven editing;
- the primary view should stay uncluttered and readable;
- persistent chrome should be small; deeper utility may expand when requested;
- technical details should be organized and layered, not dumped into the first view;
- rapid visible experiments and owner judgement matter more than heavy ceremony;
- the tool should feel simple, clean and genuinely ours;
- a creative heartbeat must survive technical rigor;
- progress is measured by what the owner can actually do with the world.

Any concept that looks impressive but slows the `see → try → understand → modify` loop fails P06.

## 4. Frozen information architecture

All visual concepts use the same product anatomy so aesthetic comparison is not contaminated by different product structures.

### 4.1 World / viewport

The 3D world owns the majority of the screen and is the visual focal point.

It must support:

- perspective world navigation;
- selected cell/body/face legibility;
- authored meaning marks drawn on or immediately around matter;
- runtime motion without losing authored orientation;
- optional compiled/runtime/provenance overlays;
- gizmos and direct manipulation drafts;
- honest invalid / unsupported / rebuild visual states.

### 4.2 Minimal top bar

Persistent top chrome is intentionally small:

- ANVIL Studio identity / workspace name;
- save/load/project affordance only if needed for concept completeness;
- undo/redo affordance;
- global command/search entry;
- compact view/help/settings access.

No dashboard metrics, experiment gate status or scientific telemetry belongs here.

### 4.3 Adaptive creation/tool rail

A compact edge rail exposes the few top-level intents:

- **Matter** — create/remove/paint material;
- **Meaning** — add local physical meaning to a selected face/region;
- **Select / Inspect** — selection mode and semantic inspection;
- optional **Measure / View** utility.

Selection should adapt available operations. The rail should not permanently expose every capability.

### 4.4 Context action surface

Selection produces a small local/contextual action surface close to the work or near the primary tool rail.

Examples:

- selected matter → move/inspect/material/remove;
- selected face → material / Bearing / Torque Patch candidates where valid;
- selected local meaning → edit/remove/inspect semantics;
- unsupported combination → explain why rather than silently disabling everything.

This is an editor interaction surface, not a scientific claim that all shown capabilities compose physically.

### 4.5 Context inspector

A right-side inspector is **conditional**, not visually dominant.

Default: collapsed or narrow summary.

Expanded inspector shows information in progressive depth:

1. what is selected and what it means to the user;
2. editable authored properties/draft controls;
3. compiled interpretation summary when relevant;
4. runtime/provenance technical reveal on demand.

Do not mix source and runtime fields in one undifferentiated property list.

### 4.6 Simulation strip

A thin bottom or lower-edge simulation surface provides:

- EDIT / RUN / PAUSE state;
- run/pause/reset;
- optional step / slow motion / replay controls where conceptually useful;
- one concise current-state signal;
- optional temporary trace/compare control.

It must feel like operating the physical world, not executing an owner gate.

## 5. Required product states

The design is incomplete unless the following states are explicitly visualized or specified.

### S0 — World / default edit

A construction exists. Nothing is selected. The world is inviting, spacious and ready to manipulate. User can understand how to create/select/run without reading documentation.

### S1 — Matter selected

Selection is obvious in the world. Inspector/context tools reveal authored matter identity/material and valid operations without drowning the viewport.

### S2 — Face / local meaning authoring

A face is selected. The system makes local meaning feel like painting/placing behavior onto matter. Bearing and Torque Patch must be visually localized to the selected physical region, not represented primarily as table rows.

### S3 — RUN / living world

Simulation visibly activates. Chrome becomes quieter rather than louder. Physical movement is the primary evidence. Authored meaning remains readable enough to orient the user.

### S4 — PAUSE / inspect consequence

Motion is frozen; selection/inspection becomes easier. The user can reveal trajectories, body decomposition, anchors or provenance without changing authored truth.

### S5 — Authored / compiled / runtime reveal

The product must communicate the separation between persistent meaning and disposable interpretation without requiring separate AUTHORED / RUNTIME / BOTH pages. Use layered overlays and progressive reveal inside one world.

### S6 — Invalid authoring

Example: impossible/non-adjacent/ambiguous placement. The world and local UI clearly explain what is invalid and how to recover. No generic red error wall.

### S7 — Valid but unsupported composition

Example: two independently valid local meanings whose joint physical composition is not yet qualified. Preserve authored intent, label the execution state honestly as unsupported, and explain the boundary without deleting or silently rewriting the source.

### S8 — Rebuild / trace

After a meaningful authored change or qualified topology operation, the user can understand what stayed persistent and what was rebuilt. Prefer ghosting, traces, highlights or provenance overlays over textual log narration.

## 6. Core journeys the design must support

### A — Understand
Open a construction and quickly understand: this is authored matter; this is its current physical interpretation; these marks are local meaning.

### B — Change
Select and modify matter/material, see the authored world change, rebuild when needed, preserve orientation.

### C — Give meaning
Select a local face/region and assign a currently available meaning such as BEARING or TORQUE-PATCH; understand where that meaning lives.

### D — Simulate
Run, pause and reset without losing spatial orientation or confusing source with runtime motion.

### E — Intervene
Use a bounded topology/activation operation and understand persistence versus reconstruction.

### F — Explore
Perform an action not hard-coded as a single frozen demonstration path and receive either an interesting physical result or an honest INVALID/UNSUPPORTED response. If the product cannot support F, it risks becoming another Workbench.

## 7. Visual grammar

### 7.1 World-first contrast

The matter/world carries visual weight. App chrome is quieter and lower-contrast. Selected/local semantic meaning can become vivid, but only around the relevant place.

### 7.2 Semantic color is functional

Use a restrained base palette and a small number of high-information accents. Colors should encode stable classes such as:

- selection / active focus;
- authored local meaning;
- active runtime energy/action;
- warning / unsupported;
- invalid/error;
- provenance/trace.

Do not create a rainbow of capability-specific colors that becomes impossible to learn.

Exact palette is not frozen before concept review.

### 7.3 Material should look tangible

Even with simple geometry, matter should have enough lighting, shading, grounding and edge definition to feel physical and manipulable. Avoid both sterile flat debug cubes and glossy game-art spectacle.

### 7.4 Meaning lives on matter

Bearing/torque/compliance-like semantics should appear as local marks, anchors, rings, arrows, face treatments, seams or vectors positioned in the world. The inspector may explain them; it must not be the primary representation.

### 7.5 Motion clarifies state

Use subtle transitions for selection, tool activation, overlay reveal and RUN/PAUSE. Motion should explain causality or state change, not decorate idle chrome.

## 8. Three concept directions

All three directions must implement the same anatomy and states.

### Direction A — LIVING WORKSHOP

Dark-to-neutral physical workspace, restrained charcoal chrome, softly lit matter, a small number of luminous semantic accents. Feels intimate, tactile and alive without sci-fi HUD decoration. Strongest candidate for the project's creative/experimental soul.

### Direction B — PRECISION DAYLIGHT

Light/neutral modeling environment with exceptionally quiet chrome and crisp selection/semantic colors. Maximizes clarity and approachability; closer to a precision design instrument, but must avoid becoming generic CAD.

### Direction C — MATERIAL LAB

Mid-dark industrial/technical workspace with slightly stronger instrument character: subtle grid, measurement/provenance traces, machined typography/details. More analytical than A, but still viewport-first and free of dashboard walls.

The concept review should judge which direction best balances creation, discovery, clarity and ANVIL identity. Hybridization is allowed only after identifying exactly which traits are being combined; do not average all three into generic UI.

## 9. Build Web Apps concept requirements

Before any Studio product code:

1. generate the **complete primary desktop screen**, not a hero/header fragment;
2. generate separate readable state/detail concepts where a single screenshot cannot carry the information;
3. keep all real UI text/controls code-native in eventual implementation;
4. do not invent fake metrics, product claims, dashboards or extra navigation;
5. preserve the world-first container model — do not turn the layout into nested cards;
6. show practical implementable panel/toolbar/icon anatomy;
7. include at minimum S0, S2, S3/S4 and S7/S8 visual evidence before freeze;
8. after owner acceptance, extract exact design tokens, typography, icon inventory, component families, states, spacing, motion and responsive/minimum-viewport behavior;
9. implementation must later be compared screenshot-to-concept at native design dimensions.

## 10. P06 rejection gates

Reject a concept if any is true:

- the viewport is not clearly the main product surface;
- the first read is logs, cards, state labels or dashboards rather than matter;
- authored/runtime layers are represented primarily as separate pages;
- local meaning is easier to understand in the inspector than in the world;
- persistent chrome is dense enough to reduce creative working space materially;
- visual style is decorative sci-fi, generic SaaS or generic CAD without ANVIL identity;
- RUN makes the UI busier rather than letting the physical result dominate;
- unsupported/invalid states are hidden, destructive or represented as generic errors;
- the concept cannot plausibly support rapid `Edit → Run → Observe → Change`;
- implementation would require changing P04/P05 boundaries or inventing new science.

## 11. Explicit non-claims

P06 does not prove or freeze:

- new physics or semantic capabilities;
- multi-bearing or arbitrary multi-capability runtime composition;
- arbitrary CUT continuity;
- representation-independent locality ontology;
- final workspace persistence/file schema;
- state manager, undo architecture or command bus implementation;
- WebGPU or react-three-fiber;
- exact owner-hardware performance;
- final Machine Matter representation.

## 12. Completion condition

P06 reaches **PRODUCT DESIGN ACCEPTED** only when:

- owner accepts one coherent complete visual direction;
- required states/journeys are represented without hidden contradictions;
- a red-team review finds no W1-style readability/product-value failure;
- the accepted concept is converted into a frozen design system + state catalogue + interaction/component inventory;
- all remaining uncertainties are implementation details rather than unresolved product decisions.

Only then may C6 prepare the implementation-ready build plan.
