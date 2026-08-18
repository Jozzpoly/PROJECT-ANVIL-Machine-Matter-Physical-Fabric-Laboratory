# PROJECT ANVIL

**Machine Matter / Physical Fabric Laboratory**

PROJECT ANVIL is an experimental R&D laboratory for testing a deliberately unusual idea:

> A machine should be authored as persistent semantic matter and local physical intent, then compiled into disposable runtime representations appropriate to the simulation.

The long-term target is not a catalog of chassis, wheels, engines and joints. The working dream is closer to **painting local properties** — matter, bindings, interfaces and functions — and letting useful machine structure emerge from their composition. Names such as steel/rubber, stiff/elastic/breakable, bearing/friction surface, torque/sensor/signal are research vocabulary, not a frozen ontology and not direct aliases for Box3D objects.

The current cubic-cell dialect is only a laboratory representation. It is not a commitment that Machine Matter must remain voxel-based.

## Current accepted stack

`main` contains promoted bounded evidence for:

- **ANVIL-00 / COLLAPSE** — persistent matter compiles deterministically into reduced rigid runtime representation;
- **ANVIL-01 / CUT** — bounded runtime topology replacement with source identity and rigid-field motion transfer;
- **ANVIL-02 / BEARING** — a local authored rotational interface derives two rigid islands plus a passive revolute relation;
- **ANVIL-03 / REBIND** — persistent bearing semantics reconstruct on changed disposable bodies after a nearby CUT while moving;
- **ANVIL-04 / LOAD-REBIND** — bounded cold relation reconstruction survives the declared multi-kN load without migrating hidden joint-cache state;
- **ANVIL-05 / TORQUE** — persistent signed active intent acts through BEARING as an equal/opposite torque pair without authored Box3D motor semantics;
- **ANVIL-06 / TORQUE-PATCH** — the same active intent can be authored on a local persistent source face with no authored `bearingId`; locality resolves the bearing and invalid placement fails closed.

These results are deliberately narrow. Passing one fixture does not promote a universal Bond, Relation, FUNCTION, power or control architecture.

## What is being separated

```text
AUTHORED TRUTH
persistent matter / local physical intent
        │ compile
        ▼
COMPILED REPRESENTATION
rigid islands / relations / actions / provenance
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

## Research discipline

ANVIL is not a product roadmap, VAW rewrite, JV port or promise to model every physical domain in one solver. It advances through small executable falsifiers.

Read:

- [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md) — current orchestration state and exact strongest evidence;
- [`docs/RESEARCH_COMPASS.md`](docs/RESEARCH_COMPASS.md) — long-horizon invariants, frontier map and macro validation loop;
- [`docs/EXPERIMENT_PROTOCOL.md`](docs/EXPERIMENT_PROTOCOL.md) — per-experiment evidence lifecycle;
- [`docs/FOUNDATION.md`](docs/FOUNDATION.md) — what has actually earned reuse;
- [`docs/DONOR_MAP.md`](docs/DONOR_MAP.md) — donor capabilities and boundaries.

## Current frontier

ANVIL-06 boundedly addressed the first FUNCTION locality debt: active intent no longer needs to name a persistent bearing component in authored source for the single-bearing fixture.

The largest strategic imbalance is now **BINDINGS**. ANVIL effectively knows rigid adjacency or separation, but has no earned local compliant/elastic binding behavior.

The selected next research direction is therefore **ANVIL-07 / ELASTIC-SEAM**: test the smallest local authored compliant binding that produces bounded relative deformation and restoring behavior without prematurely introducing a generic Bond ontology.

`ACTIVATE` — separating persistent capability from transient command — remains important, but adding control depth immediately after two FUNCTION experiments would leave the physical binding frontier almost untouched.

## Evidence rule

Documentation and green CI are never physics acceptance by themselves. Every experiment states a falsifiable hypothesis, bounded fixture, observable gates, meaningful controls, limitations and required evidence class. Negative results that reduce the search space are retained.
