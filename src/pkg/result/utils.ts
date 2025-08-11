import { Err, Ok } from "./result";

/**
 * Creates an {@link Ok} result containing the provided value.
 *
 * This is the preferred way to create success results, as it's more
 * concise than using the Ok constructor directly.
 *
 * @template T - The type of the success value.
 * @param value - The value to wrap in an Ok result.
 * @returns An Ok instance containing the provided value.
 *
 * @example
 * const result = ok(42);
 * // result is Ok<number>
 *
 * const userResult = ok({ id: 1, name: 'Alice' });
 * // userResult is Ok<{ id: number, name: string }>
 */
export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/**
 * Creates an {@link Err} result containing the provided error.
 *
 * This is the preferred way to create error results, as it's more
 * concise than using the Err constructor directly.
 *
 * @template E - The type of the error value.
 * @param error - The error to wrap in an Err result.
 * @returns An Err instance containing the provided error.
 *
 * @example
 * const result = err("Something went wrong");
 * // result is Err<string>
 *
 * const errorResult = err(new Error("Network timeout"));
 * // errorResult is Err<Error>
 */
export function err<E>(error: E): Err<E> {
  return new Err(error);
}
