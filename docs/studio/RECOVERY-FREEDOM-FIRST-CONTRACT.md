# ANVIL Studio Recovery — Freedom First Contract

Status: **SUPERSEDED FOR NEW RECOVERY WORK**.

This document records the first recovery pivot that rejected classifier-gated permission semantics. It remains useful historical evidence, but its broad `Freedom First` framing was found insufficient because it could still justify ANVIL making destructive decisions on the Owner's behalf.

The active recovery contract is now:

`docs/studio/R1-OWNER-AUTHORITY-SEMANTICS.md`

The corrected governing rule is:

> **Owner decides. ANVIL interprets. Runtime attempts. Evidence reports.**

Historical lessons retained from this contract:

- evidence classifications must not become permission gates;
- useful partial physical realization is preferable to globally blocking the world;
- local failure should remain local;
- runtime is disposable and must not write pose back into authored source;
- world-first/direct manipulation remains the product direction;
- the Owner may deliberately create unsupported, contradictory, overloaded, or solver-hostile experiments.

Correction introduced by R1:

- default deletion is exact, not automatic cascade;
- orphaned authored intent may remain and be diagnosed locally;
- cascade deletion requires an explicit separate Owner command;
- ANVIL must not choose between conflicting authored intents on the Owner's behalf;
- rebind/retarget preserves authored identity.

Do not use this superseded file as the active implementation contract.