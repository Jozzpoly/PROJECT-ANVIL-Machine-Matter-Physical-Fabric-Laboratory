# AI Project Memory — PROJECT ANVIL

Last strategic grounding: 2026-08-21.

Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND**. **Epoch I is closed. No ANVIL-11 is active.** Live Git overrides this memory.

## Authority / project self-model

Repository: `Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory`.

Authority order:
1. live Git/code + executable evidence;
2. direct Owner validation where genuinely required;
3. `.anvil/project-state.json` + `docs/CURRENT_HANDOFF.md` verified against live Git;
4. this memory + canonical docs;
5. conversation/donor history only as leads.

ANVIL may be treated as a third governance actor alongside Owner and Orchestrator. This is an operational metaphor, not literal consciousness.

- **Owner** — purpose, values, subjective acceptance, explicit vision changes.
- **Orchestrator** — investigation, falsification, planning, implementation, continuity.
- **Project self-model** — accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next question.

Contradictions against accepted evidence/boundaries must be surfaced and consciously reclassified, never silently executed.

## Durable project identity

ANVIL investigates persistent authored Physical Fabric / Machine Matter meaning compiling into disposable runtime representations. Runtime Box3D bodies/joints/actions are interpretations, not construction identity. Cubic cells and `cellId@face` remain a laboratory dialect, not final ontology.

W1 / PR #22 is closed-unmerged negative product evidence after Owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**. Do not revive its gate/dashboard form.

P04 / PR #23 is closed-unmerged boundary-proof evidence. P05 / PR #24 is closed-unmerged technology-proof evidence selecting:

- Vite + TypeScript;
- React sparse editor shell;
- imperative Three.js/WebGL2 presentation;
- existing Box3D / accepted ANVIL runtime adapters.

P06 attempt #1 / PR #26 is **INVALID / INTERRUPTED / CLOSED UNMERGED**. Its generated dashboard-heavy mockup is rejected and is not a design reference.

## ANVIL Studio north star

**ANVIL Studio is one long-lived, world-first interactive 3D laboratory for Physical Fabric.**

North-star loop:

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

Grounded product loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

Shortest constitution:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

## C5A / Product Behavior — PASS

Canonical: `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`.

Key rules:

- BUILD edits what persists;
- RUN creates fresh disposable runtime;
- PAUSE preserves runtime for STEP/TRACE, not arbitrary source editing;
- STOP disposes runtime, not construction;
- local meaning belongs to places on matter;
- `READY / INVALID / UNSUPPORTED / REQUIRES BUILD / RUNTIME FAULT` remain distinct;
- `UNSUPPORTED != INVALID`;
- authored operations follow `TARGET → PREVIEW/DRAFT → COMMIT → RECOMPILE/RECLASSIFY → SPATIAL FEEDBACK`;
- accepted CUT remains a qualified topology intervention, not free editing.

## C5B / Product Interaction — PASS

Canonical: `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`.

Rules:

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

Earned semantic surfaces:

- world-attached;
- context-action;
- workspace-global;
- investigation.

BUILD/RUN/PAUSE/TRACE/STOP remain one workspace. RUN quiets UI. STOP changes lifetime/representation and must not fake reverse physics. Runtime manifestations of authored meaning are related to but not identical with authored source marks.

Instrumentation is question-driven and temporary. Save/Load preserves authored workspace, never canonical runtime state. View navigation is presentation-only. Generic Move/Copy/Duplicate/Multi-select are not first-envelope requirements.

## P06.7A / Product Surface Architecture — PASS

Canonical: `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`.

Selected structural direction:

> **WORLD CANVAS + PERIPHERAL ISLANDS**

The world fills the application window. Sparse UI overlays it instead of framing a smaller viewport.

Earned surface anatomy:

1. **World Canvas** — full-window primary surface.
2. **Workspace Dock** — upper-left; document identity, dirty state, New/Open/Save/Save As, authored Undo/Redo.
3. **Intent Rail** — left edge; Select / Matter / Meaning / Inspect only, not a permanent capability catalog.
4. **Simulation Dock** — lower-center; BUILD/RUN/PAUSE lifetime and currently valid runtime actions.
5. **Context/Draft Pod** — near current target/selection; relevant local actions, draft controls, Commit/Cancel; world remains primary preview.
6. **Investigation Drawer** — right-edge conditional Inspect/Trace/Details; closed by default; does not auto-recenter world; keeps Authored / Interpretation / Runtime-Trace separated.

First envelope intentionally has no permanent property inspector, hierarchy/outliner, timeline, full-width status bar, experiment dashboard, runtime entity browser, material-definition lab, environment editor or Generic Entity/Component inspector.

### Material / profile

Current authored material contract is only `id`, `densityKgM3`, `friction`, `displayColor` + per-cell `materialId`. First envelope therefore assigns existing materials; it does not invent a new material science/editor.

Simulation profile selector remains contextual: absent when only one qualified profile exists; visible when real choice/compatibility makes it relevant.

### Workspace / first run

Explicit Save remains available; auto-recovery may be a safety net. Runtime state is never canonical save state.

When no workspace exists, keep the same 3D world visible and offer a small one-time `Empty / Editable Starter` start surface. No dashboard/home route or forced tutorial.

### Desktop target

- reference: **1440×900 CSS px**;
- first-envelope minimum product target: **1024×640 CSS px**;
- below minimum, do not compress into dashboard clutter; authoring may be declared unqualified;
- mobile/tablet is outside first envelope.

The minimum is a design target and must be empirically tested during implementation/fidelity work.

## Accepted engineering/product boundaries

Do not renegotiate without real contradiction/new evidence:

- `authored != compiled != runtime != render`;
- `render entity != authored entity != runtime entity`;
- runtime is disposable;
- React does not own/mirror hot 60 Hz runtime state;
- Three scene objects are presentation-only;
- selection crosses renderer/application as sparse semantic references/events;
- generic authored edits may rebuild/reset runtime unless continuity is qualified;
- `UNSUPPORTED != INVALID`;
- `cellId@face` is current laboratory dialect, not final ontology;
- runtime manifestations are not authored source itself;
- no permanent inspector/hierarchy/timeline/dashboard is earned for first envelope.

## Current P06 method

Every mini-stage uses `PLAN → REALIZATION → RED TEAM → VERDICT`.

Before Product Design acceptance:

- ImageGen/mockups do not invent product structure;
- Build Web Apps does not invent product behavior/information architecture;
- no Studio implementation;
- visual styling may express but must not rewrite earned structure.

Build Web Apps returns after Product Design acceptance as implementation/fidelity discipline.

## Next selected stage — P06.7B / Visual Language

Question:

> **How should ANVIL Studio look, feel and move so the earned structure expresses the project's actual character — precise, exploratory, tactile, alive and technically honest — without decorative sci-fi, generic CAD, generic SaaS or the rejected P06 #1 dashboard language?**

P06.7B must define:

- typography;
- palette;
- world/background/lighting character;
- tangible matter appearance;
- authored-meaning vs runtime-manifestation grammar;
- selection/hover/draft hierarchy;
- INVALID / UNSUPPORTED / RUNTIME FAULT styling;
- icon system;
- spacing/container treatment;
- motion including STOP ghost treatment;
- exact visual density of the earned surfaces.

P06.7B is the first stage where Owner taste/emotional character becomes a primary acceptance axis.

Then: `P06.8 complete product contract + adversarial red-team → PRODUCT DESIGN ACCEPTED → C6 IMPLEMENTATION READY → Build Web Apps implementation/fidelity`.
