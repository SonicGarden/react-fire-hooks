/**
 * A deferred promise that can be manually resolved or rejected.
 * Useful for testing async operations where you need to control
 * the exact timing of promise resolution.
 */
export type DeferredPromise<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

/**
 * Creates a deferred promise that can be manually resolved or rejected.
 *
 * @example
 * const deferred = createDeferred<string>();
 * const fn = vi.fn(() => deferred.promise);
 *
 * // Later, manually resolve
 * deferred.resolve('test data');
 *
 * // Or manually reject
 * deferred.reject(new Error('test error'));
 */
export const createDeferred = <T>(): DeferredPromise<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
