import { Err, Ok } from "./result";

/**
 * Creates a new `Ok` result containing the given value.
 *
 * @template T - The success value type.
 * @template E - The error type (usually `never` here).
 * @param value - The success value to wrap.
 * @returns An `Ok` instance wrapping the value.
 *
 * @example
 * const result = ok(42);
 * console.log(result.isOk());   // true
 * console.log(result.unwrap()); // 42
 */
export function ok<T, E = never>(value: T): Ok<T, E>;
export function ok<T extends void = void, E = never>(value: void): Ok<void, E>;
export function ok<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value);
}

/**
 * Creates a new `Err` result containing the given error.
 *
 * @template T - The success value type (usually `never` here).
 * @template E - The error value type.
 * @param err - The error value to wrap.
 * @returns An `Err` instance wrapping the error.
 *
 * @example
 * const failure = err("Network error");
 * console.log(failure.isErr());     // true
 * console.log(failure.unwrapErr()); // "Network error"
 */
export function err<T = never, E extends string = string>(err: E): Err<T, E>;
export function err<T = never, E = unknown>(err: E): Err<T, E>;
export function err<T = never, E extends void = void>(err: void): Err<T, void>;
export function err<T = never, E = unknown>(err: E): Err<T, E> {
  return new Err(err);
}
