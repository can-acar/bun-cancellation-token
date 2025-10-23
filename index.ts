// Public entry for the bun-cancellation-token module
// Re-export the core APIs from src so Bun users can import the package directly.
export {
	CancellationToken,
	CancellationTokenSource,
	linkTokens,
	withTimeout,
	withDeadline,
	abortableDelay,
	anyToken,
} from "./src/cancellation/cancellation.ts";

// Optional default export for convenience in some consumers
export default {} as never;