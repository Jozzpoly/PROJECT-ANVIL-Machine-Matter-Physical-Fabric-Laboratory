# PROJECT ANVIL

**Machine Matter / Physical Fabric Laboratory**

PROJECT ANVIL is an experimental R&D laboratory for testing a specific idea:

> A machine should be authored as persistent semantic matter and physical intent, then compiled into disposable runtime representations appropriate to the simulation.

The project is deliberately not a product roadmap, a VAW rewrite, a JV port, or a promise to simulate every physical domain in one solver. Its job is to falsify the useful parts of the idea with small executable experiments.

## Current research question

Can a high-resolution authored construction retain stable identity while compiling into a much smaller physical representation, without embedding Box3D/runtime identity into the authored model?

The first experiment is **ANVIL-00 / COLLAPSE**.

On the active experiment branch, see [`docs/experiments/ANVIL-00-COLLAPSE.md`](docs/experiments/ANVIL-00-COLLAPSE.md) for the exact hypothesis, fixture, automated evidence and explicit non-claims.

Current automated scope on the experiment branch:

```text
persistent MatterDocument
        ↓
deterministic rigidification
        ↓
mass / COM + compact collision view
        ↓
disposable PhysicalPlan
        ↓
stock Box3D 0.1.0 runtime
```

The one-cell topology edit is currently an **authoring-time recompile**, not runtime fracture.

## Evidence rule

Documentation and green CI are not product or physics acceptance. Each experiment must state its hypothesis, fixture, observable evidence, limits, and verdict. Negative results are retained.

## Repository state

This repository was intentionally initialized empty on 2026-08-17. `main` is reserved for verified checkpoints; active experiments use explicit branches/PRs.
