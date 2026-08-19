# ANVIL-10 / TORQUE-PATCH-REBIND — evidence log

Status: **A + B0/B1/B2 + C0/C1/C2 SUPPORTED / PROMOTED**

Canonical frozen preflight: `docs/experiments/ANVIL-10-TORQUE-PATCH-REBIND-PREFLIGHT.md`  
Frozen preflight source: `d89f001705a8b80da822792ecef24e30af31ac89`

## Research question

Can one unchanged persistent local TORQUE-PATCH survive the accepted nearby CUT semantically so that its disposable action is regenerated against the rebound BEARING, a valid-looking stale pre-CUT action is rejected even though its old body still exists, and explicit post-rebuild activation acts through the correct new body without affecting that stale sibling?

## Micro A/B — relowering + stale-binding rejection

Exact supported source:

```text
source head         4be76be143a93acc13c45842218d5efa4e1dfe4a
base main           b825002141d30cf2190ae3475b94020f261fc8dd
synthetic checkout  03fb24042679a34f89d74a72b7e4b5df15a52dd8
Actions run         32199521910
canonical Node      24.16.0
canonical npm       11.13.0
Node suite          52/52 PASS
production build    PASS
candidate gate      skipped (Draft PR)
```

The implementation delta from the frozen preflight contained only:

- `src/experiments/anvil-10-torque-patch-rebind.ts`;
- `tests/torque-patch-rebind-boundary.test.mjs`;
- test registration in `package.json`.

No accepted ANVIL-03/05/06/09 source or `src/foundation` file changed.

### B0 — accepted before parity

The experiment-local adapter consumes an already-derived `BearingCompilation`; it does not call `compileMatter`, `compileBearing`, `compileTorque` or `compileTorquePatch` internally.

Against `rebind.before`, the relowered result matched accepted ANVIL-06 meaning for:

- source patch ID and target;
- resolved persistent bearing ID;
- complete supplied bearing compilation;
- source torque/bearing identity;
- signed effort;
- disposable body IDs;
- axis and equal/opposite torque vectors.

Net torque-pair magnitude remained within the frozen `1e-12 N*m` bound.

Verdict: **B0 SUPPORTED**.

### B1 — required disposable remap

The accepted REBIND fixture produced:

```text
before bodies             2
after bodies              3
before bearing body A     body:a:0
after bearing body A      body:a:2
persistent bearing        bearing:seam-0 -> same
persistent patch target   a:2@x+ -> same
```

The fresh post-CUT action resolved `bodyAId` to `body:a:2` while preserving persistent source identity, signed `+100 N*m` effort, axis and torque-vector meaning.

The post-CUT physical plan still contains `body:a:0`, so this is not a missing-ID case.

Verdict: **B1 SUPPORTED**.

### B2 — valid-looking stale action fails closed

The test paired the accepted `after` bearing compilation with the pre-CUT action that still names `body:a:0`.

Although `body:a:0` still exists post-CUT, validation rejected the candidate because the current rebound relation requires `body:a:2` for persistent endpoint `a:2`.

A local patch that is not a current bearing endpoint also failed closed before runtime creation.

Verdict: **B2 SUPPORTED**.

## C0-C2 — real Box3D composition

Exact supported source:

```text
source head         a448167642d0fd2435d44b8efc42f972fdac698a
base main           b825002141d30cf2190ae3475b94020f261fc8dd
synthetic checkout  bc511beb5bb6cda9f52b03eead751987345ee7df
Actions run         32199721488
canonical Node      24.16.0
canonical npm       11.13.0
Node suite          53/53 PASS
production build    PASS
candidate gate      skipped (Draft PR)
```

The C0-C2 material delta added only:

- `src/experiments/anvil-10-torque-patch-rebind-runtime.ts`;
- `tests/torque-patch-rebind-runtime.test.mjs`;
- runtime-test registration in `package.json`.

The post-CUT runtime is experiment-local. It consumes the correctly relowered `after` compilation plus accepted `transferRebindMotion()` state, creates one passive fresh revolute relation, starts OFF through accepted `ActivateControlState`, and conditionally applies the fresh equal/opposite action with `b3Body_ApplyTorque`.

No accepted ANVIL-03/05/06/09 semantics or foundation source changed.

### C0 — passive moving reconstruction continuity

The pre-CUT world used the accepted untransformed REBIND moving fixture for 31 steps with no active torque. Two fresh post-CUT ANVIL-10 worlds were then created from the same transferred state and same relowered action compilation, both default OFF.

Observed transaction metrics:

```text
pre-CUT bearing gap                    0.000021968921954951226 m
immediate rebound gap                  0.000021962633651854834 m
A anchor position jump                 6.309619393903406e-9 m
B anchor position jump                 0 m
A anchor velocity jump                 1.6656098946107296e-8 m/s
B anchor velocity jump                 0 m/s
immediate linear-momentum error        5.881965671548286e-6 kg*m/s
post-CUT bodies                        3
post-CUT passive revolute relations    1
fresh activation                       OFF / OFF
```

All frozen continuity limits passed by large margin. Contacts were disabled, linear/angular body damping read back zero and sleep read back disabled.

Verdict: **C0 SUPPORTED**.

### C1 — post-CUT ON/OFF causal discrimination

From the identical fresh post-CUT state:

```text
ACTIVE    explicit ON    30 steps
CONTROL   remains OFF    30 steps
```

Observed:

```text
ACTIVE final relative speed            6.743629574775696 rad/s
CONTROL final relative speed           0.7880277335643768 rad/s
ACTIVE speed advantage                 5.955601841211319 rad/s
frozen minimum advantage               0.25 rad/s

ACTIVE bearing gap                     0.0002873246760864253 m
CONTROL bearing gap                    0.000017258970778704764 m
ACTIVE/CONTROL momentum-vector delta   0.0002609891995630394 kg*m/s
complete barycenter separation         2.939816288405678e-7 m
```

The frozen comparative discriminator is exceeded by more than an order of magnitude while both worlds remain inside bearing/isolation limits.

No absolute relative-speed conservation assumption was introduced.

Verdict: **C1 SUPPORTED**.

### C2 — stale sibling remains physically uninvolved

The post-CUT `body:a:0` still exists but no longer contains persistent bearing endpoint `a:2`.

After the same ACTIVE/OFF branch interval:

```text
stale sibling angular-velocity delta   0 rad/s
stale sibling linear-velocity delta    0 m/s
frozen limits                          1e-6 / 1e-6
```

The active world therefore did not accidentally apply the remapped action to the valid-looking stale sibling.

Verdict: **C2 SUPPORTED**.

## Research stop rule

The frozen A + B0/B1/B2 + C0/C1/C2 gates all passed. ANVIL-10 research stopped at that boundary. No command-migration, active-during-CUT, load/contact, arbitrary-transform, multiple-patch/bearing, compliance or UI variant was added.

## Ready exact-integration candidate

The PR was marked Ready only after the bounded research stop rule was reached.

```text
Ready source             c173a6d336f3917bbd8ef74e1fb2f2118ffc6d20
Ready run                32199826901
Ready base               b825002141d30cf2190ae3475b94020f261fc8dd
Ready synthetic merge    94015244dc854ff03210eaa9fc6b459ac61ceb9d
qualified tree           6cbfede282e2d9243634d5d73d0c2dfd74df269f
```

Ready core:

```text
canonical Node           24.16.0
canonical npm            11.13.0
Node suite               53/53 PASS
production build         PASS
staging artifact         9347082469
staging size             424993 bytes
staging SHA256           5de7bf8f97dedab7f47235ff6bd582196551d583aa467c14aa1b5bd0809874ba
```

The candidate job checked out the exact same synthetic merge, downloaded that exact staging artifact and verified the same digest before further regression validation.

Candidate regression gate:

```text
Windows launcher self-test     PASS
Chromium regression            19/19 PASS
final artifact                 9347109470
final size                     424993 bytes
final SHA256                   a1467ac5fdf67671606777fefe26d06c67e92c5977b5488d140b62eab49af5ff
```

The launcher and Chromium checks are **whole-product regression evidence only**. They are not direct ANVIL-10 Class C/D evidence because ANVIL-10 introduced no browser-specific scientific uncertainty or dedicated product route.

## Promotion identity

PR #15 was merged with expected-head protection after reconfirming live `main`, Ready head and mergeability.

```text
actual material merge    ffde8c0babdd473454b3e769cb10fd31537a0c70
actual merge tree        6cbfede282e2d9243634d5d73d0c2dfd74df269f
```

The actual material merge tree is **exactly identical** to the Ready-qualified synthetic tree.

## Supported interpretation

A + B + C evidence plus exact integration qualification support this bounded interpretation for the frozen single-bearing moving fixture:

> One unchanged persistent local TORQUE-PATCH can be relowered onto a changed disposable body decomposition by resolving the same persistent BEARING after CUT; the old pre-CUT action is rejected as stale even when its old body ID remains valid, and the fresh post-CUT action produces strong causal ON-vs-OFF torque response through the correct new endpoint body without acting on the stale sibling.

This is evidence for persistent local active meaning surviving one bounded runtime topology rebuild through **re-lowering**, not for persistence or migration of compiled actions themselves.

## Explicit non-claims

ANVIL-10 does not prove:

- generic FUNCTION or Device ontology;
- generic action-cache invalidation/versioning architecture;
- transient activation-state migration/restoration through rebuild;
- torque active during the reconstruction transaction;
- loaded/contact actuation through CUT;
- command routing, ports, signals, buses or controllers;
- reverse/analog command or bidirectional actuator capacity;
- power/energy/storage semantics;
- multiple bearings, multiple patches or mechanism graphs;
- arbitrary-transform / arbitrary-axis active covariance;
- body/joint handle or warm-start migration;
- function through compliant/deformable matter;
- alternate authored representation/resolution invariance;
- in-place mutation of one populated Box3D world;
- promotion of TORQUE-PATCH/FUNCTION/ACTIVATE/REBIND into foundation.
