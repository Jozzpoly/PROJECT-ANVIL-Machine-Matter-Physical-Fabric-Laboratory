# PROJECT ANVIL — Workbench W0 Adversarial Review

Status: **ACTIVE — attack the provisional Candidate B before implementation**

This review exists to find reasons not to implement the provisional Workbench design. It does not seek to make Candidate B look complete.

## Attack 1 — “owner chooses when to CUT” silently broadens the dynamic fixture

The provisional W0 design initially treated owner-selected CUT timing while torque is OFF as neutral interaction timing.

That claim is too strong.

ANVIL-03/10 support a bounded moving CUT/REBIND transaction under frozen schedules and state classes. ANVIL-10's accepted active re-lowering test does **not** let an owner drive arbitrary pre-CUT active motion and then CUT from whatever angular pose/velocity happens to result. Its pre-CUT world is the accepted REBIND path with a frozen initial moving state and frozen pre-CUT step count; active-vs-OFF branching occurs after the post-CUT fresh worlds have been reconstructed.

Therefore two tempting Workbench freedoms are not currently justified as mere UI:

1. arbitrary owner-selected CUT time after an arbitrary amount of simulation;
2. active torque ON for an arbitrary duration before CUT, then OFF, then CUT from the resulting state.

Both can move the CUT transaction outside the exact dynamic fixture that earned ANVIL-10.

### Correction

Workbench v0 must not claim arbitrary timing/state robustness.

The first specimen should use a **bounded scripted pre-CUT transaction checkpoint** matching an accepted state path. Owner interaction may control presentation/pause and may initiate the prepared CUT transaction only when the specimen reports **CUT READY** at the frozen checkpoint.

Likewise, the strongest honest first specimen does **not need pre-CUT active torque**. It can start with a moving passive bearing, perform the accepted CUT/REBIND/re-lowering transaction, then let the owner activate the persistent torque capability in the fresh post-CUT runtime.

This narrows the story to:

```text
persistent Matter + BEARING + TORQUE-PATCH meaning exists
        ↓
frozen moving pre-CUT state (torque runtime not active)
        ↓
CUT READY
        ↓ owner initiates the accepted transaction
CUT → motion transfer → BEARING reconstruction → same TORQUE-PATCH re-lowered
        ↓
fresh post-CUT runtime defaults OFF
        ↓ owner chooses ON/OFF
causal torque through rebound endpoint
```

A later specimen may test or demonstrate active-before-CUT composition only after its dynamic boundary is separately justified.

Verdict: **PROVISIONAL DESIGN NARROWED.**

## Attack 2 — “run/pause” can also create unbounded pre-CUT state

A generic run/pause loop before CUT would allow the owner to advance the pre-CUT runtime beyond the frozen transaction state. Even with torque OFF, this changes pose/velocity and can silently turn the Workbench into a broader REBIND robustness claim.

### Correction

Before the CUT transaction, v0 should be a controlled progression to a known **CUT READY** checkpoint, not an indefinitely free-running simulation.

Acceptable owner controls before CUT:

- start/advance the prepared sequence;
- pause/resume presentation of that prepared sequence if the underlying transaction checkpoint remains deterministic;
- reset.

The implementation must not let arbitrary pre-CUT runtime duration determine the state passed into CUT unless a separate validation proves that broader timing class.

After fresh post-CUT reconstruction, bounded ON/OFF observation may run for the same fixed observation window used by the accepted active behavior, or another explicitly frozen integration window that does not become a new scientific claim.

Verdict: **NARROW INTERACTION CONTRACT.**

## Attack 3 — “same TORQUE-PATCH exists before CUT” vs “pre-CUT compiled action exists”

Persistent authored TORQUE-PATCH meaning may exist before CUT, but Workbench must not imply that its compiled `TorqueActionPlan` survives the transaction.

### Correction

The UI/diagnostics should distinguish:

- persistent source TORQUE-PATCH: unchanged;
- any disposable pre-CUT compiled action: not authoritative and not migrated;
- fresh post-CUT compiled action: newly derived from persistent source + current rebound BEARING.

For v0, the cleanest story is to avoid needing a live pre-CUT active action at all. Show the persistent authored torque mark before CUT, then materialize/use the fresh compiled action only after the accepted re-lowering transaction.

Verdict: **PASS AFTER LANGUAGE/STATE CORRECTION.**

## Attack 4 — “three view modes” can accidentally present compiled geometry as scientific truth

AUTHORED / PHYSICAL / BOTH is neutral only if PHYSICAL clearly means **current compiled/runtime interpretation**, not “what the object really is physically.”

### Correction

Preferred language:

- **AUTHORED MATTER**
- **RUNTIME INTERPRETATION**
- **BOTH**

or equally explicit wording.

Do not label the runtime view simply “PHYSICAL TRUTH”.

Verdict: **PASS WITH LANGUAGE GUARD.**

## Attack 5 — owner reality question can be biased by explanatory UI

If the Workbench tells the owner in advance “this is persistent semantic matter and it survives correctly,” the owner gate becomes a comprehension test of our explanation rather than a test of whether the abstraction is naturally legible.

### Correction

Owner evaluation should have two layers:

1. **first-pass observation** with minimal explanation: what does the owner think remains the same and what changed?
2. **technical reveal** after interaction: authored IDs, body decomposition, fresh action provenance, stale sibling.

The verdict should record whether the central distinction was visible before the detailed explanation, not merely understandable after reading it.

Verdict: **OWNER GATE HARDENED.**

## Attack 6 — prepared single CUT can still feel like scripted mechanism

This cannot be solved honestly in W0 by adding arbitrary editing; that would exceed evidence. It must remain a deliberate limitation and an owner outcome discriminator.

### Correction

The UI should visibly mark the single available CUT as **accepted test location / bounded specimen**, not simulate free-form editing.

If the owner verdict is LEGIBLE BUT SCRIPTED, do not count that as failure of implementation. It is exactly the evidence needed to decide whether authorship/locality freedom is the next frontier.

Verdict: **KNOWN LIMITATION RETAINED AS EVIDENCE.**

## Revised Candidate B0

The original “active topology” candidate is narrowed to **B0 — post-rebind activation specimen**.

Frozen conceptual sequence:

```text
AUTHORED:
Matter + one BEARING + one local TORQUE-PATCH

PRE-CUT:
known moving passive state
→ controlled progression to CUT READY

OWNER ACTION:
execute the one accepted nearby CUT transaction

TRANSACTION:
old runtime disposed
motion transferred
body decomposition 2 → 3
same persistent BEARING reconstructed
same persistent TORQUE-PATCH re-lowered
fresh runtime/action starts OFF

POST-CUT OWNER ACTION:
OFF / ON

OBSERVATION:
ON produces causal torque through the rebound endpoint
stale sibling remains uninvolved
```

This still composes ANVIL-00/01/02/03/06/09/10 and uses the accepted active torque behavior inherited through ANVIL-05, while avoiding an unearned arbitrary active-before-CUT dynamic state.

## What B0 no longer claims or allows

- no pre-CUT torque activation;
- no arbitrary pre-CUT run duration;
- no arbitrary CUT timing/state;
- no active-during-CUT;
- no activation migration;
- no arbitrary post-CUT observation horizon presented as science;
- no free-form cutting;
- no torque magnitude editing.

## Adversarial verdict

**Candidate B survives only after narrowing to B0.**

This is a meaningful correction, not cosmetic wording. The original provisional design allowed owner timing freedoms that could move the CUT transaction beyond the exact dynamic evidence. B0 restores the intended principle: Workbench v0 composes accepted behavior without silently converting a bounded experiment into a general interactive robustness claim.

Remaining question before W0 acceptance:

> Can B0 still provide enough owner information gain despite the loss of pre-CUT active control and arbitrary timing?

Current assessment: likely yes, because the central owner-facing distinction is not “I can drive the mechanism before CUT”; it is “persistent local meaning remains while disposable runtime topology and compiled action binding are replaced, then the same authored capability can act again through the new interpretation.”

This assessment must be reflected in the final W0 scope before implementation is authorized.
