// Serialize reads with commands so a stale poll cannot overtake a user action.
export function createSessionSyncQueue() {
  let tail = Promise.resolve();
  let closed = false;
  return {
    run(operation) {
      const result = tail.catch(() => undefined).then(() => {
        if (closed) throw new Error("Session connection closed");
        return operation();
      });
      tail = result;
      // Keep an unobserved caller rejection from becoming an unhandled rejection.
      tail.catch(() => undefined);
      return result;
    },
    close() { closed = true; },
  };
}
export function sessionRetryDelay(failures) {
  return Math.min(30000, 1000 * 2 ** Math.min(Math.max(failures, 0), 5));
}
