# P06.7B — ANVIL Studio Visual Language

Status: **PASS — VISUAL LANGUAGE EARNED**

Work type: integration / product design. This document freezes the v0 visual/emotional language of ANVIL Studio on top of the already-grounded C5A Product Behavior, C5B Product Interaction and P06.7A Product Surface Architecture. It does not implement Studio, create ANVIL-11, add new physical semantics, change the P06.7A surface anatomy or promote UI concepts into Foundation.

Grounding base: `main@c3af43df80ca599a5dfc01b6690913f02f439406`.

## 1. Design question

> **How should ANVIL Studio look, feel and move so the earned product structure expresses the project's actual character — precise, exploratory, tactile, alive and technically honest — without regressing into decorative sci-fi, generic CAD, generic SaaS or the rejected P06 #1 dashboard language?**

P06.7B uses `PLAN → REALIZATION → RED TEAM → VERDICT` and treats visual styling as an expression of already-earned behavior, never as authority to invent new product structure.

## 2. Research-grounded principles

External references were used only for interaction/visual principles, not copied layouts:

- Shapr3D: selection-driven adaptive tools support model focus instead of menu browsing;
- Blender: the 3D Viewport remains the main region while overlays/gizmos are separately controlled and regions may overlap the main area;
- Gravity Sketch: creative 3D value comes from direct spatial construction and iteration;
- WCAG/W3C: meaningful controls, focus and state indicators require sufficient contrast; color must not be the sole carrier of state.

Owner-history review reinforced recurring preferences: direct and stable manipulation, calm legible workspace, technical depth available without requiring owner debugging, real control rather than placebo UI, and strong rejection of generic dashboard/sci-fi generative patterns.

## 3. Compared visual directions

### A — PRECISION DAYLIGHT
Light neutral modeling environment, dark linework, crisp technical UI.

Strength: clarity.
Risk: strong generic-CAD gravity and reduced emotional distinction.

**Rejected as v0 default.** A future light theme remains possible.

### B — LUMINOUS RESEARCH INSTRUMENT
Black world, neon cyan/purple overlays, holographic glow and high-tech presentation.

Strength: immediate technical spectacle.
Risk: decorative sci-fi shorthand, visual noise and direct regression toward the failed generated P06 #1 language.

**Rejected.**

### C — QUIET PHYSICAL WORKSHOP
Neutral mid-dark world, tangible matter, quiet graphite chrome, restrained semantic accents and direct spatial marks.

Strength: world dominance, tactile physical character, semantic color discipline, enough technical precision without turning the product into a control room.

**Selected v0 visual direction.**

This selection is not justified by an assumed Owner preference for dark mode. It is selected because it best satisfies the current product contract. Owner may later request a light theme without changing the underlying semantic grammar.

## 4. Governing visual grammar

The visual system follows four rules:

1. **Shape communicates capability / kind.**
2. **Stroke/material treatment communicates lifetime / representation.**
3. **Color reinforces semantics but is never the only carrier of meaning.**
4. **Motion is reserved for things that actually act, change or transition.**

This prevents the viewport from becoming a rainbow status map.

## 5. World character

### 5.1 Canvas

Default world range: approximately `#202327` to `#262A2E`.

The world is mid-dark graphite, not a black void. No volumetric fog, neon horizon, holographic grid or decorative sci-fi atmosphere.

### 5.2 Ground/grid

- grid/ground is an orientation instrument, not decoration;
- subtle in BUILD;
- may visually quiet further in RUN;
- no permanently dominant RGB infinite grid;
- orientation aids remain presentation-only.

### 5.3 Lighting

Use a calm studio/workshop lighting model:

- soft key + fill;
- stable exposure;
- soft contact shadows / ambient occlusion where technically appropriate;
- no dramatic spotlights or animated environment lighting merely to make RUN look exciting.

The scene should make geometry readable at a glance and remain stable between BUILD/RUN/PAUSE.

## 6. Matter appearance

Matter must feel tangible rather than like debug cubes or game art.

- material base color comes from authored `displayColor`;
- renderer may light/tone-map but must not replace authored material identity with a decorative palette;
- matte/rough presentation by default;
- subtle beveling sufficient to read faces and corners;
- contact grounding;
- no permanent full wireframe over every cell;
- cell/face boundaries become stronger only when targeting, selecting, authoring or investigating.

The goal is `I can touch/build this`, not `I am reading a collider visualization`.

## 7. UI chrome

Primary chrome surface: `#1C1F23`.

UI islands are solid/semi-opaque graphite with minimal decorative transparency. Avoid glassmorphism, large bloom, translucent sci-fi panes and nested-card SaaS composition.

Rules:

- one container level where possible;
- groups separated by spacing and restrained dividers rather than cards inside cards;
- moderate corner radius around `8 px`;
- restrained short shadow only when needed to separate an island from the world;
- chrome remains quieter than matter.

## 8. Typography

Selected default family:

- **IBM Plex Sans** — normal product/UI language;
- **IBM Plex Mono** — numeric measurement, technical detail and developer/research reveal only.

Approximate v0 roles:

- normal controls/body: `13 px`;
- secondary labels: `12 px`;
- important surface title/state: `14–16 px`;
- monospace values: `12–13 px`, tabular where useful.

Avoid terminal-like monospacing of the whole application and avoid military/all-caps UI. Short lifetime labels such as BUILD/RUN/PAUSE may use compact uppercase treatment.

Font implementation may bundle the selected family or use a metric/readability-compatible fallback if technically necessary; typography roles and density matter more than font-brand fetishism.

## 9. Spacing and controls

Base spacing rhythm:

`4 / 8 / 12 / 16 / 24 px`

Typical desktop control height:

`32–36 px`

Icons:

- geometric stroke language;
- approximately `18 px`;
- approximately `1.75 px` stroke;
- filled icons only when state genuinely benefits from the distinction;
- icon-only treatment is acceptable only where function is already discoverable or compact-mode requires it;
- otherwise use concise text labels/tooltips.

Avoid pill-everything styling and decorative badges.

## 10. Core visual tokens

| Role | Token | Meaning |
|---|---|---|
| Chrome | `#1C1F23` | solid graphite UI surface |
| World | `#202327–#262A2E` | neutral mid-dark workspace |
| Primary text | `#F2F4F7` | high-contrast primary UI |
| Secondary text | `#AEB6C0` | secondary UI |
| Muted readable | `#7D8793` | lowest normal readable UI level |
| Bearing / relation | `#4BC7C1` | ring + axis family |
| Torque / active intent | `#F2A65A` | patch + arrow family |
| INVALID | `#E56A6A` | malformed authored intent |
| UNSUPPORTED | `#B7A0D8` | meaningful but unqualified frontier |
| REQUIRES BUILD | `#D7BC68` | lifetime transition required |

The semantic colors were sanity-checked for strong contrast against `#1C1F23`; exact implementation must still verify contrast in rendered context.

`READY` has no dedicated green success treatment.

`RUNTIME FAULT` may reuse the fault/red family with stronger context/icon/recovery treatment rather than inventing another permanent semantic color.

## 11. Selection, hover and focus

Material `displayColor` is arbitrary enough that one fixed selection accent cannot remain legible everywhere.

Therefore:

### Hover
- immediate/sub-80 ms response;
- restrained face/object treatment;
- never relies on a slow glow animation.

### Selection
Use a **two-tone high-contrast outline** (light + dark under-stroke / equivalent) so selection remains legible over both dark and light matter.

### Keyboard focus
Use an equally explicit focus treatment; color change alone is insufficient.

### Active authoring target/handle
Critical targets and handles maintain a minimum screen-space legibility across zoom and oblique camera angles.

An active handle must not disappear behind the geometry it controls. Controlled x-ray / dashed continuation is permitted for the currently active operation only. Do not turn all authored meaning into permanent through-wall overlays.

## 12. Capability visual families

### Bearing
Primary geometry: **ring + axis**.

Color reinforcement: `#4BC7C1`.

The axis/pivot is spatial and physically aligned with the actual qualified local interface; avoid floating `BEARING` badges as the primary representation.

### TorquePatch
Primary geometry: **surface patch + directional arrow**.

Color reinforcement: `#F2A65A`.

Magnitude/sign are shown through local geometry/directional treatment during editing and realization; avoid generic gauge widgets unless deeper inspection truly requires numeric detail.

Future capabilities must earn their own visual family; do not preallocate a rainbow capability palette.

## 13. Authored vs runtime manifestation

This distinction is mandatory.

### Authored mark
- solid/matte precision stroke;
- visibly attached to persistent source location;
- no ambient animation;
- stable during BUILD.

### Runtime manifestation
- retains capability shape family and related hue;
- uses a distinct stroke/material treatment;
- may have a brighter core/marker;
- motion cue is allowed only when the represented runtime behavior is actually active/changing;
- no broad neon bloom.

A runtime manifestation must never visually imply that persistent authored source itself moved.

### Compiled / trace reveal
Compiled interpretation is normally hidden. In Inspect/Trace it may use neutral/dashed boundary/ghost language and cross-highlighting.

TRACE is an explanation layer, not a third permanent visual mode.

## 14. Product-state styling

### READY
Quiet. Successful normal operation creates no green banner/badge wall.

### INVALID
- coral red `#E56A6A`;
- broken/hatched/slashed local geometry;
- exact offending target emphasized;
- concise recovery reason/action.

Color alone never communicates invalidity.

### UNSUPPORTED
- muted lavender `#B7A0D8`;
- dashed/open-boundary treatment;
- preserved authored intent remains visible;
- visual language communicates **frontier / not qualified yet**, not user error.

Do not use generic danger-red for UNSUPPORTED.

### REQUIRES BUILD
- ochre `#D7BC68`;
- transition cue toward BUILD/Stop & Edit;
- not a danger/error presentation.

### RUNTIME FAULT
- Simulation Dock may gain a stronger fault surface;
- preserve last readable world snapshot where possible;
- show Retry / Stop / Details;
- raw logs only after Details.

## 15. Investigation / trace visual language

Instrumentation follows:

`QUESTION → TEMPORARY LENS → SPATIAL ANSWER → OPTIONAL DEEPER EXPLANATION`

Use neutral/low-saturation explanatory visuals wherever a new semantic accent is not required:

- trajectory / velocity;
- body decomposition;
- source ↔ compiled ↔ runtime lineage;
- old/new reconstruction ghosts;
- provenance cross-highlights.

Investigation colors must not compete with active authoring/failure semantics.

## 16. Motion grammar

Motion is restrained and functional.

Approximate v0 timings:

| Interaction | Target timing | Rule |
|---|---:|---|
| Hover / target acquisition | `0–80 ms` | precision first |
| Context/Draft Pod appear | `100–140 ms` | short ease-out, no bounce |
| Drawer open/close | `160–200 ms` | stable slide/fade; no world recenter |
| BUILD → RUN handoff | `120–180 ms` | lifetime handoff, never geometry morph |
| STOP final-runtime ghost | `280–360 ms` | fade old realization; no reverse physics |
| Explicit Focus/Reframe camera | `180–260 ms` | only after user view command |

Do not use springy/bouncy UI motion as default.

Runtime directional cues update in the imperative Three presentation path, not by mirroring hot runtime state through React.

## 17. BUILD / RUN / PAUSE character

### BUILD — workshop / intention
- tangible matter and authored marks primary;
- grid/orientation aids readable;
- Context/Draft surfaces may become slightly more explicit during authoring.

### RUN — physical consequence
- authoring chrome visually quiets;
- world/motion dominates;
- grid and irrelevant authored chrome may reduce emphasis;
- only qualified runtime actions/manifests remain prominent.

### PAUSE — investigation opening
- same physical realization remains primary;
- Inspect/Trace affordance becomes more discoverable;
- do not automatically turn on diagnostic overlays.

## 18. STOP visual handoff

STOP changes representation lifetime, not physics history.

- final runtime state may remain briefly as a neutral fading ghost (`~280–360 ms`);
- persistent authored construction becomes primary again;
- do not animate runtime geometry traveling back to source pose;
- do not auto-move the camera;
- explicit Reframe/Return-to-construction remains a view command.

## 19. First-run visual treatment

The `Empty / Editable Starter` start surface uses the same graphite visual language and remains small over the same World Canvas.

No marketing hero, dashboard cards, onboarding carousel or locked tutorial route.

Starter matter should already demonstrate the normal tangible matter lighting/material treatment, not a special promotional renderer.

## 20. Accessibility / legibility requirements

P06.7B treats accessibility as part of precision rather than a later polish task.

- meaningful UI controls/state indicators must retain strong contrast against adjacent surfaces;
- selection/focus uses form/contrast as well as color;
- state is never encoded by hue alone;
- keyboard focus remains visible and unobscured by peripheral surfaces;
- important authoring targets retain minimum screen-space visibility;
- decorative grid/ambient guides may remain lower contrast because they are not the sole source of required information.

Implementation/fidelity work must test actual rendered contrast, high/low material colors, keyboard navigation and extreme view angles.

## 21. Explicit anti-patterns

P06.7B rejects:

- black void + neon cyan/purple HUD;
- holographic panels / glassmorphism;
- permanent glowing outlines around everything;
- rainbow body/capability coloring by default;
- giant status badges / success green everywhere;
- generic dark SaaS cards;
- terminal/monospace styling for the entire product;
- dramatic game lighting or post-processing that obscures authored geometry;
- motion/animation that implies physical continuity not actually earned;
- a visual redesign that moves or adds P06.7A surfaces merely to look fashionable.

## 22. Red-team result

The selected language survives the following attacks:

- dark theme does not rely on blackness/neon and retains readable contrast;
- semantic accents remain bounded because shape and treatment carry most meaning;
- authored/runtime distinction is visible without inventing a separate page/mode;
- arbitrary material colors are handled by two-tone selection/focus treatment;
- animation is short and representational, not fake physics;
- active authoring handles remain legible at difficult zoom/angles;
- the visual language does not require a new scientific capability or change P06.7A surface structure;
- React/Three hot-loop boundary remains intact.

Known empirical risks are deferred to implementation/fidelity evidence rather than hidden:

- actual `1024×640` density;
- real material-color clashes;
- extreme camera angle/zoom target legibility;
- font metrics/loading and icon optical quality;
- GPU/browser behavior of outline/ghost treatments.

These are implementation/fidelity validation obligations, not reasons to invent a different product contract now.

## 23. Verdict

# **P06.7B PASS — VISUAL LANGUAGE EARNED**

Selected direction:

> **QUIET PHYSICAL WORKSHOP**

Short visual constitution:

> **Matter should feel touchable. Meaning should look deliberately authored onto places. Runtime should become alive only when physics is alive. Chrome should behave like a quiet precision instrument. Deeper truth should appear as temporary explanation, not permanent spectacle.**

No Product Design acceptance is issued yet.

Next stage:

> **P06.8 / Complete Product Contract + adversarial red-team**

P06.8 must combine C5A + C5B + P06.7A + P06.7B as one product, test complete representative journeys/states against W1 and corrupted-P06 failure modes, identify any unresolved Owner/research/implementation questions, and only then decide whether **PRODUCT DESIGN ACCEPTED → C6 / IMPLEMENTATION READY** is earned.
