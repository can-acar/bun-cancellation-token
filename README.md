# bun-cancellation-token

Lightweight cancellation tokens built on top of AbortController for Bun/TypeScript.

## Install

```bash
bun add bun-cancellation-token
```

## Usage

```ts
import { CancellationTokenSource, abortableDelay } from "bun-cancellation-token";

const src = new CancellationTokenSource();

// cancel after 50ms
setTimeout(() => src.cancel("timeout"), 50);

try {
	await abortableDelay(500, src.token);
} catch (err) {
	console.log("aborted:", err);
}
```

## Scripts

- Dev: runs the entry module locally

```bash
bun run dev
```

- Test: runs unit tests with Bun's test runner

```bash
bun test
```

- Build: bundles to `dist/` for Bun target

```bash
bun run build
```

This package is designed primarily as a Bun module and ships TypeScript sources for first-class Bun support.
