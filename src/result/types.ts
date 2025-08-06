import type { Err, Ok } from ".";

/** Contains either an {@link Ok} value or an {@link Err} value.
 *
 * @example
 * let result: Result<number, string>;
 * result = ok(69);
 * result = err("meh")
 *
 * @see {@link ok}, {@link err}
 */
export type Result<OkValue, ErrValue = Error> = Ok<OkValue> | Err<ErrValue>;

/** Same as {@link Result}, but wrapped in a {@link Promise}. */
export type AsyncResult<OkValue, ErrValue = Error> = Promise<
  Result<OkValue, ErrValue>
>;

export interface ResultLike<OkValue, ErrValue> {
  /** Type guard. Returns `true` if this is an {@link Ok} result.
   *
   * @example
   * const result = mayFail();
   *
   * if (result.isOk()) {
   *   // do smth with Ok
   * } else {
   *   // do smth with Err
   * }
   */
  isOk(): this is Ok<OkValue>;

  /** Type guard. Returns `true` if this is an {@link Err} result.
   *
   * @example
   * const result = mayFail();
   *
   * if (result.isErr()) {
   *   // do smth with Err
   * } else {
   *   // do smth with Ok
   * }
   */
  isErr(): this is Err<ErrValue>;

  /** Returns `true` if this is an {@link Ok} result and its value satisfies the predicate. */
  isOkAnd(predicate: (value: OkValue) => boolean): boolean;

  /** Returns `true` if this is an {@link Err} result and its error satisfies the predicate. */
  isErrAnd(predicate: (error: ErrValue) => boolean): boolean;

  /** Returns the {@link Ok} value if present, otherwise `null`. */
  ok(): OkValue | null;

  /** Returns the {@link Err} value if present, otherwise `null`. */
  err(): ErrValue | null;

  /** Returns the {@link Ok} value, or throws {@link ResultError} if this is an {@link Err}. */
  unwrap(): OkValue;

  /** Returns the {@link Err} value, or throws {@link ResultError} if this is an {@link Ok}. */
  unwrapErr(): ErrValue;

  /** Returns the {@link Ok} value if present, otherwise returns the provided default value. */
  unwrapOr(defaultValue: OkValue): OkValue;

  /** Returns the {@link Ok} value if present, otherwise computes a fallback using the provided function. */
  unwrapOrElse(defaultValueFn: (error: ErrValue) => OkValue): OkValue;

  /** Returns the {@link Err} value.
   *
   * Throws an {@link Error} with the given message if this is an {@link Ok}.
   */
  expectErr(message: string): ErrValue;

  /** Maps the {@link Ok} value using the provided function.
   *
   * If this is an {@link Err}, returns self.
   */
  map<OtherOkValue>(
    fn: (value: OkValue) => OtherOkValue,
  ): Result<OtherOkValue, ErrValue>;

  /** Maps the {@link Err} value using the provided function.
   *
   * If this is an {@link Ok}, returns self.
   */
  mapErr<OtherErrValue>(
    fn: (error: ErrValue) => OtherErrValue,
  ): Result<OkValue, OtherErrValue>;

  /** Returns `other` if this is an {@link Ok}; otherwise returns self.
   *
   * For lazy evaluation, use {@link andThen}.
   */
  and<OtherOkValue>(
    other: Result<OtherOkValue, ErrValue>,
  ): Result<OtherOkValue, ErrValue>;

  /** Applies the function to the {@link Ok} value and returns its result.
   *
   * If this is an {@link Err}, returns self.
   */
  andThen<OtherOkValue>(
    fn: (value: OkValue) => Result<OtherOkValue, ErrValue>,
  ): Result<OtherOkValue, ErrValue>;

  /** Returns `other` if this is an {@link Err}; otherwise returns self.
   *
   * For lazy evaluation, use {@link orElse}.
   */
  or<OtherErrValue>(
    other: Result<OkValue, OtherErrValue>,
  ): Result<OkValue, OtherErrValue>;

  /** Applies the function to the {@link Err} value and returns its result.
   *
   * If this is an {@link Ok}, returns self.
   */
  orElse<OtherErrorValue>(
    fn: (error: ErrValue) => Result<OkValue, OtherErrorValue>,
  ): Result<OkValue, OtherErrorValue>;

  /** Converts an {@link Ok} containing `null` or `undefined` to `null`.
   *
   * Otherwise, returns self.
   */
  transpose(): Result<NonNullable<OkValue>, ErrValue> | null;

  /** Returns a string representation of the result. */
  toString(): string;
}
