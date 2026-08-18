# ANVIL-03 / REBIND — Evidence Log

Status: **OWNER ACCEPTED — C0 + C1 + D0 + FORGE OWNER GATE SUPPORTED**

Canonical preflight: `docs/experiments/ANVIL-03-REBIND-PREFLIGHT.md`.
Owner record: `docs/experiments/ANVIL-03-REBIND-OWNER-GATE.md`.

## Research result

REBIND tested whether one persistent authored BEARING interface can remain attached to the correct source matter when a nearby mass-preserving CUT changes the disposable body decomposition of one side while the mechanism is already moving.

Declared fixture:

```text
source matter          7 cells -> same 7 cells
runtime bodies         2 -> 3
source bearing         1 -> 1
bearing endpoint body  body:a:0 -> body:a:2
bearing seam           a:2 x+ <-> b:0 x-
nearby CUT seam        a:0 x+ <-> a:2 x-
```

The endpoint body ID actually changes, so this is a real rebinding transaction rather than a no-op identity case.

## C0 — moving nearby CUT + bearing reconstruction

Exact first solver source:

```text
source head      17b3007db667ab10a6146bd0d5dfab37ce4208a0
PR checkout      039461c52423e15ceec666e7426e1079b86edd66
Actions run      32084284445
```

Canonical Node result: **30/30 PASS**. The later Chromium dependency-install step was cancelled by the next experiment commit after strict/solver/build/launcher had already passed; logs showed Ubuntu mirror delay, not an ANVIL failure.

Observed C0 probe:

```text
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

C0 is **SUPPORTED FOR THE DECLARED MOVING FIXTURE**.

## C1 — arbitrary common 3D transform

C1 was declared before execution because C0 alone did not establish independence from the authored/global orientation.

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

Same frozen tolerances, no transformed-specific loosening. Full Node result: **31/31 PASS**; full workflow: **SUCCESS**.

C1 is **SUPPORTED FOR THE DECLARED COMMON-RIGID-TRANSFORM FIXTURE**.

## D0 — production browser

Exact D0 source:

```text
source head      91c04e18f2c4cfc81dd0982e9d22ba88b9e2b5a0
Actions run      32085235789
artifact ID      9306487552
artifact SHA256  077155228d54055d05075f25e2eb5a710c21b821b5b93d6972d794c3150037e3
```

The production browser implemented the synchronized A/B sequence:

```text
BEFORE CUT
left and right identical

CUT
same 7 source cells; bearing-side body changes 2 -> 3 bodies

AFTER CUT
left:  same source bearing recreated on correct new child
right: identical post-CUT control but relation deliberately not recreated
```

Production browser reproduced the C0 physical metrics and passed rendered layout, no-horizontal-overflow, finite-state and no-page-error gates.

D0 browser result at this checkpoint: **13/13 Chromium PASS**.

## Final Forge owner candidate

Exact owner-tested package:

```text
source head      e03e227df073ec45946f9e83a9716ca6d7fe8af3
PR checkout      72ea1e01c3d5b5fe268933449c5d4a48a1aad3f3
Actions run      32085543984 attempt 1
artifact         anvil-browser-laboratory
artifact ID      9306595449
artifact SHA256  98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
Forge revision   v0.2.1-human-owner-copy
entry            /?experiment=rebind
```

Final exact CI:

- canonical Node `24.16.0` / npm `11.13.0`;
- strict TypeScript PASS;
- **31/31** Node / exact real-Box3D tests PASS;
- production build PASS;
- Forge launcher self-test PASS;
- unsafe entry paths rejected;
- **17/17** real Chromium tests PASS;
- artifact upload PASS.

Live GitHub external handshake after owner handoff reconfirmed source head, synthetic checkout, unchanged base `main`, run success, artifact ID and digest.

## Owner gate

Owner verdict: **ACCEPT** after **14 observed REBIND runs** on Windows 10 / Chrome 151 / 1920x911 @ DPR 1.

Owner observation: after CUT, the left green connection stays on the correct new piece and keeps the structures together, while the right no-relation control's red points and distance line visibly separate.

The owner also supplied a screenshot visibly supporting that same terminal A/B distinction. See `ANVIL-03-REBIND-OWNER-GATE.md` for the exact acceptance record.

## Supported interpretation

C0 + C1 + D0 + the owner gate support the bounded hypothesis that persistent source provenance plus persistent authored bearing endpoints are sufficient to reconstruct the correct rotational relation onto a changed disposable body decomposition while preserving the already-earned rigid motion field closely enough for this moving fixture.

The negative control gives the result strong causal discrimination: omitting relation reconstruction produces about `1.023 m` separation instead of the accepted left-side `0.025 mm` final gap.

## Explicit non-claims

REBIND does not prove:

- in-place mutation of one persistent populated Box3D world;
- body/joint-handle migration;
- Box3D revolute warm-start impulse or internal solver-cache migration;
- contact-manifold migration;
- arbitrary external-load/contact continuity through the transaction;
- cutting through the bearing interface itself;
- merges, arbitrary fracture or arbitrary topology;
- multiple relations or closed loops;
- motor/limit/power/control state migration;
- generic Relation/Joint/Constraint ontology;
- universal authored frame entities.

The supported result is **semantic relation continuity across one bounded runtime topology rebuild**, not generic joint-state migration.
