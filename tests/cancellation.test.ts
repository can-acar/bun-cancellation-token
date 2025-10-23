import { describe, it, expect } from "bun:test";
import {
  CancellationTokenSource,
  anyToken,
  withTimeout,
  abortableDelay,
} from "../index.ts";

describe("CancellationToken basics", () => {
  it("cancels via source", async () => {
    const src = new CancellationTokenSource();
    queueMicrotask(() => src.cancel("boom"));

    await expect(abortableDelay(10, src.token)).rejects.toBe("boom");
  });

  it("anyToken resolves when any cancels", async () => {
    const a = new CancellationTokenSource();
    const b = withTimeout(5);
    const merged = anyToken(a.token, b.token);

    await expect(abortableDelay(50, merged)).rejects.toMatchObject(
      new Error("Timeout 5ms")
    );
  });
});
