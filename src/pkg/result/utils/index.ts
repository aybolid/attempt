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

export function ok<OkValue>(value: OkValue): Ok<OkValue> {
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

export function err<ErrValue>(error: ErrValue): Err<ErrValue> {
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
export function attempt<OkValue, ErrValue>(
  fn: () => Promise<OkValue>,
  errorMapper: (e: unknown) => ErrValue,
): AsyncResult<OkValue, ErrValue>;

// Sync with custom error mapping
export function attempt<OkValue, ErrValue>(
  fn: () => OkValue,
  errorMapper: (e: unknown) => ErrValue,
): Result<OkValue, ErrValue>;

// Async with default error mapping
export function attempt<OkValue>(
  fn: () => Promise<OkValue>,
): AsyncResult<OkValue, Error>;

// Sync with default error mapping
export function attempt<OkValue>(fn: () => OkValue): Result<OkValue, Error>;

export function attempt<OkValue, ErrValue>(
  fn: () => OkValue | Promise<OkValue>,
  errorMapper?: (e: unknown) => ErrValue,
): Result<OkValue, ErrValue | Error> | AsyncResult<OkValue, ErrValue | Error> {
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
export function withAttempt<OkValue, ErrValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<OkValue>,
  errorMapper: (e: unknown) => ErrValue,
): (...args: Args) => AsyncResult<OkValue, ErrValue>;

// Sync with custom error mapper
export function withAttempt<OkValue, ErrValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => OkValue,
  errorMapper: (e: unknown) => ErrValue,
): (...args: Args) => Result<OkValue, ErrValue>;

// Async without error mapper
export function withAttempt<OkValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => Promise<OkValue>,
): (...args: Args) => AsyncResult<OkValue, Error>;

// Sync without error mapper
export function withAttempt<OkValue, Args extends readonly unknown[]>(
  fn: (...args: Args) => OkValue,
): (...args: Args) => Result<OkValue, Error>;

export function withAttempt<
  OkValue,
  ErrValue,
  Args extends readonly unknown[],
  ReturnValue =
    | Result<OkValue, ErrValue | Error>
    | AsyncResult<OkValue, ErrValue | Error>,
>(
  fn: (...args: Args) => OkValue | Promise<OkValue>,
  errorMapper?: (e: unknown) => ErrValue,
): (...args: Args) => ReturnValue {
  return (...args: Args) =>
    // Note: TypeScript cannot infer the conditional return type here cleanly,
    // so we assert the result as a workaround to support both sync and async functions.
    errorMapper
      ? (attempt(() => fn(...args), errorMapper) as ReturnValue)
      : (attempt(() => fn(...args)) as ReturnValue);
}
