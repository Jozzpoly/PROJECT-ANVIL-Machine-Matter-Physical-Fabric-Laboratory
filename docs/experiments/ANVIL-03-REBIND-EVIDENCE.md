# ANVIL-03 / REBIND — Evidence Log

Status: **C0 + C1 SOLVER SUPPORTED; D0 PRODUCTION BROWSER UNDER TEST; OWNER VERDICT NOT YET REQUESTED**

Canonical preflight: `docs/experiments/ANVIL-03-REBIND-PREFLIGHT.md`.

## C0 — moving nearby CUT + bearing reconstruction

Exact first solver source:

```text
source head      17b3007db667ab10a6146bd0d5dfab37ce4208a0
PR checkout      039461c52423e15ceec666e7426e1079b86edd66
Actions run      32084284445
```

The Node/strict/real-Box3D stage completed successfully before the later Chromium dependency-install step was cancelled by the next experiment commit. The cancellation was caused by Ubuntu mirror/network delay after all C0 solver assertions, build and launcher checks had already passed.

Canonical Node result: **30/30 PASS**.

Observed C0 probe:

```text
source cells                 7
bodies                       2 -> 3
bearing endpoint body        body:a:0 -> body:a:2
pre-CUT bearing gap          0.000021968921954951226 m
immediate rebound gap        0.000021962633651854834 m
A anchor position jump       6.309619393903406e-9 m
B anchor position jump       0 m
A anchor velocity jump       1.6656098946107296e-8 m/s
B anchor velocity jump       0 m/s
linear momentum error        5.881965671548286e-6 kg*m/s
one-step rebound gap         0.00002054741063032056 m
final rebound gap            0.000024937191646834136 m
no-relation control gap      1.0229843861580046 m
final bearing angle          1.2498903274536133 rad
```

Interpretation:

- the runtime body containing the persistent bearing endpoint actually changed, so this is a real rebinding fixture rather than a no-op identity case;
- transaction position/velocity continuity is many orders of magnitude inside the predeclared limits;
- the no-relation control separates by more than 1 m, strongly discriminating a recreated bearing from an easy free-motion false pass;
- the recreated bearing remains freely rotational rather than weld-like.

C0 is **SUPPORTED FOR THE DECLARED MOVING PLANAR FIXTURE**.

## C1 — arbitrary common 3D transform

Declared before execution because C0 begins from the authored/global orientation while the transfer rule uses the full parent quaternion.

Exact source:

```text
source head      22c65e7d58fdac4cf2f6b681789833d9fe683e08
PR checkout      8a3577239f0c0cf2ffa4e6b9a9aea8ab66ace29e
Actions run      32084832593
artifact ID      9306386261
artifact SHA256  fd1ec7416e684f71523bb227898879166959047f105881983a27eb3f4f86a61c
```

Common transform:

```text
rotation      0.91 rad about axis proportional to (0.37, -0.81, 0.44)
translation   (2.4, -1.3, 1.7) m
world axis    (-0.5800899553, -0.4336241820, 0.6895402183)
```

Observed C1 probe:

```text
pre-CUT bearing gap          0.000021900811210208918 m
immediate rebound gap        0.000021960328122009838 m
A anchor position jump       1.3807986118955533e-7 m
B anchor position jump       0 m
A anchor velocity jump       3.797139380597537e-8 m/s
B anchor velocity jump       1.4901161193847656e-8 m/s
linear momentum error        5.8566788618200165e-6 kg*m/s
one-step rebound gap         0.000020498619673763233 m
final rebound gap            0.000025012184787344172 m
no-relation control gap      1.0229825329658968 m
final bearing angle          1.2498835325241089 rad
```

All original tolerances remained unchanged. Full Node result: **31/31 PASS**. Existing production browser regressions: **12/12 PASS**. Full run conclusion: **SUCCESS**.

C1 is **SUPPORTED FOR THE DECLARED COMMON-RIGID-TRANSFORM FIXTURE**.

## Solver interpretation before browser work

C0 and C1 together support the bounded hypothesis that persistent source provenance plus the persistent authored bearing endpoint cells are sufficient to reconstruct the correct relation onto a changed disposable body decomposition while preserving the already-earned rigid motion field.

The evidence does not justify another solver variant merely for repetition. The next independent failure surface is the production browser path and owner-visible transaction.

## D0 — production browser intent

The browser gate must show one synchronized A/B sequence:

```text
BEFORE CUT
left and right are identical: 2 bodies + bearing

CUT
same 7 source cells; bearing-side body is split: 2 -> 3 bodies

AFTER CUT
left:  same source bearing is recreated on the correct new child
right: same post-CUT motion, but the bearing is deliberately not recreated
```

The fixed camera must not follow the bodies or interpolate across the transaction in a way that can hide a jump.

Browser automation must reproduce the declared C0 gates from the production bundle and additionally check readable rendered layout, finite states, no horizontal overflow and no page errors.

Primary human copy should be plain Polish. Technical metrics should be secondary/collapsed. D0 is not an owner acceptance event.

## Explicit non-claims

Current solver evidence does not prove:

- in-place mutation of one persistent populated Box3D world;
- Box3D revolute impulse/warm-start/internal solver-cache migration;
- contact manifold migration;
- cutting through the bearing interface itself;
- multiple relations or closed loops;
- motors, limits, power/control state transfer;
- arbitrary fracture topology;
- generic Relation/Joint/Constraint ontology;
- universal authored frame entities.
