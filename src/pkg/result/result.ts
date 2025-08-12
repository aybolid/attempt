import { isNullable } from "@/internal/utils";

import { None, none, Some, some, type Option } from "../option";

/**
 * Represents the result of an operation that can either succeed with a value (`Ok`) or fail with an error (`Err`).
 *
 * Similar to Rust's `Result<T, E>` type.
 *
 * @template T - The type of the successful value.
 * @template E - The type of the error value (defaults to `Error`).
 *
 * @example
 * const okResult: Result<number> = new Ok(42);
 * console.log(okResult.isOk());   // true
 * console.log(okResult.unwrap()); // 42
 *
 * const errResult: Result<number, string> = new Err("Bad things happened");
 * console.log(errResult.isErr());     // true
 * console.log(errResult.unwrapErr()); // "Bad things happened"
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

/** A `Promise` that resolves to a {@link Result}. */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

type ResultGenerator<T, E> = Generator<Err<never, E>, T>;

/** Interface for values that can be converted into a {@link Result}. */
export interface IntoResult<T, E> {
  intoResult(): Result<T, E>;
}

/**
 * Interface implemented by `Ok` and `Err` providing common `Result`-like methods.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 */
interface ResultLike<T, E> extends Iterable<Err<never, E>, T> {
  /**
   * Returns `true` if the result is `Ok`.
   * @example
   * ok(42).isOk();      // true
   * err("oops").isOk(); // false
   */
  isOk(): this is Ok<T, E>;

  /**
   * Returns `true` if the result is `Err`.
   * @example
   * err("oops").isErr(); // true
   * ok(42).isErr();      // false
   */
  isErr(): this is Err<T, E>;

  /**
   * Returns `true` if the result is `Ok` **and** the contained value satisfies the predicate.
   * @param predicate - Function to test the `Ok` value.
   * @example
   * ok(10).isOkAnd(v => v > 5); // true
   */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /**
   * Returns `true` if the result is `Err` **and** the contained error satisfies the predicate.
   * @example
   * err(404).isErrAnd(e => e === 404); // true
   */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  /**
   * Converts `Ok(T)` to `Some(T)` and `Err(E)` to `None`.
   * @example
   * ok(42).ok();      // Some(42)
   * err("nope").ok(); // None
   */
  ok(): Option<T>;

  /**
   * Converts `Err(E)` to `Some(E)` and `Ok(T)` to `None`.
   * @example
   * err("fail").err(); // Some("fail")
   * ok(42).err();      // None
   */
  err(): Option<E>;

  /** Returns the contained `Ok` value, throwing if it’s `Err`. */
  unwrap(): T;

  /** Returns the contained `Err` value, throwing if it’s `Ok`. */
  unwrapErr(): E;

  /** Returns the contained `Ok` value or the provided default. */
  unwrapOr(defaultValue: T): T;

  /** Returns the contained `Ok` value or computes a default from the error. */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  /**
   * Returns the contained error, or throws with the provided message if `Ok`.
   */
  expectErr(message: string): E;

  /** Maps an `Ok(T)` to `Ok(T2)` by applying a function to the value, or leaves `Err` unchanged. */
  map<T2>(fn: (value: T) => T2): Result<T2, E>;

  /** Maps an `Err(E)` to `Err(E2)` by applying a function to the error, or leaves `Ok` unchanged. */
  mapErr<E2>(fn: (error: E) => E2): Result<T, E2>;

  /** Returns `other` if `Ok`, otherwise returns `Err` as-is. */
  and<T2>(other: Result<T2, E>): Result<T2, E>;

  /** Calls `fn` with the `Ok` value and returns the result, or returns `Err` as-is. */
  andThen<T2>(fn: (value: T) => Result<T2, E>): Result<T2, E>;

  /** Returns `Ok` as-is, or `other` if `Err`. */
  or<E2>(other: Result<T, E2>): Result<T, E2>;

  /** Calls `fn` with the `Err` value and returns the result, or returns `Ok` as-is. */
  orElse<E2>(fn: (error: E) => Result<T, E2>): Result<T, E2>;

  /**
   * Converts `Option<Result>` into `Result<Option>`.
   * Returns `None` if `Ok(None)`, otherwise wraps.
   */
  transpose(): Option<Result<NonNullable<T>, E>>;

  /** Pattern matches over the `Ok` and `Err` cases. */
  match<U>(body: { Ok: (value: T) => U; Err: (error: E) => U }): U;

  /** Returns a string representation of the result. */
  toString(): string;
}

/** Error type thrown when invalid Result unwrapping occurs. */
export class ResultError extends Error {
  override name = "ResultError";

  /** Checks if the given value is an instance of ResultError. */
  static isResultError(value: unknown): value is ResultError {
    return value instanceof ResultError;
  }
}

/**
 * Represents a successful result value.
 *
 * @typeParam T - Type of the wrapped value.
 * @typeParam E - Type of the error (only relevant for type compatibility).
 *
 * @example
 * const r = new Ok(123);
 * console.log(r.isOk());   // true
 * console.log(r.unwrap()); // 123
 */
export class Ok<T, E> implements ResultLike<T, E> {
  static _tag = "Ok" as const;
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isErr(): this is never {
    return false;
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  isOkAnd(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  isErrAnd(_: (_: never) => boolean): boolean {
    return false;
  }

  ok(): Some<T> {
    return some(this.#value);
  }

  err(): None {
    return none();
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
    throw new ResultError(`${message}: ${this.#value}`);
  }

  map<T2>(fn: (value: T) => T2): Ok<T2, E> {
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

  transpose(): Option<Ok<NonNullable<T>, E>> {
    return isNullable(this.#value)
      ? none()
      : some(this as Ok<NonNullable<T>, E>);
  }

  match<U>(body: { Ok: (value: T) => U }): U {
    return body.Ok(this.#value);
  }

  toString(): string {
    try {
      return `${Ok._tag}(${JSON.stringify(this.#value)})`;
    } catch {
      return `${Ok._tag}(<non-serializable>)`;
    }
  }

  *[Symbol.iterator](): ResultGenerator<T, never> {
    return this.#value;
  }
}

/**
 * Represents a failed result containing an error value.
 *
 * @template T - Type of the success value (only relevant for type compatibility).
 * @template E - Type of the error value.
 *
 * @example
 * const r = new Err("Bad thing");
 * console.log(r.isErr());     // true
 * console.log(r.unwrapErr()); // "Bad thing"
 */
export class Err<T, E> implements ResultLike<never, E> {
  static _tag = "Err" as const;
  readonly #value: E;

  /**
   * Creates a new Err result containing the provided error.
   *
   * @param value - The error value to wrap.
   */
  constructor(value: E) {
    this.#value = value;
  }

  isOk(): this is never {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  isOkAnd(_: (_: never) => boolean): boolean {
    return false;
  }

  isErrAnd(predicate: (value: E) => boolean): boolean {
    return predicate(this.#value);
  }

  ok(): None {
    return none();
  }

  err(): Some<E> {
    return some(this.#value);
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

  mapErr<E2>(fn: (error: E) => E2): Err<T, E2> {
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

  transpose(): Option<this> {
    return some(this);
  }

  match<U>(body: { Err: (error: E) => U }): U {
    return body.Err(this.#value);
  }

  toString(): string {
    try {
      return `${Err._tag}(${JSON.stringify(this.#value)})`;
    } catch {
      return `${Err._tag}(<non-serializable>)`;
    }
  }

  *[Symbol.iterator](): ResultGenerator<never, E> {
    yield this;
    throw new Error("Do not use Result generator outside of `$try`");
  }
}
