import { Err, Ok } from "./result";

/** Create new {@link Ok} instance containing the provided value */
export function ok<T, E = never>(value: T): Ok<T, E>;
export function ok<T extends void = void, E = never>(value: void): Ok<void, E>;
export function ok<T, E = never>(value: T): Ok<T, E> {
  return new Ok(value);
}

/** Create new {@link Err} instance containing the provided error value */
export function err<T = never, E extends string = string>(err: E): Err<T, E>;
export function err<T = never, E = unknown>(err: E): Err<T, E>;
export function err<T = never, E extends void = void>(err: void): Err<T, void>;
export function err<T = never, E = unknown>(err: E): Err<T, E> {
  return new Err(err);
}
