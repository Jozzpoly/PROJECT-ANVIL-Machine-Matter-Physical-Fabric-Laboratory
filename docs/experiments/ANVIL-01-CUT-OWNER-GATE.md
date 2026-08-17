# ANVIL-01 / CUT — Owner Validation Gate

Status: **READY FOR OWNER VALIDATION — NOT YET ACCEPTED**

This gate is Evidence Class **E — Owner Manual Validation**. Automated solver and production-browser evidence are already green; this step exists for observations that should not be silently replaced by CI assertions.

## Exact validation artifact

Use only this checkpoint for the current owner verdict:

- branch: `experiment/anvil-01-cut`
- code/package head: `e1a0b4b0ff6570897603f51ea54cc2d953ae1a2d`
- GitHub Actions run: `32071241142`
- artifact: `anvil-browser-laboratory`
- artifact ID: `9301831216`
- artifact SHA-256: `9fa1ba669408e52462334ca1a72aad57a4582ef7e6dba8c7fa122b518a389dac`
- artifact expiry: `2026-08-31T21:29:32Z`

CI for this exact package passed:

- canonical Node/npm;
- strict TypeScript;
- 20/20 foundation/compiler/real-Box3D tests;
- production Vite build;
- packaged Windows owner-launcher self-test from `dist`;
- 2/2 real Chromium tests: accepted ANVIL-00 regression + CUT product-runtime evidence;
- artifact upload.

## How to run on Windows

No terminal commands are required.

1. Download the `anvil-browser-laboratory` artifact from Actions run `32071241142`.
2. Extract the ZIP to any temporary folder.
3. Double-click `START_ANVIL_CUT.cmd`.
4. A console window should remain open and the browser should open automatically on ANVIL-01 / CUT.
5. Leave the console open while testing. Closing it stops the local server.

The launcher uses Windows PowerShell/.NET only. It chooses an available localhost port in `4173..4199`; it does not install dependencies or modify an existing project folder.

## What the page must show before CUT

Expected initial state:

- status: `READY`;
- persistent source: `51 authored cells`;
- runtime: one moving + rotating Box3D body;
- button: `RUN CUT`;
- the visualization should visibly move/rotate rather than present a static fabricated result.

## Perform the transaction

Click `RUN CUT` once.

The page deliberately warms up the one-body runtime for real Box3D solver steps, snapshots it at a step boundary, compiles the same 51 source cells into two bodies, disposes the old runtime, initializes the two replacement bodies with the tested rigid-field transfer, and continues stepping the replacement runtime.

Expected automated result on the page:

- status: `CUT EVIDENCE PASS`;
- source cells: `51 → 51`;
- runtime bodies: `1 → 2`;
- source add/remove: `0 / 0`;
- all **8 falsification gates** show PASS:
  1. persistent source identity;
  2. mass-preserving 1→2 split;
  3. nontrivial rotating fixture;
  4. runtime mass continuity;
  5. child pose continuity;
  6. rigid velocity field;
  7. total linear momentum;
  8. post-transaction solver step.

## Owner observations that matter

The following are intentionally manual judgements.

### A. Visual continuity at the transaction

Watch the object immediately before and after `RUN CUT` reaches the split boundary.

Reject if you see an obvious unexplained:

- teleport;
- orientation reset;
- full stop/freeze;
- explosive velocity jump;
- disappearing source matter;
- unrelated scene reset that makes continuity impossible to judge.

Tiny visual differences from converting one runtime representation into two are not automatically failures; the question is whether the same moving matter appears to continue naturally through the transaction.

### B. Persistent-matter interpretation

Judge whether the demo communicates the intended relationship:

> the authored matter remains the same while the disposable runtime representation changes from one body to two.

Reject if the result instead reads as "delete old object and spawn unrelated debris" or otherwise contradicts that intended interpretation.

### C. Continued live behavior

After the split, watch for several seconds.

The two replacement bodies should remain live, finite and visibly simulated. Reject obvious numerical instability, runaway motion unrelated to the pre-cut state, rendering corruption, or a hidden reset shortly after PASS.

### D. Replay

Click `RESET`, then run CUT again at least twice.

The qualitative event should be repeatable. The exact pixels need not match frame-for-frame, but the experiment should not sometimes succeed and sometimes visibly fail under the same deterministic fixture.

### E. Regression control

Optionally use the `Open accepted ANVIL-00 / COLLAPSE` link. The old viewer is intentionally preserved as a separate control and should still behave as before.

## Evidence boundary shown to the owner

A PASS here still means only the bounded ANVIL-01 claim.

It does **not** demonstrate:

- in-place body replacement inside one persistent populated Box3D world;
- migration of Box3D contact-manifold internals;
- external joint/constraint state transfer;
- arbitrary cut surfaces or fracture geometry;
- damage propagation, toughness, debris or plasticity;
- deformable/compliant matter;
- full angular-momentum or rotational-energy conservation for arbitrary rotated matter.

## Owner verdict

Record one of:

- **ACCEPT** — the automated evidence and manual behavior are acceptable within the stated scope;
- **REJECT** — include the observed failure and, if possible, whether it is visual continuity, behavior after split, repeatability, launcher/runtime, or interpretation;
- **INCONCLUSIVE** — include what prevented a meaningful judgement.

Do not merge/promote ANVIL-01 based on CI alone. Owner ACCEPT is the final required gate for the current experiment lifecycle.
