export * from "./types";
export * from "./utils";

import type { Result } from "./types";

interface ResultLike<T, E> {
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
  isOk(): this is Ok<T>;

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
  isErr(): this is Err<E>;

  /** Returns `true` if this is an {@link Ok} result and its value satisfies the predicate. */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if this is an {@link Err} result and its error satisfies the predicate. */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  /** Returns the {@link Ok} value if present, otherwise `null`. */
  ok(): T | null;

  /** Returns the {@link Err} value if present, otherwise `null`. */
  err(): E | null;

  /** Returns the {@link Ok} value, or throws {@link ResultError} if this is an {@link Err}. */
  unwrap(): T;

  /** Returns the {@link Err} value, or throws {@link ResultError} if this is an {@link Ok}. */
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
  map<T2>(fn: (value: T) => T2): Result<T2, E>;

  /** Maps the {@link Err} value using the provided function.
   *
   * If this is an {@link Ok}, returns self.
   */
  mapErr<E2>(fn: (error: E) => E2): Result<T, E2>;

  /** Returns `other` if this is an {@link Ok}; otherwise returns self.
   *
   * For lazy evaluation, use {@link andThen}.
   */
  and<T2>(other: Result<T2, E>): Result<T2, E>;

  /** Applies the function to the {@link Ok} value and returns its result.
   *
   * If this is an {@link Err}, returns self.
   */
  andThen<T2>(fn: (value: T) => Result<T2, E>): Result<T2, E>;

  /** Returns `other` if this is an {@link Err}; otherwise returns self.
   *
   * For lazy evaluation, use {@link orElse}.
   */
  or<E2>(other: Result<T, E2>): Result<T, E2>;

  /** Applies the function to the {@link Err} value and returns its result.
   *
   * If this is an {@link Ok}, returns self.
   */
  orElse<E2>(fn: (error: E) => Result<T, E2>): Result<T, E2>;

  /** Converts an {@link Ok} containing `null` or `undefined` to `null`.
   *
   * Otherwise, returns self.
   */
  transpose(): Result<NonNullable<T>, E> | null;

  /** Matches the result against the provided body.
   *
   * If this is an {@link Ok}, calls the `Ok` function with the value.
   * If this is an {@link Err}, calls the `Err` function with the error.
   */
  match<U>(body: { Ok: (value: T) => U; Err: (error: E) => U }): U;

  /** Returns a string representation of the result. */
  toString(): string;
}

export class ResultError extends Error {
  override name = "ResultError";
}

/** Represents a successful result containing a value of generic type `OkValue`. The value is immutable. */
export class Ok<T> implements ResultLike<T, never> {
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

  isErrAnd(_: (_: never) => boolean): boolean {
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
    throw new ResultError(`Unwrapping error value on ${this.toString()}`);
  }

  unwrapOr(_: T): T {
    return this.#value;
  }

  unwrapOrElse(_: (_: never) => T): T {
    return this.#value;
  }

  expectErr(message: string): never {
    throw new Error(`${message}: ${this.#value}`);
  }

  map<T2>(fn: (value: T) => T2): Ok<T2> {
    return new Ok(fn(this.#value));
  }

  mapErr<E2>(_: (_: never) => E2): this {
    return this;
  }

  and<T2, E2>(other: Result<T2, E2>): Result<T2, E2> {
    return other;
  }

  andThen<T2, E2>(fn: (value: T) => Result<T2, E2>): Result<T2, E2> {
    return fn(this.#value);
  }

  or<_, E2>(_: Result<T, E2>): this {
    return this;
  }

  orElse<_, E2>(_: (_: never) => Result<T, E2>): this {
    return this;
  }

  transpose(): Ok<NonNullable<T>> | null {
    return this.#value === null || this.#value === undefined
      ? null
      : (this as Ok<NonNullable<T>>);
  }

  match<U>(body: { Ok: (value: T) => U }): U {
    return body.Ok(this.#value);
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Ok._tag}(${this.#value})`;
  }
}

/** Represents a failed result containing an error of generic type `ErrValue`. The error is immutable. */
export class Err<E> implements ResultLike<never, E> {
  static _tag = "Err" as const;

  readonly #value: E;

  constructor(value: E) {
    this.#value = value;
  }

  isOk(): this is never {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  isOkAnd(_: (_: never) => boolean): boolean {
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
    throw new ResultError(`Unwrapping value on ${this.toString()}`);
  }

  unwrapErr(): E {
    return this.#value;
  }

  unwrapOr<DefaultOkValue>(defaultValue: DefaultOkValue): DefaultOkValue {
    return defaultValue;
  }

  unwrapOrElse<T>(fn: (errorValue: E) => T): T {
    return fn(this.#value);
  }

  expectErr(_: string): E {
    return this.#value;
  }

  map<T2>(_: (_: never) => T2): this {
    return this;
  }

  mapErr<E2>(fn: (error: E) => E2): Err<E2> {
    return new Err(fn(this.#value));
  }

  and<T2, _>(_: Result<T2, E>): this {
    return this;
  }

  andThen<T2, _>(_: (_: never) => Result<T2, E>): this {
    return this;
  }

  or<T2, E2>(other: Result<T2, E2>): Result<T2, E2> {
    return other;
  }

  orElse<T2, E2>(fn: (error: E) => Result<T2, E2>): Result<T2, E2> {
    return fn(this.#value);
  }

  transpose(): this {
    return this;
  }

  match<U>(body: { Err: (error: E) => U }): U {
    return body.Err(this.#value);
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Err._tag}(${this.#value})`;
  }
}
