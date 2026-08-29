import { R2WorldCanvas, type R2WorldHit } from "./world.js";

let installed = false;

function hasAuthoredMeaning(hit: R2WorldHit | null): boolean {
  if (hit === null) return false;
  if (hit.kind === "interface") return hit.bearingIds.length > 0 || hit.torquePatchIds.length > 0;
  if (hit.kind === "meaning") return hit.torquePatchIds.length > 0;
  return false;
}

function semanticPixelAt(canvas: HTMLCanvasElement, clientX: number, clientY: number): boolean {
  const rect = canvas.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return false;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (context === null || rect.width <= 0 || rect.height <= 0) return false;
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = Math.max(0, Math.min(canvas.width - 1, Math.floor((clientX - rect.left) * scaleX)));
  const y = Math.max(0, Math.min(canvas.height - 1, Math.floor((clientY - rect.top) * scaleY)));
  const data = context.getImageData(x, y, 1, 1).data;
  const r = data[0] ?? 0;
  const g = data[1] ?? 0;
  const b = data[2] ?? 0;

  // Bounded to the authored semantic palette: realized cyan, torque/partial amber-orange,
  // and conflict purple. Neutral Matter/ground pixels deliberately do not qualify.
  const cyan = g > 125 && b > 120 && g - r > 32 && b - r > 25;
  const warm = r > 135 && r - b > 42 && g - b > 18;
  const purple = r > 105 && b > 125 && b - g > 18;
  return cyan || warm || purple;
}

function probeNearbyMeaning(
  world: R2WorldCanvas,
  baseHit: (this: R2WorldCanvas, clientX: number, clientY: number) => R2WorldHit | null,
  clientX: number,
  clientY: number,
): R2WorldHit | null {
  // Visible E1 axis/arrow debt extends only a few CSS pixels beyond the central semantic hit.
  // Search the minimum local shell needed to reconnect that rendered envelope; do not create
  // a broad magnetic selection zone around Meaning.
  for (let radius = 1; radius <= 8; radius += 1) {
    const samples = Math.max(12, radius * 6);
    for (let sample = 0; sample < samples; sample += 1) {
      const angle = (sample / samples) * Math.PI * 2;
      const candidate = baseHit.call(
        world,
        clientX + Math.cos(angle) * radius,
        clientY + Math.sin(angle) * radius,
      );
      if (hasAuthoredMeaning(candidate)) return candidate;
    }
  }
  return null;
}

function neutralizeResearchPriming(receipt: HTMLElement): void {
  const current = receipt.textContent ?? "";
  const neutral = current
    .replace(" · R2 · Owner Authority core active", "")
    .replace(" · starter has Matter only · no hidden meaning", " · starter");
  if (neutral !== current) receipt.textContent = neutral;
}

export function installBlindTestReadiness(): void {
  if (installed) return;
  installed = true;

  const baseHit = R2WorldCanvas.prototype.hit;
  R2WorldCanvas.prototype.hit = function hitWithSemanticEnvelope(
    this: R2WorldCanvas,
    clientX: number,
    clientY: number,
  ): R2WorldHit | null {
    const direct = baseHit.call(this, clientX, clientY);
    if (direct?.kind === "interface" || direct?.kind === "meaning") return direct;

    const shell = document.querySelector<HTMLElement>(".r2-studio");
    if (shell?.dataset.runtime === "running" || shell?.dataset.runtime === "starting") return direct;

    const canvas = document.querySelector<HTMLCanvasElement>("canvas[data-r2-world]");
    if (canvas === null || !semanticPixelAt(canvas, clientX, clientY)) return direct;
    return probeNearbyMeaning(this, baseHit, clientX, clientY) ?? direct;
  };

  const receipt = document.querySelector<HTMLElement>("[data-r2-receipt]");
  if (receipt !== null) {
    neutralizeResearchPriming(receipt);
    const observer = new MutationObserver(() => neutralizeResearchPriming(receipt));
    observer.observe(receipt, { childList: true, characterData: true, subtree: true });
  }
}
