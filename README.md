# PROJECT ANVIL

**Machine Matter / Physical Fabric Laboratory**

PROJECT ANVIL is an experimental R&D laboratory for testing a deliberately unusual idea:

> A machine should be authored as persistent semantic matter and local physical intent, then compiled into disposable runtime representations appropriate to the simulation.

The long-term target is not a catalog of chassis, wheels, engines and joints. The working dream is closer to **painting local properties** — matter, bindings, interfaces and functions — and letting useful machine structure emerge from their composition. Names such as steel/rubber, stiff/elastic/breakable, bearing/friction surface, torque/sensor/signal are research vocabulary, not a frozen ontology and not direct aliases for Box3D objects.

The current cubic-cell dialect is only a laboratory representation. It is not a commitment that Machine Matter must remain voxel-based.

## Current accepted stack

`main` contains the latest promoted bounded evidence:

- **ANVIL-00 / COLLAPSE** — persistent matter compiles deterministically into reduced rigid runtime representation;
- **ANVIL-01 / CUT** — bounded runtime topology replacement with source identity and rigid-field motion transfer;
- **ANVIL-02 / BEARING** — a local authored rotational interface derives two rigid islands plus a passive revolute relation;
- **ANVIL-03 / REBIND** — the same persistent bearing can be reconstructed on changed disposable runtime bodies after a nearby CUT while moving;
- **ANVIL-04 / LOAD-REBIND** — bounded cold bearing reconstruction survives the declared multi-kN external load without migrating hidden joint-cache state;
- **ANVIL-05 / TORQUE** — persistent signed active intent can act through BEARING as an equal/opposite torque pair without encoding Box3D joint motor mode in authored source.

These results are deliberately narrow. Passing one fixture does not promote a universal Bond, Relation, FUNCTION, power or control architecture.

## What is actually being tested

The project separates four domains:

```text
AUTHORED TRUTH
persistent semantic matter / local intent
        │
        │ compile
        ▼
COMPILED REPRESENTATION
rigid islands / relations / actions / provenance
        │
        │ lower
        ▼
RUNTIME PHYSICS
solver-owned and disposable
        │
        │ observe
        ▼
EVIDENCE
measurements / lineage / owner judgement when needed
```

The important claim is the separation itself: authored identity must not become synonymous with one body, collider, joint, grid resolution or solver.

## Research discipline

ANVIL is not a product roadmap, VAW rewrite, JV port or promise to model every physical domain in one solver. It advances through small executable falsifiers.

Read:

- [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md) — current orchestration state and exact strongest evidence;
- [`docs/RESEARCH_COMPASS.md`](docs/RESEARCH_COMPASS.md) — long-horizon vision invariants, frontier map and macro critical-validation loop;
- [`docs/EXPERIMENT_PROTOCOL.md`](docs/EXPERIMENT_PROTOCOL.md) — per-experiment evidence lifecycle;
- [`docs/FOUNDATION.md`](docs/FOUNDATION.md) — what has actually earned reuse;
- [`docs/DONOR_MAP.md`](docs/DONOR_MAP.md) — donor capabilities and boundaries.

## Current frontier

ANVIL-05 is the first bounded active result, but it exposed an important semantic debt: its authored `TorqueMark` still references persistent `bearingId` directly.

That is not a runtime-ID leak, but it can become a path back toward a conventional component graph. Before adding control systems, the next research step attacks this risk directly:

**ANVIL-06 / TORQUE-PATCH** — test whether active torque can be authored as a local property on source matter/interface and deterministically discover the bearing through locality/topology, with no authored bearing reference and fail-closed invalid placement.

This is intentionally a semantic-composition experiment, not a new solver-actuator experiment.

## Evidence rule

Documentation and green CI are never physics acceptance by themselves. Every experiment states a falsifiable hypothesis, bounded fixture, observable gates, meaningful controls, limitations and evidence class. Negative results that reduce the search space are retained.
