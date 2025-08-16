import type { Option } from "../option";
import type { Result } from "../result";

/** Pattern matches over {@link Result} and {@link Option} values.
 *
 * Provides a convenient, exhaustive way to handle both variants of a {@link Result}
 * (`Ok` and `Err`) or {@link Option} (`Some` and `None`) without manual branching.
 *
 * @example
 * const result: Result<number, string> = ok(42);
 * const message = match(result, {
 *   Ok: (value) => `Success: ${value}`,
 *   Err: (err) => `Error: ${err}`,
 * }); // -> "Success: 42"
 *
 * const option: Option<number> = some(10);
 * const doubled = match(option, {
 *   Some: (value) => value * 2,
 *   None: () => 0,
 * }); // -> 20
 */
export function match<T, E, U>(
  result: Result<T, E>,
  body: { Ok: (value: T) => U; Err: (errorValue: E) => U },
): U;

export function match<T extends NonNullable<unknown>, U>(
  option: Option<T>,
  body: { Some: (value: T) => U; None: () => U },
): U;

export function match<T, E, U>(
  value: Result<T, E> | Option<NonNullable<T>>,
  body:
    | { Ok: (value: T) => U; Err: (errorValue: E) => U }
    | { Some: (value: T) => U; None: () => U },
): U {
  // @ts-expect-error this is valid (source - trust me bro)
  return value.match(body);
}
