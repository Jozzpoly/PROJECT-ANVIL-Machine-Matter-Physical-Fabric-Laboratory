# PROJECT ANVIL — Current Handoff

Status: **ANVIL-10 ACCEPTED / EPOCH I CLOSED / P06 PRODUCT DESIGN ACCEPTED / C6 IMPLEMENTATION READY**

Live Git/code + executable evidence override this checkpoint if they differ.

## Cold takeover

Before any implementation:

1. resolve live `main` and open PRs;
2. read `.anvil/project-state.json`;
3. read this handoff;
4. read `docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md` as final Product Design authority;
5. read **`docs/studio/C6-IMPLEMENTATION-READY.md`** as implementation authority;
6. consult C5A/C5B/P06.7A/P06.7B only when one specific Product Contract detail needs depth;
7. inspect live `package.json`, `tsconfig.json`, `src/bootstrap.ts`, CI and accepted experiment APIs before writing.

Do not reconstruct P01–P06 from conversation history when these live records are coherent.

## Scientific / evidence boundary

Accepted scientific truth remains through **ANVIL-10 / TORQUE-PATCH-REBIND** only. Epoch I is closed. No ANVIL-11 is active or implied by Studio implementation.

Historical evidence:

- W1 / PR #22 — CLOSED UNMERGED, Owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**. Dashboard/gate form is negative product evidence.
- P04 / PR #23 — closed-unmerged boundary proof PASS for first active-bearing Studio envelope.
- P05 / PR #24 — closed-unmerged technology proof PASS: Vite + TypeScript, React sparse editor shell, imperative Three.js/WebGL2 presentation, existing Box3D/ANVIL runtime.
- P06 attempt #1 / PR #26 — INVALID / INTERRUPTED / CLOSED UNMERGED; generated mockup rejected.

## Project self-model

Operational metaphor only:

- **Owner** — purpose, values, subjective acceptance, explicit vision changes;
- **Orchestrator** — investigation, falsification, planning, implementation, continuity;
- **Project self-model** — accepted truth, negative evidence, boundaries, active uncertainty, contradictions and next question.

Contradictions against accepted truth/boundaries must be surfaced and consciously reclassified, never silently executed.

## Product authority

**ANVIL Studio is one long-lived, world-first interactive 3D laboratory for Physical Fabric.**

Grounded loop:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

Final first-envelope Product Design:

- `docs/studio/P06-C5A-PRODUCT-BEHAVIOR.md`;
- `docs/studio/P06-C5B-PRODUCT-INTERACTION.md`;
- `docs/studio/P06-7A-PRODUCT-SURFACE-ARCHITECTURE.md`;
- `docs/studio/P06-7B-VISUAL-LANGUAGE.md`;
- **`docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md`**.

P06.8 verdict: **PASS — PRODUCT DESIGN ACCEPTED FOR IMPLEMENTATION PREPARATION.**

This is not Owner Value proof.

### Locks relevant to implementation

- `authored != compiled != runtime != render`;
- runtime disposable;
- `UNSUPPORTED != INVALID`;
- BUILD mutates persistent source; RUN creates fresh runtime; STOP disposes runtime, not construction;
- runtime manifestations must not be presented as authored source itself;
- React does not own/mirror 60 Hz runtime state;
- Three scene objects are presentation-only;
- `cellId@face` is current dialect, not final ontology;
- direct manipulation is **relative/no-jump**;
- accepted mouse contract is LMB interaction, MMB orbit, Shift+MMB pan, wheel zoom;
- selected surface is **WORLD CANVAS + PERIPHERAL ISLANDS**;
- selected visual language is **QUIET PHYSICAL WORKSHOP**;
- no permanent full-height inspector/dashboard/hierarchy/timeline is earned for v0.

## C6 — IMPLEMENTATION READY

Canonical implementation record:

> **`docs/studio/C6-IMPLEMENTATION-READY.md`**

C6 verdict:

> **PASS — IMPLEMENTATION READY**

Important implementation decisions:

- Studio enters as `/?studio=1`, not `?experiment=studio`;
- preserve historical root/routes through first Owner gate;
- first production dependency transaction pins P05-qualified Three/React/ReactDOM versions;
- route-scope historical CSS before Studio so old laboratory styles cannot bleed into product UI;
- implement one app-owned `src/studio/` integration vertical, not a new Foundation/platform;
- persistent `StudioSource` owns Matter + Bearing marks + TorquePatch marks;
- app-level `sourceGeneration` increments on every authored commit; Matter revision alone is insufficient;
- compiled refs are generation-scoped; runtime refs are runtime-session-scoped;
- product classifier separates authored validity, composition support and run readiness;
- ordinary incomplete construction is not INVALID/UNSUPPORTED;
- first executable Studio runtime remains the P04/P05 active-bearing envelope: exactly one valid Bearing + one valid TorquePatch → existing `ActivatePhysics`;
- no GenericRuntime is introduced;
- P05 viewport/controller code is donor evidence only; default OrbitControls/TransformControls behavior must not override accepted Studio input semantics.

## Exact next executable action — I1 / FIRST PHYSICAL LOOP

From exact live C6 `main`:

1. create branch `integration/studio-v0-i1-first-loop`;
2. open Draft PR early;
3. execute **I1.0 / Studio substrate** first;
4. continue only through coherent validated checkpoints:
   - I1.0 Studio substrate;
   - I1.1 Authored Matter Workshop;
   - I1.2 Local Meaning + classifier;
   - meso audit;
   - I1.3 First Physical Realization;
5. mark Ready only after I1.3 deserves exact Chromium/owner candidate;
6. hand exact artifact to Owner for **O1 / FIRST LOOP REALITY GATE**;
7. do not merge product direction merely because CI passes.

I1 owner loop:

`Editable Starter → modify matter → author/edit Bearing/TorquePatch → RUN → ACTIVATE → observe → STOP → modify → RUN again`

If O1 is positive, merge the exact owner-tested I1 head. If negative/inconclusive, preserve branch as evidence/donor and correct the lowest implicated contract before deeper implementation.

Only after positive O1 starts `I2 / LABORATORY DEPTH` for Inspect/Trace, failure/recovery depth, workspace hardening and final fidelity/Owner Value gate.

## Build Web Apps

It may now be used as implementation/fidelity discipline only.

The user explicitly opts out of ImageGen-led product redesign. Do not generate a new product concept before coding, do not rearrange P06 surfaces by template convention, and do not invent capabilities/metrics/dashboard objects. P06 + C6 are authoritative.

## Stop rules

Stop and escalate rather than patch through if implementation:

- needs multi-bearing/multi-action runtime semantics;
- invents new physical/local meaning;
- introduces generic runtime/entity/capability architecture mainly for integration convenience;
- makes React a runtime-frame owner;
- uses renderer IDs as authored identity;
- serializes runtime as source;
- changes P06 input/surface behavior to fit a library/framework;
- changes accepted experiment/compiler/runtime semantics merely to make Studio easier;
- deletes/re-writes UNSUPPORTED intent automatically;
- solves product problems with dashboard/log walls;
- requires Owner terminal/build/debug work to judge the artifact.

Run a meso audit on any such trigger.
