// @bun
// src/cancellation/cancellation.ts
class CancellationToken {
  signal;
  constructor(signal) {
    this.signal = signal;
  }
  get isCancellationRequested() {
    return this.signal.aborted;
  }
  throwIfCancellationRequested() {
    if (this.signal.aborted)
      throw this.signal.reason ?? new Error("Cancelled");
  }
  onCancelled(cb) {
    if (this.signal.aborted) {
      cb(this.signal.reason);
      return () => {};
    }
    const h = () => cb(this.signal.reason);
    this.signal.addEventListener("abort", h, { once: true });
    return () => this.signal.removeEventListener("abort", h);
  }
}

class CancellationTokenSource {
  controller = new AbortController;
  token = new CancellationToken(this.controller.signal);
  cancel(reason) {
    this.controller.abort(reason ?? "Cancelled");
  }
}
function linkTokens(...tokens) {
  const src = new CancellationTokenSource;
  const unsubs = tokens.map((t) => t.onCancelled((r) => src.cancel(r)));
  src.token.onCancelled(() => unsubs.forEach((u) => u()));
  return src;
}
function withTimeout(ms, parent) {
  const src = new CancellationTokenSource;
  const timer = setTimeout(() => src.cancel(new Error(`Timeout ${ms}ms`)), ms);
  const clear = () => clearTimeout(timer);
  src.token.onCancelled(clear);
  parent?.onCancelled((r) => {
    clear();
    src.cancel(r);
  });
  return src;
}
function withDeadline(at, parent) {
  const due = typeof at === "number" ? at : at.getTime();
  return withTimeout(Math.max(0, due - Date.now()), parent);
}
function abortableDelay(ms, ct) {
  return new Promise((resolve, reject) => {
    if (ct?.isCancellationRequested)
      return reject(ct.signal.reason ?? new Error("Cancelled"));
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);
    let off;
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
function anyToken(...tokens) {
  const src = linkTokens(...tokens);
  return src.token;
}

// index.ts
var bun_cancellation_token_default = {};
export {
  withTimeout,
  withDeadline,
  linkTokens,
  bun_cancellation_token_default as default,
  anyToken,
  abortableDelay,
  CancellationTokenSource,
  CancellationToken
};
