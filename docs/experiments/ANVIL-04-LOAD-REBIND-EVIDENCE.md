# ANVIL-04 / LOAD-REBIND — Evidence Log

Status: **C0 + C1 + D0 SUPPORTED / PROMOTED**

Canonical preflight: `docs/experiments/ANVIL-04-LOAD-REBIND-PREFLIGHT.md`.

## Research question

Can the accepted ANVIL-03 semantic bearing rebind survive a runtime rebuild while the old bearing is carrying a strong sustained external constraint load, without a gross first-step shock when the old Box3D joint and its internal solver history are discarded?

The experiment uses a laboratory-only pair of equal and opposite `2500 N` forces applied at the current bearing anchors. This is test instrumentation, not authored FUNCTION/actuation semantics.

Common bounded fixture:

```text
source cells            7 -> same 7
runtime bodies          2 -> 3
source bearing          1 -> 1
bearing endpoint body   body:a:0 -> body:a:2
bearing seam            a:2@x+ <-> b:0@x-
nearby CUT              a:0 <-> a:2
runtime bodies          all dynamic
gravity                 zero
contacts                disabled
external preload        2500 N equal/opposite at bearing anchors
```

## Binding capability

Exact pinned `box3d.js@0.0.2` exposes the two real-solver capabilities required by the experiment:

- `b3Body_ApplyForce`;
- `b3Joint_GetConstraintForce`.

The capability precheck passed before C0 implementation. No synthetic force substitute is used.

## C0 — loaded equilibrium

Exact supported checkpoint:

```text
source head      7de3f8e45f49a209a110db8692b70c3a26ad1a26
PR checkout      422a92637bfa9ef710b6f0544053508bb3c4c381
Actions run      32134396736
Node suite       33/33 PASS
```

Observed C0:

```text
commanded preload                  2500 N
old-joint constraint force         2500.000244140625 N
preload bearing gap                0.00013287970064526582 m
preload max COM speed              0.0000021148692958831123 m/s
preload max angular speed          0.000006746955023229631 rad/s
immediate rebound gap              0.00013289009735995648 m
max anchor position jump           1.513998814730904e-8 m
max anchor velocity jump           1.1368683772224934e-13 m/s
first-step gap                     0.00019730550530758903 m
first-step anchor velocity gap     2.838967705982946e-10 m/s
first-step max body speed          0.000005439194958098105 m/s
fresh-joint constraint force       2499.9951177753455 N
final constrained gap              0.00022967010838635617 m
no-relation control gap            17.350001479584105 m
```

C0 passed all predeclared gates. The fresh relation immediately recovered essentially the same 2.5 kN constraint load without a gross first-step velocity or position kick.

C0 alone was not treated as sufficient because it begins in an almost exact equilibrium at the constrained anchor.

## C1 — moving + loaded rebind

C1 was declared after C0 but before its first execution. It combines the accepted ANVIL-03 moving rigid-field fixture with the same 2.5 kN preload.

Exact supported checkpoint:

```text
source head      91adf0bb266663bd30ed59637256fe92deb55750
PR checkout      127c5e4489191cc44c52cc4c7878cb6304c8b552
Actions run      32134746006
Node suite       34/34 PASS
```

Observed C1:

```text
commanded preload                  2500 N
old-joint constraint force         2551.616827479971 N
preload bearing gap                0.0001763423239173839 m
preload relative angular speed     1.2114612460136414 rad/s
immediate rebound gap              0.00017634832855923489 m
max anchor position jump           7.243845060872667e-9 m
max anchor velocity jump           1.6137700352453327e-8 m/s
first-step gap                     0.00024550836023042494 m
first-step anchor velocity gap     6.128157470238641e-8 m/s
fresh-joint constraint force       2527.2392934796676 N
final constrained gap              0.0003379116587781509 m
final relative angular speed       0.2702902555465698 rad/s
no-relation control gap            16.331536932971133 m
```

C1 passed while the mechanism was genuinely moving and the old relation was carrying approximately 2.55 kN. The reconstructed joint produced approximately 2.53 kN on its first solver step and did not freeze into a hidden weld.

## D0 — production Chromium

ANVIL-04 deliberately used automated Class D evidence rather than an owner gate. The unresolved claim was quantitative and directly observable in the real runtime; another manual left-connected/right-separated test would have duplicated owner-accepted REBIND visual evidence.

Frozen promoted candidate:

```text
source head       88844f874ba64932418331c3c0a996a33490d85a
base main         eb5928994a2d04d039f8613b63275f349ba3a2a3
synthetic merge   ad8ea844eeb165af9fa95ac3a27d8da5b6168b7d
synthetic tree    e5a311462772c29c26074d9d92ec9041ef5db94e
Actions run       32135764502
Node suite        34/34 PASS
Chromium suite    18/18 PASS
```

Lean candidate handoff:

```text
staging artifact ID      9323900170
staging SHA256            e219ddf67620ff3acb191bfc159fbe633c50d3e44d1c3f999bf33a7c34ad06a2
final artifact ID        9323943419
final artifact SHA256    dd4e3c36554a41606825b66f9e7977945e90e65f8fce1fb5d8d23753226711ba
```

The candidate job downloaded the exact staging artifact produced by core before running launcher and Chromium evidence. It did not rebuild a parallel candidate.

Production route:

`/?experiment=load-rebind`

The in-page probe ran C1 through the production bundle and published fail-closed raw metrics. A separate Playwright observer independently parsed those values and re-applied the important thresholds instead of trusting the page's PASS state.

Observed D0 Chromium metrics exactly matched C1:

```text
preload force                       2551.616827479971 N
preload gap                         0.0001763423239173839 m
preload relative angular speed      1.2114612460136414 rad/s
max immediate position jump         7.243845060872667e-9 m
max immediate velocity jump         1.6137700352453327e-8 m/s
first-step gap                      0.00024550836023042494 m
first-step anchor velocity gap      6.128157470238641e-8 m/s
first-step constraint force         2527.2392934796676 N
final constrained gap               0.0003379116587781509 m
no-relation control gap             16.331536932971133 m
final relative angular speed        0.2702902555465698 rad/s
```

D0 result: **SUPPORTED**.

## Promotion identity

PR #9 was merged with expected-head protection after confirming the Ready head and base remained unchanged.

```text
promoted source head   88844f874ba64932418331c3c0a996a33490d85a
actual merge           2dfac4c79e7c12be2795e87bb5d51c12fc29e231
actual merge tree      e5a311462772c29c26074d9d92ec9041ef5db94e
```

The actual merge tree is identical to the synthetic merge tree that passed the Ready candidate gate.

## Supported interpretation

C0 + C1 + D0 support the bounded claim that, for these force-pair fixtures, persistent source semantics plus rigid-motion transfer are sufficient to cold-reconstruct the revolute relation under a sustained multi-kN external constraint load without migrating Box3D's internal joint warm-start/cache state.

This is evidence that **joint-cache migration is not required for these bounded cases**. It is not evidence that such migration is universally unnecessary.

The strong no-bearing controls provide causal discrimination: without relation reconstruction the same loaded post-CUT state separates by more than `16 m`.

The result strengthens ANVIL's disposable-runtime premise: a runtime joint can be discarded and rebuilt from persistent semantics and still immediately resume the declared mechanical responsibility under load.

## Explicit non-claims

ANVIL-04 does not prove:

- Box3D warm-start/joint-cache migration;
- exact equivalence to uninterrupted solver history;
- contact-manifold continuity or active contact during CUT;
- arbitrary preload magnitude, direction, impact or fatigue;
- multiple relations or closed loops;
- motors, limits, power or FUNCTION semantics;
- cutting through the bearing itself;
- generic Relation/Constraint architecture;
- in-place mutation of one persistent populated Box3D world.

## Next decision boundary

Do not extend ANVIL-04 with arbitrary force levels or extra motion variants.

The remaining contact-loaded combination is a known future risk, but it should only become the next experiment if active contact/manifold continuity is required before the next machine hypothesis. Otherwise the higher-information move is to return to the broader Machine Matter program and test the smallest local authored **FUNCTION / actuation** signal through the already-earned bearing semantics.
