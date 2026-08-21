# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 ACCEPTED / EPOCH I CLOSED / STUDIO P06.7A PRODUCT SURFACE ARCHITECTURE PASS**

Live Git and executable evidence override this checkpoint if they differ.

## Start here

1. Resolve live `main` and open PRs before writing.
2. Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND** only. No ANVIL-11 is active or implied by Studio work.
3. W1 / PR #22 is **CLOSED UNMERGED** after owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**. Its dashboard/gate presentation is negative product evidence, not a direction to revive.
4. P04 / PR #23 is closed-unmerged boundary-proof evidence for the first active-bearing Studio envelope.
5. P05 / PR #24 is closed-unmerged technology-proof evidence selecting: existing Vite + TypeScript, React sparse editor shell, imperative Three.js/WebGL2 presentation, existing Box3D/ANVIL runtime.
6. P06 attempt #1 / PR #26 is **INVALID / INTERRUPTED / CLOSED UNMERGED**. Its generated mockup is rejected and is not a design reference.
7. P06 restart has earned and grounded:
   - **C5A / PRODUCT BEHAVIOR** — `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`;
   - **C5B / PRODUCT INTERACTION** — `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`;
   - **P06.7A / PRODUCT SURFACE ARCHITECTURE** — `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`.
8. The next unresolved product question is **P06.7B / Visual Language**. Do not implement Studio or let a visual concept change the already-earned product structure merely for fashion.

## Operational project self-model

ANVIL may be treated as a third governance actor alongside Owner and Orchestrator. This is an operational metaphor, not literal consciousness.

- **Owner** — purpose, values, subjective product acceptance, explicit vision changes.
- **Orchestrator** — investigation, falsification, planning, implementation, continuity.
- **Project self-model** — encoded accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next unresolved question.

A proposal contradicting accepted evidence/frozen boundaries must be surfaced and consciously reclassified rather than silently executed.

## Studio north star

**ANVIL Studio is one long-lived, world-first interactive 3D laboratory for Physical Fabric.**

North-star loop:

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

Grounded product loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

Shortest accepted mental model:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

The world is the product. UI supplies tools and reveals truth when needed; it must not become an evidence dashboard, owner gate, set of experiment routes, generic CAD/game editor or ontology browser.

## C5A / Product Behavior — accepted

Persistent authoring follows:

`TARGET → PREVIEW / DRAFT → COMMIT → RECOMPILE / RECLASSIFY → IMMEDIATE SPATIAL FEEDBACK`

Truth states remain distinct:

- **READY** — current authored composition can be realized;
- **INVALID** — authored intent violates current semantic contract;
- **UNSUPPORTED** — intent may be meaningful but ANVIL has not qualified the requested composition;
- **REQUIRES BUILD** — requested persistent edit cannot honestly be performed against a live realization;
- **RUNTIME FAULT** — source/composition passed validation but execution failed technically.

`UNSUPPORTED != INVALID` is a core Studio rule. Unsupported authored intent should normally survive.

## C5B / Product Interaction — accepted

Attention rule:

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

Spatial rule:

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

Four semantic surfaces were earned before screen placement:

- world-attached layer;
- context-action layer;
- workspace-global layer;
- investigation layer.

State choreography:

- BUILD — authored construction primary;
- RUN — fresh disposable runtime in the same world/camera context, UI quiets;
- PAUSE — same runtime session frozen for inspection;
- TRACE — source/compiled/runtime relationships overlay the same world;
- STOP — dispose runtime and return authored construction; do not fake reverse physics;
- persistent edit against live runtime is `REQUIRES BUILD` / explicit Stop & Edit;
- view navigation is presentation-only and camera persists unless user explicitly changes it.

Instrumentation remains question-driven:

`BEHAVIOR QUESTION → TEMPORARY LENS/OVERLAY → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

Save/Load preserves authored workspace, never canonical runtime state. Runtime motion/ACTIVATE/PAUSE/STEP do not dirty the authored document.

Generic Move / Copy / Duplicate / Multi-select are deliberately outside the first Studio envelope.

## P06.7A / Product Surface Architecture — accepted

Canonical record: `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`.

Selected structural direction:

> **WORLD CANVAS + PERIPHERAL ISLANDS**

The Three.js world fills the application. Sparse React chrome overlays it through small functional surfaces instead of carving out a conventional editor frame.

### Earned surface anatomy

1. **World Canvas — full-window primary surface**
   - world/matter remains dominant;
   - UI visibility must not auto-recenter camera.

2. **Workspace Dock — upper-left**
   - workspace/document identity + dirty state;
   - New / Open / Save / Save As;
   - authored Undo / Redo;
   - no physics/evidence/dashboard metrics.

3. **Intent Rail — left edge below Workspace Dock**
   - high-level intents only: Select / Matter / Meaning / Inspect;
   - not a permanent capability catalog.

4. **Simulation Dock — lower-center**
   - BUILD/RUN/PAUSE lifetime and relevant simulation actions;
   - current runtime-only action such as ACTIVATE appears only when the live realization actually exposes it;
   - READY is quiet; blocked RUN may show one concise category while the world shows the real local boundary.

5. **Context Pod / Draft Pod — near current target/selection**
   - only relevant local actions;
   - authored draft controls + Commit/Cancel;
   - world geometry/overlays remain the primary preview;
   - screen-space safe placement; no requirement for React 60 Hz state mirroring.

6. **Investigation Drawer — right edge, conditional**
   - opened only by explicit Inspect / Trace / Details or a genuinely deep scoped task;
   - overlays the world; no auto-pan/recenter;
   - keeps Authored / Interpretation / Runtime-Trace information separated;
   - never auto-opens merely because something is selected.

### Surfaces intentionally absent from first envelope

No permanent:

- full-height property inspector;
- hierarchy/outliner;
- timeline;
- full-width status bar;
- experiment/evidence dashboard;
- runtime entity browser;
- material-definition laboratory;
- environment editor;
- generic Entity/Component inspector.

Future surfaces require demonstrated need rather than mature-editor convention.

### Material surface

Live authored model currently gives materials only `id`, `densityKgM3`, `friction`, `displayColor`, with cells referencing `materialId`.

First envelope therefore supports **assigning an existing authored material**, not inventing a Material-definition editor or unearned material science.

### Simulation profile surface

Profile/environment remains separate from authored source validity.

- one qualified profile: no permanent selector;
- multiple genuinely qualified profiles: compact contextual selector from Simulation Dock;
- compatibility problem: reveal profile context because it matters;
- no generic Environment panel in advance of evidence.

### First run

No dashboard/home route. When no workspace exists, keep the same 3D world visible and offer a small one-time start surface:

- Empty;
- Editable Starter using only qualified capabilities.

No forced tutorial or locked demo.

### Desktop envelope

- reference design: **1440×900 CSS px**;
- first-envelope minimum product target: **1024×640 CSS px**;
- below minimum, rendering may continue but authoring is not qualified; prefer a clear minimum-size notice over chaotic compression;
- mobile/tablet is outside the first envelope.

The minimum size is a design target, not yet empirical browser evidence; C6/implementation fidelity must test it.

### Representative surface states

- BUILD idle — World + Workspace Dock + Intent Rail + Simulation Dock only;
- selected matter — add Context Pod;
- local authoring — world preview + Draft Pod;
- INVALID — local target + concise local explanation;
- UNSUPPORTED — preserve authored marks, local boundary, blocked RUN reason, optional Inspect boundary;
- RUN — motion dominates; authoring chrome quiets;
- PAUSE — Resume/Step/Stop + easier Inspect/Trace discovery;
- TRACE — world overlays + optional Investigation Drawer;
- RUNTIME FAULT — last readable world snapshot + Retry/Stop/Details, deeper details in Drawer;
- STOP — same layout, authored construction returns; no route change.

## Accepted engineering boundaries

Do not renegotiate without real contradiction/new evidence:

- `authored != compiled != runtime != render`;
- `render entity != authored entity != runtime entity`;
- runtime is disposable;
- React does not own/mirror hot 60 Hz runtime state;
- Three scene objects are presentation-only;
- selection crosses renderer/application boundaries as sparse semantic references/events;
- generic authored edits may rebuild/reset runtime unless continuity is separately qualified;
- `UNSUPPORTED != INVALID`;
- `cellId@face` is current laboratory dialect, not final Machine Matter ontology;
- runtime manifestations of authored meaning are related to but not identical with authored source marks;
- no permanent inspector/hierarchy/timeline/dashboard is earned for the first envelope.

## Open questions after P06.7A

### A — blocker now
None.

### B — safe implementation/fidelity detail
Exact CSS values inside the structural constraints, exact DOM anchor implementation, keyboard bindings, storage backend preserving workspace contract, responsive thresholds above the qualified minimum.

### C — research boundary
Multi-bearing physics, multi-patch composition, generic CUT/free-runtime editing, arbitrary continuity/state transfer, representation-independent locality.

### D — Owner / Visual Product choice
P06.7B/P06.8 must resolve with strong Owner judgement:

- exact emotional/visual character;
- final user-facing BUILD/RUN/STOP terminology where wording matters;
- final balance between calm technical instrument and tactile/creative workshop.

### E — P06.7B must resolve

- typography;
- palette;
- world/background/lighting character;
- tangible matter appearance;
- authored-meaning visual grammar;
- runtime-manifestation grammar distinct from source;
- selection/hover/draft hierarchy;
- INVALID / UNSUPPORTED / RUNTIME FAULT styling;
- icon system;
- spacing/container treatment;
- motion/transitions including STOP ghost treatment;
- exact visual density of the earned surfaces.

## P06 method

Every mini-stage uses `PLAN → REALIZATION → RED TEAM → VERDICT`.

Before Product Design acceptance:

- ImageGen/mockups do not invent product structure;
- Build Web Apps does not invent product behavior/information architecture;
- no Studio implementation;
- visual styling may express but must not rewrite earned behavior/surface structure.

Build Web Apps may return after Product Design acceptance as implementation/fidelity discipline.

## Next stage — P06.7B / Visual Language

Question:

> **How should ANVIL Studio look, feel and move so the earned product structure expresses the project's actual character — precise, exploratory, tactile, alive and technically honest — without regressing into decorative sci-fi, generic CAD, generic SaaS or the rejected P06 #1 dashboard language?**

P06.7B may now define typography, palette, world/material rendering character, semantic-state visuals, authored/runtime manifestation distinction, icons, spacing/container treatment and motion.

P06.7B must not move panels/surfaces merely to make a visual concept prettier.

After 7B: `P06.8 / Complete Product Contract + adversarial red-team → PRODUCT DESIGN ACCEPTED → C6 / IMPLEMENTATION READY`.
