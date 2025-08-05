export type Result<T, E = Error> = Ok<T> | Err<E>;
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export interface ResultLike<T, E> {
  /** Returns `true` if the result is an {@link Ok} value. */
  isOk(): this is Ok<T>;
  /** Returns `true` if the result is an {@link Err} value. */
  isErr(): this is Err<E>;

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

  /** Maps the contained value using the provided function.
   *
   * If called on {@link Ok} value, returns a new `Ok` result with the mapped value.
   * If called on {@link Err} value - returns same reference, noop.
   */
  map<U>(fn: (value: T) => U): ResultLike<U, E>;
  /** Maps the contained error using the provided function.
   *
   * If called on {@link Err} value, returns a new `Err` result with the mapped error.
   * If called on {@link Ok} value - return same reference, noop.
   */
  mapErr<F>(fn: (errorValue: E) => F): ResultLike<T, F>;

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

  ok(): T {
    return this.#value;
  }

  err(): null {
    return null;
  }

  unwrap(): T {
    return this.#value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.#value;
  }

  unwrapOrElse(_defaultValueFn: (_error: never) => T): T {
    return this.#value;
  }

  map<U>(fn: (value: T) => U): ResultLike<U, never> {
    return new Ok(fn(this.#value));
  }

  mapErr<F>(_fn: (errorValue: never) => F): ResultLike<T, F> {
    return this;
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Ok._tag}(${String(this.#value)})`;
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

  ok(): null {
    return null;
  }

  err(): E {
    return this.#value;
  }

  unwrap(): never {
    throw this.#value;
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(defaultValueFn: (errorValue: E) => T): T {
    return defaultValueFn(this.#value);
  }

  map<U>(_fn: (value: never) => U): ResultLike<U, E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): ResultLike<never, F> {
    return new Err(fn(this.#value));
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Err._tag}(${String(this.#value)})`;
  }
}
