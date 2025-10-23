import { describe, it, expect } from "bun:test";
import { withTimeout, withDeadline, abortableDelay, CancellationTokenSource } from "../index.ts";

// Timing tests are kept with small durations to minimize flakiness.
describe("Timing-related behavior", () => {
  it("withTimeout cancels around the specified time", async () => {
    const t = withTimeout(10);

    const start = Date.now();
    await expect(abortableDelay(100, t.token)).rejects.toMatchObject(
      new Error("Timeout 10ms")
    );
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(5);
  });

  it("withDeadline using Date cancels", async () => {
    const inMs = 15;
    const d = new Date(Date.now() + inMs);
    const t = withDeadline(d);
    await expect(abortableDelay(100, t.token)).rejects.toBeInstanceOf(Error);
  });

  it("abortableDelay resolves when not cancelled", async () => {
    const src = new CancellationTokenSource();
    // do not cancel
    await expect(abortableDelay(5, src.token)).resolves.toBeUndefined();
  });

  it("abortableDelay rejects immediately if token already cancelled", async () => {
    const src = new CancellationTokenSource();
    src.cancel("pre-cancel");
    await expect(abortableDelay(50, src.token)).rejects.toBe("pre-cancel");
  });
});
