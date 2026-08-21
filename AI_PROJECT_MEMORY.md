# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-21.

Accepted scientific truth is through **ANVIL-10 / TORQUE-PATCH-REBIND**. **Epoch I (ANVIL-00…10) is closed.** No ANVIL-11 is active.

Live Git overrides this memory.

## Authority and project self-model

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:
1. live Git/code + executable evidence;
2. direct Owner validation where genuinely required;
3. `.anvil/project-state.json` + `docs/CURRENT_HANDOFF.md` verified against live Git;
4. this memory + canonical docs;
5. conversation/donor history only as leads.

ANVIL may be treated as a third governance actor alongside Owner and Orchestrator. This is an operational metaphor, not literal consciousness.

- **Owner** — purpose, values, subjective acceptance, explicit vision change.
- **Orchestrator** — investigation, falsification, planning, implementation, continuity.
- **Project self-model** — encoded accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next unresolved question.

Contradictions against accepted evidence/boundaries must be surfaced and consciously reclassified, never silently executed.

## Durable project identity

ANVIL investigates persistent authored Machine Matter / Physical Fabric meaning compiling into disposable runtime representations. Runtime Box3D bodies/joints/actions are interpretations, not construction identity. Cubic cells and `cellId@face` remain a laboratory dialect, not final ontology.

W1 / PR #22 is closed-unmerged negative integration/product evidence after Owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**. Do not revive its owner-gate/dashboard form.

P04 / PR #23 is closed-unmerged boundary-proof evidence for the first active-bearing Studio envelope. P05 / PR #24 is closed-unmerged technology-proof evidence selecting Vite + TypeScript, React sparse editor shell, imperative Three.js/WebGL2 presentation and existing Box3D/ANVIL runtime.

P06 attempt #1 / PR #26 is **INVALID / INTERRUPTED / CLOSED UNMERGED**. Its generated dashboard-heavy mockup is rejected and is not a design reference.

## ANVIL Studio north star

**ANVIL Studio is one long-lived, world-first interactive 3D laboratory for Physical Fabric.**

North-star loop:

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

Grounded product loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

Shortest product constitution:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

Studio is not a single experiment route, evidence dashboard, owner-gate UI, generic CAD/game editor or final Machine Matter ontology.

## C5A / Product Behavior — PASS

Canonical record: `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`.

Core rules:

- BUILD edits what persists;
- RUN creates a fresh disposable runtime and does not write runtime motion back to source;
- PAUSE preserves runtime for STEP/TRACE but is not arbitrary source editing;
- STOP disposes runtime, not construction;
- local meaning is meaning attached to a place on matter, not Generic Entity/Component semantics;
- no required COMPOSE/Compile ceremony while lowering can remain automatic;
- product truth distinguishes READY / INVALID / UNSUPPORTED / REQUIRES BUILD / RUNTIME FAULT;
- `UNSUPPORTED != INVALID`; unsupported authored intent survives;
- authored actions follow `TARGET → PREVIEW/DRAFT → COMMIT → RECOMPILE/RECLASSIFY → SPATIAL FEEDBACK`;
- runtime evolution is not authored undo history;
- accepted CUT is a qualified topology intervention, not a generic free editor tool.

## C5B / Product Interaction — PASS

Canonical record: `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`.

### Attention architecture

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

Information levels:

1. ambient truth — world/work state/focus/discoverable authored meaning;
2. context truth — exact target/selection/draft/local blocking issue;
3. investigation truth — explicitly requested behavior/runtime/provenance explanation;
4. engineering truth — IDs/logs/CI/solver internals normally hidden.

READY is quiet. RUN makes UI quieter and physical behavior more dominant. PAUSE opens investigation without auto-enabling diagnostic clutter.

### Spatial interaction architecture

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

Four semantic surfaces, with exact pixel layout still unfrozen:

- world-attached layer — hover, selection, target, authored marks, drafts/ghosts, axes/arrows, local issue feedback;
- context-action layer — compact actions derived from current target/selection;
- workspace-global layer — work-state/simulation controls, authored Undo/Redo, workspace actions, small high-level intent set;
- investigation layer — conditional deeper Inspect/Trace explanation.

Pure tool-first, pure context-first and command-first were rejected as sole architectures. Tool / Work State / Lens / Selection remain separate axes.

View navigation (orbit/pan/zoom/focus/reframe) is presentation-only, independent of authoring/physics, and camera persists across state changes unless user explicitly changes view.

Generic Move/Copy/Duplicate/Multi-select are deliberately outside the first implementation envelope. Architecture must not prevent future editor transactions, but first Studio agency comes from add/remove matter, material edits and local meaning authoring.

### State choreography

- BUILD: authored construction primary;
- RUN entry: fresh runtime in same workspace/camera context, authoring chrome quiets;
- RUN: runtime motion primary; authored meaning may have related runtime manifestation but source must not appear to move;
- PAUSE: same runtime session frozen; inspection becomes easier;
- TRACE: source/compiled/runtime relationship overlays the same world;
- persistent edit against live runtime is REQUIRES BUILD / explicit Stop & Edit;
- STOP disposes runtime and returns persistent construction; do **not** animate runtime physically back to source pose;
- camera does not jump automatically; explicit Reframe/Return to construction handles off-screen source;
- runtime selection dies on STOP; valid authored selection may remain;
- qualified CUT/rebuild may show old→new reconstruction only where continuity evidence exists.

### Failure + instrumentation

Failure semantics remain distinct:

- INVALID → local authored issue + repair/undo;
- UNSUPPORTED → preserve intent, show unqualified relationship, block only unsupported execution, communicate "not qualified yet" rather than user error;
- REQUIRES BUILD → explicit lifetime transition;
- RUNTIME FAULT → stop stepping, preserve readable failed state, Retry/Stop/Details; raw logs behind deeper reveal.

Instrumentation grammar:

`BEHAVIOR QUESTION → TEMPORARY LENS/OVERLAY → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

Default instrumentation is opt-in, temporary, focus/selection-scoped and presentation-only. Attention priority:

`active draft/failure > selection/focus > explicit investigation > ambient authored meaning > background diagnostics`.

### Workspace continuity / recovery

Semantic persistence across RUN/STOP is distinct from disk/session storage.

- Save persists authored workspace/source + necessary app metadata, never canonical runtime state;
- authored changes dirty the document; runtime motion/ACTIVATE/PAUSE/STEP do not;
- reopen/reload returns to BUILD, restores/revalidates authored workspace, runtime only on next RUN;
- workspace serialization may be provisional/versioned/app-owned and is not final ontology;
- Load does not silently repair/delete INVALID/UNSUPPORTED intent;
- authored Undo/Redo applies only to persistent authored commands;
- persistent Undo/Redo against live realization requires BUILD, never solver rewind.

Exact storage backend/field layout remain implementation details as long as this contract holds.

## Accepted engineering boundaries

Do not renegotiate without real contradiction/new evidence:

- `authored != compiled != runtime != render`;
- `render entity != authored entity != runtime entity`;
- runtime is disposable;
- React does not own/mirror hot 60 Hz runtime state;
- Three scene objects are presentation-only;
- selection crosses renderer/application as sparse semantic references/events;
- gizmos modify editor/presentation drafts until explicit authored commit;
- generic authored edits may rebuild/reset runtime unless continuity is separately qualified;
- `UNSUPPORTED != INVALID`;
- `cellId@face` is current laboratory dialect, not final ontology;
- runtime manifestations of authored meaning are related to but not identical with authored source marks;
- P04 does not qualify multi-bearing, multi-patch, generic runtime composition or free-editor CUT continuity.

## Open-question classes after C5B

- **A BLOCKER:** none.
- **B SAFE IMPLEMENTATION DETAIL:** compile scheduling/caching, exact STEP, exact hit-test implementation preserving semantic priority, storage backend/file field layout preserving Save/Load contract, internal IDs.
- **C RESEARCH BOUNDARY:** multi-bearing physics, multi-patch composition, generic CUT/free-runtime editing, arbitrary continuity/state transfer, representation-independent locality.
- **D OWNER / PRODUCT-SURFACE CHOICE:** exact emotional/visual character, final BUILD/RUN/STOP wording, blank vs editable starter first-run, manual save/export vs autosave emphasis.
- **E NAMED LATER DESIGN:** exact screen arrangement, context-action form, material/profile surfaces, authored-mark vs runtime-manifestation visuals, STOP ghost treatment, minimum desktop viewport/responsive behavior, typography/palette/icons/spacing/motion/state styling.

## P06 method

Every mini-stage uses `PLAN → REALIZATION → RED TEAM → VERDICT`.

Before Product Design freeze:

- ImageGen/mockups do not invent product structure;
- Build Web Apps does not invent product behavior/information architecture;
- no Studio implementation;
- visual styling must not decide unresolved product behavior.

Build Web Apps may return after Product Design acceptance as implementation/fidelity discipline working from the accepted specification.

## Next stage — P06.7A / Product Surface Architecture

C5B deliberately splits the previous combined Product Surface/Visual Language stage.

P06.7A must freeze the complete desktop working surface **without aesthetic polishing**:

- relative placement/containment of viewport, global, context and investigation surfaces;
- default/selected/authoring/RUN/PAUSE/UNSUPPORTED/TRACE surface states;
- panel/drawer/popover decisions;
- minimum desktop viewport + responsive/overflow strategy;
- onboarding/first-run surface;
- save/load/material/profile entry points;
- discoverability + expert command complement.

Only after P06.7A PASS may P06.7B freeze typography, palette, lighting/material visual character, semantic-state styling, authored/runtime manifestation grammar, icons, spacing/container treatment and motion.

Then P06.8 performs the complete product-contract/adversarial red-team before **PRODUCT DESIGN ACCEPTED → C6 / IMPLEMENTATION READY**.

## Do not do now

- create ANVIL-11 by inheritance;
- reopen/merge W1 or restore its owner-gate/dashboard form;
- use rejected P06 #1 mockup as design reference;
- implement Studio before Product Design acceptance;
- allow visual fashion/templates to invent Product Surface behavior;
- promote P04/P05 helper shapes into Foundation/ontology by inertia;
- serialize runtime physics as canonical workspace state;
- treat `cellId@face` as final ontology;
- let renderer objects become authored identity or React become runtime-frame owner;
- force WebGPU, R3F, generic state manager, generic FabricRuntime or generic capability architecture without demonstrated need.
