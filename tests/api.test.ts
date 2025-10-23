import { describe, it, expect } from "bun:test";
import {
  CancellationTokenSource,
  linkTokens,
  anyToken,
} from "../index.ts";


describe("CancellationToken API", () => {
  it("isCancellationRequested reflects signal", () => {
    const src = new CancellationTokenSource();
    expect(src.token.isCancellationRequested).toBe(false);
    src.cancel("go");
    expect(src.token.isCancellationRequested).toBe(true);
  });

  it("throwIfCancellationRequested throws with reason or default", () => {
    const a = new CancellationTokenSource();
    expect(() => a.token.throwIfCancellationRequested()).not.toThrow();

    a.cancel("reason-str");
    expect(() => a.token.throwIfCancellationRequested()).toThrow("reason-str");

    const b = new CancellationTokenSource();
    b.cancel();
    expect(() => b.token.throwIfCancellationRequested()).toThrowError("Cancelled");
  });

  it("onCancelled invokes immediately if already aborted and disposer is noop", () => {
    const src = new CancellationTokenSource();
    src.cancel("now");

    let called = false;
    const off = src.token.onCancelled((r) => {
      called = true;
      expect(r).toBe("now");
    });

    expect(typeof off).toBe("function");
    off(); // should be a safe noop
    expect(called).toBe(true);
  });

  it("onCancelled disposer prevents callback from firing", () => {
    const src = new CancellationTokenSource();
    let called = 0;
    const off = src.token.onCancelled(() => { called++; });
    off();
    src.cancel("x");
    expect(called).toBe(0);
  });

  it("linkTokens cancels target when any source cancels with reason passthrough", () => {
    const a = new CancellationTokenSource();
    const b = new CancellationTokenSource();
    const linked = linkTokens(a.token, b.token);

    // cancel b and expect linked to be cancelled with same reason
    b.cancel(new Error("B failed"));

    let reason: unknown;
    linked.token.onCancelled((r) => { reason = r; });
    expect(linked.token.isCancellationRequested).toBe(true);
    expect(reason).toEqual(new Error("B failed"));
  });

  it("anyToken cancels when first underlying token cancels", () => {
    const slow = new CancellationTokenSource();
    const fast = new CancellationTokenSource();

    const any = anyToken(slow.token, fast.token);

    let got: unknown;
    any.onCancelled((r) => { got = r; });

    fast.cancel("fast");
    expect(any.isCancellationRequested).toBe(true);
    expect(got).toBe("fast");
  });
});
