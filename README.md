# PROJECT ANVIL

**Machine Matter / Physical Fabric Laboratory**

PROJECT ANVIL is an experimental R&D laboratory for testing a specific idea:

> A machine should be authored as persistent semantic matter and physical intent, then compiled into disposable runtime representations appropriate to the simulation.

The project is deliberately not a product roadmap, a VAW rewrite, a JV port, or a promise to simulate every physical domain in one solver. Its job is to falsify the useful parts of the idea with small executable experiments.

## First accepted checkpoint

**ANVIL-00 / COLLAPSE** is accepted within its stated fixture/scope.

It demonstrates:

```text
persistent MatterDocument
        ↓
deterministic rigidification
        ↓
mass / COM + independently reduced collision view
        ↓
disposable PhysicalPlan
        ↓
stock Box3D 0.1.0 runtime
```

The experiment passed semantic tests, independent Box3D mass/COM checks, real solver stepping, production Chromium execution and owner manual validation.

The one-cell topology edit remains an **authoring-time recompile**, not runtime fracture. See [`docs/experiments/ANVIL-00-COLLAPSE.md`](docs/experiments/ANVIL-00-COLLAPSE.md) for the exact evidence boundary.

## Laboratory foundation

Only a small set of demonstrated or measurement-neutral concepts is promoted for reuse:

- solver-neutral spatial/runtime state;
- deterministic mass properties for the current box-element dialect;
- source-ID provenance and compiled-entity lineage;
- continuity measurement primitives;
- explicit evidence reports and falsification protocol.

See:

- [`docs/FOUNDATION.md`](docs/FOUNDATION.md) — what is actually promoted and what is deliberately not;
- [`docs/EXPERIMENT_PROTOCOL.md`](docs/EXPERIMENT_PROTOCOL.md) — how future falsifiers are run and judged;
- [`docs/DONOR_MAP.md`](docs/DONOR_MAP.md) — VAW/JURE/JV/JES donor capabilities and boundaries;
- [`docs/experiments/TEMPLATE.md`](docs/experiments/TEMPLATE.md) — experiment record skeleton.

## Next research direction

The next intended falsifier is **ANVIL-01 / CUT**: a moving runtime topology transaction from one compiled rigid island into multiple bodies with measured identity, spatial, velocity, momentum and energy continuity.

The foundation intentionally does **not** implement the transfer policy. CUT must test and earn that behavior.

## Evidence rule

Documentation and green CI are not physics acceptance by themselves. Each experiment must state its hypothesis, fixture, observable evidence, limits and verdict. Negative results are retained.

## Repository state

This repository was intentionally initialized empty on 2026-08-17. `main` is the latest accepted checkpoint; active experiments and foundation promotions use explicit branches/PRs.
