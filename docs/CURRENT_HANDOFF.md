# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 ACCEPTED / EPOCH I CLOSED / W1 CLOSED NEGATIVE PRODUCT EVIDENCE / STUDIO C5B PRODUCT INTERACTION PASS**

Live Git and executable evidence override this checkpoint if they differ.

## Start here

1. Resolve live `main` and open PRs before writing.
2. Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND** only. No ANVIL-11 is active or implied by Studio work.
3. W1 / PR #22 is **CLOSED UNMERGED** after owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**. Its technical integration is donor evidence only; its owner-gate/dashboard form is not the product direction.
4. P04 / PR #23 is closed-unmerged boundary-proof evidence for the first active-bearing Studio envelope.
5. P05 / PR #24 is closed-unmerged technology-proof evidence. First engineering direction: existing Vite + TypeScript, React sparse editor shell, imperative Three.js/WebGL2 presentation, existing Box3D/ANVIL runtime.
6. P06 attempt #1 / PR #26 is **INVALID / INTERRUPTED / CLOSED UNMERGED**. Its generated mockup is rejected and is not a design reference.
7. P06 restart has passed and grounded:
   - **C5A / PRODUCT BEHAVIOR** — `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`;
   - **C5B / PRODUCT INTERACTION** — `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`.
8. The next unresolved product question is **P06.7A / Product Surface Architecture**. Do not implement Studio or use styling/mockups to invent unresolved product structure before that stage passes.

## Operational project self-model

ANVIL may be treated as a third governance actor alongside Owner and Orchestrator. This is an operational metaphor, not literal consciousness.

- **Owner**: purpose, values, subjective product acceptance and explicit vision changes.
- **Orchestrator**: investigation, falsification, planning, implementation and continuity.
- **Project self-model**: encoded accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next unresolved question.

A proposal contradicting accepted evidence/frozen boundaries must be surfaced and consciously reclassified rather than silently executed. Owner may consciously change the vision; Orchestrator must then re-ground project state instead of pretending continuity.

## Studio north star

**ANVIL Studio is one long-lived interactive 3D laboratory for Physical Fabric.**

North-star loop:

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

Grounded product-behavior loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

The shortest accepted mental model is:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

The world is the product. UI supplies tools and reveals truth when needed; it must not become an evidence dashboard, owner gate, set of experiment routes, generic CAD/game editor or ontology browser.

## C5A / Product Behavior — accepted

Persistent authoring follows:

`TARGET → PREVIEW / DRAFT → COMMIT → RECOMPILE / RECLASSIFY → IMMEDIATE SPATIAL FEEDBACK`

Product truth states remain distinct:

- **READY** — current authored composition can be realized;
- **INVALID** — authored intent violates current semantic contract;
- **UNSUPPORTED** — intent may be meaningful but ANVIL has not qualified the requested composition;
- **REQUIRES BUILD** — requested persistent edit cannot honestly be performed against a live realization;
- **RUNTIME FAULT** — source/composition passed validation but execution failed technically.

`UNSUPPORTED != INVALID` is a core Studio rule. Unsupported authored intent should survive rather than being silently deleted or rewritten.

Core C5A behaviors:

- BUILD edits what persists;
- RUN creates a fresh disposable runtime and never writes runtime pose/motion back to source by default;
- PAUSE preserves the same runtime session for STEP/TRACE, not arbitrary source editing;
- STOP disposes runtime but preserves source/camera/workspace context;
- local meaning is experienced as meaning attached to a place on matter, not a generic component model;
- no required COMPOSE/Compile ceremony while successful lowering can remain automatic;
- runtime evolution is not authored undo history;
- accepted CUT remains a qualified topology intervention, not generic free editing.

## C5B / Product Interaction — accepted

### Attention rule

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

Information hierarchy:

1. ambient truth — world, work state, current focus, discoverable authored meaning;
2. context truth — target/selection/draft/invalid or unsupported local issue;
3. investigation truth — explicitly requested runtime/provenance/behavior explanation;
4. engineering truth — IDs/logs/CI/solver internals normally hidden.

`READY` is quiet. RUN should make the UI quieter and physical behavior more dominant. PAUSE opens access to investigation but does not automatically enable all overlays.

### Spatial interaction rule

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

The accepted interaction architecture has four semantic surfaces, without yet freezing exact pixels/style:

- **world-attached layer** — hover/selection, exact cell/face/seam target, authored marks, drafts/ghosts, axes/arrows and local validity feedback;
- **context-action layer** — compact actions derived from current target/selection;
- **workspace-global layer** — work-state/simulation controls, authored Undo/Redo, workspace actions and a small number of high-level intents;
- **investigation layer** — conditional deeper explanation for Inspect/Trace when spatial overlays alone are insufficient.

Pure tool-first, pure context-first and command-first models were rejected as sole architectures. Keyboard/command access may later complement, never replace, discoverable core interaction.

Tool, Work State, Lens and Selection remain separate axes.

### View/navigation contract

Orbit/pan/zoom/focus/reframe are presentation-only commands:

- no authored mutation;
- no physics mutation;
- independent of active authored tool;
- camera persists across BUILD/RUN/PAUSE/TRACE/STOP unless user explicitly changes view;
- no automatic cinematic jumps merely because lifetime changed.

### State choreography

- **BUILD** — authored construction primary;
- **RUN entry** — create a fresh runtime session in the same world/camera context, quiet authoring chrome;
- **RUN** — runtime motion primary; authored meaning may have a related runtime manifestation but must not visually imply source itself moved;
- **PAUSE** — same runtime session frozen; inspection becomes easier;
- **TRACE** — source/compiled/runtime relation overlays the same world;
- **STOP** — dispose runtime and return authored construction to primary representation;
- STOP must not animate runtime physically back to source pose; brief ghost/trace may show lifetime change;
- runtime selection dies on STOP; valid authored selection may remain;
- persistent edit request during live runtime is `REQUIRES BUILD`, optionally offering explicit Stop & Edit;
- qualified CUT may show explicit reconstruction old→new only where continuity evidence exists.

### Failure/recovery contract

- INVALID → local authored target/meaning + concise reason + repair/undo;
- UNSUPPORTED → preserve intent, show the unqualified relationship, block only unsupported execution, do not blame the user;
- REQUIRES BUILD → explicit lifetime transition rather than generic error;
- RUNTIME FAULT → stop stepping, preserve readable failed snapshot where possible, offer Retry/Stop/Details;
- raw logs/stack/solver details remain behind explicit technical reveal.

### Instrumentation contract

`BEHAVIOR QUESTION → TEMPORARY LENS/OVERLAY → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

Instrumentation is opt-in, temporary, selection/focus scoped and presentation-only by default. Avoid permanently accumulating overlays into dashboard-like clutter.

Attention arbitration:

`active draft/failure > selection/focus > explicit investigation > ambient authored meaning > background diagnostics`.

### Workspace continuity/recovery contract

Do not confuse semantic persistence across RUN/STOP with disk/session persistence.

- Save preserves authored workspace/source + necessary app metadata, **not canonical runtime physics state**;
- Matter/Bearing/TorquePatch authored changes dirty the document; runtime motion/ACTIVATE/PAUSE/STEP do not;
- reload/reopen returns to BUILD, restores/revalidates authored workspace and creates runtime only on the next RUN;
- workspace format may be provisional/versioned/app-owned and is not final Machine Matter ontology;
- Load does not silently repair/delete INVALID/UNSUPPORTED intent;
- authored Undo/Redo applies to persistent authored commands only;
- persistent Undo/Redo against live realization requires BUILD, never solver rewind.

Exact storage backend/file-field layout remain implementation details as long as this contract is preserved.

## First-envelope scope decision

Generic Move / Copy / Duplicate / Multi-select are **not first-envelope requirements**. This is deliberate scope, not forgotten functionality. The architecture must not block future editor selection-set/transaction support, but C5B does not invent copy semantics for local meaning/identity merely to imitate mature CAD.

The first envelope earns real agency through add/remove matter, material editing and local physical meaning authoring.

## Accepted engineering boundaries

Do not renegotiate without real contradiction/new evidence:

- `authored != compiled != runtime != render`;
- `render entity != authored entity != runtime entity`;
- runtime is disposable;
- React does not own/mirror hot 60 Hz runtime state;
- Three scene objects are presentation-only;
- selection crosses renderer/application boundaries as sparse semantic references/events;
- gizmos modify presentation/editor drafts until explicit authored commit;
- generic authored edits may rebuild/reset runtime unless continuity is separately qualified;
- `UNSUPPORTED != INVALID`;
- `cellId@face` is current laboratory dialect, not final Machine Matter ontology;
- view navigation is presentation-only;
- runtime manifestations of authored meaning are related to but not identical with authored source marks;
- P04 does not qualify multi-bearing, multi-patch, generic runtime composition or free-editor CUT continuity.

## Open-question classes after C5B

### A — blocker now
None.

### B — safe implementation detail
Internal compile caching/scheduling, exact STEP implementation, exact renderer hit-test implementation preserving semantic priority, internal serialization field layout/storage backend preserving workspace contract, internal IDs not used as product identity.

### C — research boundary
Multi-bearing physics, multi-patch composition, generic CUT/free-runtime editing, arbitrary continuity/state transfer, representation-independent locality ontology.

### D — owner/product-surface choice
Must be resolved before final Product Design acceptance but does not block C5B: exact emotional/visual character; final BUILD/RUN/STOP wording; first-run blank vs editable starter; manual save/export vs autosave emphasis and exact recovery expectation.

### E — deferred to named P06 owner
P06.7A/P06.7B must resolve: exact screen arrangement of interaction surfaces; exact context-action form; material/profile surfaces; authored-mark vs runtime-manifestation appearance; STOP ghost treatment; minimum desktop viewport/responsive behavior; typography/palette/iconography/spacing/motion/semantic-state styling.

## P06 method after interrupted attempt #1

Every mini-stage uses:

`PLAN → REALIZATION → RED TEAM → VERDICT`

During product discovery before Product Design freeze:

- ImageGen/mockups are not the authority that discovers product structure;
- Build Web Apps does not invent product behavior/information architecture;
- do not implement Studio product code;
- visual styling must not decide unresolved product behavior.

Build Web Apps may return after Product Design acceptance as an implementation/fidelity discipline working from the accepted specification.

## Next stage correction — P06.7A / Product Surface Architecture

The previous plan bundled Product Surface and Visual Language together. C5B red-team splits them to reduce another corrupted-P06-style failure.

P06.7A asks:

> **Given grounded behavior + interaction architecture, what exact desktop working surface best embodies it without allowing visual fashion or conventional editor templates to invent product structure?**

P06.7A may freeze:

- relative screen placement/containment of viewport/global/context/investigation surfaces;
- default/selected/authoring/RUN/PAUSE/UNSUPPORTED/TRACE surface states;
- panel/drawer/popover decisions;
- minimum desktop viewport and responsive/overflow strategy;
- first-run/onboarding surface;
- save/load/material/profile entry points;
- discoverability and expert command complement.

P06.7A must still avoid aesthetic polishing.

Only after 7A PASS, P06.7B may freeze visual language: typography, palette, world/material lighting character, semantic-state colors, authored/runtime manifestation grammar, icons, spacing, container treatment and motion.

After 7A + 7B, perform P06.8 / Complete Product Contract + adversarial red-team before **PRODUCT DESIGN ACCEPTED → C6 / IMPLEMENTATION READY**.
