# ANVIL-10 / TORQUE-PATCH-REBIND — evidence log

Status: **MICRO A/B SUPPORTED / C0-C2 NOT YET EXECUTED**

Canonical frozen preflight: `docs/experiments/ANVIL-10-TORQUE-PATCH-REBIND-PREFLIGHT.md`  
Frozen preflight source: `d89f001705a8b80da822792ecef24e30af31ac89`

## Evidence boundary

This record currently supports only the static/pure semantic relowering boundary. It does **not** yet support the real-solver reconstruction or post-CUT actuation claim.

## Micro A/B — relowering + stale-binding rejection

Exact proposal source:

```text
source head       4be76be143a93acc13c45842218d5efa4e1dfe4a
base main         b825002141d30cf2190ae3475b94020f261fc8dd
synthetic checkout 03fb24042679a34f89d74a72b7e4b5df15a52dd8
Actions run       32199521910
canonical Node    24.16.0
canonical npm     11.13.0
Node suite        52/52 PASS
production build  PASS
candidate gate    skipped (Draft PR)
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

The accepted REBIND fixture produced the frozen topology facts:

```text
before bodies             2
after bodies              3
before bearing body A     body:a:0
after bearing body A      body:a:2
persistent bearing        bearing:seam-0 -> same
persistent patch target   a:2@x+ -> same
```

The fresh post-CUT action resolved `bodyAId` to `body:a:2` while preserving persistent source identity, effort, axis and torque-vector meaning.

The post-CUT physical plan still contains `body:a:0`, so this is not a missing-ID case.

Verdict: **B1 SUPPORTED**.

### B2 — valid-looking stale action fails closed

The test deliberately paired the accepted `after` bearing compilation with the pre-CUT action that still names `body:a:0`.

Although `body:a:0` still exists in the post-CUT physical plan, the validator rejected the candidate because the current rebound relation requires `body:a:2` for persistent endpoint `a:2`.

This demonstrates the intended discriminator:

> runtime/body existence is insufficient for semantic action validity; the disposable action must agree with the current persistent relation/provenance binding.

Verdict: **B2 SUPPORTED**.

A local patch that is not a current bearing endpoint also failed closed before runtime creation.

## Checkpoint interpretation

Micro A/B supports only this bounded statement:

> For the frozen single-bearing fixture, one unchanged local TORQUE-PATCH can be relowered against an already-derived pre/post REBIND bearing compilation so that accepted pre-CUT meaning is preserved, the changed endpoint body is remapped deterministically, and a valid-looking stale pre-CUT body binding is rejected before solver creation.

This does not yet prove that a reconstructed moving Box3D runtime remains continuous or that the relowered action produces correct post-CUT causal actuation.

## Next permitted action

Implement the frozen C0/C1/C2 real-solver harness only:

1. use accepted passive `RebindPhysics` for the 31-step pre-CUT moving state;
2. transfer motion with accepted `transferRebindMotion()`;
3. create two fresh experiment-local post-CUT runtimes from the same relowered `after` compilation and transferred state;
4. verify C0 continuity/default-OFF identity before branching;
5. run ACTIVE ON versus CONTROL OFF for 30 steps;
6. evaluate frozen C1 causal and C2 stale-sibling gates.

Do not add transient command migration, active torque during CUT, load/contact, arbitrary-transform, compliance, UI or foundation work.
