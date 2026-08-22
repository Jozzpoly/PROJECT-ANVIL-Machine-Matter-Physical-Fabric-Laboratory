# O1-X / LOOP KINEMATIC CLOSURE — PREFLIGHT

Status: **FROZEN BEFORE EXECUTION**

Depends on the supported first O1-X result: simultaneous lower+upper seams in the 2×2 LOOP produce one shared two-body plan with two Bearing relations between the same body pair.

## Primary question

> When two locally valid parallel-Z Bearing relations connect the same two rigid islands at two distinct pivots, does their simultaneous real-solver realization eliminate the revolute freedom that either relation permits alone?

This asks whether local interface freedoms compose naively or whether global kinematic closure creates a stricter emergent relation.

## Fixture

Reuse the 2×2 LOOP from `O1-X-MULTI-BEARING-COMPOSITION-PREFLIGHT.md`:

```text
C — D
|   |
A — B
```

Both horizontal seams are authored Bearings with free axis Z. The already-supported compositor produces:

- left rigid island `{A,C}`;
- right rigid island `{B,D}`;
- lower and upper revolute relations between that same body pair at distinct pivots.

## Intervention / control

Use the **same composed two-body PhysicalPlan** in both variants.

Initial state:

- left body angular velocity = `0 rad/s`;
- right body angular velocity = `+2 rad/s` around Z;
- zero gravity;
- contacts disabled as in the existing Bearing donor.

Variants:

1. **LOWER_ONLY control** — create only the lower revolute relation;
2. **BOTH** — create both lower and upper revolute relations.

Run 120 fixed 60 Hz steps.

## Frozen gates

LOWER_ONLY must demonstrate that the shared physical plan itself does not suppress the earned revolute freedom:

- lower anchor error `<= 1e-3 m`;
- `abs(lower joint angle) >= 0.25 rad` after 120 steps;
- finite snapshots.

BOTH tests kinematic closure:

- both anchor errors `<= 1e-3 m`;
- all snapshots finite;
- `max(abs(lower angle), abs(upper angle)) <= 0.05 rad` after 120 steps.

Interpretation:

- LOWER_ONLY moves, BOTH remains near zero angle → **EMERGENT KINEMATIC LOCK SUPPORTED**;
- BOTH retains substantial revolute motion while satisfying both distinct pivots → lock hypothesis REJECTED and geometry must be examined;
- BOTH becomes unstable / non-finite / cannot hold anchors → **SOLVER OVERCONSTRAINT RED**, still useful evidence that naive local-joint composition is not a viable realization;
- LOWER_ONLY itself does not rotate → fixture/control INCONCLUSIVE.

## Non-claims

This does not define a generic overconstraint ontology, mechanism solver, mobility analysis, or final rule for multiple Bearings. It only asks what the current local seam semantics become in this bounded closed topology.
