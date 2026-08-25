# Recovery R1 — Owner Authority Result

Status: **R1 CORE QUALIFIED / FROZEN FOR NEXT-STAGE DESIGN**

Branch: `recovery/r1-owner-authority-core`
Base: sealed `main@a87f33f6adcefddf9356d09301299591cb362568`
Recovery donor checkpoint: `7b1df1a8fc5eb09848935a56b7cb91df023179c7`
Qualified implementation/evidence head before this seal: `2dae697ff5d9b19636207ffb996ea02df23f37d3`
CI: ANVIL CI #418 — PASS.

## Verdict

R1 replaces broad `Freedom First` semantics with the narrower **Owner Authority** contract:

> Owner decides. ANVIL interprets. Runtime attempts. Evidence reports.

R1 is accepted as a recovery-core semantics checkpoint. It is **not** a product/UI acceptance and must not be merged to `main` by momentum.

## Demonstrated behavior

- default Bearing deletion removes only the named Bearing;
- default Matter deletion removes only the named Matter cell;
- orphan Bearing/Torque intent remains authored rather than being silently cleaned up;
- orphan/local failure becomes local diagnostics and does not globally prevent a useful Box3D realization;
- explicit `removeBearingWithDependents` / `removeMatterWithDependents` provide separately named cascade operations;
- rebind and retarget preserve authored Bearing/Torque identity;
- Undo/Redo restores exact authored transaction checkpoints;
- conflicting Bearings on one seam are all preserved and none is selected on the Owner's behalf;
- duplicate Bearing IDs are all omitted from runtime rather than choosing an instance;
- duplicate TorquePatch IDs are all omitted from runtime rather than applying ambiguous provenance;
- `MATTER_ONLY` remains a runnable runtime observation;
- PARTIAL worlds create real Box3D bodies/joints/actions for the realizable subset;
- the long authority cycle demonstrates orphan -> PARTIAL runtime -> rebind/retarget same IDs -> COMPLETE runtime -> exact Undo/Redo;
- multi-Bearing + multi-Torque unified runtime evidence remains intact;
- Runtime Hand remains physical solver interaction and runtime motion does not write back to source;
- fresh runtime forgets transient pose/Hand/forces state.

## Scope audit

Delta from recovery donor `7b1df1a...` to qualified R1 implementation `2dae697...`:
- 8 commits;
- authority contract/docs;
- source authoring semantics;
- 9-line best-effort lowering correction for duplicate Torque identity;
- semantic and Box3D falsifiers.

No R1 delta to:
- `runtime.ts` physics implementation;
- Runtime Hand implementation;
- compiler/Foundation;
- accepted ANVIL-00...10 science;
- owner-facing app/view/CSS.

The RED owner-facing prototype from PR #40 is intentionally absent.

## Superseded fronts

- PR #39: closed unmerged, technical donor / rejected product policy.
- PR #40: closed unmerged, forensic first recovery / superseded by R1.
- PR #41: the sole active R1 evidence front at this seal.

Branches, commits and CI remain preserved; nothing was deleted from history.

## What R1 does not prove

R1 does not prove final interaction grammar, visual representation, discoverability, subjective creative pull, arbitrary mechanism composition, gravity/ground design, final Machine Matter ontology, or a shippable Studio.

No Owner package should be produced from R1 alone.

## Next-stage boundary

The next stage may design/implement a world-first interaction layer only after re-grounding on:

1. `R1-OWNER-AUTHORITY-SEMANTICS.md`;
2. this R1 result;
3. the accepted science/source-runtime invariants.

It must not reintroduce classifier permission, automatic destructive cleanup, hidden starter meaning, or modal repair workflows for convenience.