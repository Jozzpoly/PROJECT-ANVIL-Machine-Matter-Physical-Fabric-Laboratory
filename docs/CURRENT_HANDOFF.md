# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 ACCEPTED / EPOCH I CLOSED / STUDIO P06.7B VISUAL LANGUAGE PASS**

Live Git and executable evidence override this checkpoint if they differ.

## Start here

1. Resolve live `main` and open PRs before writing.
2. Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND** only. No ANVIL-11 is active or implied by Studio work.
3. W1 / PR #22 is **CLOSED UNMERGED** after owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**. Its dashboard/gate presentation is negative product evidence, not a direction to revive.
4. P04 / PR #23 is closed-unmerged boundary-proof evidence for the first active-bearing Studio envelope.
5. P05 / PR #24 is closed-unmerged technology-proof evidence selecting existing Vite + TypeScript, React sparse editor shell, imperative Three.js/WebGL2 presentation and existing Box3D/ANVIL runtime.
6. P06 attempt #1 / PR #26 is **INVALID / INTERRUPTED / CLOSED UNMERGED**. Its generated mockup is rejected and is not a design reference.
7. P06 restart has earned:
   - **C5A / PRODUCT BEHAVIOR** — `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`;
   - **C5B / PRODUCT INTERACTION** — `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`;
   - **P06.7A / PRODUCT SURFACE ARCHITECTURE** — `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`;
   - **P06.7B / VISUAL LANGUAGE** — `docs/studio/P06-7B-VISUAL-LANGUAGE.md`.
8. The next unresolved product question is **P06.8 / Complete Product Contract + adversarial red-team**. Do not implement Studio before that review earns Product Design acceptance.

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

Persistent authoring:

`TARGET → PREVIEW / DRAFT → COMMIT → RECOMPILE / RECLASSIFY → IMMEDIATE SPATIAL FEEDBACK`

Truth states remain distinct:

- **READY** — current authored composition can be realized;
- **INVALID** — authored intent violates current semantic contract;
- **UNSUPPORTED** — intent may be meaningful but ANVIL has not qualified the requested composition;
- **REQUIRES BUILD** — requested persistent edit cannot honestly be performed against a live realization;
- **RUNTIME FAULT** — source/composition passed validation but execution failed technically.

`UNSUPPORTED != INVALID`. Unsupported authored intent normally survives.

BUILD edits what persists. RUN creates fresh disposable runtime. PAUSE preserves the same runtime for STEP/TRACE, not arbitrary source editing. STOP disposes runtime, not construction. Accepted CUT remains a specifically qualified topology intervention, not generic free editing.

## C5B / Product Interaction — accepted

Attention rule:

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

Spatial rule:

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

Earned semantic surfaces before layout:

- world-attached;
- context-action;
- workspace-global;
- investigation.

BUILD/RUN/PAUSE/TRACE/STOP remain one workspace. RUN quiets UI. STOP changes lifetime/representation and must not fake reverse physics. Runtime manifestations of authored meaning are related to but not identical with authored source marks.

Instrumentation remains question-driven:

`BEHAVIOR QUESTION → TEMPORARY LENS/OVERLAY → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

Save/Load preserves authored workspace, never canonical runtime state. View navigation is presentation-only. Generic Move/Copy/Duplicate/Multi-select are deliberately outside the first envelope.

## P06.7A / Product Surface Architecture — accepted

Canonical: `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`.

Selected direction:

> **WORLD CANVAS + PERIPHERAL ISLANDS**

The Three.js world fills the application; sparse React chrome overlays it rather than framing a smaller viewport.

Earned surfaces:

1. **World Canvas** — full-window primary world.
2. **Workspace Dock** — upper-left workspace identity/save/history.
3. **Intent Rail** — left-edge high-level `Select / Matter / Meaning / Inspect`.
4. **Simulation Dock** — lower-center BUILD/RUN/PAUSE lifetime and current simulation actions.
5. **Context/Draft Pod** — local target/selection action + draft Commit/Cancel.
6. **Investigation Drawer** — conditional right-edge `Inspect / Trace / Details`, closed by default.

No permanent full-height inspector, hierarchy/outliner, timeline, dashboard, runtime entity browser, material-definition lab, environment editor or Generic Entity/Component inspector is earned for the first envelope.

Material surface assigns existing authored materials only. Simulation profile selection appears only when real qualified choice/compatibility makes it relevant.

First run remains in the same world and offers only `Empty / Editable Starter`; no dashboard/home route.

Desktop design target:

- reference: **1440×900 CSS px**;
- minimum first-envelope target: **1024×640 CSS px**, to be empirically validated during implementation/fidelity.

## P06.7B / Visual Language — accepted

Canonical: `docs/studio/P06-7B-VISUAL-LANGUAGE.md`.

Selected v0 visual direction:

> **QUIET PHYSICAL WORKSHOP**

Visual constitution:

> **Matter should feel touchable. Meaning should look deliberately authored onto places. Runtime should become alive only when physics is alive. Chrome should behave like a quiet precision instrument. Deeper truth should appear as temporary explanation, not permanent spectacle.**

### Governing grammar

- shape communicates capability/kind;
- stroke/material treatment communicates authored/runtime lifetime;
- color reinforces semantics but is never the sole carrier;
- motion is reserved for real action/change/transition.

### World / matter

- neutral mid-dark world roughly `#202327–#262A2E`, not black void;
- calm studio/workshop lighting; stable exposure; no dramatic game lighting or sci-fi fog;
- authored material `displayColor` remains meaningful;
- matte/tangible matter, subtle bevel/contact grounding, no permanent full wireframe;
- grid is an orientation instrument and may quiet in RUN.

### Chrome / typography

- graphite chrome `#1C1F23`;
- no glassmorphism/holographic panes/nested SaaS card stacks;
- moderate radius around `8 px`;
- spacing rhythm `4 / 8 / 12 / 16 / 24 px`;
- control height roughly `32–36 px`;
- **IBM Plex Sans** for normal UI; **IBM Plex Mono** only for numeric/technical reveal;
- geometric stroke icons around `18 px`.

### Semantic visual tokens

- Bearing `#4BC7C1` — ring + axis;
- Torque `#F2A65A` — surface patch + directional arrow;
- INVALID `#E56A6A` + broken/hatched/slashed treatment;
- UNSUPPORTED `#B7A0D8` + dashed/open frontier treatment, never generic error-red;
- REQUIRES BUILD `#D7BC68` + lifetime-transition cue;
- READY remains quiet;
- RUNTIME FAULT uses fault context/icon/recovery treatment rather than inventing a permanent new color family.

Selection/focus uses a **two-tone high-contrast outline** so arbitrary material colors cannot hide the state. Critical authoring handles retain minimum screen-space legibility; controlled x-ray/dashed continuation is allowed only for the active operation where necessary.

### Authored vs runtime

- authored meaning: solid/matte, spatially attached, stable, no ambient animation;
- runtime manifestation: related shape/hue but distinct treatment; motion only if the runtime behavior is actually active;
- no broad neon bloom;
- TRACE reveals source/compiled/runtime relation through temporary neutral ghosts/cross-highlights;
- runtime manifestation must never imply authored source itself moved.

### Motion

Functional and short:

- hover `0–80 ms`;
- Context/Draft Pod `100–140 ms`;
- drawer `160–200 ms`;
- BUILD→RUN handoff `120–180 ms`;
- STOP runtime ghost `280–360 ms`;
- explicit camera Focus/Reframe `180–260 ms`.

No springy/bouncy default motion. STOP never animates runtime physically back to source pose.

### Explicit anti-patterns

Reject:

- black void + neon cyan/purple HUD;
- holographic/glass panels;
- permanent glowing/rainbow overlays;
- generic dark SaaS card UI;
- all-terminal/monospace product styling;
- dramatic game post-processing obscuring matter;
- any visual redesign that changes the P06.7A surface anatomy merely for fashion.

## Accepted engineering/product boundaries

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
- runtime manifestations of authored meaning are not authored source itself;
- no permanent inspector/hierarchy/timeline/dashboard is earned for first envelope.

## Empirical obligations carried into implementation/fidelity

These are not silently declared proven by design:

- actual `1024×640` density/readability;
- arbitrary light/dark authored material color clashes;
- extreme zoom/camera-angle target/handle legibility;
- actual keyboard focus/contrast behavior;
- outline/ghost browser/GPU behavior;
- font metrics/loading and icon optical quality;
- performance of hot Three overlays while sparse React chrome remains cold.

## P06 method

Every mini-stage uses `PLAN → REALIZATION → RED TEAM → VERDICT`.

Before Product Design acceptance:

- ImageGen/mockups do not invent product structure;
- Build Web Apps does not invent product behavior/information architecture;
- no Studio implementation;
- visual styling may express but must not rewrite earned structure.

Build Web Apps returns after Product Design acceptance as implementation/fidelity discipline.

## Next stage — P06.8 / Complete Product Contract + adversarial red-team

P06.8 must not produce another visual concept. It must combine the already-earned product into one falsifiable first-envelope contract.

Required review:

1. walk complete representative journeys through C5A behavior + C5B interaction + P06.7A surfaces + P06.7B visual language;
2. test default, selection, authoring, INVALID, UNSUPPORTED, RUN, PAUSE, TRACE, STOP, RUNTIME FAULT and reopen/recovery as one coherent product;
3. attack W1 regression, corrupted-P06 regression, generic CAD/SaaS drift, source/runtime identity confusion, hidden-only actions, instrumentation clutter and implementation-only unanswered decisions;
4. classify every remaining question as blocker / implementation-fidelity / research boundary / explicit Owner choice;
5. issue **PRODUCT DESIGN ACCEPTED** only if no fundamental product decision is being deferred to implementation.

Only after acceptance proceed to **C6 / IMPLEMENTATION READY** and hand the frozen contract to Build Web Apps as implementation/fidelity discipline.
