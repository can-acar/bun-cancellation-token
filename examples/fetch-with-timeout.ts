import { withTimeout } from "../index.ts";

async function main() {
  // Cancel the fetch if it takes longer than 1s
  const cts = withTimeout(1_000);

  const url = "https://httpbin.org/delay/5"; // responds after ~5s
  console.log("GET", url, "with 1s timeout...");

  try {
    const res = await fetch(url, { signal: cts.token.signal });
    console.log("status:", res.status);
  } catch (err) {
    console.log("fetch aborted:", err);
  }
}

main();
