import type { Nullable } from "@/internal/types";
import { isNullable } from "@/internal/utils";

import { Err, Ok, type IntoResult, type Result } from "../result";

import * as utils from "./utils";

/** Represents an optional value. */
export type Option<T> = Some<T> | None;

export namespace Option {
  export const some = utils.some;
  export const none = utils.none;

  export function from<T>(convertable: IntoOption<T>): Option<T> {
    return convertable.intoOption();
  }

  /**
   * Converts a nullable value (`null` or `undefined`) into an `Option`.
   *
   * @template T The type of the value when non-null.
   *
   * @example
   * Option.fromNullable("hello");   // Some("hello")
   * Option.fromNullable(null);      // None
   * Option.fromNullable(undefined); // None
   */
  export function fromNullable<T>(value: Nullable<T>): Option<T> {
    return isNullable(value) ? None.instance : new Some(value);
  }

  /**
   * Converts a value into an `Option`. `Some` if the value satisfies a predicate, `None` otherwise.
   *
   * @template T The type of the value.
   *
   * @param value The value to convert.
   * @param predicate The predicate to check.
   *
   * @example
   * Option.fromPredicate(5, v => v > 3); // Some(5)
   * Option.fromPredicate(2, v => v > 3); // None
   */
  export function fromPredicate<T>(
    value: T,
    predicate: (value: T) => boolean,
  ): Option<T> {
    return predicate(value) ? new Some(value) : None.instance;
  }
}

type OptionGenerator<T> = Generator<None, T>;

export interface IntoOption<T> {
  intoOption(): Option<T>;
}

/**
 * Common interface for Option-like types.
 * Inspired by Rust's `Option<T>`.
 */
interface OptionLike<T> extends Iterable<None, T>, IntoResult<T, Error> {
  /**
   * Returns `true` if this is a `Some` value.
   *
   * @example
   * new Some(5).isSome();   // true
   * None.instance.isSome(); // false
   */
  isSome(): this is Some<T>;

  /**
   * Returns `true` if this is `None`.
   *
   * @example
   * new Some(5).isNone();   // false
   * None.instance.isNone(); // true
   */
  isNone(): this is None;

  /**
   * Returns `true` if `Some` and the predicate returns `true`.
   *
   * @example
   * new Some(5).isSomeAnd(v => v > 3); // true
   */
  isSomeAnd(predicate: (value: T) => boolean): boolean;

  /**
   * Returns `true` if `None` or the predicate returns `true`.
   *
   * @example
   * None.instance.isNoneOr(() => false); // true
   */
  isNoneOr(predicate: (value: T) => boolean): boolean;

  /**
   * Returns the contained value or throws an error with `message` if `None`.
   *
   * @example
   * new Some(42).expect("No value");  // 42
   * None.instance.expect("No value"); // throws OptionError
   */
  expect(message: string): T;

  /**
   * Returns the contained value or throws if `None`.
   *
   * @example
   * new Some(42).unwrap(); // 42
   */
  unwrap(): T;

  /**
   * Returns the contained value or `defaultValue` if `None`.
   *
   * @example
   * None.instance.unwrapOr(10); // 10
   */
  unwrapOr(defaultValue: T): T;

  /**
   * Returns the contained value or computes it from `fn` if `None`.
   *
   * @example
   * None.instance.unwrapOrElse(() => 99); // 99
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Maps a `Some` to a new `Option` by applying `fn`.
   *
   * @example
   * new Some(2).map(x => x * 3).unwrap(); // 6
   */
  map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Maps a `Some` to a value by applying `fn`, or returns `defaultValue` if `None`.
   *
   * @example
   * None.instance.mapOr(5, x => x * 2); // 5
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  /**
   * Maps a `Some` to a value with `fn`, or computes default from `defaultFn` if `None`.
   *
   * @example
   * None.instance.mapOrElse(() => 10, x => x * 2); // 10
   */
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

  /**
   * Converts to a `Result`, mapping `Some` to `Ok` and `None` to `Err`.
   *
   * @example
   * new Some(42).okOr("error"); // Ok(42)
   */
  okOr<E>(err: E): Result<T, E>;

  /**
   * Converts to a `Result`, mapping `Some` to `Ok` and `None` to `Err(fn())`.
   *
   * @example
   * None.instance.okOrElse(() => "fail"); // Err("fail")
   */
  okOrElse<E>(fn: () => E): Result<T, E>;

  /**
   * Returns `self` if predicate returns true, otherwise `None`.
   *
   * @example
   * new Some(10).filter(x => x > 5); // Some(10)
   * new Some(3).filter(x => x > 5); // None
   */
  filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Returns `other` if `Some`, otherwise `None`.
   *
   * @example
   * new Some(1).and(new Some(2)); // Some(2)
   */
  and<U>(other: Option<U>): Option<U>;

  /**
   * Applies `fn` to the value if `Some`, returns the result.
   *
   * @example
   * new Some(2).andThen(x => new Some(x * 5)); // Some(10)
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U>;

  /**
   * Returns `self` if `Some`, otherwise `other`.
   *
   * @example
   * None.instance.or(new Some(42)); // Some(42)
   */
  or(other: Option<T>): Option<T>;

  /**
   * Returns `self` if `Some`, otherwise computes `Option` from `fn()`.
   *
   * @example
   * None.instance.orElse(() => new Some(5)); // Some(5)
   */
  orElse(fn: () => Option<T>): Option<T>;

  /**
   * Pattern matches on the option.
   *
   * @example
   * new Some(5).match({
   *   Some: v => `Got ${v}`,
   *   None: () => "No value"
   * });
   */
  match<U>(body: { Some: (value: T) => U; None: () => U }): U;

  /** Returns a string representation. */
  toString(): string;
}

/**
 * Error thrown when an invalid `Option` unwrap occurs.
 *
 * @example
 * try {
 *   None.instance.unwrap();
 * } catch (e) {
 *   if (OptionError.isOptionError(e)) console.error("Invalid unwrap");
 * }
 */
export class OptionError extends Error {
  override name = "OptionError";

  /** Checks if the given value is an `OptionError`. */
  static isOptionError(value: unknown): value is OptionError {
    return value instanceof OptionError;
  }
}

/**
 * Represents a value that exists.
 *
 * @example
 * const some = new Some(42);
 * some.unwrap(); // 42
 */
export class Some<T> implements OptionLike<T> {
  static readonly _tag = "Some" as const;

  readonly #value: T;

  /**
   * Creates a new `Some` containing the given value.
   */
  constructor(value: T) {
    this.#value = value;
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None {
    return false;
  }

  isSomeAnd(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  isNoneOr(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  expect(_: string): T {
    return this.#value;
  }

  unwrap(): T {
    return this.#value;
  }

  unwrapOr(_: T): T {
    return this.#value;
  }

  unwrapOrElse(_: () => T): T {
    return this.#value;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return new Some(fn(this.#value));
  }

  mapOr<U>(_: U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  mapOrElse<U>(_: () => U, fn: (value: T) => U): U {
    return fn(this.#value);
  }

  okOr<E>(_: E): Result<T, E> {
    return new Ok(this.#value);
  }

  okOrElse<E>(_: () => E): Result<T, E> {
    return new Ok(this.#value);
  }

  and<U>(other: Option<U>): Option<U> {
    return other;
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.#value);
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.#value) ? this : None.instance;
  }

  or(_: Option<T>): this {
    return this;
  }

  orElse(_: () => Option<T>): this {
    return this;
  }

  match<U>(body: { Some: (value: T) => U }): U {
    return body.Some(this.#value);
  }

  toString(): string {
    try {
      return `${Some._tag}(${JSON.stringify(this.#value)})`;
    } catch {
      return `${Some._tag}(<non-serializable>)`;
    }
  }

  intoResult(): Ok<T, never> {
    return new Ok(this.#value);
  }

  *[Symbol.iterator](): OptionGenerator<T> {
    return this.#value;
  }
}

/**
 * Represents the absence of a value.
 * Singleton — use `None.instance`.
 *
 * @example
 * const none = None.instance;
 * console.log(none.isNone()); // true
 */
export class None implements OptionLike<never> {
  static readonly _tag = "None" as const;

  /** Singleton instance of `None`. */
  static readonly instance = new None();
  private constructor() {}

  isSome(): this is Some<never> {
    return false;
  }

  isNone(): this is None {
    return true;
  }

  isSomeAnd(_: (_: never) => boolean): boolean {
    return false;
  }

  isNoneOr(_: (_: never) => boolean): boolean {
    return true;
  }

  expect(message: string): never {
    throw new OptionError(message);
  }

  unwrap(): never {
    throw new OptionError("Unwrap called on None");
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(fn: () => T): T {
    return fn();
  }

  map<U>(_: (_: never) => U): this {
    return this;
  }

  mapOr<U>(defaultValue: U, _: (_: never) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: () => U, _: (_: never) => U): U {
    return defaultFn();
  }

  okOr<E>(err: E): Result<never, E> {
    return new Err(err);
  }

  okOrElse<E>(fn: () => E): Result<never, E> {
    return new Err(fn());
  }

  and<U>(_: Option<U>): this {
    return this;
  }

  andThen<U>(_: (_: never) => Option<U>): this {
    return this;
  }

  filter(_: (_: never) => boolean): this {
    return this;
  }

  or<T>(other: Option<T>): Option<T> {
    return other;
  }

  orElse<T>(fn: () => Option<T>): Option<T> {
    return fn();
  }

  match<U>(body: { None: () => U }): U {
    return body.None();
  }

  toString(): string {
    return None._tag;
  }

  intoResult(): Err<never, Error> {
    return new Err(new Error("No value"));
  }

  *[Symbol.iterator](): OptionGenerator<never> {
    yield this;
    throw new Error("Do not use Option generator outside of `$maybe`");
  }
}
