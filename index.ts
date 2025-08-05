/** Contains either an {@link Ok} value or an {@link Err} value. */
export type Result<T, E = Error> = Ok<T> | Err<E>;
/** Same as {@link Result}, but wrapped in a {@link Promise} */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

interface ResultLike<T, E> {
  /** Returns `true` if the result is an {@link Ok} value. */
  isOk(): this is Ok<T>;
  /** Returns `true` if the result is an {@link Err} value. */
  isErr(): this is Err<E>;

  /** Returns `true` if the result is {@link Ok} and the value inside of it matches a predicate. */
  isOkAnd(predicate: (value: T) => boolean): boolean;
  /** Returns `true` if the result is {@link Err} and the error value inside of it matches a predicate. */
  isErrAnd(predicate: (value: E) => boolean): boolean;

  /** Returns the contained {@link Ok} value.
   *
   * If called on {@link Err} value, returns `null`.
   */
  ok(): T | null;
  /** Returns the contained {@link Err} value.
   *
   * If called on {@link Ok} value, returns `null`.
   */
  err(): E | null;

  /** Unwraps the result.
   *
   * If called on {@link Ok} value, returns the contained value.
   * If called on {@link Err} value, throws the contained error value.
   */
  unwrap(): T;
  /** Unwraps the result.
   *
   * If called on {@link Err} value, returns the contained error value.
   * If called on {@link Ok} value, throws the contained value.
   */
  unwrapErr(): E;
  /** Unwraps the result.
   *
   * If called on {@link Ok} value, returns the contained value.
   * If called on {@link Err} value, returns the provided default value.
   */
  unwrapOr(defaultValue: T): T;
  /** Unwraps the result.
   *
   * If called on {@link Ok} value, returns the contained value.
   * If called on {@link Err} value, returns the result of the provided function.
   */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;
  /** Returns the contained error value.
   *
   * If called on {@link Ok} value, throws an {@link Error}, constructed with the provided message.
   * If called on {@link Err} value, returns the contained error value.
   */
  expectErr(message: string): E;

  /** Maps the contained value using the provided function.
   *
   * If called on {@link Ok} value, returns a new `Ok` result with the mapped value.
   * If called on {@link Err} value - returns same reference, noop.
   */
  map<U>(fn: (value: T) => U): Result<U, E>;
  /** Maps the contained error using the provided function.
   *
   * If called on {@link Err} value, returns a new `Err` result with the mapped error.
   * If called on {@link Ok} value - return same reference, noop.
   */
  mapErr<F>(fn: (errorValue: E) => F): Result<T, F>;

  /** Returns `other` if called on {@link Ok}. If called on {@link Err} value, returns same reference, noop.
   *
   * For lazy evaluation, use {@link andThen}.
   */
  and<U>(other: Result<U, E>): Result<U, E>;

  /** Returns result from the provided function if called on {@link Ok}. If called on {@link Err} value, returns same reference, noop.
   *
   * For eager evaluation, use {@link and}.
   */
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;

  /** Transposes an {@link Ok} value. Noop if called on {@link Err} value.
   *
   * If {@link Ok} contains a non-null value, returns same reference.
   *
   * `Result<T | null | undefined, E>` -> `Result<T, E> | null`
   */
  transpose(): Result<NonNullable<T>, E> | null;

  /** Returns a string representation of the result. */
  toString(): string;
}

/** Creates a new `Ok` result.
 *
 * @see {@link Ok}
 */
export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

/** Creates a new `Err` result.
 *
 * @see {@link Err}
 */
export function err<E>(error: E): Err<E> {
  return new Err(error);
}

/**
 * Returns a {@link Result<T, Error>}.
 *
 * If the function throws, returns an {@link Err<Error>}; otherwise, returns an {@link Ok<T>}.
 */
export function attempt<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : Error(String(error)));
  }
}

/** Return an {@link AsyncResult<T, Error>}
 *
 * If the function throws, returns an {@link Err<Error>}; otherwise, returns an {@link Ok<T>}.
 */
export async function attemptAsync<T>(fn: () => Promise<T>): AsyncResult<T> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof Error ? error : Error(String(error)));
  }
}

export class Ok<T> implements ResultLike<T, never> {
  static _tag = "Ok" as const;

  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isErr(): this is Err<never> {
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

  map<U>(fn: (value: T) => U): Ok<U> {
    return new Ok(fn(this.#value));
  }

  mapErr<F>(_fn: (errorValue: never) => F): Ok<T> {
    return this;
  }

  and<U, F>(other: Result<U, F>): Result<U, F> {
    return other;
  }

  andThen<U, F>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.#value);
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

export class Err<E> implements ResultLike<never, E> {
  static _tag = "Err" as const;

  readonly #value: E;

  constructor(value: E) {
    this.#value = value;
  }

  isErr(): this is Err<E> {
    return true;
  }

  isOk(): this is Ok<never> {
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

  map<U>(_fn: (value: never) => U): Err<E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): Err<F> {
    return new Err(fn(this.#value));
  }

  and<U>(_other: Result<U, E>): Result<U, E> {
    return this;
  }

  andThen<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this;
  }

  transpose(): Err<E> {
    return this;
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Err._tag}(${this.#value})`;
  }
}
