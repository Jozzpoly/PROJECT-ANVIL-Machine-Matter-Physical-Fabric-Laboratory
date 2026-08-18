# PROJECT ANVIL — Experiment Protocol

ANVIL progresses by **bounded executable falsifiers**, not by expanding a speculative master architecture.

The goal is maximum information gained per unit of implementation/validation work without weakening evidence quality.

## 0. Identity lock

Before material work:

- resolve live repository, `main`, intended branch and HEAD;
- read `AGENTS.md`;
- for continuation/cold takeover, verify `.anvil/project-state.json` and `docs/CURRENT_HANDOFF.md` against live Git;
- determine whether the task changes an accepted checkpoint, continues an active experiment or starts a new falsifier;
- inspect the source/preflight files that actually own the behavior under test;
- inspect donor repositories only when they materially reduce uncertainty.

Do not reconstruct project truth from conversation history when live Git can answer it.

## 1. One primary research question

Write one question that could fail. If a failure would be impossible to interpret because too many assumptions change at once, narrow the experiment.

## 2. Smallest discriminating fixture

Use the smallest fixture that can expose the failure mode, not merely the smallest fixture that can turn green.

State:

- authored inputs;
- physical/material parameters;
- initial runtime state when relevant;
- one primary intervention;
- observables;
- plausible control/falsifier when false-positive success is possible.

Prefer asymmetry when symmetry could hide mapping, COM, orientation or force errors.

## 3. Gates before implementation

Define pass/fail criteria before looking at the result whenever practical.

Each material gate should have:

- stable identity/condition;
- observable metric/behavior;
- tolerance and units when numeric;
- reason it discriminates the hypothesis;
- required evidence class.

Do not relax a threshold because the first implementation misses it. Change it only when the original criterion is demonstrated to be physically/experimentally wrong, preserving the reason/history.

Do not add variants after a strong result merely to accumulate PASSes.

## 4. Evidence classes

### A. Static / structural

Typecheck, schema validation, dependency boundaries, source invariants, deterministic serialization/canonicalization.

### B. Pure synthetic

Provenance lineage, vector identities, known mass fixtures, deterministic compiler tests.

### C. Real solver

The actual physics backend creates/steps the generated representation. Prefer direct observations over feeding expected compiler answers back into the solver.

### D. Real product runtime

Production browser/native bundle is executed and browser/runtime-specific behavior is observed.

### E. Owner manual validation

Owner inspects visual continuity, feel, usability or another genuinely human judgement automation cannot establish reliably.

A lower evidence class must never be described as a higher one. **Class E is conditional, not ceremonial.**

## 5. Two-speed PR lifecycle

`main` is the latest accepted checkpoint plus verified documentation/process grounding. Material code changes go through a PR.

Recommended branches:

- `experiment/anvil-NN-short-name` for bounded falsifiers;
- `foundation/short-name` only for already-earned reusable boundaries/neutral infrastructure.

### DRAFT = research loop

Open Draft early once branch and primary hypothesis exist.

Draft runs the **core gate**:

- canonical toolchain;
- strict TypeScript;
- complete Node/real-solver regressions;
- production build.

Do not pay for Chromium/owner packaging on every solver iteration.

### READY = candidate loop

Mark Ready only after the core hypothesis is sufficiently supported and product/candidate validation is justified.

Ready runs the candidate gate on the exact PR integration context, typically:

- exact staged production build;
- launcher regression;
- real Chromium when relevant;
- final artifact/owner transport when required.

If substantial research resumes, return the PR to Draft.

## 6. Owner candidate freeze

Once an exact artifact is handed to the owner:

- freeze experiment source head until verdict;
- preserve source SHA, integration checkout, run ID, artifact ID and digest;
- do not append acceptance documentation to that branch before promotion;
- do not silently rebuild and call a different artifact equivalent.

On REJECT/INCONCLUSIVE, resume from a new commit while preserving the old evidence. On ACCEPT, prefer promotion of the exact source head the owner tested.

Before merge verify live provenance/base/head and compare tested integration tree with actual merge tree where applicable.

## 7. Post-merge grounding

After accepted exact-head merge:

- create/update experiment evidence/owner record;
- update `AI_PROJECT_MEMORY.md` only as a concise index;
- update `.anvil/project-state.json` / `docs/CURRENT_HANDOFF.md` when current takeover state changes materially;
- preserve owner-tested artifact identity separately from later docs commits.

Documentation-only grounding after qualified material merge does not require solver/Chromium requalification. It must be verified documentation-only by changed paths.

## 8. Owner workload rule

Forge exists to reduce owner validation burden.

For a deterministic clear visual gate, roughly three meaningful owner observations are normally enough unless behavior is intermittent/subtle or the owner wants more confidence.

Primary owner UI must use ordinary language; provenance/diagnostics belong in technical details/report.

## 9. Verdict vocabulary

- **SUPPORTED FOR FIXTURE** — declared automated gates pass for bounded scope;
- **OWNER ACCEPTED** — required human gate passed for exact artifact;
- **REJECTED** — evidence falsifies tested claim;
- **INCONCLUSIVE** — fixture/evidence does not discriminate;
- **BLOCKED** — required evidence could not execute;
- **REGRESSION** — previously accepted invariant no longer holds.

Never use `DONE` as a scientific verdict.

## 10. Promotion rule

Promote only boundaries that are demonstrated by accepted evidence or are neutral measurement/process infrastructure required for future falsification.

Do not promote incidental fixture details or generic ontology merely because several experiments share vocabulary.

## 11. Donor harvest rule

When another Jozzpoly project is relevant:

1. inspect current live source/evidence;
2. identify exact transferable idea/code;
3. separate donor-specific assumptions from reusable logic;
4. port minimally rather than merging product architectures;
5. preserve licensing/provenance.

A donor proves an approach exists, not that ANVIL needs its architecture.

## 12. Negative evidence

Keep failures that reduce the search space. Do not hide discontinuity/instability/wrong topology behind damping, resets, interpolation or loose gates unless those mechanisms are the tested hypothesis.

Do not preserve every typo as scientific history; preserve failures that teach something about model, fixture, lowering, toolchain or owner workflow.

## 13. Documentation economy and ownership

One fact should have one canonical owner:

- **preflight** — question, fixture, frozen gates, controls, non-claims;
- **evidence log** — executed results, meaningful negative evidence, promotion identity;
- **owner-gate record** — exact artifact + human verdict only when Class E required;
- **PR body** — concise operational phase/verdict + canonical links;
- **AI_PROJECT_MEMORY.md** — accepted capability/architecture index + strategic pointer;
- **`.anvil/project-state.json`** — compact current machine-readable checkpoint claim;
- **`docs/CURRENT_HANDOFF.md`** — short takeover instructions + accepted/active boundary + next/do-not-do;
- **`docs/FOUNDATION.md`** — stable promoted reusable boundaries only;
- **`docs/RESEARCH_COMPASS.md`** — stable macro method/invariants only;
- **README** — stable entry point.

Do not repeat detailed metrics/thresholds across these files merely for convenience.

## 14. Select next experiment by information gain

Before selecting a new falsifier:

- state what previous evidence actually established;
- name strongest remaining uncertainty;
- compare at least two plausible next experiments by information gain vs added complexity/lock-in;
- use `docs/RESEARCH_COMPASS.md` when the decision is strategic.

Do not continue a successful experiment merely by adding adjacent features.

## 15. Interruption and cold takeover

Long conversations and agent sessions are disposable too. Project continuity lives in Git.

### Preparing deliberate handoff

1. leave accepted material truth on `main` and active unaccepted material work on its Draft branch;
2. update `.anvil/project-state.json` with stable accepted checkpoint + active PR/head/phase/evidence boundary; do **not** embed a self-invalidating live-main SHA as authority;
3. update `docs/CURRENT_HANDOFF.md` as a short pointer to canonical sources, exact next action and do-not-do list;
4. update `AI_PROJECT_MEMORY.md` only if accepted/strategic truth changed;
5. do not merge/rebase an active experiment merely for takeover aesthetics;
6. verify handoff grounding changes are docs/meta-only;
7. preserve capability/toolchain prechecks distinctly from the physical hypothesis they enable.

### Cold takeover minimum

1. resolve live `main`;
2. read state/handoff as checkpoint claims;
3. resolve referenced active PR/head;
4. compare live `main` against accepted material checkpoint and classify the delta;
5. inspect active branch merge-base/delta;
6. read active preflight/evidence from live branch;
7. verify only the evidence material to the next action;
8. reconcile mismatch before implementation.

If the fingerprint matches, use **delta-audit** and continue. Do not reconstruct the entire historical experiment chain merely for reassurance.

Run a deeper macro audit after promotion, meaningful falsification, architectural contradiction, frontier change or major interruption.
