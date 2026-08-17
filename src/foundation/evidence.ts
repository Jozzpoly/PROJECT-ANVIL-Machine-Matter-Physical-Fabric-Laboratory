export interface EvidenceCheck {
  readonly id: string;
  readonly pass: boolean;
  readonly summary: string;
  readonly metrics?: Readonly<Record<string, number>>;
}

export interface EvidenceReport {
  readonly pass: boolean;
  readonly checks: readonly EvidenceCheck[];
  readonly failedCheckIds: readonly string[];
}

export function buildEvidenceReport(checks: readonly EvidenceCheck[]): EvidenceReport {
  const ids = new Set<string>();
  for (const check of checks) {
    if (ids.has(check.id)) throw new Error(`duplicate evidence check id: ${check.id}`);
    ids.add(check.id);
    if (check.metrics !== undefined) {
      for (const [name, value] of Object.entries(check.metrics)) {
        if (!Number.isFinite(value)) throw new Error(`non-finite metric ${check.id}.${name}`);
      }
    }
  }
  const failedCheckIds = checks.filter((check) => !check.pass).map((check) => check.id);
  return {
    pass: failedCheckIds.length === 0,
    checks: [...checks],
    failedCheckIds,
  };
}
