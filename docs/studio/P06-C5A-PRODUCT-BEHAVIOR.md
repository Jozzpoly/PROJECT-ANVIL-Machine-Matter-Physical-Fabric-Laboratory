# P06 / C5A — ANVIL Studio Product Behavior

Status: **C5A PASS — PRODUCT BEHAVIOR GROUNDED**

Work type: integration / product design. This document defines product behavior and user mental model only. It does not implement Studio, create ANVIL-11, freeze layout/visual design or promote new Foundation semantics.

Base truth at grounding: `main@d80a7e281ae7be73c3d39885360294f1a4dedbd9`.

## 1. Operational self-model

ANVIL is treated as a third project-governance actor alongside Owner and Orchestrator. This is an operational metaphor, not a claim of literal consciousness.

- **Owner** — supplies purpose, values, subjective product judgement and may consciously redefine the vision.
- **Orchestrator** — investigates, falsifies, synthesizes, plans, implements and maintains continuity between intention and evidence.
- **Project self-model** — the encoded identity of ANVIL: accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next unresolved question.

The project self-model is allowed to resist both Owner and Orchestrator only in the following practical sense: a proposed action that contradicts accepted evidence or frozen boundaries must be surfaced and consciously reclassified rather than silently executed.

The Owner may change the vision, but such a change must be explicit and the project state must then be re-grounded. The Orchestrator may challenge plans and sequencing, but may not silently rewrite accepted truth.

## 2. Product constitution

The shortest correct mental model is:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

Operational loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

### 2.1 What belongs to the user

The user's persistent construction is the authored world. Runtime motion is observation, not implicit editing.

`BUILD` means: modify what should persist.

`RUN` means: create a fresh physical realization of the current supported authored composition.

`STOP` means: dispose that realization and return to the persistent construction.

`PAUSE` means: keep the realization alive but stop time so it can be inspected and stepped. PAUSE is not a second authoring mode.

### 2.2 Local meaning

Local physical meaning must be experienced as meaning attached to a place on matter, not as adding a generic component to an entity.

Examples:

- BEARING: "this local interface may rotate about this axis";
- TORQUE-PATCH: "this local place carries this signed active intent".

The current `cellId@face` locator is an implementation dialect, not the user's ontology and not final Machine Matter semantics.

### 2.3 Composition

There is no required user gesture called COMPOSE. Composition is the authored combination that already exists after the user creates matter and local meanings.

Compilation/lowering should be silent while successful and explainable when it blocks, fails or becomes interesting.

### 2.4 Product truth states

Studio must distinguish at least:

- **READY** — current authored composition can be realized under the selected qualified environment/profile;
- **INVALID** — authored intent violates the current authored/semantic contract;
- **UNSUPPORTED** — local intent may be meaningful, but the requested composition has not been qualified by ANVIL;
- **REQUIRES BUILD** — the requested persistent edit cannot be performed while inspecting a live realization; return to BUILD rather than pretending arbitrary continuity exists;
- **RUNTIME FAULT** — source and composition passed product validation, but execution failed technically.

`UNSUPPORTED != INVALID` is a core Studio property. Unsupported authored intent should survive so the boundary can become a research question.

### 2.5 Progressive truth

The default order of understanding is:

1. What happened physically?
2. What did I author?
3. How was it interpreted?
4. What is the runtime doing?
5. How did this disposable representation arise from this persistent source?

The world should answer spatially before technical text explains it.

## 3. Interaction grammar

The authored interaction pattern is:

`TARGET → PREVIEW / DRAFT → COMMIT → RECOMPILE / RECLASSIFY → IMMEDIATE SPATIAL FEEDBACK`

Before COMMIT, cancellation must not mutate authored truth.

### SELECT MATTER

- selection is non-mutating;
- BUILD selection refers primarily to authored matter;
- RUN/PAUSE runtime selection remains runtime-session scoped;
- source/runtime counterparts may cross-highlight, but identity must not be silently collapsed.

### SELECT FACE / LOCAL REGION

- hover/preview identifies the exact local target before selection;
- selection is non-mutating;
- the selected place becomes the target for material/local-meaning actions;
- exact input priority when layers overlap is deferred to later P06 interaction design.

### ADD MATTER

- show a ghost/draft placement before commit;
- commit creates persistent authored matter and triggers reclassification/recompile;
- cancel removes only the draft;
- RUN/PAUSE persistent placement returns `REQUIRES BUILD`.

### REMOVE MATTER

- preview must show the matter that will disappear and any authored meanings whose current locator will become invalid;
- commit removes matter;
- do not silently cascade-delete local meanings merely for convenience;
- dangling meaning remains visible as authored intent in an INVALID state until repaired, explicitly removed or undone.

### CHANGE MATERIAL

- preview communicates the selected material change without inventing unsupported material science;
- commit changes persistent authored material assignment and recompiles the interpretation;
- active runtime requires BUILD for persistent material editing.

### ADD BEARING

- user targets a local interface/seam and an allowed free axis;
- preview shows seam/interface and axis spatially;
- commit stores persistent `BearingMark` and validates current semantics;
- user does not manually enter source IDs;
- a locally meaningful interface blocked by an alternate rigid path should be product-classified as unsupported current topology where appropriate, rather than blaming the user with a generic error.

### ADD TORQUE-PATCH

- user targets a local eligible face;
- preview shows place, sign/direction and intended magnitude spatially;
- commit stores persistent TorquePatch intent;
- ambiguous/non-resolving target under the accepted contract is INVALID;
- additional individually meaningful actions may survive in source while their joint execution remains UNSUPPORTED if not yet qualified.

### RUN

- requires current source validity, supported composition and a compatible qualified simulation profile;
- creates a fresh disposable runtime session;
- does not mutate authored truth;
- preserves camera/world registration;
- active-bearing realization starts from its qualified initial transient state (currently OFF);
- execution failure after successful validation is RUNTIME FAULT.

### ACTIVATE

- runtime-only transient action;
- does not change authored source or compilation identity;
- feedback should be primarily local and physical;
- absence of a qualified active action is not an authored-source error.

### PAUSE

- stops stepping while keeping the same runtime session alive;
- enables inspection, trace and STEP;
- persistent structural commit requires BUILD.

### STEP

- advances the paused realization by one controlled increment;
- never enters authored undo history;
- exact step duration/control is a safe implementation/design detail unless later evidence makes it product-critical.

### STOP

- disposes the runtime session;
- preserves authored source, authored selection where still valid, camera and workspace context;
- invalidates runtime selections;
- does not mean revert document/source.

### RESTART

- disposes the current runtime and creates a fresh realization from the same current authored truth/profile;
- transient runtime state returns to the qualified initial state;
- RESTART is distinct from STOP and from reverting authored edits.

### TRACE / INSPECT

- presentation/instrumentation only; no source or physics mutation;
- authored selection may reveal current compiled/runtime descendants;
- runtime selection may reveal source provenance;
- recompilation must not preserve disposable identity merely because an ID string happens to match;
- provenance may show continuation/split/merge/repartition rather than pretending one runtime object survived.

## 4. Qualified topology intervention

Accepted CUT evidence does not imply a generic CUT editor tool.

A qualified intervention may, for a specifically supported scenario:

`live realization → explicit qualified operation → authored topology replacement → dispose old runtime → qualified state transfer → recompile/rebind/relower → fresh runtime → trace old → new`

Do not infer arbitrary cut location/timing, persistent CutMark, generic live editing or arbitrary state continuity.

## 5. Undo boundary

Authored commits are expected to become undoable product actions: add/remove matter, material changes, add/remove authored local meanings.

Runtime evolution is not authored history: RUN, runtime motion, ACTIVATE, PAUSE, STEP and runtime selection do not belong to the authored undo stack.

The implementation mechanism for undo is intentionally not designed by C5A.

## 6. First real user journey

The first meaningful Studio loop should be possible without diagnostics:

1. BUILD — inspect and change a persistent construction;
2. choose a local interface;
3. author BEARING meaning;
4. choose an eligible local face;
5. author TORQUE-PATCH meaning;
6. RUN — fresh physical realization appears in the same world/camera context;
7. ACTIVATE — physical behavior becomes the first evidence;
8. PAUSE;
9. TRACE — progressively reveal why the observed motion came from the authored meaning;
10. STOP — discard runtime, return to the construction;
11. MODIFY;
12. RUN AGAIN.

A second independent bearing is a required pressure example for product behavior: preserve the authored intent, classify the joint composition as `UNSUPPORTED / MULTI-BEARING_NOT_QUALIFIED`, block execution honestly and keep the world editable. This is not a claim of multi-bearing physics.

## 7. Red-team result

C5A passed the following checks:

- no layout/panel/tool-placement was frozen;
- no new physics or ontology was invented;
- current renderer/runtime identities remain disposable and scoped;
- source and runtime are not collapsed;
- the first envelope provides real bounded agency rather than a frozen demo route;
- INVALID and UNSUPPORTED support exploration rather than hiding limitations;
- product behavior can generate future UI instead of being shaped around preselected UI components.

## 8. Open-question classification

### A — BLOCKER before the next P06 stage

None identified at C5A.

### B — SAFE IMPLEMENTATION DETAIL

- exact internal compile scheduling/caching;
- exact STEP timestep implementation;
- internal IDs not shown as product identity.

### C — RESEARCH BOUNDARY

- multi-bearing physics/runtime composition;
- multiple TorquePatch composition beyond accepted evidence;
- generic CUT/free-runtime editing;
- arbitrary continuity/state transfer;
- representation-independent locality ontology.

### D — OWNER CHOICE

No owner-choice currently blocks progress.

### E — DEFERRED DESIGN QUESTION

These are not implementation details and must be resolved before final Product Design acceptance, but they do not block C5A:

- move/copy/duplicate/multi-select behavior;
- blank world vs editable starter construction/onboarding;
- exact material-selection/library workflow;
- exact simulation-profile interaction;
- selection priority when authored/compiled/runtime geometry overlaps;
- final user-facing naming of BUILD/RUN/STOP concepts;
- STOP transition choreography from moved runtime pose to persistent authored construction.

Every deferred design question must have a later P06 owner; `we will see later` is not an accepted category.

## 9. C5A verdict

**C5A PASS — PRODUCT BEHAVIOR GROUNDED.**

The next unresolved product question is **P06.3 / Attention Architecture**:

> Given the now-grounded product behavior, what information and controls must be continuously visible, contextually available, temporarily revealed or normally absent so the world remains the primary surface without hiding necessary truth?

P06.3 must not yet freeze exact screen positions or visual styling. P06.4 will address spatial interaction architecture only after the attention hierarchy is earned.

## 10. P06 method after the interrupted first attempt

The ImageGen/visual-concept-first method from P06 attempt #1 is superseded for product discovery.

Until behavior and interaction architecture are frozen:

- no ImageGen/mockup-led product discovery;
- no Build Web Apps-led concept generation;
- no Studio implementation;
- no product code;
- no layout or design-system freeze before behavioral/attention/spatial interaction checkpoints pass.

Build Web Apps may return after Product Design acceptance as an implementation/fidelity discipline using the accepted specification, not as the authority that invents ANVIL Studio's product model.
