# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 ACCEPTED / EPOCH I CLOSED / STUDIO P06 PRODUCT DESIGN ACCEPTED / C6 NEXT**

Live Git/code + executable evidence override this checkpoint if they differ.

## 1. Cold-start order

Before writing:

1. resolve live `main` and open PRs;
2. read `.anvil/project-state.json`;
3. read this handoff;
4. for Product Design authority read, in order:
   - `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`;
   - `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`;
   - `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`;
   - `docs/studio/P06-7B-VISUAL-LANGUAGE.md`;
   - **`docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md`** — final first-envelope product contract and P06 verdict.

Do not reconstruct P06 from conversation history if these live records are coherent.

## 2. Scientific / evidence boundary

Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND** only. Epoch I is closed. No ANVIL-11 is active or implied by Studio work.

Historical product/engineering evidence:

- W1 / PR #22 — **CLOSED UNMERGED**, Owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**; dashboard/gate form is negative product evidence, donor implementation only.
- P04 / PR #23 — closed-unmerged boundary proof PASS for the first active-bearing Studio envelope.
- P05 / PR #24 — closed-unmerged technology proof PASS: existing Vite + TypeScript, React sparse editor shell, imperative Three.js/WebGL2 presentation, existing Box3D/ANVIL runtime.
- P06 attempt #1 / PR #26 — **INVALID / INTERRUPTED / CLOSED UNMERGED**; generated dashboard-heavy mockup is rejected and is not a design reference.

## 3. Operational project self-model

ANVIL may be treated as a third governance actor alongside Owner and Orchestrator. This is an operational metaphor, not literal consciousness.

- **Owner** — purpose, values, subjective product acceptance, explicit vision changes.
- **Orchestrator** — investigation, falsification, planning, implementation, continuity.
- **Project self-model** — accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next unresolved question.

Contradictions with accepted evidence/boundaries must be surfaced and consciously reclassified, never silently executed.

## 4. Studio north star

**ANVIL Studio is one long-lived, world-first interactive 3D laboratory for Physical Fabric.**

`CREATE MATTER → GIVE IT LOCAL MEANING → COMPOSE → SIMULATE → OBSERVE → MODIFY → DISCOVER`

Grounded loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

Shortest mental model:

> **I build persistent matter. I give physical meaning to places on it. Studio continuously determines whether that authored composition can currently be realized. RUN creates a fresh disposable physical realization. I observe it, pause it and trace why it behaved that way. STOP discards the realization, not my construction. If I exceed ANVIL's earned capability, my authored intent survives and Studio tells me honestly that the composition is not yet supported.**

## 5. P06 accepted product contract

### Identity / lifetime

Do not renegotiate without real contradiction:

- `authored != compiled != runtime != render`;
- runtime is disposable;
- BUILD mutates persistent construction;
- RUN creates fresh runtime;
- PAUSE preserves current runtime for STEP/TRACE, not arbitrary source editing;
- STOP disposes runtime, not construction;
- runtime manifestations must never be presented as if authored source itself moved;
- `cellId@face` is current laboratory dialect, not final ontology;
- generic source edits may rebuild/reset runtime unless continuity is separately qualified;
- `UNSUPPORTED != INVALID`.

### Product truth states

Keep distinct:

`READY / INVALID / UNSUPPORTED / REQUIRES BUILD / RUNTIME FAULT`.

Unsupported authored intent normally survives. READY is quiet.

### Interaction

Persistent authoring follows:

`TARGET → PREVIEW / DRAFT → COMMIT → RECOMPILE / RECLASSIFY → SPATIAL FEEDBACK`

Final direct-input contract from P06.8A:

- LMB = target/select/direct interaction;
- MMB drag = orbit;
- Shift+MMB = pan;
- wheel = zoom;
- F = focus selection;
- Esc = cancel current transient draft;
- Enter = commit current parameterized draft;
- Ctrl+Z / Ctrl+Shift+Z = authored history;
- Ctrl+S = Save authored workspace.

**Continuous manipulation is relative/no-jump:** pointer-down captures the current draft value, then drag applies a delta. Exact sensitivity is tuned in browser fidelity, not promoted into domain semantics.

First-envelope direct authoring:

- Add/Remove one matter cell at a time with spatial preview;
- assign existing authored material;
- Bearing: target shared seam, choose one of the two legal tangent axes spatially, Commit;
- TorquePatch: target eligible Bearing endpoint face, local patch/arrow, relative no-jump signed effort edit + exact numeric fallback, Commit;
- ACTIVATE is transient `OFF | ON` only.

Generic Move/Copy/Duplicate/Multi-select are outside v0.

### Attention / surfaces

> **Matter first. Context second. Explanation on demand. Engineering internals last.**

> **Local truth close to matter; global state at workspace boundary; investigation only on request.**

Selected surface architecture:

> **WORLD CANVAS + PERIPHERAL ISLANDS**

- full-window World Canvas;
- upper-left Workspace Dock;
- left-edge `Select / Matter / Meaning / Inspect` Intent Rail;
- lower-center Simulation Dock;
- local Context/Draft Pod;
- conditional right-edge Investigation Drawer.

No permanent full-height inspector/hierarchy/timeline/dashboard/property wall is earned for first envelope.

Reference desktop `1440×900`; minimum first-envelope product target `1024×640 CSS px`, still requiring empirical browser validation.

### First run

Same World Canvas; small `Empty / Editable Starter` choice only.

- Empty: no cells, but at least one usable authored material seed.
- Editable Starter: ordinary editable workspace using only qualified first-envelope semantics — small Matter, exactly one Bearing, exactly one TorquePatch, compatible active-bearing profile, runtime starts OFF and ACTIVATE produces visible motion.

No dashboard/home/tutorial route.

### Visual language

Selected:

> **QUIET PHYSICAL WORKSHOP**

Matter tangible; meaning deliberately authored onto places; runtime becomes visually alive only when physics is alive; chrome is a quiet precision instrument; deeper truth is temporary explanation.

Canonical tokens/details live in `docs/studio/P06-7B-VISUAL-LANGUAGE.md`.

Do not regress to black-void neon HUD, glass/holographic panes, permanent rainbow overlays, generic dark SaaS cards or visual structure invented by styling.

## 6. P06.8 adversarial result

Final complete-product review attacked:

- W1 dashboard regression;
- corrupted-P06 generative-design regression;
- generic CAD/game-editor drift;
- source/runtime identity confusion;
- hidden-only interaction;
- instrumentation clutter;
- React hot-loop leakage;
- ontology overclaim;
- silent destructive convenience;
- manipulation-feel ambiguity.

The direct-manipulation gap initially failed and was corrected through P06.8A. No blocker remains before implementation preparation.

**P06.8 verdict: PASS — PRODUCT DESIGN ACCEPTED FOR IMPLEMENTATION PREPARATION.**

This is not Owner Value proof. The running Studio must still earn real feel/visual/usefulness acceptance.

## 7. Remaining issue classes

### Implementation / fidelity, not product invention

- storage/file mechanism preserving Save/Open semantics;
- compile scheduling/caching;
- exact hit-test implementation preserving semantic priority;
- Torque drag sensitivity;
- Context/Draft Pod DOM anchoring;
- outline/ghost implementation;
- fonts/icons/browser focus;
- actual `1024×640` density and extreme-view legibility.

### Research boundaries

- multi-bearing runtime composition;
- multiple TorquePatch composition beyond accepted evidence;
- generic CUT/free-runtime editing;
- arbitrary continuity/state transfer;
- final representation-independent locality ontology.

### Future product problems outside first envelope

- generic Move/Copy/Duplicate/Multi-select;
- large-world navigator/outliner;
- material-definition authoring;
- richer environment/profile authoring;
- touch/mobile;
- input remapping.

## 8. Next stage — C6 / IMPLEMENTATION READY

**Do not start Studio product code yet.**

C6 must translate the frozen product into:

- concrete app/module boundaries;
- ordered vertical implementation slices;
- source/adaptor/presentation ownership map;
- exact first-envelope feature inventory;
- test/evidence/fidelity gates per slice;
- owner-facing browser delivery path;
- implementation stop rules;
- cold-takeover instructions for the implementation conversation.

C6 may choose engineering mechanisms. It may not silently reopen P06 product behavior, surface structure or visual language to fit a framework/template.

After C6 PASS, Build Web Apps may return strictly as implementation/fidelity discipline working from the accepted contract. It has no redesign authority by inertia.
