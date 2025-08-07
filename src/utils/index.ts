import { Err, Ok, type AsyncResult, type Result } from "@/result";

/** Creates an {@link Ok} result wrapping the provided value.
 *
 * @example
 * const result = ok(42);
 * console.log(result instanceof Ok); // true
 */
export function ok<OkValue>(value: OkValue): Ok<OkValue> {
  return new Ok(value);
}

/** Creates an {@link Err} result wrapping the provided error.
 *
 * @example
 * const result = err("An error occurred");
 * console.log(result instanceof Err); // true
 */
export function err<ErrValue>(error: ErrValue): Err<ErrValue> {
  return new Err(error);
}

/** Executes a synchronous function and wraps its result in a {@link Result}.
 *
 * Returns {@link Ok} if successful; {@link Err<Error>} if an exception is thrown.
 *
 * @example
 * function parseJson<T>(input: string): Result<T> {
 *   return attempt(() => JSON.parse(input));
 * }
 */
export function attempt<OkValue>(fn: () => OkValue): Result<OkValue, Error> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : Error(String(error)));
  }
}

/** Executes an asynchronous function and wraps its result in an {@link AsyncResult}.
 *
 * Returns {@link Ok} if successful; {@link Err<Error>} if an exception is thrown.
 *
 * @example
 * async function callApi(url: string): Result<Response> {
 *   return attemptAsync(async () => {
 *     const response = await fetch(url);
 *     if (!response.ok) throw `HTTP Error: ${response.status} (${response.statusText})`;
 *     return response;
 *   });
 * }
 */
export async function attemptAsync<OkValue>(
  fn: () => Promise<OkValue>,
): AsyncResult<OkValue, Error> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof Error ? error : Error(String(error)));
  }
}

/**
 * Wraps a function to automatically handle exceptions and return {@link Result} ({@link AsyncResult} if wrapping an async function).
 *
 * @example
 * const safeApiCall = withAttempt(async (url: string) => {
 *   const response = await fetch(url);
 *   if (!response.ok) throw `HTTP ${response.status}`; // Error will be constructed
 *   return response;
 * });
 *
 * const result: AsyncResult<Response, Error> = await safeApiCall("/api/data");
 */
export function withAttempt<OkValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<OkValue>,
): (...args: Args) => AsyncResult<OkValue, Error>;

export function withAttempt<OkValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => OkValue,
): (...args: Args) => Result<OkValue, Error>;

export function withAttempt<Fn extends (...args: unknown[]) => unknown>(
  fn: Fn,
): (...args: Parameters<Fn>) => unknown {
  return (...args: Parameters<Fn>) => {
    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result
          .then((value) => ok(value))
          .catch((error) =>
            err(error instanceof Error ? error : Error(String(error))),
          );
      } else {
        return ok(result);
      }
    } catch (error) {
      return err(error instanceof Error ? error : Error(String(error)));
    }
  };
}

/** Matches a {@link Result} against a set of cases.
 *
 * Same as calling {@link Result.match} directly.
 *
 * @example
 * const result = ok(42);
 * const value = match(result, {
 *   Err: (error) => `Error: ${error}`,
 *   Ok: (value) => `Value: ${value}`,
 * });
 * console.log(value); // "Value: 42"
 */
export function match<ReturnValue, OkValue, ErrValue>(
  result: Result<OkValue, ErrValue>,
  body: {
    Err: (error: ErrValue) => ReturnValue;
    Ok: (value: OkValue) => ReturnValue;
  },
): ReturnValue {
  return result.match(body);
}
