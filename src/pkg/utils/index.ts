import type { Option } from "../option";
import type { Result } from "../result";

/**
 * Pattern matches on a `Result` or `Option`, invoking the appropriate handler function.
 *
 * For `Result`, calls `body.Ok` if `Ok`, or `body.Err` if `Err`.
 * For `Option`, calls `body.Some` if `Some`, or `body.None` if `None`.
 *
 * @template T - The contained success or option value type.
 * @template E - The error type for `Result`.
 * @template U - The return type of the match handlers.
 *
 * @param value - The `Result` or `Option` instance to match on.
 * @param body - An object with handler functions for each variant.
 *
 * @returns The result of the invoked handler function.
 *
 * @example
 * match(ok(42), {
 *   Ok: (v) => `Value: ${v}`,
 *   Err: (e) => `Error: ${e}`,
 * });
 *
 * match(some("foo"), {
 *   Some: (v) => `Got ${v}`,
 *   None: () => "No value",
 * });
 */
export function match<T, E, U>(
  result: Result<T, E>,
  body: { Ok: (value: T) => U; Err: (errorValue: E) => U },
): U;

export function match<T, U>(
  option: Option<T>,
  body: { Some: (value: T) => U; None: () => U },
): U;

export function match<T, E, U>(
  value: Result<T, E> | Option<T>,
  body:
    | { Ok: (value: T) => U; Err: (errorValue: E) => U }
    | { Some: (value: T) => U; None: () => U },
): U {
  // @ts-expect-error this is valid (source - trust me bro)
  return value.match(body);
}
