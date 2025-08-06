/** Contains either an {@link Ok} value or an {@link Err} value.
 *
 * @example
 * let result: Result<string, Error>
 * result = ok("Hello");
 * result = err(new Error("Oops"));
 */
type Result<T, E = Error> = Ok<T> | Err<E>;

/** Same as {@link Result}, but wrapped in a {@link Promise}. */
type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

interface ResultLike<T, E> {
  /** Returns `true` if this is an {@link Ok} result.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.isOk()); // true
   *
   * const errResult = fa("Oops");
   * console.log(errResult.isOk()); // false
   */
  isOk(): this is Ok<T>;

  /** Returns `true` if this is an {@link Err} result.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.isErr()); // false
   *
   * const errResult = err("Oops");
   * console.log(errResult.isErr()); // true
   */
  isErr(): this is Err<E>;

  /** Returns `true` if this is an {@link Ok} result and its value satisfies the predicate.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.isOkAnd(x => x > 0)); // true
   * console.log(okResult.isOkAnd(x => x < 0)); // false
   *
   * const errResult = err("Oops");
   * console.log(errResult.isOkAnd(x => x > 0)); // false
   * console.log(errResult.isOkAnd(x => x < 0)); // false
   */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if this is an {@link Err} result and its error satisfies the predicate.
   *
   * @example
   * const errResult = err(new Error("Oops"));
   * console.log(errResult.isErrAnd(e => e.message === "Oops")); // true
   * console.log(errResult.isErrAnd(e => e.message === "Another Oops")); // false
   *
   * const okResult = ok(42);
   * console.log(okResult.isErrAnd(e => e.message === "Oops")); // false
   * console.log(okResult.isErrAnd(e => e.message === "Another Oops")); // false
   */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  /** Returns the {@link Ok} value if present, otherwise `null`.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.ok()); // 42
   *
   * const errResult = err("Oops");
   * console.log(errResult.ok()); // null
   */
  ok(): T | null;

  /** Returns the {@link Err} value if present, otherwise `null`.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.err()); // null
   *
   * const errResult = err("Oops");
   * console.log(errResult.err()); // "Oops"
   */
  err(): E | null;

  /** Returns the {@link Ok} value, or throws if this is an {@link Err}.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.unwrap()); // 42
   *
   * const errResult = err("Oops");
   * console.log(errResult.unwrap()); // throws "Oops"
   */
  unwrap(): T;

  /** Returns the {@link Err} value, or throws if this is an {@link Ok}.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.unwrapErr()); // throws 42
   *
   * const errResult = err("Oops");
   * console.log(errResult.unwrapErr()); // "Oops"
   */
  unwrapErr(): E;

  /** Returns the {@link Ok} value if present, otherwise returns the provided default value.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.unwrapOr(0)); // 42
   *
   * const errResult = err("Oops");
   * console.log(errResult.unwrapOr(0)); // 0
   */
  unwrapOr(defaultValue: T): T;

  /** Returns the {@link Ok} value if present, otherwise computes a fallback using the provided function.
   *
   * @example
   * const okResult = ok(42);
   * console.log(okResult.unwrapOrElse(() => 0)); // 42
   *
   * const errResult = err("Oops");
   * console.log(errResult.unwrapOrElse((errValue) => errValue.length)); // 4
   */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  /** Returns the {@link Err} value.
   *
   * Throws an {@link Error} with the given message if this is an {@link Ok}.
   *
   * @example
   * const errResult = err("Oops");
   * console.log(errResult.expectErr("Expected an error")); // "Oops"
   *
   * const okResult = ok(42);
   * console.log(okResult.expectErr("Expected an error")); // throws Error("Expected an error: 42")
   */
  expectErr(message: string): E;

  /** Maps the {@link Ok} value using the provided function.
   *
   * If this is an {@link Err}, returns self.
   *
   * @example
   * const okResult = ok(42);
   * const mappedOkResult = okResult.map((value) => value * 2);
   * console.log(mappedOkResult); // Ok(84)
   * console.log(mappedOkResult === okResult); // false (new Ok was created)
   *
   * const errResult = err("Oops");
   * const mappedErrResult = errResult.map((value) => value * 2);
   * console.log(mappedErrResult); // Err("Oops")
   * console.log(mappedErrResult === errResult); // true (same reference)
   */
  map<U>(fn: (value: T) => U): Result<U, E>;

  /** Maps the {@link Err} value using the provided function.
   *
   * If this is an {@link Ok}, returns self.
   *
   * @example
   * const okResult = ok(42);
   * const mappedOkResult = okResult.mapErr((error) => error.toUpperCase());
   * console.log(mappedOkResult); // Ok(84)
   * console.log(mappedOkResult === okResult); // true (same reference)
   *
   * const errResult = err("Oops");
   * const mappedErrResult = errResult.mapErr((error) => error.toUpperCase());
   * console.log(mappedErrResult); // Err("OOPS")
   * console.log(mappedErrResult !== errResult); // false (new Err was created)
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /** Returns `other` if this is an {@link Ok}; otherwise returns self.
   *
   * For lazy evaluation, use {@link andThen}.
   *
   * @example
   * const okResult = ok(42);
   * const otherResult = ok(100);
   * const andResult = okResult.and(otherResult);
   * console.log(andResult); // Ok(100)
   * console.log(andResult === otherResult); // true (same reference)
   *
   * const errResult = err("Oops");
   * const otherResult = ok(100);
   * const andErrResult = errResult.and(otherResult);
   * console.log(andErrResult); // Err("Oops!")
   * console.log(andErrResult === errResult); // true (same reference)
   */
  and<U>(other: Result<U, E>): Result<U, E>;

  /** Applies the function to the {@link Ok} value and returns its result.
   *
   * If this is an {@link Err}, returns self.
   *
   * @example
   * const okResult = ok(42);
   * const mappedOkResult = okResult.andThen(x => ok(x * 2));
   * console.log(mappedOkResult); // Ok(84)
   * console.log(mappedOkResult === okResult); // true (same reference)
   *
   * const errResult = err("Oops");
   * const mappedErrResult = errResult.andThen(x => ok(x * 2));
   * console.log(mappedErrResult); // Err("Oops!")
   * console.log(mappedErrResult === errResult); // true (same reference)
   */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /** Returns `other` if this is an {@link Err}; otherwise returns self.
   *
   * For lazy evaluation, use {@link orElse}.
   */
  or<F>(other: Result<T, F>): Result<T, F>;

  /** Applies the function to the {@link Err} value and returns its result.
   *
   * If this is an {@link Ok}, returns self.
   */
  orElse<F>(fn: (error: E) => Result<T, F>): Result<T, F>;

  /** Converts an {@link Ok} containing `null` or `undefined` to `null`.
   *
   * Otherwise, returns self.
   */
  transpose(): Result<NonNullable<T>, E> | null;

  /** Returns a string representation of the result. */
  toString(): string;
}

/** Creates an {@link Ok} result wrapping the provided value. */
function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/** Creates an {@link Err} result wrapping the provided error. */
function err<E>(error: E): Err<E> {
  return new Err(error);
}

/** Executes a synchronous function and wraps its result in a {@link Result}.
 *
 * Returns {@link Ok} if successful; {@link Err<Error>} if an exception is thrown.
 */
function attempt<T>(fn: () => T): Result<T, Error> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : Error(String(error)));
  }
}

/** Executes an asynchronous function and wraps its result in an {@link AsyncResult}.
 *
 * Returns {@link Ok} if successful; {@link Err<Error>} if an exception is thrown.
 */
async function attemptAsync<T>(fn: () => Promise<T>): AsyncResult<T, Error> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof Error ? error : Error(String(error)));
  }
}

/** Represents a successful result containing a value of type `T`. The value is immutable. */
class Ok<T> implements ResultLike<T, never> {
  static _tag = "Ok" as const;

  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isErr(): this is never {
    return false;
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isOkAnd(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  isErrAnd(_predicate: (value: never) => boolean): boolean {
    return false;
  }

  ok(): T {
    return this.#value;
  }

  err(): null {
    return null;
  }

  unwrap(): T {
    return this.#value;
  }

  unwrapErr(): never {
    throw this.#value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.#value;
  }

  unwrapOrElse(_defaultValueFn: (_error: never) => T): T {
    return this.#value;
  }

  expectErr(message: string): never {
    throw Error(`${message}: ${this.#value}`);
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.#value));
  }

  mapErr<F>(_fn: (errorValue: never) => F): Result<T, F> {
    return this;
  }

  and<U, F>(other: Result<U, F>): Result<U, F> {
    return other;
  }

  andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.#value);
  }

  or<F>(_other: Result<T, F>): Result<T, F> {
    return this;
  }

  orElse<_T, F>(_fn: (errorValue: never) => Result<T, F>): Result<T, F> {
    return this;
  }

  transpose(): Ok<NonNullable<T>> | null {
    return this.#value === null || this.#value === undefined
      ? null
      : (this as Ok<NonNullable<T>>);
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Ok._tag}(${this.#value})`;
  }
}

/** Represents a failed result containing an error of type `E`. The error is immutable. */
class Err<E> implements ResultLike<never, E> {
  static _tag = "Err" as const;

  readonly #value: E;

  constructor(value: E) {
    this.#value = value;
  }

  isErr(): this is Err<E> {
    return true;
  }

  isOk(): this is never {
    return false;
  }

  isOkAnd(_predicate: (value: never) => boolean): boolean {
    return false;
  }

  isErrAnd(predicate: (value: E) => boolean): boolean {
    return predicate(this.#value);
  }

  ok(): null {
    return null;
  }

  err(): E {
    return this.#value;
  }

  unwrap(): never {
    throw this.#value;
  }

  unwrapErr(): E {
    return this.#value;
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(defaultValueFn: (errorValue: E) => T): T {
    return defaultValueFn(this.#value);
  }

  expectErr(_message: string): E {
    return this.#value;
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.#value));
  }

  and<U, _F>(_other: Result<U, E>): Result<U, E> {
    return this;
  }

  andThen<U, _F>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this;
  }

  or<T, F = E>(other: Result<T, F>): Result<T, F> {
    return other;
  }

  orElse<T, F = E>(fn: (errorValue: E) => Result<T, F>): Result<T, F> {
    return fn(this.#value);
  }

  transpose(): Err<E> {
    return this;
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Err._tag}(${this.#value})`;
  }
}

export type { Result, AsyncResult };
export { ok, err, Ok, Err, attempt, attemptAsync };
