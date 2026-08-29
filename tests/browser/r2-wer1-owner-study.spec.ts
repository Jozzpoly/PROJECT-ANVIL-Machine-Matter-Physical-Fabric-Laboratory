import { expect, test } from "@playwright/test";

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

test("WER-1 study harness deterministically prepares every preregistered fixture", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/wer1-study.html");
  await page.waitForFunction(() => Boolean((window as Window & { __WER1_STUDY__?: unknown }).__WER1_STUDY__));

  const expectedCounts = [7, 7, 15, 15, 27, 27, 53, 53, 7, 7, 15, 15, 27, 27, 53, 53];
  const expectedPolicies = [
    "baseline", "global", "global", "baseline", "global", "baseline", "baseline", "global",
    "global", "local", "local", "global", "local", "global", "global", "local",
  ];

  for (let index = 0; index < 16; index += 1) {
    await page.evaluate(async (trialIndex) => {
      const api = (window as Window & {
        __WER1_STUDY__?: { loadTrial: (index: number) => Promise<void> };
      }).__WER1_STUDY__;
      if (api === undefined) throw new Error("WER-1 study API missing");
      await api.loadTrial(trialIndex);
    }, index);

    await expect(page.getByText("Gotowe", { exact: true })).toBeVisible();
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
  }
});

test("WER-1 study harness detects correct N target and local-A authored target", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/wer1-study.html");
  await page.waitForFunction(() => Boolean((window as Window & { __WER1_STUDY__?: unknown }).__WER1_STUDY__));
  await page.evaluate(() => localStorage.clear());

  await page.evaluate(async () => {
    const api = (window as Window & {
      __WER1_STUDY__?: { loadTrial: (index: number) => Promise<void>; debugCompleteTarget: () => Promise<void> };
    }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    await api.loadTrial(0);
    await api.debugCompleteTarget();
  });
  await expect(page.getByText("Próba zakończona", { exact: true })).toBeVisible();

  let state = await page.evaluate(() => {
    const api = (window as Window & { __WER1_STUDY__?: { loadState: () => StudyState } }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    return api.loadState();
  });
  expect(state.results).toHaveLength(1);
  expect(state.results[0]?.trialId).toBe("N1A");
  expect(state.results[0]?.firstRelevantCorrect).toBe(true);
  expect(state.results[0]?.wrongRelevantActions).toBe(0);

  await page.evaluate(async () => {
    const api = (window as Window & {
      __WER1_STUDY__?: { loadTrial: (index: number) => Promise<void>; debugCompleteTarget: () => Promise<void> };
    }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    await api.loadTrial(9);
    await api.debugCompleteTarget();
  });
  await expect(page.getByText("Para A1 zakończona", { exact: true })).toBeVisible();

  state = await page.evaluate(() => {
    const api = (window as Window & { __WER1_STUDY__?: { loadState: () => StudyState } }).__WER1_STUDY__;
    if (api === undefined) throw new Error("WER-1 study API missing");
    return api.loadState();
  });
  expect(state.results).toHaveLength(2);
  expect(state.results[1]?.trialId).toBe("A1B");
  expect(state.results[1]?.policy).toBe("local");
  expect(state.results[1]?.firstRelevantCorrect).toBe(true);
  expect(state.results[1]?.wrongRelevantActions).toBe(0);
  expect(state.results[1]?.bActivations).toBe(1);
});
