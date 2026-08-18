# PROJECT ANVIL — Experiment Protocol

ANVIL progresses by **bounded executable falsifiers**, not by expanding a speculative master architecture.

The goal is not maximum ceremony. The goal is **maximum information gained per unit of implementation and validation work** without weakening evidence quality.

## 0. Identity lock

Before material work:

- resolve live repository, `main`, intended branch and HEAD;
- read `AI_PROJECT_MEMORY.md` and `AGENTS.md`;
- determine whether the task changes an accepted checkpoint, an active experiment or starts a new falsifier;
- inspect the source files that actually own the behavior under test;
- inspect donor repositories only when they materially reduce uncertainty.

Do not reconstruct project truth from conversation history when live Git can answer it.

## 1. One primary research question

Write one question that could fail.

Good:

> Can a moving rigid island be recompiled into two bodies at a step boundary while preserving source identity and bounded kinematic discontinuity?

Bad:

> Build the universal Machine Matter system with fracture, joints, surfaces and adaptive physics.

If a failure would be impossible to interpret because too many assumptions change at once, narrow the experiment.

## 2. Smallest discriminating fixture

Use the smallest fixture that can expose the failure mode, not merely the smallest fixture that can turn green.

State:

- authored inputs;
- materials/parameters;
- initial runtime state when relevant;
- one primary intervention;
- expected observables;
- at least one plausible control or falsifier when a false-positive pass is possible.

Prefer asymmetric fixtures when symmetry could hide an incorrect COM, orientation, mapping or force calculation.

## 3. Gates before implementation

Define pass/fail criteria before looking at the result whenever practical.

Each material gate should have:

- stable ID or clearly identified condition;
- observable metric/behavior;
- tolerance and units when numeric;
- reason the gate discriminates the hypothesis;
- evidence class.

Do not relax a threshold because the first implementation misses it. Change the threshold only when the original criterion is demonstrated to be physically or experimentally wrong.

Do not add more variants after a strong result merely to accumulate green tests. Add another falsifier only when it attacks a remaining live assumption.

## 4. Evidence classes

ANVIL distinguishes these classes:

### A. Static / structural

Strict typecheck, schema validation, dependency boundaries, deterministic serialization.

### B. Pure synthetic

Provenance lineage, vector identities, known mass fixtures, deterministic compiler tests.

### C. Real solver

The actual physics backend creates the generated representation and steps it. Prefer independent solver cross-checks over writing compiler answers back into the solver.

### D. Real product runtime

The production browser/native build is executed. Runtime errors and interaction paths are observed automatically where useful.

### E. Owner manual validation

The owner inspects behavior, communication, feel or visual failure modes that automation cannot establish reliably.

A lower evidence class must never be described as a higher one.

**Class E is conditional, not ceremonial.** Require an owner gate only when human observation adds evidence that classes A–D cannot establish efficiently. If the complete research claim is quantitative/structural and already discriminated by automated evidence, record why no owner gate is required.

## 5. Two-speed PR lifecycle

`main` is the latest accepted checkpoint. Material code changes go through a PR.

Recommended branches:

- `experiment/anvil-NN-short-name` for bounded falsifiers;
- `foundation/short-name` only for already-earned reusable boundaries or neutral process/measurement infrastructure.

### DRAFT = research loop

Open the draft PR early, once the branch and primary hypothesis exist.

While the PR is Draft:

- each synchronized commit runs the **core gate**: canonical toolchain, strict TypeScript, complete Node/real-solver regression suite and production build;
- do not pay for Chromium/Forge packaging on every solver iteration;
- record meaningful negative evidence, but do not turn every exploratory commit into a release candidate.

There should be no separate branch-push CI for experiment/foundation branches once a PR exists. The PR is the canonical integration context.

### READY = candidate loop

Mark the PR Ready only after the core hypothesis is sufficiently supported and a real product/owner candidate is justified.

Ready triggers the **candidate gate** on the exact PR synthetic merge:

- exact production build staged by the core gate;
- Windows launcher self-test;
- real Chromium evidence;
- final Forge artifact upload.

If a browser/candidate defect requires substantial renewed experimentation, convert the PR back to Draft. If it is a small candidate-layer fix, keep it Ready and let each new commit rerun the full candidate gate.

This Draft/Ready distinction is part of the evidence workflow, not UI decoration.

## 6. Owner candidate freeze

Once an exact artifact is handed to the owner:

- freeze the experiment branch head until the verdict;
- preserve source SHA, PR synthetic checkout, run ID, artifact ID and digest;
- do not append acceptance documentation to that branch before promotion;
- do not silently rebuild and call the new artifact equivalent.

On **REJECT** or **INCONCLUSIVE**, resume work from a new commit while preserving the rejected/inconclusive artifact as historical evidence.

On **ACCEPT**, the preferred promotion target is the **same exact source head the owner tested**.

Before merge:

1. externally cross-check the owner report against live GitHub;
2. confirm PR head is still the owner-tested source SHA;
3. confirm base `main` is still the base represented by the tested synthetic checkout;
4. merge with expected-head protection;
5. compare the tested synthetic-merge Git tree with the actual merge tree.

This is stronger and cheaper than changing the branch with Markdown after acceptance and re-running the entire physics/browser pipeline.

## 7. Post-merge grounding

After an accepted exact-head merge:

- record owner acceptance in experiment documentation;
- update `AI_PROJECT_MEMORY.md`;
- record the actual merge SHA/tree identity;
- preserve the owner-tested artifact identity separately from later documentation commits.

Documentation-only grounding after an already verified exact-head merge does **not** require re-running solver/Chromium evidence. It must be verified as documentation-only by inspecting the commit/diff paths.

Do not create a full docs-grounded promotion cycle merely to make Markdown changes.

## 8. Owner workload rule

Forge exists to remove technical validation work from the owner.

For a deterministic, clear A/B visual gate, default owner validation is:

- one orienting run;
- two repeat runs;
- verdict after roughly **3 meaningful observations**.

More repetitions are useful only when behavior is intermittent, probabilistic, subtle, subjective or the owner wants additional confidence. Do not make 10–20 repetitions a default ritual.

Primary owner UI should say what to look at in ordinary language. SHA/schema/provenance/numeric diagnostics belong in collapsed technical details and the generated agent report.

## 9. Verdict vocabulary

Use explicit verdicts:

- **SUPPORTED FOR FIXTURE** — declared automated gates pass for the bounded scope;
- **OWNER ACCEPTED** — required human gate passed for the exact artifact;
- **REJECTED** — evidence falsifies the tested claim;
- **INCONCLUSIVE** — the experiment does not discriminate the hypothesis;
- **BLOCKED** — required evidence could not be executed;
- **REGRESSION** — a previously accepted invariant no longer holds.

Never use `DONE` as a substitute for a scientific verdict.

## 10. Promotion rule

After an accepted experiment, ask which parts actually deserve reuse.

Promote only boundaries that are:

- demonstrated by completed evidence; or
- neutral measurement/infrastructure directly required by the next falsifier.

Do not promote incidental fixture details or build generic ontology because several experiments happen to share vocabulary.

## 11. Donor harvest rule

When another Jozzpoly project has a relevant mechanism:

1. inspect its current live source/evidence;
2. identify the exact transferable idea or code;
3. separate project-specific assumptions from reusable logic;
4. port minimally rather than merging product architectures;
5. preserve third-party licensing/provenance.

A donor implementation proves an approach exists, not that ANVIL needs it.

## 12. Negative evidence

Keep useful failures and record why they failed.

A failure should reduce the search space. Do not hide discontinuities, instability or wrong topology behind damping, resets, visual interpolation or loose gates unless the experiment explicitly tests those mechanisms.

Do not preserve every transient typo as scientific history. Preserve failures that teach us something about the model, fixture, lowering, toolchain contract or owner workflow.

## 13. Documentation economy

Avoid repeating the same detailed metrics in PR body, evidence file, owner-gate file and project memory.

Preferred ownership:

- **preflight** — question, fixture, frozen gates, non-claims;
- **evidence log** — executed technical results and meaningful negative evidence;
- **owner-gate record** — exact artifact identity + human verdict, only when class E is required;
- **PR body** — concise current verdict + links/summary;
- **AI_PROJECT_MEMORY.md** — current accepted state, strongest claims/boundaries, exact latest owner identity, next decision.

The memory is an orchestration index, not a complete experiment archive.

## 14. Start the next experiment only when the previous one taught us something

Before selecting the next falsifier:

- state what the previous experiment actually established;
- name the strongest remaining assumption or uncertainty;
- compare at least two plausible next experiments by information gain vs added complexity;
- prefer the smallest experiment that attacks the most consequential uncertainty.

Do not continue a successful experiment merely by adding repetitions or adjacent features. Do not combine two new physical hypotheses in one first falsifier.

## 15. Interruption and cold-takeover checkpoint

Long conversations and agent sessions are disposable too. Project continuity must live in Git, not in one chat context.

When preparing a deliberate handoff or stopping at a meaningful boundary:

1. leave accepted material truth on `main` and active unaccepted material work on its Draft/experiment branch;
2. update `docs/CURRENT_HANDOFF.md` with exact accepted-vs-active state, live SHAs, executed evidence boundary, frozen next action and explicit do-not-do list;
3. update `AI_PROJECT_MEMORY.md` only with the concise current orchestration state;
4. do not merge an active experiment merely for convenience;
5. verify any `main` handoff/grounding commit is documentation-only;
6. preserve capability/toolchain prechecks as a distinct evidence category from the physical hypothesis they enable.

A new conversation must treat the handoff as a claim to verify:

- resolve live `main`;
- resolve referenced PR/base/head;
- read live experiment preflight/evidence files;
- inspect material branch diff and relevant CI;
- reconcile any mismatch before implementation.

The desired result is that the owner can start a new conversation without manually reconstructing technical history, while the incoming agent still performs an independent live-state takeover instead of trusting stale prose.