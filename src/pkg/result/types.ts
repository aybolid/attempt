import type { Err, Ok } from ".";

/** Contains either an {@link Ok} value or an {@link Err} value.
 *
 * @example
 * let result: Result<number, string>;
 * result = ok(69);
 * result = err("meh")
 */
export type Result<OkValue, ErrValue = Error> = Ok<OkValue> | Err<ErrValue>;

/** Same as {@link Result}, but wrapped in a {@link Promise}. */
export type AsyncResult<OkValue, ErrValue = Error> = Promise<
  Result<OkValue, ErrValue>
>;

export interface IntoResult<OkValue, ErrValue> {
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
  intoResult(): Result<OkValue, ErrValue>;
}
