import { isPromise, toError } from "@/internal/utils";

import { Err, Ok, type AsyncResult, type Result } from "..";

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
 * Returns {@link Ok} if successful; {@link Err} if an exception is thrown.
 *
 * @example
 * function parseJson<T>(input: string): Result<T> {
 *   return attempt(() => JSON.parse(input));
 * }
 */
// Overloads with custom error mapping
export function attempt<OkValue, ErrValue>(
  fn: () => OkValue,
  errorMapper: (e: unknown) => ErrValue,
): Result<OkValue, ErrValue>;

// Overloads with default error mapping (Error)
export function attempt<OkValue>(fn: () => OkValue): Result<OkValue, Error>;

export function attempt<OkValue, ErrValue>(
  fn: () => OkValue,
  errorMapper?: (e: unknown) => ErrValue,
): Result<OkValue, ErrValue | Error> {
  try {
    return ok(fn());
  } catch (e) {
    const mapper = errorMapper ?? toError;
    return err(mapper(e));
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
// Overloads with custom error mapping
export async function attemptAsync<OkValue, ErrValue>(
  fn: () => Promise<OkValue>,
  errorMapper: (e: unknown) => ErrValue,
): AsyncResult<OkValue, ErrValue>;

// Overloads with default error mapping (Error)
export async function attemptAsync<OkValue>(
  fn: () => Promise<OkValue>,
): AsyncResult<OkValue, Error>;

export async function attemptAsync<OkValue, ErrValue>(
  fn: () => Promise<OkValue>,
  errorMapper?: (e: unknown) => ErrValue,
): AsyncResult<OkValue, ErrValue | Error> {
  try {
    return ok(await fn());
  } catch (e) {
    const mapper = errorMapper ?? toError;
    return err(mapper(e));
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
// Overloads for async functions with custom error mapper
export function withAttempt<OkValue, ErrValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<OkValue>,
  errorMapper: (e: unknown) => ErrValue,
): (...args: Args) => Promise<Result<OkValue, ErrValue>>;

// Overloads for sync functions with custom error mapper
export function withAttempt<OkValue, ErrValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => OkValue,
  errorMapper: (e: unknown) => ErrValue,
): (...args: Args) => Result<OkValue, ErrValue>;

// Overloads for async functions without error mapper (defaults to Error)
export function withAttempt<OkValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<OkValue>,
): (...args: Args) => Promise<Result<OkValue, Error>>;

// Overloads for sync functions without error mapper (defaults to Error)
export function withAttempt<OkValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => OkValue,
): (...args: Args) => Result<OkValue, Error>;

export function withAttempt<OkValue, ErrValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => OkValue | Promise<OkValue>,
  errorMapper?: (e: unknown) => ErrValue,
): (
  ...args: Args
) =>
  | Result<OkValue, ErrValue | Error>
  | Promise<Result<OkValue, ErrValue | Error>> {
  return (...args: Args) => {
    const mapper = errorMapper ?? toError;

    try {
      const result = fn(...args);
      if (isPromise(result)) {
        return result
          .then((value) => ok(value))
          .catch((e) => {
            return err(mapper(e));
          });
      } else {
        return ok(result);
      }
    } catch (e) {
      return err(mapper(e));
    }
  };
}
