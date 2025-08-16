import { Err, Ok } from "./result";

/**
 * Creates a new {@link Ok} instance containing the provided value.
 *
 * @example
 * const result = ok(42); // -> Ok(42)
 * const result2 = ok();  // -> Ok<void>
 */
export function ok<T, E = never>(value: T): Ok<T, E>;
export function ok<T extends void = void, E = never>(value: void): Ok<void, E>;
export function ok<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value);
}

/**
 * Creates a new {@link Err} instance containing the provided error value.
 *
 * @example
 * const result = err("error");            // -> Err("error")
 * const result2 = err(new Error("fail")); // -> Err(Error)
 */
export function err<T = never, E extends string = string>(err: E): Err<T, E>;
export function err<T = never, E = unknown>(err: E): Err<T, E>;
export function err<T = never, E extends void = void>(err: void): Err<T, void>;
export function err<T = never, E = unknown>(err: E): Err<T, E> {
  return new Err(err);
}
