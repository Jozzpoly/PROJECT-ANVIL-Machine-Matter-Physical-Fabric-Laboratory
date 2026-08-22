# O1-X / MULTI-BEARING COMPOSITION STRESS — EVIDENCE

Status: **SUPPORTED FOR FIXTURE / BREAKOUT EVIDENCE — NOT PRODUCT PROMOTION**

Branch: `experiment/o1x-multi-bearing-composition`

Layered base: frozen O1 Studio candidate `1a2c99e073d40e29cfe46e20a7c61910f6ac0d3b`.

This record covers the two frozen preflights:

- `O1-X-MULTI-BEARING-COMPOSITION-PREFLIGHT.md`;
- `O1-X-LOOP-KINEMATIC-CLOSURE-PREFLIGHT.md`.

No accepted ANVIL-02 / Foundation / Studio READY semantics were changed.

## 1. Simultaneous composition — verdict

**SUPPORTED FOR FIXTURE.**

Canonical measurement run: **ANVIL CI #365**, source head `eb832778378ffbabb7006cfe949c0aef161e377e`.

Complete strict/Node/real-solver suite: **84/84 PASS**. Production build: PASS.

### CHAIN

Authored topology:

`A — B — C`

Two local Z-axis Bearings were lowered through one shared `compileMatter(...blockedFaceConnections[])` result.

Observed:

- body count: `3`;
- relation count: `2`;
- both relations resolved against the same one PhysicalPlan;
- relation order remained deterministic under authored Bearing array reversal.

Real Box3D after 60 steps with intentionally divergent outer-body velocities:

- constrained `bearing:ab` anchor error: `1.4901161193847656e-8 m`;
- constrained `bearing:bc` anchor error: `0 m`;
- max constrained anchor error: `1.4901161193847656e-8 m`;
- no-relation control `bearing:ab`: `0.9999999403953552 m`;
- no-relation control `bearing:bc`: `0.9999990463256836 m`;
- max no-relation control separation: `0.9999999403953552 m`.

The relation/no-relation control is strongly discriminating; this is not incidental proximity.

### LOOP / collective topology

Authored topology:

```text
C — D
|   |
A — B
```

Lower A↔B and upper C↔D seams are both authored Z-axis Bearings.

Accepted single-Bearing donor controls:

- lower seam alone → `ALTERNATE_RIGID_BYPASS`;
- upper seam alone → `ALTERNATE_RIGID_BYPASS`.

Simultaneous composition:

- physical body count: `2`;
- components: `{A,C}` and `{B,D}`;
- lower relation body pair: `body:A ↔ body:B`;
- upper relation body pair: `body:A ↔ body:B`.

### First learned boundary

The following implication is falsified for this local-topology dialect:

> `Bearing A fails in isolation` + `Bearing B fails in isolation` ⇒ `{A+B} cannot form a meaningful decomposition`.

The set of local seams can change rigid connectivity collectively. Multi-Bearing composition is therefore **non-additive at compile/decomposition time**.

This does not invalidate ANVIL-02; its accepted claim remains deliberately one-Bearing-in-isolation.

## 2. LOOP kinematic closure — verdict

**EMERGENT KINEMATIC LOCK SUPPORTED FOR FIXTURE.**

Canonical run: **ANVIL CI #367**, exact source head `b01969410ac7db90fa83e47adb56a438d833f03c`.

Complete strict/Node/real-solver suite: **85/85 PASS**. Production build: PASS.

Both variants use the exact same shared two-body LOOP PhysicalPlan and the same initial relative angular velocity `+2 rad/s` around Z.

### LOWER_ONLY control

Only the lower relation is realized through accepted `BearingPhysics`.

After 120 steps:

- revolute joint angle: `1.710079550743103 rad`;
- anchor error: `1.660211010944925e-5 m`.

The shared physical decomposition itself therefore does not remove the earned revolute freedom.

### BOTH relations

Both lower and upper Bearings are realized simultaneously.

After 120 steps:

- lower anchor error: `7.650059969385465e-6 m`;
- upper anchor error: `6.515461470788876e-6 m`;
- max anchor error: `7.650059969385465e-6 m`;
- relative body rotation: `0 rad`;
- left angular velocity Z: `0.6250155568122864 rad/s`;
- right angular velocity Z: `0.6248641610145569 rad/s`.

The solver remains finite and satisfies both pivots while relative rotation is eliminated. The two bodies co-rotate rather than rotate relative to one another.

### Second learned boundary

Two locally valid interface meanings that individually permit the same relative rotational DOF do **not** necessarily preserve that DOF when composed at distinct spatial pivots.

For this fixture:

> local revolute freedom + local revolute freedom → globally locked relative rotation.

Therefore a future ANVIL composition model cannot safely infer global capability by naively unioning the nominal freedoms of independently lowered local relations. Spatial arrangement and the complete constraint topology can create stricter emergent behavior.

## 3. What this evidence does and does not buy

Supported for these fixtures:

- many local Bearing seams can participate in one shared deterministic Matter decomposition;
- real Box3D can realize a simple two-Bearing open chain accurately;
- collective seam sets can create topology that no constituent seam creates alone;
- multiple locally valid Bearings can globally eliminate a freedom each one permits individually.

Not supported / not claimed:

- Studio multi-Bearing READY;
- arbitrary multi-Bearing mechanisms;
- generic mobility / mechanism analysis;
- stable arbitrary closed constraint loops;
- multi-Torque composition;
- gravity/contact behavior;
- representation-independent interfaces;
- generic Relation / Constraint / Joint ontology;
- ANVIL-11 or Foundation promotion.

## 4. Strategic consequence

The frozen one-Bearing Studio profile remains a useful qualified baseline, but it is no longer a sufficient model for reasoning about the composition frontier.

The first Breakout result shows that **composition itself creates facts**. A future product/runtime boundary will need to distinguish:

- authored local meaning;
- the composed physical decomposition;
- emergent kinematic capability of that composition;
- one selected disposable solver realization.

Do not turn those words into generic permanent architecture from this evidence alone.
