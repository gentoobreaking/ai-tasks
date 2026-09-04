/**
 * Generic DOM-script loader with readiness polling.
 *
 * Used by the Google Maps loader to inject a <script> tag and resolve once the
 * global is ready. Decoupled so the retry/poll logic is independently testable
 * and not tied to google maps specifics.
 */

export interface RetryableLoaderOptions {
  /** Script src URL to inject. */
  src: string;
  /** Predicate that returns true when the global is ready. */
  ready: () => boolean;
  /** Max total time to wait (ms). */
  timeout: number;
  /** Milliseconds between readiness polls. */
  pollInterval: number;
  /** Max number of readiness polls. */
  maxAttempts: number;
}

/**
 * Inject a script tag, then poll `ready` until true or deadline exceeded.
 * Returns a promise that resolves the window global or rejects on failure.
 */
export function createRetryableLoader<T>(options: RetryableLoaderOptions): Promise<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  const timeoutId = setTimeout(() => {
    cleanup();
    reject(new Error('Script failed to load within timeout.'));
  }, options.timeout);

  const script = document.createElement('script');
  script.src = options.src;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    cleanup();
    reject(
      new Error(`Failed to load script: ${options.src}. Check network connectivity and API key.`)
    );
  };

  script.onload = () => {
    pollReady();
  };

  function cleanup() {
    clearTimeout(timeoutId);
  }

  function pollReady(attempt = 0): void {
    if (options.ready()) {
      cleanup();
      resolve(window as unknown as T);
      return;
    }
    if (attempt >= options.maxAttempts) {
      cleanup();
      reject(new Error('Script loaded but global never became ready.'));
      return;
    }
    setTimeout(() => pollReady(attempt + 1), options.pollInterval);
  }

  document.head.appendChild(script);
  return promise;
}
