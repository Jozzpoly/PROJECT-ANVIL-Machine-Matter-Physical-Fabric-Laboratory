import { expect, test, type Page } from "@playwright/test";

interface StudyActive {
  trial: { id: string; sub: "N" | "A"; pair: string; policy: "baseline" | "global" | "local"; scene: string };
  index: number;
  matterCount: number;
  targetEndpoints: string[];
}

interface StudyState {
  index: number;
  results: Array<{
    trialId: string;
    policy: string;
    firstRelevantCorrect: boolean | null;
    wrongRelevantActions: number;
    bActivations: number;
  }>;
}

async function waitForPreparedOrRed(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const text = document.querySelector<HTMLElement>("#study-overlay")?.innerText ?? "";
    return text.includes("Gotowe") || text.includes("STUDY-HARNESS RED");
  }, undefined, { timeout: 15_000 });
  const overlay = await page.locator("#study-overlay").innerText();
  if (overlay.includes("STUDY-HARNESS RED")) throw new Error(`WER-1 study harness setup RED:\n${overlay}`);
  await expect(page.getByText("Gotowe", { exact: true })).toBeVisible();
}

async function loadTrial(page: Page, index: number): Promise<void> {
  await page.evaluate(async (trialIndex) => {
    const api = (window as Window & {
      __WER1_STUDY__?: { loadTrial: (value: number) => Promise<void> };
    }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    await api.loadTrial(trialIndex);
  }, index);
  await waitForPreparedOrRed(page);
}

async function debugCompleteTarget(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const api = (window as Window & {
      __WER1_STUDY__?: { debugCompleteTarget: () => Promise<void> };
    }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    await api.debugCompleteTarget();
  });
}

async function studyState(page: Page): Promise<StudyState> {
  return page.evaluate(() => {
    const api = (window as Window & { __WER1_STUDY__?: { loadState: () => StudyState } }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    return api.loadState();
  });
}

test("WER-1 study fixture selector is bounded to explicit study URLs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const normalStudio = page.locator(".r2-studio");
  await expect(normalStudio).toHaveAttribute("data-cells", "3");
  await expect(normalStudio).toHaveAttribute("data-bearings", "0");

  await page.goto("/?wer1=global&wer1study=1&wer1fixture=sA&wer1sub=N");
  const studyStudio = page.locator(".r2-studio");
  await expect(studyStudio).toHaveAttribute("data-cells", "7");
  await expect(studyStudio).toHaveAttribute("data-bearings", "1");
  await expect(studyStudio).toHaveAttribute("data-wer1-policy", "global");
});

test("WER-1 study harness prepares and target-validates all 16 preregistered trials", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/wer1-study.html");
  await page.waitForFunction(() => Boolean((window as Window & { __WER1_STUDY__?: unknown }).__WER1_STUDY__));
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => Boolean((window as Window & { __WER1_STUDY__?: unknown }).__WER1_STUDY__));

  const expectedCounts = [7, 7, 15, 15, 27, 27, 53, 53, 7, 7, 15, 15, 27, 27, 53, 53];
  const expectedPolicies = [
    "baseline", "global", "global", "baseline", "global", "baseline", "baseline", "global",
    "global", "local", "local", "global", "local", "global", "global", "local",
  ];
  const expectedTrialIds = [
    "N1A", "N1B", "N2A", "N2B", "N3A", "N3B", "N4A", "N4B",
    "A1A", "A1B", "A2A", "A2B", "A3A", "A3B", "A4A", "A4B",
  ];

  for (let index = 0; index < 16; index += 1) {
    await loadTrial(page, index);
    const active = await page.evaluate(() => {
      const api = (window as Window & {
        __WER1_STUDY__?: { getActive: () => StudyActive | null };
      }).__WER1_STUDY__;
      if (api === undefined) throw new Error("WER-1 study API missing");
      return api.getActive();
    });
    expect(active).not.toBeNull();
    expect(active?.index).toBe(index);
    expect(active?.matterCount).toBe(expectedCounts[index]);
    expect(active?.trial.policy).toBe(expectedPolicies[index]);
    expect(active?.targetEndpoints).toHaveLength(2);

    const appFrame = page.frames().find((candidate) => candidate !== page.mainFrame());
    if (appFrame === undefined) throw new Error("WER-1 app iframe missing");
    const studio = appFrame.locator(".r2-studio");
    await expect(studio).toHaveAttribute("data-cells", String(expectedCounts[index]));
    await expect(studio).toHaveAttribute("data-wer1-policy", expectedPolicies[index] ?? "baseline");
    await expect(studio).toHaveAttribute("data-bearings", index < 8 ? "1" : "0");

    await debugCompleteTarget(page);
    await page.waitForFunction((length) => {
      const api = (window as Window & { __WER1_STUDY__?: { loadState: () => StudyState } }).__WER1_STUDY__;
      return api?.loadState().results.length === length;
    }, index + 1, { timeout: 10_000 });
    const state = await studyState(page);
    const result = state.results[index];
    expect(result?.trialId).toBe(expectedTrialIds[index]);
    expect(result?.policy).toBe(expectedPolicies[index]);
    expect(result?.firstRelevantCorrect).toBe(true);
    expect(result?.wrongRelevantActions).toBe(0);
    if (index >= 8) expect(result?.bActivations).toBe(1);
  }
});
