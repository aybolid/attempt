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
