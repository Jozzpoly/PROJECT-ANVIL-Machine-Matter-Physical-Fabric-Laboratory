# C6 — ANVIL Studio Implementation Ready

Status: **PASS — IMPLEMENTATION READY**

Work type: integration / implementation preparation. This checkpoint translates the accepted P06 Product Design into a bounded implementation map. It does not implement Studio, create ANVIL-11, refactor accepted physics/Foundation semantics or grant any new scientific or Owner Value claim.

Grounding base: `main@0a50c307dadea04009322b2cdfd71a20f5abb593`.

Product authority: `docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md` plus its canonical predecessors. C6 may choose engineering mechanisms only where the Product Contract left them open. It may not silently redesign the product to fit libraries/templates.

---

## 1. Why C6 exists

P06 earned a first-envelope product contract. C6 answers the final pre-code question:

> **How do we implement that product in this real repository, through the smallest useful verticals, while preserving accepted scientific/runtime boundaries and giving the Owner early direct reality feedback rather than another technically green but lifeless integration?**

The implementation goal is not to build a generic editor platform. The first implementation must produce this concrete loop:

`BUILD MATTER → GIVE ONE LOCAL BEARING + TORQUEPATCH → RUN FRESH REALIZATION → ACTIVATE → OBSERVE → STOP → MODIFY → RUN AGAIN`

Then, after early Owner acceptance, deepen it into Inspect/Trace/failure/recovery/fidelity.

---

## 2. Live repository facts that constrain implementation

At C6 grounding:

- production `package.json` contains Box3D only; React/Three were proven in P05 with temporary `--no-save` installation and are not yet production dependencies;
- current TypeScript config is strict and includes `src/**/*.ts` only; Studio requires a deliberate TSX transaction;
- `src/bootstrap.ts` routes historical laboratories through `?experiment=...` and the default root remains the ANVIL-00 evidence viewer;
- `src/main.ts` is historical evidence UI, not a Studio skeleton;
- historical CSS is partly imported globally from `bootstrap.ts`, which would leak into a new Studio route unless corrected;
- existing CI already supplies the correct Draft/core and Ready/candidate speeds;
- current owner artifact manifest supports an explicit entry path;
- existing Playwright browser regression covers historical laboratory routes;
- P05 proves the Three-owned hot loop / sparse React callback boundary but its test inspector, default OrbitControls bindings and TransformControls proxy are donor evidence only.

Therefore:

- do not gradually mutate `src/main.ts` into Studio;
- do not replace historical experiment routes during first integration;
- do not copy the P05 shell UI or camera/input mappings;
- do not build a new CI/artifact pipeline;
- do add one independent Studio application vertical and use existing delivery infrastructure.

---

## 3. First production technology transaction

The first implementation PR must pin the exact runtime versions qualified by P05:

- `three@0.185.1`;
- `react@19.2.8`;
- `react-dom@19.2.8`.

Compatible React type packages become dev dependencies and are locked by the same package-lock transaction.

TypeScript must add React JSX support and include Studio TSX without weakening existing strict settings.

Explicit non-selections remain:

- no `react-three-fiber` without a demonstrated need;
- no generic state manager without a demonstrated need;
- no component/UI framework merely to generate chrome;
- no WebGPU launch dependency;
- no Generic FabricRuntime / Generic Entity / capability registry.

IBM Plex font delivery and exact icon assets remain later fidelity implementation details. The first physical-loop integration may use a metric/readability-compatible fallback while preserving P06.7B layout/tone, then lock actual font delivery during I2 fidelity if technically appropriate.

---

## 4. Application entry and CSS isolation

Studio enters through a product-specific query:

`/?studio=1`

It must **not** be represented as `?experiment=studio`.

Implementation order:

1. parse Studio intent before historical experiment routing;
2. dynamic import the Studio entry only for `studio=1`;
3. route-scope historical CSS so it is loaded with its historical route/module rather than globally bleeding into Studio;
4. import Studio CSS from the Studio entry only;
5. keep historical default/root behavior unchanged until Owner Value evidence explicitly authorizes a root switch.

The route/CSS cleanup is maintenance/integration hygiene only. Every existing browser regression must remain green.

For Owner candidates on Studio implementation branches, update `anvil-artifact.config.json` to:

`entryPath = "/?studio=1"`

so the packaged owner artifact opens directly in Studio. This does not require changing default root behavior.

---

## 5. Implementation ownership map

The first Studio is an **app-owned integration vertical** under `src/studio/`. Exact file count may be reduced if simpler, but ownership must remain clear.

Expected ownership groups:

### Entry / React shell

`src/studio/index.tsx`

- mount/unmount Studio;
- own no physics or authored semantics.

`src/studio/ui/*`

- sparse React chrome from P06.7A;
- React receives semantic state/events, never per-frame body transforms.

### Authored workspace

`src/studio/workspace.ts` or equivalent

Owns:

- current persistent Studio source;
- app-level source generation;
- authored command transactions;
- dirty state;
- Undo/Redo;
- transient editor drafts separate from committed source.

### Compilation / product classification

`src/studio/compile.ts` or equivalent

Only Studio owner of orchestration across accepted compiler/experiment APIs:

- `compileMatter`;
- `compileBearing`;
- `relowerTorquePatchToBearing` / ANVIL-10 current-binding guard;
- product issue classification;
- first-envelope READY/INVALID/UNSUPPORTED decisions.

It must not create a generic compiler architecture.

### Runtime session

`src/studio/runtime.ts` or equivalent

Owns:

- fresh runtime session ID;
- accepted active-bearing `ActivatePhysics` instance;
- OFF/ON activation;
- step/pause/resume/dispose;
- runtime snapshots;
- current runtime failure boundary.

The application Work State owns BUILD/RUNNING/PAUSED; runtime adapter owns the disposable physics session, not product navigation.

### Persistence

`src/studio/storage.ts` or equivalent

Owns:

- versioned Studio workspace serialization;
- Save/Open/Save As mechanism;
- source-only persistence;
- migration/fail-closed parse boundary.

Never serialize Box3D bodies/joints, runtime transforms, runtime session IDs or compiled IDs as canonical authored truth.

### Presentation projection

`src/studio/presentation.ts` or equivalent

Produces plain, solver-neutral presentation data from source/compilation/runtime observations. No Box3D handles/types cross this boundary.

### Three controller

`src/studio/three/StudioViewport.ts` or equivalent

Owns:

- renderer/scene/camera;
- requestAnimationFrame;
- viewport resize;
- exact picking;
- authored matter geometry;
- world-attached meaning/selection/draft overlays;
- runtime transforms;
- transient STOP ghost;
- hot presentation-only animations;
- direct input routing that must obey P06.8A.

It communicates to application/React only through sparse semantic events and imperative commands.

---

## 6. Persistent Studio source and identity scopes

### 6.1 Serializable authored source

Initial app-owned source shape:

```ts
interface StudioSourceV0 {
  readonly schema: "anvil-studio-source/0";
  readonly matter: MatterDocument;
  readonly bearings: readonly BearingMark[];
  readonly torquePatches: readonly TorquePatch[];
}
```

Arrays are deliberate even though runtime composition is initially narrower: a second locally valid Bearing or TorquePatch must be able to remain authored and become UNSUPPORTED instead of being structurally impossible or silently deleted.

This source shape is app-local and provisional. It is not Foundation and not final Machine Matter ontology.

### 6.2 In-memory source generation

`MatterDocument.revision` is insufficient to identify the complete Studio source because a TorquePatch-only authored edit can leave Matter revision unchanged.

Therefore Studio owns a monotonic **session-scoped `sourceGeneration`** that increments on every authored commit, including:

- Add/Remove Matter;
- material assignment;
- Bearing add/remove/edit;
- TorquePatch add/remove/edit;
- authored Undo/Redo.

A newly opened workspace starts a fresh generation scope. Generation is not a persistent ontology ID.

### 6.3 Compiled references

Compiled selection/reference must contain source-generation scope. A reference from generation N is stale after an authored command creates generation N+1 unless explicitly re-resolved from persistent source identity/provenance.

### 6.4 Runtime references

Every RUN creates a fresh **runtime session ID**. Runtime references contain session scope in addition to relevant plan/source references.

Reusing the same `planBodyId` in a fresh runtime must never make old runtime selection valid.

### 6.5 Render references

Three object/instance IDs are presentation details only. They may map to semantic source/compiled/runtime refs but must never become persistent identity.

---

## 7. Authored commands and draft boundary

First-envelope authored commands:

- Add one Matter cell;
- Remove one Matter cell;
- assign existing material;
- Add/Remove/Edit Bearing;
- Add/Remove/Edit TorquePatch.

Exact command-history implementation is not frozen; snapshots or inverse commands are acceptable if they preserve these invariants:

1. draft/preview never mutates committed source;
2. Commit performs one authored transaction and increments source generation exactly once;
3. Cancel restores the state from before the transient draft;
4. authored Undo/Redo affects source/history, not runtime evolution;
5. persistent command against live runtime requires BUILD / explicit Stop & Edit;
6. Remove Matter never silently cascade-deletes dependent local meanings; they survive as INVALID/dangling intent until explicitly repaired/removed/undone.

Persistent source IDs must be app-owned, opaque and independent of runtime/renderer IDs. A deterministic/injectable ID source for tests is allowed.

---

## 8. Classification axes and first-envelope execution readiness

Do not force every ordinary BUILD state into a success/error badge.

Internal classifier keeps three orthogonal axes:

```text
authoredValidity: VALID | INVALID
compositionSupport: SUPPORTED | UNSUPPORTED
runReadiness: READY | INCOMPLETE
```

These are application facts, not three permanent UI indicators.

Examples:

- Matter only → `VALID / SUPPORTED / INCOMPLETE`;
- exactly one valid Bearing and no TorquePatch → `VALID / SUPPORTED / INCOMPLETE`;
- exactly one valid Bearing + exactly one valid TorquePatch → candidate `VALID / SUPPORTED / READY`;
- two individually valid Bearings → `VALID / UNSUPPORTED / INCOMPLETE` with `MULTI_BEARING_NOT_QUALIFIED`;
- multiple individually valid TorquePatches within the one-bearing composition → `VALID / UNSUPPORTED / INCOMPLETE` with `MULTI_TORQUE_PATCH_NOT_QUALIFIED`;
- dangling or malformed local meaning → `INVALID / ... / INCOMPLETE`.

User-facing semantics remain those from P06: READY is quiet; INVALID is authored error; UNSUPPORTED is frontier/not-qualified-yet. Lack of READY during ordinary construction is not an error.

---

## 9. Compilation/classification algorithm

The first envelope must remain explicit rather than generic.

For each authored generation:

1. compile Matter;
2. compile/validate each Bearing mark in isolation against current Matter;
3. classify known local Bearing failures:
   - malformed/missing/non-adjacent/illegal-axis semantics → INVALID;
   - locally meaningful seam that cannot split current rigid connectivity because an alternate rigid path bypasses it → current-topology UNSUPPORTED, not user blame;
4. validate/relower each TorquePatch against its current Bearing relation using ANVIL-10 behavior;
5. a patch not resolving uniquely to a current Bearing endpoint → INVALID;
6. if multiple independently valid Bearings remain → preserve them and classify joint composition UNSUPPORTED;
7. if multiple independently valid TorquePatches remain in the currently one-bearing composition → preserve them and classify joint action composition UNSUPPORTED;
8. only one valid Bearing + one valid TorquePatch + compatible first runtime profile yields RUN `READY`.

Accepted experiment code currently reports errors largely through exceptions/messages. Do not refactor accepted scientific code into a new error ontology merely for Studio. The Studio adapter maps known accepted conditions into app-local issue codes and tests the mapping fail-closed. Unknown exceptions remain internal integration faults and are never quietly mislabeled as user INVALID.

---

## 10. First runtime envelope

The first Owner-facing executable Studio path is deliberately the same active-bearing family already prepared by P04/P05:

`Matter + exactly one Bearing + exactly one TorquePatch → compileBearing → relowerTorquePatchToBearing → ActivatePhysics`

Runtime creation rules:

- RUN is only enabled when `runReadiness = READY`;
- every RUN creates a fresh session;
- runtime starts activation OFF;
- Activate/Deactivate changes transient OFF/ON only;
- runtime stepping and snapshots remain inside the runtime/Three hot path;
- PAUSE retains the same session;
- STEP advances the paused session;
- STOP disposes the runtime and invalidates runtime refs;
- RESTART disposes and creates another fresh session from unchanged current source/compilation;
- generic persistent edits during RUN/PAUSE are blocked as REQUIRES BUILD;
- source/camera/workspace remain stable across the lifetime handoff;
- runtime pose is never written back to authored source by default.

Matter-only and passive-Bearing authored states remain legitimate BUILD states but are not broadened into separate Studio runtime/profile products merely because historical ANVIL-00/02 viewers exist. That broader product question can be revisited later if user value demands it.

No GenericRuntime is required or earned.

---

## 11. Direct input implementation constraint

P05 donor code used standard `OrbitControls`; its default bindings are **not** the accepted product input contract and must not be copied unchanged.

The Studio viewport/input adapter must enforce:

- LMB — target/select/direct interaction;
- MMB drag — orbit;
- Shift+MMB drag — pan;
- wheel — zoom;
- F — focus;
- Esc — cancel current transient draft;
- Enter — commit parameterized draft;
- Ctrl+Z / Ctrl+Shift+Z — authored history;
- Ctrl+S — Save.

If adapting OrbitControls cannot preserve this cleanly, use a thin explicit input wrapper or custom camera mapping rather than changing the product to fit library defaults.

Continuous authoring controls obey **relative/no-jump** semantics. Torque effort drag captures the current draft effort at pointer-down and applies a delta; merely grabbing the control must not change value. Shift provides fine adjustment. Exact sensitivity is a browser-fidelity parameter, not authored physics semantics.

Do not use generic TransformControls for Torque merely because P05 used TransformControls to prove draft isolation. Torque is its own spatial interaction.

---

## 12. Three / presentation strategy

P05 provides donor evidence for:

- InstancedMesh viability;
- Raycaster exact instance + face picking;
- semantic world overlays;
- runtime snapshots driving visible transforms;
- imperative renderer loop outside React.

Do not copy its test scene styling or inspector.

Initial rendering guidance:

- authored Matter rendered from current cells/materials;
- presentation maps instance/cell indexes explicitly to persistent cell IDs;
- current `cellToBody` mapping allows runtime cell geometry to follow current body snapshots without presenting disposable body meshes as authored truth;
- Bearing authored marks use source seam/axis geometry;
- runtime Bearing/Torque manifestations use related but distinct presentation treatment and current runtime transforms;
- selection/focus is semantic, with two-tone contrast treatment independent of material color;
- Context/Draft Pod receives sparse semantic anchors; it must not require React rerendering every runtime frame;
- moving runtime selection is primarily represented in Three/world space; DOM surfaces may use imperative positioning or stable edge placement only when needed;
- STOP ghost is presentation-only and short-lived.

Do not optimize by introducing representation-specific authored semantics. Rebuild simple presentation objects when authored generation changes until evidence demands deeper optimization.

---

## 13. React boundary

React owns sparse editor/application chrome only:

- work state;
- active high-level intent/tool;
- current semantic selection/focus;
- current authored draft parameters;
- product classification/issues;
- workspace dirty/history availability;
- conditional surfaces/drawer.

React must **not** own:

- 60 Hz body transforms;
- per-frame world-space overlay transforms;
- Box3D handles;
- Three scene objects;
- renderer-frame counters as product UI.

A production regression test must carry the P05 boundary forward: when runtime frames advance with no semantic event, React render count must remain unchanged.

Test-only invisible instrumentation is allowed to prove this. It is never product telemetry.

---

## 14. Workspace persistence

C6 freezes the semantic contract, not one browser API.

Initial persisted envelope:

```text
versioned StudioSourceV0
+ minimal app metadata necessary to reopen the workspace
```

Never persist runtime physics.

Acceptable implementation strategy:

- explicit Open;
- explicit Save / Save As;
- use Chromium File System Access where practical, with a download/upload fallback if required;
- Save while RUN may serialize current authored source, not transient runtime;
- reopen/load starts in BUILD and reclassifies/recompiles source;
- current runtime session is never resurrected;
- parsing/migration fails closed and never silently deletes INVALID/UNSUPPORTED intent.

Crash/autosave recovery hardening belongs to I2; simple correct explicit Save/Open belongs to I1.

---

## 15. First-run data

Same World Canvas; transient choice only:

- Empty;
- Editable Starter.

### Empty

- no cells;
- at least one usable authored material seed;
- immediate Matter/Add path;
- no separate homepage.

### Editable Starter

Use accepted active-bearing donor data, translated into ordinary StudioSource:

- small asymmetric Matter;
- exactly one valid Bearing;
- exactly one valid TorquePatch;
- compatible active-bearing runtime path;
- runtime begins OFF;
- Activate produces obvious visible motion;
- source is fully editable/dismantlable.

Do not import fixture-helper architecture into Studio. Harvest data/accepted semantics only.

---

## 16. Implementation lifecycle — I1 / FIRST PHYSICAL LOOP

Create one explicit integration branch/PR from the exact C6 main checkpoint:

`integration/studio-v0-i1-first-loop`

Open it **Draft** early.

The PR contains four coherent micro-checkpoints. Do not merge partial framework layers into main solely because they compile.

### I1.0 — Studio substrate

Deliver:

- production React/ReactDOM/Three dependency transaction;
- TSX support preserving strict TypeScript;
- `/?studio=1` route;
- historical CSS route isolation;
- minimal Studio entry;
- full-window World Canvas;
- sparse peripheral React mount;
- Three controller + accepted camera/input mapping;
- no product physics/source behavior invented yet.

Validation:

- complete existing Node/Box3D suite;
- production build;
- all historical browser routes during targeted/local browser validation;
- Studio route smoke/no console error;
- canvas fills intended viewport;
- LMB/MMB/Shift+MMB channels do not collide;
- no historical CSS bleed.

Do not mark Ready yet.

### I1.1 — Authored Matter Workshop

Deliver:

- StudioSource + generation scope;
- Empty + Editable Starter source loading;
- tangible authored Matter;
- exact cell/face picking;
- selection/focus;
- Matter Add/Remove preview→commit;
- Material assignment from existing source materials;
- authored Undo/Redo + dirty state;
- basic explicit Save/Open roundtrip;
- Workspace Dock / Intent Rail / Context Pod only as earned by current actions.

Validation:

Node/application:

- drafts do not mutate source;
- Commit increments source generation once;
- Undo/Redo restore source coherently;
- Remove preserves dependent meanings rather than silently deleting them;
- serialization roundtrip preserves source exactly.

Browser:

- exact cell+face picking;
- Add ghost precedes source change;
- Remove preview identifies dependencies;
- Esc cancels draft;
- camera survives authored changes;
- no permanent inspector/dashboard appears.

Do not mark Ready yet.

### I1.2 — Local Meaning + classifier

Deliver:

- Bearing seam targeting;
- exactly legal tangent-axis choices;
- Bearing preview/Commit;
- TorquePatch eligible face targeting;
- local patch/arrow;
- relative/no-jump effort editing;
- exact numeric fallback;
- product classifier / issue mapping;
- VALID/SUPPORTED/READY orthogonal behavior;
- INVALID local meaning;
- UNSUPPORTED multiple Bearing/TorquePatch preservation;
- no raw compiler message as primary UI.

Validation:

- bearing endpoint/axis semantics against accepted compiler;
- alternate rigid bypass classified as topology unsupported where product contract requires;
- TorquePatch relowers through ANVIL-10 against current Bearing;
- Torque-only authored commit increments Studio generation even if Matter revision is unchanged;
- second valid Bearing survives in source and disables READY rather than being removed;
- grab of an existing Torque effort does not change it until pointer delta occurs;
- Shift fine adjustment operates only on draft;
- Commit/Cancellation boundary exact.

### Meso audit after I1.2

Before runtime integration answer:

- Are source/compiler/UI boundaries still thin and app-local?
- Did any generic ontology/runtime abstraction appear merely for convenience?
- Does direct authoring feel spatial, or are we drifting into forms?
- Is React still sparse?
- Are existing scientific APIs being changed to accommodate Studio?
- Is the next runtime step still the highest-value uncertainty?

Verdict must be continue/harden/stop/split/pivot with one exact next action.

### I1.3 — First Physical Realization

Deliver:

- fresh runtime session identity;
- READY active-bearing path using existing ActivatePhysics;
- RUN / ACTIVATE / DEACTIVATE;
- PAUSE / STEP;
- STOP / RESTART;
- runtime body motion drives Three directly;
- authored/runtime manifestations visually distinct;
- runtime selection/session invalidation;
- source/camera persistence;
- brief STOP ghost, no reverse physics;
- REQUIRES BUILD for persistent edit against live runtime;
- artifact config direct to `/?studio=1`.

Validation:

- fresh runtime starts OFF;
- OFF remains inert within accepted expectation;
- Activate causes visible causal motion;
- Deactivate removes active torque application;
- pause retains same session;
- STEP moves same paused session one controlled step;
- STOP disposes runtime and never mutates source;
- RESTART receives new session identity even if planBodyIds repeat;
- no runtime frames cause React rerenders without semantic events;
- no Box3D handles cross presentation/application boundary;
- STOP never animates runtime physically back to authored pose.

After this checkpoint, and only after Draft/core remains clean, mark PR Ready for the existing candidate pipeline.

---

## 17. O1 — FIRST LOOP REALITY GATE

The Ready/candidate artifact must open directly in Studio and require no Owner terminal/build/debug work.

Owner task is product use only:

`Starter → modify matter → author/edit local meaning → RUN → ACTIVATE → adjust/observe → STOP → modify → RUN again`

Questions for Owner evidence:

- Is selection/targeting immediately understandable?
- Does Add/Remove feel spatial rather than form-driven?
- Can Bearing be authored without thinking about IDs/solver objects?
- Does Torque manipulation remain stable and no-jump?
- Does RUN make the world/physics dominate?
- Is ACTIVATE causality obvious?
- Does STOP read as ending a disposable realization, not rewind/teleport?
- Is chrome sufficiently quiet?
- Does the tool create a spontaneous desire to try another construction/change?

### O1 disposition

**Positive first-loop signal:**
- freeze exact tested head;
- verify artifact/source provenance;
- merge exact owner-tested I1 head;
- ground checkpoint;
- start I2 from new main.

**Negative/inconclusive product signal:**
- do not merge the product direction merely because CI passed;
- preserve branch/PR as integration evidence/donor;
- classify failure at the lowest implicated product contract/input/surface/runtime boundary;
- correct there before continuing depth work.

This repeats the W1 lesson deliberately.

---

## 18. Implementation lifecycle — I2 / LABORATORY DEPTH

Only after O1 gives a sufficiently positive first-loop signal.

New integration branch/PR from accepted I1 main:

`integration/studio-v0-i2-laboratory-depth`

Open Draft.

### I2.0 — Investigation / TRACE

Deliver:

- source↔compiled↔runtime cross-highlighting;
- runtime manifestation selection;
- Bearing pivot/axis manifestation;
- basic trajectory/ghost where it answers a selected question;
- Investigation Drawer only on explicit Inspect/Trace/Details;
- generation/session-scoped refs respected.

### I2.1 — Failure / recovery depth

Deliver:

- polished INVALID local recovery;
- UNSUPPORTED frontier explanation;
- REQUIRES BUILD + explicit Stop & Edit;
- RUNTIME FAULT stop/Retry/Stop/Details boundary;
- no raw logs as first-level product response.

### I2.2 — Workspace/recovery hardening

Deliver:

- robust reopen→BUILD behavior;
- file-version validation/migration boundary;
- save during RUN writes authored source only;
- optional crash/autorecovery only if it can be added without altering canonical Save semantics.

### I2.3 — Fidelity / adversarial hardening

Mandatory empirical gates:

- reference `1440×900`;
- minimum target `1024×640`;
- very light and very dark authored material colors;
- difficult zoom/view angles;
- minimum screen-space handles;
- keyboard focus/contrast;
- Intent/Simulation/Context/Drawer density;
- UI quietness during RUN;
- STOP ghost clarity;
- no React hot-loop regression;
- first-run Empty and Editable Starter complete flows.

Then perform a meso/macro product audit before Ready.

Mark Ready only when the complete first-envelope laboratory deserves final Owner evaluation.

---

## 19. O2 — STUDIO VALUE / REALITY GATE

The final first-envelope candidate must let the Owner use Studio as a small real laboratory, not inspect implementation evidence.

Primary Owner questions:

- Does ANVIL feel like one continuous physical workshop?
- Is matter/local meaning/runtime distinction understandable through use?
- Does direct manipulation feel precise and stable?
- Does TRACE answer curiosity rather than create diagnostic clutter?
- Are INVALID and UNSUPPORTED meaningfully different?
- Does Save/reopen preserve the construction without pretending to preserve runtime?
- Is the visual language recognizably ANVIL rather than generic dark CAD/science-fiction UI?
- Most importantly: does the tool produce a real **value/creative pull** to keep constructing, changing and discovering?

A technical PASS alone cannot answer this.

---

## 20. Test/evidence inventory

### Node/application tests

Add tests covering:

- source command/draft/commit immutability;
- sourceGeneration scope;
- Undo/Redo;
- classifier axes and issue codes;
- multiple valid Bearings/TorquePatches preserved as UNSUPPORTED;
- ANVIL-10 relowering/current-binding;
- compiled ref invalidation across generations;
- runtime ref invalidation across sessions;
- save/load exact source roundtrip;
- no runtime material serialized.

### Chromium tests

Add Studio tests under existing `tests/browser/` covering:

- Studio route and no CSS bleed;
- world dominance and responsive constraints;
- exact picking;
- mouse input contract;
- Add/Remove/Material draft behavior;
- Bearing axis authoring;
- Torque relative/no-jump editing;
- INVALID/UNSUPPORTED;
- RUN/activation/state choreography;
- STOP/RESTART identity/lifetime;
- Save/reopen;
- TRACE/Drawer when I2 lands;
- `1440×900` and `1024×640`;
- selection contrast and difficult-view legibility.

### Boundary tests

Carry P04/P05 findings into production regressions:

- Studio source generation changes independently of Matter revision where needed;
- planBodyId does not equal runtime identity;
- presentation model exposes no Box3D handles;
- renderer/Three entities never become authored IDs;
- React render count does not rise merely because runtime frame count rises.

### Visual evidence

Do not invent a dashboard. Programmatic layout/contrast checks + browser screenshots/artifact observation are evidence for fidelity. Owner artifact use is the product evidence.

---

## 21. CI / PR strategy

Use existing repository lifecycle.

### Draft

For active implementation:

- exact branch/head locked before writes;
- canonical Node/npm;
- strict TypeScript;
- complete Node/Box3D regression;
- production build;
- local/targeted browser checks when needed for interaction work.

Do not repeatedly mark Ready merely to obtain Chromium ceremony during every micro edit.

### Ready

Only at coherent candidate boundaries:

- I1.3 first physical loop;
- final I2 laboratory candidate.

Existing CI then provides:

- exact staged production build;
- Windows launcher self-test;
- Chromium regression;
- owner artifact.

Freeze exact candidate source head during Owner verdict.

---

## 22. Implementation stop rules

Stop ordinary implementation and escalate instead of patching through any of these:

1. implementation requires multi-bearing runtime or multiple-action composition beyond accepted evidence;
2. direct manipulation requires new physical/semantic meaning not present in accepted source;
3. `GenericEntity`, `GenericCapability`, `FabricRuntime`, generic compiler registry or permanent inspector is introduced mainly for current integration convenience;
4. React begins owning/mirroring per-frame runtime transforms;
5. renderer IDs become authored identity;
6. Save begins serializing runtime/compiled identities or transforms as authored truth;
7. accepted input behavior is changed because default library bindings are easier;
8. accepted experiment/compiler/runtime semantics must be changed merely to fit Studio architecture;
9. UNSUPPORTED authored intent is deleted/rewritten automatically;
10. a visual/instrumentation problem is solved by adding a dashboard/log wall;
11. two successive fixes treat the same symptom without reducing its underlying uncertainty;
12. Owner artifact requires Owner build/debug/tooling work before product judgement;
13. implementation changes P06 surface/visual/direct-interaction contract to satisfy a framework/template without a demonstrated product contradiction.

On trigger:

- classify cause;
- run at least meso audit;
- change adapter, narrow scope, split a research experiment or consciously reopen the exact affected product contract;
- do not preserve sunk cost merely because code exists.

---

## 23. Explicit non-goals for I1/I2

Do not add merely because mature editors have them:

- generic Move / Copy / Duplicate / Multi-select;
- hierarchy/outliner;
- material-definition editor;
- generic environment/profile editor;
- arbitrary CUT tool;
- ELASTIC/compliance composition;
- multi-bearing runtime;
- mobile/touch layout;
- key remapping/preferences system;
- plugin architecture;
- Generic Entity/Component inspector;
- WebGPU/R3F/state-management migration;
- final Machine Matter file/ontology.

These remain future evidence-driven product/research questions.

---

## 24. Build Web Apps role after C6

Build Web Apps may now be used during implementation only under this contract:

- the user explicitly opts out of ImageGen-led design discovery;
- P06 Product Design is already accepted;
- do not generate a replacement concept before coding;
- do not add/rearrange permanent surfaces merely for conventional frontend composition;
- do not invent capabilities, metrics, dashboards or domain objects;
- treat `docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md` and this C6 record as production authorities;
- use browser testing, React implementation discipline and screenshot/fidelity comparison as strengths;
- if framework convenience conflicts with P06/C6, preserve P06/C6 and change implementation or surface the contradiction.

---

## 25. Cold takeover for implementation conversation

A new implementation orchestrator must:

1. resolve live `main` and open PRs;
2. verify C6 grounding exact main/head;
3. read `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md`;
4. read `docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md`;
5. read this `docs/studio/C6-IMPLEMENTATION-READY.md`;
6. consult C5A/C5B/7A/7B only when a specific contract detail requires depth;
7. inspect live `package.json`, `tsconfig.json`, `src/bootstrap.ts`, CI and relevant accepted experiment APIs;
8. do **not** restart product design or P01–P06;
9. start exactly **I1 / FIRST PHYSICAL LOOP** on a new Draft integration branch;
10. begin with I1.0 route/dependency/input boundary and validate before proceeding.

The implementation conversation should not inherit any uncommitted implementation from prior chats. Live Git is source of truth.

---

## 26. C6 adversarial verdict

C6 was red-teamed for:

- speculative platform architecture;
- framework-driven product changes;
- route/CSS contamination;
- donor-code inertia;
- default OrbitControls conflict with accepted input;
- source/compiled/runtime identity leakage;
- false INVALID/UNSUPPORTED classification of ordinary incomplete construction;
- over-broad runtime scope;
- too-late Owner feedback;
- excessive CI ceremony;
- merging half-built framework layers;
- new ontology/Foundation promotion;
- technical PASS substituting for product value.

Corrections incorporated before PASS:

- one app-owned Studio vertical, no generic platform;
- `?studio=1` product route + route-scoped CSS;
- explicit no-jump/direct input boundary independent of donor controls;
- separate source validity/support/run-readiness axes;
- active-bearing runtime only for first Owner loop;
- one Draft I1 through first physical loop before product merge;
- early O1 Owner reality gate before investigation/depth work;
- second I2 branch only after O1 signal;
- existing CI reused rather than expanded into new process machinery.

No blocker remains before implementation.

# **C6 PASS — IMPLEMENTATION READY**

Next executable action after this docs/meta checkpoint is merged:

> **Cold takeover in the implementation conversation → create `integration/studio-v0-i1-first-loop` from exact live C6 main → open Draft → execute I1.0 Studio substrate.**

Do not implement Studio in this C6 grounding PR.
