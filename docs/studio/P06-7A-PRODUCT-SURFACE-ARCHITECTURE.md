# P06.7A — ANVIL Studio Product Surface Architecture

Status: **PASS — PRODUCT SURFACE ARCHITECTURE EARNED**

Work type: integration / product design.

Base truth: `main@d9239bc47a2b11bffbc62f8ad4768b6f215a4d79` with C5A / Product Behavior and C5B / Product Interaction already grounded.

This document freezes the **structural working surface** of the first ANVIL Studio desktop envelope. It does not implement Studio, create ANVIL-11, freeze visual styling, invent new physics/ontology, or promote product-local structures into Foundation.

## 1. Question

> **Given grounded product behavior + interaction architecture, what exact desktop working surface best embodies ANVIL without allowing visual fashion or conventional editor templates to invent product structure?**

P06.7A exists so later visual design and implementation do not decide layout, containment or information placement by convention.

## 2. Inputs that may not be renegotiated here

From C5A:

- the persistent construction belongs to the user;
- local physical meaning belongs to places on matter;
- RUN creates a fresh disposable realization;
- PAUSE preserves that realization for observation;
- STOP disposes realization, not construction;
- `UNSUPPORTED != INVALID`;
- authored actions follow `TARGET → PREVIEW/DRAFT → COMMIT → RECOMPILE/RECLASSIFY → SPATIAL FEEDBACK`.

From C5B:

- **matter first; context second; explanation on demand; engineering internals last**;
- **local truth close to matter; global state at workspace boundary; investigation only on request**;
- world-attached / context-action / workspace-global / investigation remain distinct semantic surfaces;
- BUILD / RUN / PAUSE / TRACE / STOP remain one workspace and do not fake source/runtime identity continuity;
- view navigation is presentation-only;
- Save/Load preserves authored workspace, never canonical runtime physics;
- instrumentation is temporary and question-driven by default;
- generic Move / Copy / Duplicate / Multi-select are not first-envelope requirements.

Engineering lock from P05:

- Three.js/WebGL2 owns hot presentation;
- React owns sparse editor/application chrome;
- hot runtime motion must not require React state mirroring at 60 Hz.

## 3. Surface requirements matrix

The surface must simultaneously satisfy:

1. **world dominance** — normal work reads first as matter in a world, not an editor frame;
2. **core discoverability** — a new user can discover Matter / Meaning / Inspect and simulation without hidden-only expert gestures;
3. **locality** — face/seam/meaning operations are spatial and do not require property-table-first workflows;
4. **quiet RUN** — entering simulation removes authoring pressure rather than adding telemetry;
5. **deep truth on demand** — Trace/Inspect can expose authored/compiled/runtime/provenance truth without a permanent dashboard;
6. **lifetime legibility** — surface does not imply authored source moved because runtime moved;
7. **failure locality** — INVALID/UNSUPPORTED appear first at the affected place/relationship;
8. **workspace continuity** — Save/dirty/Undo/Redo exist without becoming a document-management application;
9. **first-envelope restraint** — do not create hierarchy, timeline, material lab, environment editor or generic property system without a demonstrated need;
10. **implementation feasibility** — sparse DOM chrome must fit the proven React ↔ imperative Three boundary.

## 4. Compared surface families

### A — FIXED EDITOR FRAME — REJECT

Shape:

`top bar + permanent left tool rail + permanent right inspector + bottom status/transport + viewport in the middle`

Strengths:

- predictable;
- highly discoverable;
- simple to implement.

Reasons for rejection:

- tells the user "this is a conventional editor with a viewport" before matter is experienced;
- permanently reserves screen area for information even when none is needed;
- exerts strong CAD/Unity/Blender template pressure;
- makes a property inspector likely to become the primary representation of local meaning;
- recreates the structural conditions that produced W1-style UI gravity.

### B — ALMOST PURE WORLD / RADIAL CONTEXT — REJECT AS SOLE ARCHITECTURE

Shape:

`almost no persistent chrome; most operations discovered through object/context/radial interaction`

Strengths:

- strongest world-first feeling;
- excellent locality;
- minimal visual overhead.

Reasons for rejection as the only model:

- weak first-use discoverability in a novel domain;
- requires users to know interaction vocabulary before learning Physical Fabric vocabulary;
- scales poorly as new qualified capabilities appear;
- expert-feeling hidden gestures would become accidental mandatory knowledge.

### C — WORLD CANVAS + PERIPHERAL ISLANDS — SELECTED

Shape:

- full-window world canvas;
- several small function-specific edge surfaces;
- local context/draft surface near current work;
- one conditional deep investigation surface.

This is the only tested family that simultaneously preserves world dominance, discoverability, locality, progressive disclosure and implementation feasibility.

## 5. Selected desktop anatomy

The names below are **architectural labels**, not frozen user-facing copy.

### 5.1 WORLD CANVAS — full application background

The Three.js viewport fills the application window.

Permanent React chrome overlays it in small islands instead of carving out a smaller central viewport.

The world remains spatially continuous when global/context/investigation surfaces open or close.

No automatic camera reframe is caused merely by UI visibility.

### 5.2 WORKSPACE DOCK — upper-left

Purpose: persistent document/workspace actions only.

Contains:

- workspace/document name or identity;
- dirty-state indication;
- access to New / Open / Save / Save As;
- authored Undo / Redo.

Does **not** contain:

- physics metrics;
- compile gates;
- runtime body counts;
- evidence status;
- capability lists;
- scientific claim state.

It remains compact and does not become a full-width application header.

### 5.3 INTENT RAIL — left edge below Workspace Dock

Purpose: discover the small number of highest-level user intents.

First-envelope intents:

- **Select**;
- **Matter**;
- **Meaning**;
- **Inspect**.

It is deliberately **not** a permanent list of BEARING / TORQUE-PATCH / CUT / ELASTIC / future capabilities.

Specific actions emerge from current target + qualified context.

The active intent changes targeting/affordances, not project identity.

During RUN, authoring intents may visually quiet/become unavailable while Select/Inspect remain meaningful.

### 5.4 SIMULATION DOCK — lower-center

Purpose: global lifetime/simulation state and actions.

BUILD:

- current authored-work state is unambiguous;
- RUN is the primary execution action when current composition is realizable.

RUN:

- Pause;
- Stop;
- Restart where useful;
- current qualified transient action such as ACTIVATE only when the active realization actually exposes it.

PAUSE:

- Resume;
- Step;
- Stop;
- Restart;
- Inspect/Trace entry remains available through the broader interaction architecture.

The dock is compact rather than full-width.

`READY` is not a permanent success banner. RUN availability normally communicates readiness.

When RUN is blocked, the dock may show one concise reason/category while the world shows the actual local INVALID/UNSUPPORTED boundary.

### 5.5 CONTEXT POD / DRAFT POD — near current target/selection

Purpose: local actions and active authored draft control.

Selection examples:

- selected matter → Material / Remove / Inspect;
- selected eligible local place under Meaning intent → currently qualified local meanings such as Bearing / Torque Patch;
- selected authored meaning → edit/remove/inspect actions appropriate to that meaning.

The Context Pod shows only actions valid/relevant to the current target and state.

After an authored operation begins, it becomes a **Draft Pod** containing:

- only parameters necessary for that draft;
- Commit;
- Cancel;
- concise validity/boundary feedback.

World geometry/overlays remain the primary preview. The Pod explains/commits; it does not replace spatial feedback.

Placement rules:

- screen-space surface, not a 3D entity;
- offset away from selected geometry where possible;
- clamped to safe viewport bounds;
- may flip to another side or a stable edge-context position when the projected target would be obscured;
- must not require React state rerendering on every runtime frame.

Hot world-attached marks/picking/motion remain in Three. If a DOM anchor must follow motion, positioning may be updated imperatively without mirroring runtime state into React.

### 5.6 INVESTIGATION DRAWER — right edge, conditional

Purpose: deeper text/numeric explanation only after explicit `Inspect`, `Trace`, `Details` or another clearly scoped request.

Properties:

- closed by default;
- never auto-opens merely because something is selected;
- overlays the world rather than permanently shrinking it;
- opening does not auto-pan or recenter camera;
- one large conditional information surface, not several dashboards.

Information must retain lifetime separation. A useful content ordering is:

1. **Authored** — what persistent intent/place is selected;
2. **Interpretation** — how current compilation/lowering interprets it;
3. **Runtime / Trace** — what the current disposable realization is doing/where it came from.

These are not a single generic property list and do not imply common identity.

Raw engineering data remains behind an additional explicit technical reveal if needed.

## 6. Surfaces intentionally absent from first envelope

No permanent:

- right property inspector;
- hierarchy/outliner;
- timeline;
- full-width status bar;
- experiment/evidence dashboard;
- compile log panel;
- runtime entity browser;
- material-definition laboratory;
- environment editor;
- generic Entity/Component inspector.

Absence does not prohibit future evidence-driven additions. It prevents mature-editor furniture from arriving before a demonstrated need.

## 7. Material surface

Live authored material contract currently contains:

- `id`;
- `densityKgM3`;
- `friction`;
- `displayColor`;
- cells reference `materialId`.

P06.7A therefore freezes **material assignment**, not a new Material-definition authoring system.

First-envelope flow:

`select authored matter → Material action → compact picker of materials already present in current authored document → preview → commit assignment`

Rules:

- do not invent steel/aluminum/etc. catalogs unless current authored data actually contains them;
- do not invent Young's modulus, Poisson ratio, yield strength or other material science absent from accepted model;
- density/friction may be inspectable deeper information but are not required as default controls during simple assignment;
- authoring/editing MaterialDefinition itself is outside the first surface envelope until separately designed.

## 8. Simulation-profile surface

Simulation profile/environment is separate from authored source validity.

Surface rule:

- when only one qualified profile is relevant, do not consume permanent chrome with a selector;
- when multiple qualified profiles genuinely exist, profile selection may emerge from Simulation Dock through a compact picker;
- when profile compatibility blocks RUN, the current relevant profile/compatibility becomes contextually visible;
- do not create a generic Environment panel in advance of evidence.

## 9. Workspace save/recovery surface

Workspace Dock gives the user an ordinary durable-document mental model:

- New;
- Open;
- Save;
- Save As;
- dirty indication;
- authored Undo/Redo.

Product expectation:

- explicit Save remains understandable and available;
- automatic recovery may exist as a safety net, not as a substitute that makes persistence mysterious;
- canonical save contains authored workspace + required app metadata, never live solver state;
- saving during RUN may save the authored construction without preserving transient runtime motion;
- after reopen/recovery the workspace returns to BUILD and recompiles/revalidates.

Exact browser/local storage/file-system backend remains implementation-specific.

## 10. First-run / New Workspace surface

P06.7A avoids forcing either extreme `always blank` or `always scripted demo`.

When no workspace exists, the same 3D world remains visible as background. A small one-time start surface offers:

- **Empty** — begin from no authored construction;
- **Editable Starter** — load a fully editable starter using only already-qualified capabilities.

Rules:

- no separate dashboard/home route is required;
- no forced tutorial sequence;
- Starter must be ordinary editable authored content, not a locked demonstration;
- user can clear/replace it;
- contextual first-use hints may disappear after successful actions rather than becoming permanent onboarding chrome.

Exact starter content belongs to implementation/product-contract preparation but may not use unqualified science.

## 11. Expert command complement

A command palette / searchable action channel may coexist with visible interaction surfaces.

Rules:

- never the sole discoverable path to core actions;
- filters commands by current state/target/capability;
- may explain `REQUIRES BUILD` / unsupported state rather than silently hiding every unavailable command;
- exact keyboard bindings are not frozen by 7A because they must be reconciled with browser and 3D navigation input later.

## 12. Reference desktop envelope

Reference design viewport:

- **1440 × 900 CSS px**.

First-envelope minimum product target:

- **1024 × 640 CSS px**.

Responsive rules inside that envelope:

- World Canvas always fills the application window;
- no multi-column dashboard reflow;
- Intent Rail may collapse text labels before dropping core intents;
- Simulation Dock may compact secondary labels while retaining state + primary actions;
- Context/Draft Pod width is constrained and repositions around target / safe edge;
- Investigation Drawer overlays rather than reflows/recenters world;
- drawer must remain bounded to roughly `<= 42%` of viewport width at small desktop sizes;
- no permanent panel may appear merely to solve narrower layout;
- below `1024 × 640`, rendering may continue but first-envelope authoring is not qualified; prefer a clear minimum-viewport notice over chaotic compression.

Mobile/tablet is outside this first product envelope. This is scope, not a permanent product prohibition.

The `1024 × 640` minimum is a design target, not yet empirical browser evidence. C6/implementation fidelity must test it.

## 13. Representative surface states

### BUILD / idle

Visible:

- World Canvas;
- Workspace Dock;
- Intent Rail;
- Simulation Dock.

Absent:

- Context Pod;
- Investigation Drawer;
- diagnostics.

### Matter selected

Add:

- spatial selection;
- Context Pod with currently relevant matter actions.

Drawer remains closed.

### Local meaning authoring

Add:

- exact face/seam target;
- world preview/axis/vector as applicable;
- Draft Pod with necessary draft controls + Commit/Cancel.

### INVALID

Primary signal:

- exact offending target/meaning in world;
- concise explanation in Draft/Context Pod.

No global modal error.

### UNSUPPORTED composition

- preserve authored marks;
- show exact unqualified relationship locally;
- RUN becomes unavailable with one concise category/reason at Simulation Dock;
- `Inspect boundary` may open Investigation Drawer.

### RUN

- world/runtime motion becomes dominant;
- authoring intents quiet/unavailable;
- Simulation Dock exposes runtime actions;
- no automatic telemetry drawer;
- moving runtime does not require a React context surface to follow every frame.

### PAUSE

- same runtime realization remains;
- Resume / Step / Stop visible;
- Inspect/Trace becomes more discoverable;
- no automatic property dashboard.

### TRACE

- spatial source/compiled/runtime overlays in world;
- optional Investigation Drawer for deeper explanation.

### RUNTIME FAULT

- preserve readable failed/last snapshot where possible;
- Simulation Dock expands locally to Retry / Stop / Details;
- Details opens Investigation Drawer;
- raw logs remain deeper technical reveal.

### STOP

- no layout/route change;
- authored construction returns as primary world representation;
- any final-runtime ghost is world presentation, not a new panel;
- camera remains unless user explicitly reframes.

## 14. Red-team

### 14.1 Risk: Peripheral Islands slowly become a conventional editor frame

Guard:

- no permanent full-width header/status bar;
- no permanent full-height inspector;
- no hierarchy/timeline by convention;
- new permanent surfaces require demonstrated product need.

### 14.2 Risk: Context Pod hides the world

Guard:

- safe projected placement and flipping;
- stable edge fallback;
- essential preview remains in world, so Pod never owns spatial truth.

### 14.3 Risk: Investigation Drawer becomes a property dump

Guard:

- explicit invocation only;
- source / interpretation / runtime remain separated;
- no auto-open on simple selection;
- raw engineering truth remains deeper still.

### 14.4 Risk: No outliner hurts large worlds

Classification: **deferred product-scale question, not first-envelope blocker**.

Do not invent a Generic Entity tree for the current dialect. When spatial navigation demonstrably fails at target scales, investigate a navigator/search surface from evidence.

### 14.5 Risk: 1024 × 640 is not proven

Classification: **implementation/fidelity validation requirement**.

If browser implementation cannot preserve world dominance/readability at that size, return the result to product design rather than compressing into clutter.

### 14.6 Risk: React world-anchored chrome violates P05 hot-loop boundary

Guard:

- hot marks/selection/motion remain in Three;
- Context/Draft Pod changes on sparse semantic events;
- any required screen anchor movement may use an imperative DOM ref path rather than React state mirroring;
- RUN should not require a pod to chase every runtime body.

## 15. Open questions after P06.7A

### A — BLOCKER before P06.7B

None.

### B — SAFE IMPLEMENTATION / FIDELITY DETAIL

- exact CSS pixel sizes within the structural constraints;
- exact DOM anchoring implementation;
- exact keyboard bindings;
- internal file/storage backend preserving workspace contract;
- exact responsive thresholds above the minimum target.

### C — RESEARCH BOUNDARY

Unchanged:

- multi-bearing physics;
- multi-patch composition;
- generic CUT/free-runtime editing;
- arbitrary continuity/state transfer;
- representation-independent locality ontology.

### D — OWNER / VISUAL PRODUCT CHOICE for P06.7B/P06.8

- exact emotional/visual character;
- final user-facing terminology for BUILD/RUN/STOP where wording matters;
- final aesthetic balance between calm instrument and tactile/creative workshop.

### E — P06.7B MUST RESOLVE

- typography;
- palette;
- world/background/lighting character;
- tangible matter appearance;
- authored-meaning visual grammar;
- runtime-manifestation visual grammar distinct from authored source;
- selection/hover/draft hierarchy;
- INVALID / UNSUPPORTED / RUNTIME FAULT semantic styling;
- icon system;
- spacing / container treatment;
- motion/transitions including STOP ghost treatment;
- exact visual density of Workspace Dock / Intent Rail / Simulation Dock / Context Pod / Investigation Drawer.

## 16. Verdict

**P06.7A PASS — PRODUCT SURFACE ARCHITECTURE EARNED.**

Selected structural direction:

> **WORLD CANVAS + PERIPHERAL ISLANDS**

Core rule:

> **The world fills the application. Local actions appear close to the current matter/target. Global lifetime/workspace controls stay in small stable edge surfaces. Deep explanation gets one conditional drawer only when requested.**

This is a product-structure verdict, not final visual acceptance.

## 17. Next stage

**P06.7B / Visual Language** may now begin.

It must not change the earned surface structure merely to fit a fashionable visual concept.

P06.7B is the first stage where Owner taste and emotional character become a primary acceptance axis. It must translate ANVIL's project identity — precise, exploratory, tactile, alive, technically honest — into typography, palette, lighting, matter rendering, semantic overlays, chrome treatment and motion without regressing into decorative sci-fi, generic CAD, generic SaaS or the rejected P06 #1 dashboard language.

After 7B: `P06.8 / Complete Product Contract + adversarial red-team → PRODUCT DESIGN ACCEPTED → C6 / IMPLEMENTATION READY`.
