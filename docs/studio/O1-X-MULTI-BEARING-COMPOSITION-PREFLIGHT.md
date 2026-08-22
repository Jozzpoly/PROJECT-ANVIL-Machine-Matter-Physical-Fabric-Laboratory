# O1-X / MULTI-BEARING COMPOSITION STRESS — PREFLIGHT

Status: **FROZEN BEFORE EXECUTION**

Work type: bounded Breakout falsifier after O1 Owner product rejection.

Experiment branch: `experiment/o1x-multi-bearing-composition`

Exact donor base: frozen O1 candidate `1a2c99e073d40e29cfe46e20a7c61910f6ac0d3b`.

This experiment does **not** reopen accepted ANVIL-02 or promote ANVIL-11. It deliberately attacks the first Studio runtime envelope after natural Owner gameplay authored multiple Bearings and exposed the one-bearing qualification boundary as an active product/research constraint.

## 1. Primary question

> Can multiple local persistent Bearing marks be lowered **simultaneously** from one Matter source into one deterministic physical decomposition whose per-Bearing relations remain locally coherent — including a topology in which each seam alone has an alternate rigid bypass but the set of seams collectively changes rigid connectivity?

A useful result may be PASS or RED. The purpose is to learn whether multi-Bearing composition is naturally expressible by the already-earned local seam semantics or whether a deeper composition rule is missing.

## 2. Donor facts held fixed

- `MatterDocument` remains persistent authored truth.
- `BearingMark` remains the current experiment-local authored interface meaning.
- `compileMatter(document, { blockedFaceConnections })` already accepts multiple local blocked face adjacencies.
- accepted `compileBearing()` remains unchanged and continues to mean exactly one Bearing compiled in isolation.
- Box3D revolute joints remain disposable lowering targets, never authored identity.
- no GenericConstraint / GenericRelation / component graph is introduced.

## 3. Fixture A — CHAIN

Authored Matter: three face-adjacent cells in a straight asymmetric-labelled chain:

`A — B — C`

Two Bearings:

- `bearing:ab` on seam A↔B, free axis Z;
- `bearing:bc` on seam B↔C, free axis Z.

Primary intervention: lower both Bearing seams in one `compileMatter` call.

Expected structural evidence:

- exactly 3 rigid bodies;
- exactly 2 compiled Bearing relations;
- each relation resolves its authored endpoints to two distinct current bodies;
- both relations share the **same one** physical plan identity, not two independently compiled plans;
- pivots / axes / local anchors are finite;
- source Bearing IDs survive only as provenance.

### Real-solver discrimination

Create one Box3D world from that shared plan and create both revolute joints.

Initial motion is intentionally divergent: the outer plan bodies receive opposite linear velocities along X while the middle starts at zero.

After 60 fixed steps:

- **relations ON:** maximum world-space anchor separation across both Bearings must be `<= 1e-3 m`;
- **relations OFF control:** using the same plan and initial velocities but creating no joints, maximum corresponding anchor separation must be `>= 0.5 m`;
- all body snapshots remain finite;
- no source object is mutated.

This control prevents "three bodies happened to stay near each other" from being mistaken for joint evidence.

## 4. Fixture B — LOOP / collective topology

Authored Matter: four cells forming a 2×2 face-connected loop:

```text
C — D
|   |
A — B
```

Two horizontal Bearing seams:

- lower seam A↔B;
- upper seam C↔D;
- both use tangent free axis Z.

Frozen control expectations:

1. accepted `compileBearing(lower)` in isolation must fail with the existing alternate-rigid-bypass condition;
2. accepted `compileBearing(upper)` in isolation must fail for the same reason;
3. simultaneous composition with **both seams blocked in the same Matter compile** must produce exactly 2 rigid bodies: left column `{A,C}` and right column `{B,D}`;
4. both Bearing relations must resolve against that one shared two-body plan;
5. the result is evidence that local meaning can be **composition-non-additive**: `A fails alone` and `B fails alone` does not imply `{A+B} fails`.

No real-solver stability PASS is claimed for the LOOP fixture. Two revolute constraints between the same body pair at distinct pivots may intentionally expose overconstraint or a missing higher-level composition rule in a later stress step.

## 5. Implementation boundary

New code must be experiment-local. It may:

- validate multiple `BearingMark`s against current cell adjacency / tangent-axis rules;
- derive one list of blocked face connections;
- call existing `compileMatter()` once;
- construct per-Bearing disposable relation plans from that shared result;
- create an experiment-local Box3D world for Fixture A with zero, one or multiple revolute joints for discrimination.

It must **not**:

- modify `compileBearing()` to make old evidence mean something broader;
- modify Foundation;
- change Studio classifier/READY semantics;
- change PR #35 or its frozen O1 evidence;
- add Torque composition yet;
- add gravity/ground yet;
- create generic joint/action/runtime architecture;
- claim representation independence or final ontology.

## 6. Evidence classes

Required now:

- A — strict/static boundaries;
- B — deterministic synthetic topology/provenance;
- C — real Box3D solver for CHAIN relation-vs-no-relation control.

Not required for this first falsifier:

- D browser/product runtime;
- E Owner validation.

## 7. Verdict vocabulary

- **SUPPORTED FOR FIXTURE** — frozen CHAIN + LOOP structural gates and CHAIN real-solver discrimination pass.
- **REJECTED** — local Bearing marks cannot be coherently composed under these fixtures without contradicting the frozen gates.
- **INCONCLUSIVE** — fixture or instrumentation fails to discriminate composition from incidental behavior.
- **BLOCKED** — required real solver evidence cannot execute.

Even a SUPPORT verdict does **not** mean Studio multi-Bearing runtime is qualified. It only earns the next stress question.
