export type CancellationReason = string | Error;

export class CancellationToken {
  constructor(readonly signal: AbortSignal) {}
  get isCancellationRequested() { return this.signal.aborted; }
  throwIfCancellationRequested() {
    if (this.signal.aborted) throw this.signal.reason ?? new Error("Cancelled");
  }
  onCancelled(cb: (reason: any) => void) {
    if (this.signal.aborted) { cb(this.signal.reason); return () => {}; }
    const h = () => cb(this.signal.reason);
    this.signal.addEventListener("abort", h, { once: true });
    return () => this.signal.removeEventListener("abort", h);
  }
}

export class CancellationTokenSource {
  private controller = new AbortController();
  readonly token = new CancellationToken(this.controller.signal);
  cancel(reason?: CancellationReason) { this.controller.abort(reason ?? "Cancelled"); }
}

export function linkTokens(...tokens: CancellationToken[]): CancellationTokenSource {
  const src = new CancellationTokenSource();
  const unsubs = tokens.map(t => t.onCancelled((r) => src.cancel(r)));
  src.token.onCancelled(() => unsubs.forEach(u => u()));
  return src;
}

export function withTimeout(ms: number, parent?: CancellationToken): CancellationTokenSource {
  const src = new CancellationTokenSource();
  const timer = setTimeout(() => src.cancel(new Error(`Timeout ${ms}ms`)), ms);
  const clear = () => clearTimeout(timer);
  src.token.onCancelled(clear);
  parent?.onCancelled((r) => { clear(); src.cancel(r); });
  return src;
}

export function withDeadline(at: number | Date, parent?: CancellationToken): CancellationTokenSource {
  const due = typeof at === "number" ? at : at.getTime();
  return withTimeout(Math.max(0, due - Date.now()), parent);
}

// await abortable delay
export function abortableDelay(ms: number, ct?: CancellationToken) {
  return new Promise<void>((resolve, reject) => {
    if (ct?.isCancellationRequested) return reject(ct.signal.reason ?? new Error("Cancelled"));

    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    let off: (() => void) | undefined;
    const cleanup = () => {
      clearTimeout(timer);
      off?.();
      off = undefined;
    };

    off = ct?.onCancelled((r) => {
      cleanup();
      reject(r ?? new Error("Cancelled"));
    });
  });
}

// AbortSignal.any polyfill benzeri
export function anyToken(...tokens: CancellationToken[]): CancellationToken {
  const src = linkTokens(...tokens);
  return src.token;
}
