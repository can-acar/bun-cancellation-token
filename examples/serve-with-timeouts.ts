import { CancellationTokenSource, withTimeout, abortableDelay } from "../index.ts";

// Simple Bun.serve example with per-request timeout and graceful shutdown
const shutdown = new CancellationTokenSource();

const server = Bun.serve<{ shutdown: CancellationTokenSource }>({
  port: 3000,
  fetch: async (req, server) => {
    // Per-request deadline: 2s or earlier if server is shutting down
    const perReq = withTimeout(2_000, shutdown.token);
    try {
      // Simulate slow work; if it exceeds 2s, token cancels and we return 504
      await abortableDelay(5_000, perReq.token);
      return new Response("OK\n");
    } catch (e) {
      return new Response("Gateway Timeout\n", { status: 504 });
    }
  },
});

console.log(`Server running on http://localhost:${server.port}`);
console.log("Press Ctrl+C to stop...");

// Graceful shutdown on SIGINT/SIGTERM
["SIGINT", "SIGTERM"].forEach((sig) => {
  try {
    // @ts-ignore Node types may not be present, but Bun polyfills process
    process.on(sig, () => {
      console.log(`\n${sig} received: shutting down...`);
      shutdown.cancel(sig);
      server.stop();
    });
  } catch {}
});
