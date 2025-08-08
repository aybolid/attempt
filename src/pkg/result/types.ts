import type { Err, Ok } from ".";

/** Contains either an {@link Ok} value or an {@link Err} value.
 *
 * @example
 * let result: Result<number, string>;
 * result = ok(69);
 * result = err("meh")
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/** Same as {@link Result}, but wrapped in a {@link Promise}. */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export interface IntoResult<T, E> {
  /** Converts this value into a {@link Result}.
   *
   * @example
   * class MyError extends Error implements IntoResult<never, MyError> {
   *   override name = "MyError";
   *   intoResult(): Result<never, MyError> {
   *     return err(this)
   *   }
   * }
   */
  intoResult(): Result<T, E>;
}
