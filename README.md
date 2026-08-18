# PROJECT ANVIL

**Machine Matter / Physical Fabric Laboratory**

PROJECT ANVIL is an experimental R&D laboratory for a deliberately unusual idea:

> Author persistent semantic matter and local physical intent, then compile them into disposable runtime representations appropriate to the simulation.

The long-term target is not a catalog of chassis, wheels, engines and joints. The working direction is closer to **painting local properties/capabilities** — matter, bindings, interfaces and functions — and testing whether useful machine behavior can emerge from their composition.

Research vocabulary such as steel/rubber, stiff/elastic/breakable, bearing/friction surface or torque/sensor/signal is not a frozen ontology and is not a direct alias for Box3D objects. The current cubic-cell source dialect is a laboratory representation, not a commitment that Machine Matter must remain voxel-based.

## Evidence milestones

Accepted bounded experiments currently include:

- **ANVIL-00 / COLLAPSE** — reduced rigid runtime representation from persistent source matter;
- **ANVIL-01 / CUT** — bounded topology replacement with source identity and rigid-field motion transfer;
- **ANVIL-02 / BEARING** — local rotational interface to passive revolute runtime relation;
- **ANVIL-03 / REBIND** — semantic bearing reconstruction after a nearby moving CUT;
- **ANVIL-04 / LOAD-REBIND** — bounded loaded cold relation reconstruction;
- **ANVIL-05 / TORQUE** — signed active intent through a passive bearing without authored solver-motor semantics;
- **ANVIL-06 / TORQUE-PATCH** — local source-face active intent resolving existing BEARING without authored `bearingId`.

Each result is deliberately narrower than a universal material, relation, FUNCTION, power or control architecture.

For the **current live experiment and takeover state**, do not use this README as a roadmap. Start with:

- [`.anvil/project-state.json`](.anvil/project-state.json) — compact machine-readable checkpoint claim;
- [`docs/CURRENT_HANDOFF.md`](docs/CURRENT_HANDOFF.md) — cold-takeover instructions.

Verify both against live Git before material work.

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

## Project documents

- [`AGENTS.md`](AGENTS.md) — agent rules, truth hierarchy, document ownership and takeover discipline;
- [`docs/EXPERIMENT_PROTOCOL.md`](docs/EXPERIMENT_PROTOCOL.md) — per-experiment evidence lifecycle;
- [`docs/RESEARCH_COMPASS.md`](docs/RESEARCH_COMPASS.md) — durable macro validation and anti-drift method;
- [`docs/FOUNDATION.md`](docs/FOUNDATION.md) — reusable boundaries already earned by evidence;
- [`AI_PROJECT_MEMORY.md`](AI_PROJECT_MEMORY.md) — concise accepted-state and architectural index;
- [`docs/DONOR_MAP.md`](docs/DONOR_MAP.md) — donor capabilities and project boundaries;
- [`docs/experiments/`](docs/experiments/) — canonical preflights and experiment evidence.

## Research rule

ANVIL advances through bounded executable falsifiers. Documentation, green CI or code presence are never physics acceptance by themselves. Negative results that reduce the search space are retained; abstractions are promoted only after evidence earns them.
