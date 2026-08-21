# P06.8 — ANVIL Studio Complete Product Contract

Status: **PASS — PRODUCT DESIGN ACCEPTED FOR IMPLEMENTATION PREPARATION**

Work type: integration / product design. This document is the final P06 first-envelope product contract. It combines the already-grounded C5A Product Behavior, C5B Product Interaction, P06.7A Product Surface Architecture and P06.7B Visual Language, adds the direct-manipulation/input contract discovered during the final adversarial review, and classifies the remaining unknowns before C6 / IMPLEMENTATION READY.

Grounding base: `main@ebd62b8e65baeeb3f72ffac15bc1c8d8f6ae54ba`.

This is **not** a new scientific claim, ANVIL-11, runtime/Foundation refactor, generic ontology or Owner Value proof.

---

## 1. Product constitution

ANVIL Studio is one long-lived, world-first interactive 3D laboratory for Physical Fabric.

North star:

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

Grounded loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

Shortest mental model:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

The world is the product. UI provides tools and reveals truth; it does not become a dashboard, owner-gate UI, experiment router, generic CAD/game editor or ontology browser.

---

## 2. Accepted lifetime / identity contract

These remain frozen:

- `authored != compiled != runtime != render`;
- `render entity != authored entity != runtime entity`;
- runtime is disposable;
- runtime motion is observation, not implicit authoring;
- BUILD edits what persists;
- RUN creates a fresh runtime realization;
- PAUSE preserves the same runtime session for STEP/TRACE, not arbitrary source editing;
- STOP disposes runtime, not authored construction;
- generic authored edits may rebuild/reset runtime unless continuity is separately qualified;
- runtime manifestations of authored meaning are related to, but not identical with, authored source marks;
- `cellId@face` remains a current laboratory dialect, not final Machine Matter ontology;
- `UNSUPPORTED != INVALID`.

Accepted CUT remains a specifically qualified topology intervention, not generic live editing.

---

## 3. Product truth states

Studio distinguishes:

### READY
Current authored composition can be realized under the selected qualified profile. READY is quiet; no permanent success banner.

### INVALID
Authored intent violates the current authored/semantic contract. The exact offending local target/meaning is shown spatially; repair/removal/Undo are available.

### UNSUPPORTED
Intent may be meaningful, but ANVIL has not qualified the requested composition. Authored intent survives. Execution is blocked only where needed. Presentation communicates frontier / not qualified yet, not user error.

### REQUIRES BUILD
A persistent edit was requested against a live realization. Studio offers an explicit lifetime transition such as Stop & Edit rather than pretending arbitrary continuity.

### RUNTIME FAULT
Source/composition passed validation, but runtime execution failed technically. Stepping stops, the last readable snapshot is preserved where possible, and Retry / Stop / Details are offered. Raw technical diagnostics remain behind Details.

---

## 4. Authored interaction grammar

Persistent authoring follows:

`TARGET → PREVIEW / DRAFT → COMMIT → RECOMPILE / RECLASSIFY → IMMEDIATE SPATIAL FEEDBACK`

Before COMMIT, cancellation never mutates authored truth.

Primary authored capabilities of the first implementation envelope:

- select authored matter / local face or interface;
- add one matter cell at a time from a valid exposed face;
- remove one matter cell at a time;
- assign an existing authored material;
- author one or more persistent Bearing marks even if joint execution later becomes UNSUPPORTED;
- author TorquePatch local active intent within the currently earned contract;
- authored Undo/Redo;
- Save/Open authored workspace.

Generic Move / Copy / Duplicate / Multi-select are deliberately outside this first envelope. Their future semantics must not be inferred from mature CAD by convenience.

---

## 5. P06.8A — Direct Manipulation & Input Contract

The final adversarial review found one previously under-specified product decision: exact direct-manipulation behavior. This is now part of the product contract rather than being delegated to implementation invention.

### 5.1 Default desktop input channels

- **LMB** — target / select / interact with the active authored or runtime handle;
- **MMB drag** — orbit camera;
- **Shift + MMB drag** — pan camera;
- **wheel** — zoom;
- **F** — focus current selection;
- explicit **Reframe / Return to construction** — user-invoked view command;
- **Esc** — cancel/revert the current transient draft/operation layer only;
- **Enter** — commit the current parameterized authored draft when one exists;
- **Ctrl+Z / Ctrl+Shift+Z** — authored Undo/Redo;
- **Ctrl+S** — Save authored workspace.

View commands are presentation-only and remain independent from authoring and physics.

LMB-drag on ordinary geometry does not secretly become Move, box selection or orbit in v0. Pointer-down on an active authored handle has priority over normal selection. MMB remains the dedicated view channel.

### 5.2 No-jump manipulation rule

For continuous controls:

> **Pointer-down captures the current draft value/state. Drag applies a relative delta from the grabbed state. Grabbing never jumps the value to an absolute pointer-derived value.**

This applies directly to TorquePatch effort editing and to future continuous handles unless a separately justified interaction contract says otherwise.

`Shift` provides fine adjustment. Exact pixel-to-value sensitivity is an implementation/fidelity parameter and must be tuned in the browser rather than promoted into physical semantics.

### 5.3 Add Matter

`Matter → Add`:

1. hover a valid exposed authored face;
2. show one ghost cell immediately outside that face;
3. LMB commits that one cell;
4. tool remains active for repeated additions;
5. Esc cancels only the current hover/draft.

No drag-paint semantics are claimed for v0.

### 5.4 Remove Matter

`Matter → Remove`:

1. hover identifies exactly the cell to be removed;
2. preview also reveals authored meanings that will become dangling/INVALID;
3. LMB commits removal;
4. local meanings are not silently cascade-deleted;
5. tool remains active for repeated removals.

No drag-delete semantics are claimed for v0.

### 5.5 Material

Selected authored matter → `Material`:

- choose only from materials already authored in the current workspace;
- hovering a candidate may preview appearance;
- LMB/explicit choice commits;
- Esc cancels preview;
- no material-definition/science editor is part of v0.

### 5.6 Bearing

Current experiment-local truth gives Bearing a local shared interface plus one free tangent axis.

Interaction:

1. `Meaning` intent narrows targeting to an eligible shared seam/interface;
2. the seam uniquely identifies the two opposite adjacent endpoints;
3. Studio shows only the two tangent axes permitted by the accepted contract;
4. hovering an axis previews the complete Bearing draft in the world;
5. selecting an axis updates the draft;
6. `Enter` / local Commit writes the persistent Bearing mark;
7. user never enters endpoint IDs or axis strings manually.

### 5.7 TorquePatch

Interaction:

1. `Meaning` targets an eligible Bearing endpoint face;
2. Studio shows local patch + directional arrow;
3. signed `effortNm` is edited either by the local relative drag handle or exact numeric value in Draft Pod;
4. drag is no-jump and changes draft only;
5. crossing zero visibly reverses sign/direction;
6. explicit Commit writes the TorquePatch;
7. no arbitrary scientific max-torque clamp is invented by the UI; only finite authored values are semantic truth.

### 5.8 Runtime activation

Accepted activation is transient `OFF | ON` only.

- runtime begins OFF;
- OFF exposes `Activate`;
- ON exposes `Deactivate`;
- activation does not dirty authored workspace;
- no throttle/hold/control ontology is inferred.

---

## 6. Attention and investigation contract

Governing hierarchy:

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

Spatial rule:

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

Information levels:

1. ambient world/work state/focus;
2. current target/selection/draft/local failure;
3. explicitly requested investigation truth;
4. engineering/debug truth normally hidden.

RUN makes Studio quieter. PAUSE makes investigation easier but does not automatically enable diagnostic clutter.

Instrumentation follows:

`BEHAVIOR QUESTION → TEMPORARY LENS/OVERLAY → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

---

## 7. Product surface contract

Selected architecture:

> **WORLD CANVAS + PERIPHERAL ISLANDS**

The Three.js world fills the application. Sparse React chrome overlays rather than permanently reducing the viewport.

First-envelope surfaces:

1. **World Canvas** — full-window world;
2. **Workspace Dock** — upper-left workspace identity, dirty state, New/Open/Save/Save As, authored Undo/Redo;
3. **Intent Rail** — left-edge high-level `Select / Matter / Meaning / Inspect`;
4. **Simulation Dock** — lower-center BUILD/RUN/PAUSE lifetime and current runtime actions;
5. **Context/Draft Pod** — local selection/target actions and draft Commit/Cancel;
6. **Investigation Drawer** — conditional right-edge Inspect/Trace/Details, closed by default.

Not earned as permanent first-envelope surfaces:

- full-height property inspector;
- hierarchy/outliner;
- timeline;
- dashboard/status wall;
- runtime entity browser;
- generic material-definition lab;
- environment editor;
- Generic Entity/Component inspector.

Reference desktop: `1440×900 CSS px`.

Minimum first-envelope product target: `1024×640 CSS px`, still requiring empirical browser validation.

Below that target Studio may render but first-envelope authoring is not qualified; do not solve this by dashboard-like responsive stacking.

---

## 8. First-run / starter contract

The product has no separate home/dashboard route.

A new, not-yet-created workspace shows the same World Canvas plus a small transient choice:

- **Empty**;
- **Editable Starter**.

### Empty

Starts in BUILD with no authored cells but with at least one usable authored material seed so Add Matter works immediately. The exact seed material values are app-level implementation data, not new material science.

### Editable Starter

Uses only already-qualified first-envelope semantics:

- small asymmetric Matter construction;
- exactly one valid Bearing;
- exactly one TorquePatch;
- active-bearing compatible profile;
- runtime starts OFF;
- ACTIVATE produces clearly observable motion;
- the entire workspace is ordinary authored data and can be edited or dismantled.

The current accepted ANVIL Bearing/TorquePatch fixture is valid donor data for this starter; product code must not treat the scientific fixture helper itself as permanent product architecture.

No onboarding carousel, marketing hero, locked tutorial route or special demo renderer.

---

## 9. Visual language contract

Selected direction:

> **QUIET PHYSICAL WORKSHOP**

Constitution:

> **Matter should feel touchable. Meaning should look deliberately authored onto places. Runtime should become alive only when physics is alive. Chrome should behave like a quiet precision instrument. Deeper truth should appear as temporary explanation, not permanent spectacle.**

Governing grammar:

- shape = capability/kind;
- stroke/material treatment = lifetime/representation;
- color reinforces but never solely carries meaning;
- motion is reserved for actual action/change/transition.

World / chrome:

- world roughly `#202327–#262A2E`;
- chrome `#1C1F23`;
- calm workshop/studio lighting;
- matte tangible matter using authored `displayColor`;
- no black-void/neon HUD, glassmorphism or holographic panels;
- IBM Plex Sans for normal UI, IBM Plex Mono only for numeric/technical reveal;
- spacing `4 / 8 / 12 / 16 / 24 px`, control height about `32–36 px`, moderate radius around `8 px`.

Semantic families:

- Bearing `#4BC7C1`, ring + axis;
- Torque `#F2A65A`, patch + directional arrow;
- INVALID `#E56A6A`, broken/hatched/slashed treatment;
- UNSUPPORTED `#B7A0D8`, dashed/open frontier treatment;
- REQUIRES BUILD `#D7BC68`, lifetime-transition cue;
- READY quiet;
- selection/focus uses two-tone high-contrast outline.

Authored marks remain stable/matte. Runtime manifestations share capability shape family but use distinct treatment and motion only if real runtime behavior is active.

STOP may show a brief fading final-runtime ghost but never reverse-physics animation.

---

## 10. Complete representative journeys

### 10.1 Build from empty

`Empty → Matter/Add → face hover ghost → click commit → repeat → Material → assign existing material`

No ID entry, inspector or compiler ceremony is required.

### 10.2 Author active local behavior

`Meaning → seam → choose tangent Bearing axis → Commit → eligible face → TorquePatch → relative effort edit / exact number → Commit`

The world carries the primary explanation.

### 10.3 First physical consequence

`RUN → fresh runtime OFF → Activate → visible physical behavior`

Motion is primary evidence; no telemetry wall appears.

### 10.4 Investigate

`PAUSE → select runtime manifestation → TRACE / Inspect → spatial source↔compiled↔runtime explanation → optional Drawer detail`

No separate Analysis/Provenance page.

### 10.5 Return and iterate

`STOP → runtime disposed → authored construction primary → modify → RUN again`

Camera remains stable unless the user invokes a view command. Runtime never animates physically back to source pose.

### 10.6 Invalid authoring

Local authored target/meaning communicates exact violation; source remains inspectable and repairable. No global modal-error workflow.

### 10.7 Unsupported frontier

A second individually valid Bearing may remain authored while joint execution is classified UNSUPPORTED / multi-bearing-not-qualified. Intent survives; user may edit or inspect the boundary.

### 10.8 Runtime fault

Valid/supported authored state enters RUN, execution fails technically, stepping stops, last readable state remains, Retry / Stop / Details become available.

### 10.9 Reopen / crash recovery

Save preserves authored workspace, not runtime. Reopen returns to BUILD, restores/revalidates source, and creates a new runtime only on the next RUN.

---

## 11. Adversarial review

The complete contract was attacked against the following regressions.

### W1 regression — technical gate UI instead of useful laboratory

PASS. Normal product work requires no AUTHORED/RUNTIME/BOTH gate dashboard, telemetry wall or scientific test receipt. Technical truth remains available through explicit investigation.

### Corrupted P06 regression — generated advanced-tool stereotypes

PASS. No invented Load/Constraint/Analysis/Stress/Material-science surfaces, no neon science-fiction board, no design-system poster masquerading as a product screen.

### Generic CAD drift

PASS for first envelope. The product has direct spatial authoring and limited earned surfaces, not a permanent inspector/hierarchy/timeline stack. Future mature-editor capabilities must be evidence-driven.

### Generic game-editor drift

PASS. Renderer entities do not become application truth, scene hierarchy is not authored ontology, and runtime state remains disposable.

### Source/runtime identity confusion

PASS. Lifetime changes are explicit; STOP is a representation handoff; selection is not silently transferred as one Generic Entity.

### Hidden-only interaction

PASS. Core actions are discoverable through Intent Rail + context surfaces; keyboard/command access is a speed channel, not the only path.

### Instrumentation clutter

PASS. Investigation is opt-in, temporary and scoped; RUN makes UI quieter.

### Manipulation-feel ambiguity

Initially FAIL. Resolved by P06.8A Direct Manipulation & Input Contract, including dedicated camera channel and no-jump relative continuous editing.

### React hot-loop regression

PASS. Hot world motion, picking overlays and runtime manifestations remain imperative Three/presentation work. React owns sparse semantic chrome/events, not frame state.

### Ontology overclaim

PASS. Current cubic cells, faces, Bearing/Torque shapes and starter data remain first-dialect/product-local expressions, not final Machine Matter ontology.

### Silent destructive convenience

PASS. Removing matter does not silently delete dependent local meaning. Unsupported intent is preserved. Save/Load does not silently repair source.

---

## 12. Remaining questions — final classification

### A — BLOCKER BEFORE IMPLEMENTATION PREPARATION

**None after P06.8A.**

### B — IMPLEMENTATION / FIDELITY DECISIONS

These must preserve the product contract but do not invent the product:

- internal compile scheduling/caching;
- exact STEP mechanism/timestep wiring;
- exact renderer hit-test implementation preserving semantic priority;
- storage backend / browser file mechanism preserving Save/Open semantics;
- workspace JSON field layout/version migration details;
- exact DOM anchoring method for Context/Draft Pod;
- Torque drag sensitivity and fine-adjustment gain;
- outline/ghost rendering technique;
- icon optical tuning;
- font bundling/fallback;
- shader/AA/AO implementation details;
- browser-specific focus handling.

### C — RESEARCH BOUNDARIES

Not part of first-envelope claims:

- multi-bearing runtime composition;
- multiple TorquePatch composition beyond accepted evidence;
- generic CUT / arbitrary free-runtime editing;
- arbitrary continuity/state transfer;
- representation-independent locality / final Machine Matter ontology.

### D — FUTURE PRODUCT PROBLEMS OUTSIDE FIRST ENVELOPE

Explicitly deferred, not forgotten:

- generic Move / Copy / Duplicate / Multi-select;
- large-world navigator/outliner if spatial navigation becomes insufficient;
- generalized material-definition authoring;
- richer simulation-environment/profile authoring;
- mobile/tablet/touch input;
- user-configurable input remapping.

### E — OWNER REALITY / FIDELITY JUDGEMENT

These cannot be proven by text design and intentionally remain for the running product:

- actual direct-manipulation feel;
- real visual/emotional acceptance of Quiet Physical Workshop;
- whether the first-loop invites further experimentation;
- actual `1024×640` density/readability;
- target/handle legibility at extreme view angles and zoom;
- arbitrary material-color clashes;
- whether UI is sufficiently quiet in RUN;
- whether TRACE explains instead of overwhelming.

These are not implementation blockers; they are mandatory Owner-facing reality gates.

---

## 13. Empirical obligations for implementation/fidelity

Implementation must produce evidence for:

- first useful world visible without dashboard ceremony;
- full first journey from Editable Starter and from Empty;
- exact cell/face/seam picking;
- Add/Remove/Material authoring with preview-before-commit;
- Bearing tangent-axis direct authoring;
- TorquePatch relative/no-jump manipulation + exact value entry;
- runtime OFF/ON activation;
- RUN/PAUSE/STEP/STOP/RESTART lifetime correctness;
- authored/runtime manifestation distinction;
- INVALID / UNSUPPORTED / REQUIRES BUILD / RUNTIME FAULT presentations;
- Save/reopen returns to BUILD and never resurrects runtime;
- `1024×640` first-envelope target;
- light/dark material selection contrast;
- difficult zoom/angle handles;
- keyboard focus;
- hot Three loop without React frame mirroring;
- owner-facing browser artifact/workflow that does not require Owner build/debug/tooling work.

---

## 14. Product Design acceptance boundary

This checkpoint means:

> **The first Studio product envelope is sufficiently defined that implementation should no longer decide fundamental product behavior, interaction architecture, surface structure, visual language or direct-manipulation semantics.**

It does **not** mean:

- the product has demonstrated Owner value;
- the visual design is empirically proven in-browser;
- every future editor feature has been designed;
- any new physics has been qualified;
- P04/P05 spike helpers become production architecture by inertia.

Owner Value must be earned by the running Studio.

---

## 15. Verdict

# **P06.8 PASS — PRODUCT DESIGN ACCEPTED FOR IMPLEMENTATION PREPARATION**

P06 is complete for the first Studio implementation envelope.

Next stage:

> **C6 / IMPLEMENTATION READY**

C6 must translate this frozen product contract into an implementation map, file/module boundaries, incremental vertical slices, browser/owner evidence gates and takeover instructions. It may refine engineering mechanisms, but must not reopen product behavior or visual structure without a demonstrated contradiction.

Only after C6 PASS should Studio product implementation begin.
