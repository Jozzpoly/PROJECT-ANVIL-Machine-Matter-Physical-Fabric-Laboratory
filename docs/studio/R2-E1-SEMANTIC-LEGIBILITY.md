# ANVIL Recovery R2-E1 — Semantic Legibility Closure

Status: **EVALUATION READY — BOUNDED SEMANTIC PRESENTATION PASS**.

Branch: `recovery/r2-direct-world-grammar`.

This record does **not** seal all of R2, accept the final visual design, prove Owner Value, authorize merge, or promote the current Canvas2D/presentation adapters into permanent Machine Matter architecture.

## Question

> Is the D6-qualified direct-world grammar presented clearly enough that a human can evaluate the grammar itself, rather than being forced to know frozen Playwright coordinates or infer physical meaning from tiny generic markers?

R2-E1 was deliberately narrower than visual polish. It addressed only semantic legibility blockers discovered by R2-E0:

1. shared interfaces were technically targetable but nearly invisible before hover;
2. Bearing marks did not expose `freeAxis` in the world;
3. Torque marks did not expose direction/sign in the world;
4. RUN removed Bearing/Torque causal presentation entirely;
5. the same minimum had to remain usable at `1440×900` and `1024×640`.

Excluded from E1:

- Three.js migration;
- final lighting/material/AO work;
- final typography/icons/chrome;
- Save/Open, PAUSE/TRACE, Investigation Drawer or old P06 surface restoration;
- new meaning kinds or generic visual ontology;
- source, realization, R1 Owner Authority, physics/runtime or Loose semantic changes.

## Baseline rendered evidence

CI was first extended to capture rendered evidence from the same real Chromium candidate gate that runs R2 regression tests.

Stable pre-correction baseline:

- exact product semantics still D6 head-derived; only visual-evidence instrumentation added;
- run: `33189631671` / ANVIL CI #482;
- head: `609e5c89ce3db68fd71e2d122c30b8ab61a13ca6`;
- core/build/launcher/browser: PASS;
- visual artifact: `r2-e1-visual-evidence`, artifact ID `9693222319`;
- artifact digest: `sha256:cf043ba13a1654996db1b455d929d38234bc438d666df226de29da7dc84cd36f`.

The rendered baseline confirmed the E0 diagnosis rather than contradicting it:

- an unused shared seam appeared as an extremely small, low-emphasis point;
- Bearing + Torque looked essentially like a small ring plus dot, while actual Bearing axis and Torque magnitude lived in Context;
- changing physical semantics could therefore leave the world mark visually equivalent;
- conflict truth was carried mostly by Context text;
- standalone single-anchor Torque was truthful/reachable but visually weak;
- Loose was comparatively explicit because it had a named chip;
- RUN showed moving Matter but no Bearing/Torque manifestation at the physical cause.

This was classified as **presentation insufficiency**, not evidence that the direct-world grammar or R1 preservation semantics were structurally wrong.

## Bounded correction

E1 added `src/studio-r2/semantic-presentation.ts`, installed before the R2 app.

It is an experiment-local presentation adapter. It does not own authored truth or runtime semantics.

### Shared interface

A normal shared interface now receives a small hollow target/cross that is visible before hover while remaining quieter than authored Meaning. One-shot/rebind/retarget intent increases its emphasis rather than turning every seam into permanent bright chrome.

### Bearing

Bearing uses the already-earned capability family:

> **ring + axis**

The axis is projected from the authored `freeAxis`; changing the axis therefore changes the world mark rather than only a dropdown value.

Resolved, unresolved/orphan and conflicting Bearings keep distinct treatment using the existing R2 status evidence. No new semantic status system was introduced.

### TorquePatch

Torque uses a small local patch plus directional cue when a unique truthful Bearing axis exists.

The cue changes direction with the sign of `effortNm`.

For a preserved standalone Torque whose authored `cellId@face` survives but no unique Bearing axis exists, E1 deliberately does **not** fabricate a direction. It shows the local patch plus an explicit `+`, `−` or `0` sign at the truthful authored target.

### RUN manifestation

Realized Bearing/Torque Meaning no longer disappears when physics starts.

Runtime presentation is derived only from already-existing realization/runtime provenance:

- `FreedomBearingPlan.localAnchorA/localAnchorB`;
- `axisWorld`;
- current runtime body position/rotation snapshots;
- `FreedomTorquePlan.sourceBearingId` and `effortNm`.

The runtime Bearing pivot is reconstructed from the two current local anchors and the axis from the current body rotations. Torque is drawn at that realized Bearing manifestation.

The runtime treatment is visually distinct from the authored mark and is non-interactive presentation only. It does not write runtime pose back to source and does not invent a persistent runtime identity.

## Falsification / executable evidence

The visual-evidence test was strengthened so E1 does not rely only on screenshots or subjective judgement.

On exact executable head:

`24d25b364897a16cf4a4fa79d8862dcab502bb2b`

ANVIL CI #485 / run `33190634628` passed:

- strict/typecheck + Foundation/semantic/Box3D: **PASS**;
- production browser build: **PASS**;
- packaged Windows owner launcher self-test: **PASS**;
- full real Chromium regression including E1 evidence: **PASS**.

The E1 browser evidence explicitly proves:

1. changing Bearing `freeAxis` from `z` to `y` changes the local world raster;
2. changing Torque effort from `+20 Nm` to `-20 Nm` changes the local world raster;
3. RUN contains detectable cyan Bearing and orange Torque manifestation pixels on the Canvas itself at both `1440×900` and `1024×640`;
4. all previous R2/D6 interaction tests remain green.

Rendered after-evidence:

- artifact: `r2-e1-visual-evidence`;
- artifact ID: `9693628866`;
- digest: `sha256:f018829a19755a67c62e8f78f3a0543d68884691feaf152d6aba9a066d1caa0d`;
- source run/head: `33190634628` / `24d25b364897a16cf4a4fa79d8862dcab502bb2b`.

Owner candidate artifact from the same executable head:

- artifact: `anvil-browser-laboratory`;
- artifact ID: `9693629928`;
- digest: `sha256:9cfe639fc15c1f0b5da14e2b067595d52fdc9c168353fd553f3589d3a1a6cccb`.

## Rendered review verdict

The post-correction rendered set was reviewed directly, not inferred only from code/tests.

At `1440×900`:

- shared seam is discoverable without dominating Matter;
- Bearing axis is visibly directional;
- Torque direction visibly reverses with sign;
- conflict remains a local spatial state with explicit Context identities/diagnostics;
- single-anchor Torque remains truthful and more legible without a fabricated axis;
- Loose remains explicit and unchanged in role;
- RUN retains a visible causal Bearing/Torque manifestation at the moving joint.

At `1024×640`:

- the same semantic marks remain legible;
- runtime manifestation remains visible;
- Context occupies more of the viewport but does not make the world unusable in the tested envelope.

No E0 evaluation blocker remained strong enough to justify further presentation expansion inside E1.

## Deliberate non-claims / debt

E1 does **not** claim:

- final `QUIET PHYSICAL WORKSHOP` fidelity;
- final colors, lighting, materials, typography, iconography or animation;
- accessibility qualification beyond the tested semantic cues;
- arbitrary viewport/mobile qualification;
- human discoverability/value proof beyond removing the identified instrumentation bias;
- final generic Meaning visualization architecture.

The current `semantic-presentation.ts` adapter mirrors the current R2 Canvas camera/presentation math in order to remain bounded and avoid turning E1 into a renderer refactor. This is accepted **experiment-local debt**, not architecture to canonize by inertia. If R2 later survives Owner evaluation and consolidation is earned, this adapter should be folded into the chosen presentation layer rather than generalized prematurely.

## Verdict

# **R2-E1: EVALUATION READY**

Meaning of this verdict:

> The known E0 presentation blockers have been removed far enough that the next human/product judgement can evaluate the direct-world grammar itself rather than a nearly invisible debug representation.

This is **not** equivalent to:

- R2 SEALED;
- RC1 Owner acceptance;
- Owner Value proved;
- merge authorized.

Natural boundary reached. Selection of the next stage remains a separate decision.
