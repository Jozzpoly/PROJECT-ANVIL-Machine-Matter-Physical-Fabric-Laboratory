# ANVIL-04 / LOAD-REBIND — Evidence Log

Status: **C0 + C1 CORE SUPPORTED / D0 PRODUCTION CHROMIUM PENDING**

Canonical preflight: `docs/experiments/ANVIL-04-LOAD-REBIND-PREFLIGHT.md`.

## Research question

Can the accepted ANVIL-03 semantic bearing rebind survive a runtime rebuild while the old bearing is carrying a strong sustained external constraint load, without a gross first-step shock when the old Box3D joint and its internal solver history are discarded?

The experiment deliberately uses a laboratory-only pair of equal and opposite `2500 N` forces applied at the current bearing anchors. This is test instrumentation, not authored FUNCTION/actuation semantics.

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

## Binding capability precheck

Exact pinned `box3d.js@0.0.2` exposes the two real-solver capabilities required by this experiment:

- `b3Body_ApplyForce`;
- `b3Joint_GetConstraintForce`.

The capability precheck passed before C0 implementation. No synthetic substitute is used.

## C0 — loaded equilibrium

Exact supported checkpoint:

```text
source head      7de3f8e45f49a209a110db8692b70c3a26ad1a26
PR checkout      422a92637bfa9ef710b6f0544053508bb3c4c381
Actions run      32134396736
Node suite       33/33 PASS
```

Observed C0 probe:

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

Observed C1 probe:

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

C1 passed the same bounded continuity intent while the mechanism was genuinely moving and the old relation was carrying approximately 2.55 kN. The reconstructed joint produced approximately 2.53 kN on its first solver step and did not freeze into a hidden weld.

## Supported interpretation so far

C0 + C1 support the bounded claim that, for these force-pair fixtures, persistent source semantics plus rigid-motion transfer are sufficient to cold-reconstruct the revolute relation under a sustained multi-kN external constraint load without requiring migration of Box3D's internal joint warm-start/cache state.

This is evidence that **joint-cache migration is not required for these bounded cases**. It is not evidence that such migration is universally unnecessary.

The no-bearing controls separate by more than `16 m`, giving strong causal discrimination: the loaded constrained result is not explained by coincident free motion.

## D0 — production browser boundary

A technical production-browser probe now exists at:

`/?experiment=load-rebind`

It executes the moving C1 fixture using the production bundle and publishes raw metrics plus fail-closed gates. A dedicated Playwright test independently re-checks those raw values instead of trusting the page's own PASS label.

At the time of this evidence record, the browser observer has been added but **real Chromium D0 has not yet been executed**, because PR #9 remains Draft under the lean evidence workflow.

D0 becomes supported only after the same Ready head passes the candidate job in real Chromium.

## Owner validation decision

No owner gate is planned for ANVIL-04 unless D0 reveals a genuinely visual ambiguity.

The unresolved ANVIL-04 claim is quantitative: actual constraint force, first-step anchor gap/relative velocity, finite state and causal control separation. Manual repetition would not add a new evidence class beyond the already owner-accepted REBIND visual semantics.

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
