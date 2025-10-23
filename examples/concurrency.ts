import { CancellationTokenSource, withTimeout, linkTokens, abortableDelay } from "../index.ts";

async function runTask(name: string, ms: number, token: CancellationTokenSource["token"]) {
  const start = Date.now();
  try {
    await abortableDelay(ms, token);
    console.log(`${name} finished in ~${Date.now() - start}ms`);
    return name;
  } catch (e) {
    console.log(`${name} cancelled after ~${Date.now() - start}ms ->`, e);
    throw e;
  }
}

async function main() {
  // Overall deadline 150ms for the whole batch
  const overall = withTimeout(150);

  // Optional: allow manual cancellation with Ctrl+C
  const manual = new CancellationTokenSource();
  try {
    // @ts-ignore process is available in Bun
    process.on("SIGINT", () => manual.cancel("SIGINT"));
  } catch {}

  // Linked token: cancels when either overall deadline OR manual cancel occurs
  const linked = linkTokens(overall.token, manual.token);

  const tasks = [
    runTask("fast", 50, linked.token),
    runTask("medium", 100, linked.token),
    runTask("slow", 300, linked.token),
  ];

  const results = await Promise.allSettled(tasks);
  console.log("results:", results.map(r => r.status));
}

main();
