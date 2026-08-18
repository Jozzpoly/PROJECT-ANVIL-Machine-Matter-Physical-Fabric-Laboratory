# ANVIL-03 / REBIND — Owner Gate

Status: **OWNER ACCEPTED — 2026-08-18**

This file records the exact human-validation event for ANVIL-03. It does not redefine the automated evidence or broaden the research claim.

## Exact owner-tested candidate

```text
repository        Jozzpoly/PROJECT-ANVIL-Machine-Matter-Physical-Fabric-Laboratory
branch            experiment/anvil-03-rebind
source head       e03e227df073ec45946f9e83a9716ca6d7fe8af3
PR synthetic      72ea1e01c3d5b5fe268933449c5d4a48a1aad3f3
Actions run       32085543984 attempt 1
artifact          anvil-browser-laboratory
artifact ID       9306595449
artifact SHA256   98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44
Forge schema      anvil-forge-owner-gate/v2
Forge revision    v0.2.1-human-owner-copy
entry path        /?experiment=rebind
```

Live GitHub cross-check after owner handoff confirmed:

- PR #7 still pointed to source head `e03e227d...` and synthetic checkout `72ea1e01...`;
- `main` was still exactly `36d363d5c828fa8f1bf96f183bd7393573dec216`, the base used by that synthetic checkout;
- Actions run `32085543984` was `completed / success`, attempt 1, for source head `e03e227d...`;
- every workflow stage completed successfully, including strict tests, production build, launcher, Chromium evidence and artifact upload;
- artifact `9306595449` belonged to that run and source head;
- GitHub's artifact digest was exactly `sha256:98ae32912516cb8287c02bf12aa669b57628f7ef7e47be9f647d05791918ad44`.

The Forge report therefore passed the required external provenance handshake.

## Owner observation

Owner verdict: **ACCEPT**

Observed REBIND runs: **14**

Owner environment:

```text
Windows 10
Chrome 151
viewport 1920 x 911 @ DPR 1
```

Owner's direct behavioral observation, paraphrased faithfully:

- after the split, the left example keeps the green connection attached to the correct new piece;
- the connected structures remain held together around that green bearing marker;
- the right control deliberately lacks the rebuilt relation and its red points separate visibly;
- the red distance line makes the control separation obvious;
- the observed behavior matched the plain-language instruction shown by Forge.

Owner notes from the generated report:

> Tak, jest dokładnie tak jak opisałeś, po prawej czerwona linia się rozjeżdża, a po lewej zielone kółko trzyma ze sobą bryły.

The owner also supplied a 1919x896 screenshot in the project conversation. It visibly shows the accepted terminal state: the left green bearing marker remains coincident while the right red control markers are separated by about 1.023 m; `TEST: OK` is visible and `DZIAŁA` is selected. The screenshot itself remains conversation evidence and is not stored in this repository.

## Automated values shown in the accepted report

```text
automated evidence             PASS
automated gates                11/11 PASS
source cells                   7 -> 7
runtime bodies                 2 -> 3
source bearing                 1 -> 1
endpoint runtime body          body:a:0 -> body:a:2
max anchor position jump       0.000006 mm
max anchor velocity jump       1.666e-8 m/s
linear momentum error          5.882e-6 kg*m/s
final bearing gap              0.025 mm
no-relation control gap        1.023 m
relative bearing angle         1.250 rad
```

The owner verdict remains independent of these metrics; manual ACCEPT is based on the observed behavior.

## Did REBIND satisfy its declared requirements?

**Yes — for the bounded claim declared in the preflight.** No physical threshold was loosened after execution.

The declared requirements were covered by independent evidence layers:

1. **Topology/provenance:** source matter remained `7 -> 7`; runtime decomposition changed `2 -> 3`; source bearing identity remained `1 -> 1`; endpoint `a:2` moved from disposable `body:a:0` to `body:a:2`, so the fixture exercised real rebinding rather than a no-op.
2. **Immediate continuity:** reconstructed anchor position and material-point velocity stayed far inside the frozen `0.07 mm` / `0.07 mm/s` limits; total linear-momentum error stayed far inside the frozen `0.75 kg*m/s` limit.
3. **Post-transaction behavior:** the rebuilt bearing remained within the frozen `2.5 mm` gap bound, continued to permit substantial relative rotation and remained finite after solver continuation.
4. **Causal control:** the otherwise-identical no-relation control separated by about `1.023 m`, far above the frozen `0.25 m` minimum, showing that the left result is not explained by an easy free-motion fixture.
5. **Spatial falsifier:** the same thresholds passed under the predeclared arbitrary common 3D rigid transform, so the current transfer/rebinding logic is not accidentally tied to the authored global orientation for this fixture.
6. **Production path:** strict TypeScript, exact real Box3D, production build, launcher self-test and `17/17` Chromium tests passed on the exact owner candidate.
7. **Human path:** the owner repeated the real Windows/Chrome test 14 times and accepted the intended A/B behavior.

## Accepted bounded claim

For the declared moving seven-cell fixture, a persistent authored BEARING interface can survive a nearby mass-preserving CUT that changes one side's disposable rigid-body decomposition. Persistent source-cell provenance and persistent bearing endpoint cell IDs are sufficient to resolve the bearing onto the correct new child body. Reconstructing fresh runtime bodies and a fresh Box3D revolute joint preserves the already-earned rigid motion field closely enough to avoid an observable transaction discontinuity in this fixture, keeps the shared pivot coincident within the declared tolerance and retains free relative rotation after the solver resumes.

The result is supported by solver, common-transform, production-browser, negative-control and owner-visible evidence.

## What this does **not** prove

ANVIL-03 does not prove:

- in-place mutation of one persistent populated Box3D world;
- migration of Box3D body/joint handles;
- transfer of revolute warm-start impulse or any internal joint solver cache;
- contact-manifold migration;
- continuity while the relation is under arbitrary external contact/load;
- cutting through the bearing interface itself;
- merges, arbitrary fracture or arbitrary topology transactions;
- multiple interacting relations or closed kinematic loops;
- motor, limit, power or control-state migration;
- a generic Relation/Joint/Constraint ontology;
- universal authored frame entities.

The strongest correct interpretation is **semantic relation continuity across one bounded runtime topology rebuild**, not generic joint-state migration.

## Forge V0.2.1 field result

REBIND is the first real owner field trial of the V0.2.1 communication rule earned from BEARING.

Observed result for this gate:

- `START_ANVIL.cmd` reached the correct REBIND page on Windows;
- the primary copy used plain Polish and ordinary decisions `DZIAŁA / NIE DZIAŁA / NIE WIEM`;
- technical provenance remained available for the agent without being required reading for the owner;
- the owner correctly restated the intended visual distinction and selected `DZIAŁA` after 14 runs;
- the generated technical report retained enough exact identity for a successful external GitHub handshake.

This is a **field pass for Forge V0.2.1 on ANVIL-03**, not evidence that Forge is a finished universal validation framework. Keep earning generality from future ANVIL gates rather than abstracting it prematurely.

## Promotion decision

Owner acceptance unblocks promotion of ANVIL-03 for the bounded claim above. Promotion must preserve `e03e227d...` + artifact `9306595449` + digest `98ae3291...` as the immutable owner-tested identity even though the final documentation commit and merge happen later.
