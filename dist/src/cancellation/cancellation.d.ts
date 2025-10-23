export type CancellationReason = string | Error;
export declare class CancellationToken {
    readonly signal: AbortSignal;
    constructor(signal: AbortSignal);
    get isCancellationRequested(): boolean;
    throwIfCancellationRequested(): void;
    onCancelled(cb: (reason: any) => void): () => void;
}
export declare class CancellationTokenSource {
    private controller;
    readonly token: CancellationToken;
    cancel(reason?: CancellationReason): void;
}
export declare function linkTokens(...tokens: CancellationToken[]): CancellationTokenSource;
export declare function withTimeout(ms: number, parent?: CancellationToken): CancellationTokenSource;
export declare function withDeadline(at: number | Date, parent?: CancellationToken): CancellationTokenSource;
export declare function abortableDelay(ms: number, ct?: CancellationToken): Promise<void>;
export declare function anyToken(...tokens: CancellationToken[]): CancellationToken;
