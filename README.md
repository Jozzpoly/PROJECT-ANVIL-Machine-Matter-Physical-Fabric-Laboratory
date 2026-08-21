# PROJECT ANVIL

**Machine Matter / Physical Fabric Laboratory**

PROJECT ANVIL is an experimental R&D laboratory for a deliberately unusual idea:

> Author persistent semantic matter and local physical intent, then compile them into disposable runtime representations appropriate to the simulation.

The long-term target is not a catalog of chassis, wheels, engines and joints. The working direction is closer to **painting local properties/capabilities** — matter, bindings, interfaces and functions — and testing whether useful machine behavior can emerge from their composition.

Research vocabulary such as steel/rubber, stiff/elastic/breakable, bearing/friction surface or torque/sensor/signal is not a frozen ontology and is not a direct alias for Box3D objects. The current cubic-cell source dialect is a laboratory representation, not a commitment that Machine Matter must remain voxel-based.

## Evidence milestones — Epoch I

The first bounded research epoch is closed with accepted science through:

- **ANVIL-00 / COLLAPSE** — reduced rigid runtime representation from persistent source matter;
- **ANVIL-01 / CUT** — bounded topology replacement with source identity and rigid-field motion transfer;
- **ANVIL-02 / BEARING** — local rotational interface to passive revolute runtime relation;
- **ANVIL-03 / REBIND** — semantic bearing reconstruction after a nearby moving CUT;
- **ANVIL-04 / LOAD-REBIND** — bounded loaded cold relation reconstruction;
- **ANVIL-05 / TORQUE** — signed active intent through a passive bearing without authored solver-motor semantics;
- **ANVIL-06 / TORQUE-PATCH** — local source-face active intent resolving existing BEARING without authored `bearingId`;
- **ANVIL-07 / ELASTIC-SEAM** — one bounded local compliant seam can deform and restore;
- **ANVIL-08 / COMPLIANCE-RESOLUTION** — frozen area-normalized 1D compliance survives exact 2× authored refinement without per-patch retuning;
- **ANVIL-09 / ACTIVATE** — one compiled persistent torque action can remain unchanged while runtime-only OFF/ON/OFF activation changes whether active torque is applied;
- **ANVIL-10 / TORQUE-PATCH-REBIND** — one unchanged local torque patch can be re-lowered after a nearby CUT onto the rebound bearing/current body while a valid-looking stale pre-CUT action is rejected.

Each result is deliberately narrower than a universal material, relation, FUNCTION, power, control, Surface or representation-independent architecture. Exact claims and non-claims belong to the corresponding evidence records under `docs/experiments/`.

## After Epoch I — ANVIL Studio

ANVIL-00…10 form the first bounded research epoch, now **closed**. No ANVIL-11 is active by inheritance.

The first post-Epoch-I Workbench integration proved an important negative product result: a technically qualified composition can still fail to provide useful owner-facing value when the presentation is gate/dashboard-heavy, raw or workflow-driven. W1 / PR #22 was therefore closed unmerged with Owner verdict **NO VALUE SIGNAL — PRESENTATION / INSTRUMENT FAILURE**.

That result led to a separate Studio preparation sequence rather than more gate-style applications:

- P04 — first-envelope integration/boundary proof, closed-unmerged PASS;
- P05 — renderer/editor-shell technology proof, closed-unmerged PASS;
- P06 — Product Design, accepted;
- C6 — implementation preparation, **IMPLEMENTATION READY**.

The selected product direction is now:

> **ANVIL Studio — one long-lived, world-first interactive 3D laboratory for Physical Fabric.**

Its grounded loop is:

`BUILD → GIVE LOCAL MEANING → RUN → OBSERVE → PAUSE / TRACE → STOP → MODIFY → RUN AGAIN`

The first implementation stage is **I1 / FIRST PHYSICAL LOOP**. It must begin only after cold takeover from the sealed live `main`; it is not an ANVIL-11 scientific experiment.

Product and implementation authorities:

- [`docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md`](docs/studio/P06-8-COMPLETE-PRODUCT-CONTRACT.md) — accepted first-envelope Product Design;
- [`docs/studio/C6-IMPLEMENTATION-READY.md`](docs/studio/C6-IMPLEMENTATION-READY.md) — implementation ownership, vertical slices, evidence/Owner gates and stop rules;
- [`docs/studio/PREIMPLEMENTATION-HANDOFF-AUDIT.md`](docs/studio/PREIMPLEMENTATION-HANDOFF-AUDIT.md) — one-time audit of repository/evidence/workflow readiness before implementation handoff.

For the **current live work and takeover state**, do not use this README as the operational roadmap. Start with:

- [`.anvil/project-state.json`](.anvil/project-state.json) — compact machine-readable checkpoint claim;
- [`docs/CURRENT_HANDOFF.md`](docs/CURRENT_HANDOFF.md) — cold-takeover instructions and exact next bounded action.

Verify current-state documents against live Git before material work.

## Architectural separation

```text
AUTHORED TRUTH
persistent matter / local physical intent
        │ compile
        ▼
COMPILED REPRESENTATION
runtime-ready topology / relations / actions / provenance
        │ lower
        ▼
RUNTIME PHYSICS
solver-owned and disposable
        │ observe
        ▼
EVIDENCE
measurements / lineage / human judgement only when useful
```

Authored identity must not become synonymous with one body, collider, joint, grid resolution or solver.

## Work modes

ANVIL separates four kinds of material work:

- **experiment** — asks a new falsifiable scientific/semantic/physics question;
- **foundation** — promotes or hardens a reusable boundary already supported by evidence;
- **integration** — composes accepted capabilities for owner/system evaluation without automatically creating a new scientific claim;
- **maintenance** — improves tooling/process/packaging/documentation while preserving accepted semantics.

This distinction prevents product/integration work from silently becoming evidence for an ontology that has not actually been tested.

## Project documents

- [`AGENTS.md`](AGENTS.md) — agent rules, truth hierarchy, work classification and takeover discipline;
- [`docs/EXPERIMENT_PROTOCOL.md`](docs/EXPERIMENT_PROTOCOL.md) — per-experiment evidence lifecycle;
- [`docs/RESEARCH_COMPASS.md`](docs/RESEARCH_COMPASS.md) — durable macro validation and anti-drift method;
- [`docs/FOUNDATION.md`](docs/FOUNDATION.md) — reusable boundaries already earned by evidence;
- [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md) — concise accepted-state and architectural index;
- [`docs/DONOR_MAP.md`](docs/DONOR_MAP.md) — donor capabilities and project boundaries;
- [`docs/experiments/`](docs/experiments/) — canonical preflights and experiment evidence;
- [`docs/studio/`](docs/studio/) — accepted Studio Product Design, implementation-readiness and handoff records.

## Research rule

ANVIL advances through bounded executable falsifiers. Documentation, green CI, code presence or a convincing integration demo are never physics acceptance by themselves. Negative results that reduce the search space are retained; abstractions are promoted only after evidence earns them.
