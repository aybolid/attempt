/** Contains either an {@link Ok} value or an {@link Err} value. */
type Result<T, E = Error> = Ok<T> | Err<E>;

/** Same as {@link Result}, but wrapped in a {@link Promise}. */
type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

interface ResultLike<T, E> {
  /** Returns `true` if this is an {@link Ok} result. */
  isOk(): this is Ok<T>;

  /** Returns `true` if this is an {@link Err} result. */
  isErr(): this is Err<E>;

  /** Returns `true` if this is an {@link Ok} result and its value satisfies the predicate. */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if this is an {@link Err} result and its error satisfies the predicate. */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  /** Returns the {@link Ok} value if present, otherwise `null`. */
  ok(): T | null;

  /** Returns the {@link Err} value if present, otherwise `null`. */
  err(): E | null;

  /** Returns the {@link Ok} value, or throws if this is an {@link Err}. */
  unwrap(): T;

  /** Returns the {@link Err} value, or throws if this is an {@link Ok}. */
  unwrapErr(): E;

  /** Returns the {@link Ok} value if present, otherwise returns the provided default value. */
  unwrapOr(defaultValue: T): T;

  /** Returns the {@link Ok} value if present, otherwise computes a fallback using the provided function. */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  /** Returns the {@link Err} value.
   *
   * Throws an {@link Error} with the given message if this is an {@link Ok}.
   */
  expectErr(message: string): E;

  /** Maps the {@link Ok} value using the provided function.
   *
   * If this is an {@link Err}, returns self.
   */
  map<U>(fn: (value: T) => U): Result<U, E>;

  /** Maps the {@link Err} value using the provided function.
   *
   * If this is an {@link Ok}, returns self.
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /** Returns `other` if this is an {@link Ok}; otherwise returns self.
   *
   * For lazy evaluation, use {@link andThen}.
   */
  and<U>(other: Result<U, E>): Result<U, E>;

  /** Applies the function to the {@link Ok} value and returns its result.
   *
   * If this is an {@link Err}, returns self.
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

/** Represents a successful result containing a value of type `T`. */
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

/** Represents a failed result containing an error of type `E`. */
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
