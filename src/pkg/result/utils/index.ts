import { isPromise, toError } from "@/internal/utils";

import { Err, Ok, type AsyncResult, type Result } from "..";

/**
 * Wraps a value in an {@link Ok} result.
 *
 * Indicates a successful outcome.
 *
 * @example
 * const result = ok(42);
 * // result is Ok<number>
 *
 * @param value - The value to wrap.
 * @returns An Ok instance containing the provided value.
 */

export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/**
 * Wraps an error in an {@link Err} result.
 *
 * Indicates a failed outcome.
 *
 * @example
 * const result = err("Something went wrong");
 * // result is Err<string>
 *
 * @param error - The error to wrap.
 * @returns An Err instance containing the provided error.
 */

export function err<E>(error: E): Err<E> {
  return new Err(error);
}

/**
 * Executes a function and returns a {@link Result} or {@link AsyncResult}, depending on whether the function is synchronous or asynchronous.
 *
 * If the function succeeds, wraps the return value in {@link Ok}.
 * If it throws, wraps the error (optionally mapped) in {@link Err}.
 *
 * This utility supports both sync and async functions.
 *
 * @example
 * // Synchronous usage
 * const result = attempt(() => JSON.parse(input));
 *
 * @example
 * // Asynchronous usage
 * const result = await attempt(async () => {
 *   const response = await fetch(url);
 *   if (!response.ok) throw new Error("Request failed");
 *   return response;
 * });
 *
 * @param fn - A function to execute, either sync or async.
 * @param errorMapper - Optional function to map caught errors.
 * @returns A {@link Result} or {@link AsyncResult}, depending on `fn`.
 */

// Async with custom error mapping
export function attempt<T, E>(
  fn: () => Promise<T>,
  errorMapper: (e: unknown) => E,
): AsyncResult<T, E>;

// Sync with custom error mapping
export function attempt<T, E>(
  fn: () => T,
  errorMapper: (e: unknown) => E,
): Result<T, E>;

// Async with default error mapping
export function attempt<T>(fn: () => Promise<T>): AsyncResult<T, Error>;

// Sync with default error mapping
export function attempt<T>(fn: () => T): Result<T, Error>;

export function attempt<T, E>(
  fn: () => T | Promise<T>,
  errorMapper?: (e: unknown) => E,
): Result<T, E | Error> | AsyncResult<T, E | Error> {
  const mapper = errorMapper ?? toError;

  try {
    const result = fn();
    if (isPromise(result)) {
      return result.then(ok).catch((e) => err(mapper(e)));
    } else {
      return ok(result);
    }
  } catch (e) {
    return err(mapper(e));
  }
}

/**
 * Wraps a function (sync or async) in a safe wrapper that catches exceptions and returns a {@link Result} or {@link AsyncResult}.
 *
 * Use this to create reusable safe function wrappers without repeating try/catch logic.
 *
 * @example
 * const safeParse = withAttempt(JSON.parse);
 * const result = safeParse("{\"a\": 1}");
 *
 * @example
 * const safeFetch = withAttempt(async (url: string) => {
 *   const res = await fetch(url);
 *   if (!res.ok) throw new Error("Fetch failed");
 *   return res;
 * });
 * const result = await safeFetch("https://api.example.com");
 *
 * @param fn - The function to wrap. Can be sync or async.
 * @param errorMapper - Optional mapper for caught exceptions.
 * @returns A wrapped function that returns a {@link Result} or {@link AsyncResult}.
 */

// Async with custom error mapper
export function withAttempt<T, E, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<T>,
  errorMapper: (e: unknown) => E,
): (...args: Args) => AsyncResult<T, E>;

// Sync with custom error mapper
export function withAttempt<T, E, Args extends readonly unknown[]>(
  fn: (...args: Args) => T,
  errorMapper: (e: unknown) => E,
): (...args: Args) => Result<T, E>;

// Async without error mapper
export function withAttempt<T, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => AsyncResult<T, Error>;

// Sync without error mapper
export function withAttempt<T, Args extends readonly unknown[]>(
  fn: (...args: Args) => T,
): (...args: Args) => Result<T, Error>;

export function withAttempt<
  T,
  E,
  Args extends readonly unknown[],
  Out = Result<T, E | Error> | AsyncResult<T, E | Error>,
>(
  fn: (...args: Args) => T | Promise<T>,
  errorMapper?: (e: unknown) => E,
): (...args: Args) => Out {
  return (...args: Args) =>
    // Note: TypeScript cannot infer the conditional return type here cleanly,
    // so we assert the result as a workaround to support both sync and async functions.

    errorMapper
      ? (attempt(() => fn(...args), errorMapper) as Out)
      : (attempt(() => fn(...args)) as Out);
}
