import type { Nullable } from "@/internal/types";
import { isNullable, stringify } from "@/internal/utils";

import { Err, Ok, type Result } from "../result";

/** Represents an optional value.
 *
 * Can be either {@link Some} or {@link None}.
 */
export type Option<T extends NonNullable<unknown>> = Some<T> | None;

export namespace Option {
  /** Creates an {@link Option} from a value that implements {@link IntoOption}. */
  export function from<T extends NonNullable<unknown>>(
    convertable: IntoOption<T>,
  ): Option<T> {
    return convertable.intoOption();
  }

  /** Creates an {@link Option} from a nullable value.
   *
   * If the value is `null` or `undefined`, returns {@link None}.
   * Otherwise, returns {@link Some} containing the value.
   *
   * @example
   * Option.fromNullable(42);        // -> Some(42)
   * Option.fromNullable(null);      // -> None
   * Option.fromNullable(undefined); // -> None
   */
  export function fromNullable<T extends Nullable<unknown>>(
    value: T,
  ): Option<NonNullable<T>> {
    return isNullable(value)
      ? None.instance
      : new Some(value as NonNullable<T>);
  }

  /** Creates an {@link Option} from a value and a predicate.
   *
   * If the predicate returns `true`, returns {@link Some} containing the value.
   * Otherwise, returns {@link None}.
   *
   * @example
   * Option.fromPredicate(42, (x) => x > 0); // -> Some(42)
   * Option.fromPredicate(42, (x) => x < 0); // -> None
   */
  export function fromPredicate<T extends NonNullable<unknown>>(
    value: T,
    predicate: (value: T) => boolean,
  ): Option<T> {
    return predicate(value) ? new Some(value) : None.instance;
  }
}

type OptionGenerator<T> = Generator<None, T>;

/** Defines an interface for converting a value into an {@link Option}. */
export interface IntoOption<T extends NonNullable<unknown>> {
  /** Converts the value into an {@link Option}. */
  intoOption(): Option<T>;
}

interface OptionLike<T extends NonNullable<unknown>> extends Iterable<None, T> {
  /** Type guard. Returns `true` if the option is a {@link Some}.
   *
   * @example
   * const option = some(42);
   * option.isSome(); // -> true
   */
  isSome(): this is Some<T>;

  /** Type guard. Returns `true` if the option is a {@link None}.
   *
   * @example
   * const option = none();
   * option.isNone(); // -> true
   */
  isNone(): this is None;

  /** Returns `true` if the option is a {@link Some} and the value satisfies the given predicate.
   *
   * @example
   * const option = some(42);
   * option.isSomeAnd((x) => x > 0); // -> true
   * option.isSomeAnd((x) => x < 0); // -> false
   */
  isSomeAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if the option is a {@link None} or the value satisfies the given predicate.
   *
   * @example
   * let option = some(42);
   * option.isNoneOr((x) => x > 0); // -> true
   * option.isNoneOr((x) => x < 0); // -> false
   *
   * option = none();
   * option.isNoneOr((x) => x > 0); // -> true
   * option.isNoneOr((x) => x < 0); // -> true
   */
  isNoneOr(predicate: (value: T) => boolean): boolean;

  /** Returns the contained value or throws an {@link OptionError} with the given message.
   *
   * The good practice is to provide a meaningful error message
   * that tells why you are expecting the value to be present.
   *
   * @example
   * let option = some(42);
   * option.expect("the value should be here. trust me bro"); // -> 42
   *
   * option = none();
   * option.expect("the value should be here. trust me bro"); // -> throws OptionError(...)
   */
  expect(message: string): T;

  /** Returns the contained value or throws an {@link OptionError} with a generic message.
   *
   * @example
   * let option = some(42);
   * option.unwrap(); // -> 42
   *
   * option = none();
   * option.unwrap(); // -> throws OptionError(...)
   */
  unwrap(): T;

  /** Returns the contained value or provided default value.
   *
   * @see {@link unwrapOrElse} for lazy evaluation of the default value.
   *
   * @example
   * let option = some(42);
   * option.unwrapOr(0); // -> 42
   *
   * option = none();
   * option.unwrapOr(0); // -> 0
   */
  unwrapOr(defaultValue: T): T;

  /** Returns the contained value or computed default value.
   *
   * @example
   * let option = some(42);
   * option.unwrapOrElse(() => 0); // -> 42
   *
   * option = none();
   * option.unwrapOrElse(() => 0); // -> 0
   */
  unwrapOrElse(fn: () => T): T;

  /** Returns {@link Some} containing mapped value or {@link None}.
   *
   * @example
   * let option = some(42);
   * option.map((x) => x.toFixed(2)); // -> Some("42.00")
   *
   * option = none();
   * option.map((x) => x.toFixed(2)); // -> None
   */
  map<U extends NonNullable<unknown>>(fn: (value: T) => U): Option<U>;

  /** Returns mapped value or provided default value.
   *
   * @see {@link mapOrElse} for lazy evaluation of the default value.
   *
   * @example
   * let option = some(42);
   * option.mapOr("0.00", (x) => x.toFixed(2)); // -> "42.00"
   *
   * option = none();
   * option.mapOr("0.00", (x) => x.toFixed(2)); // -> "0.00"
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  /** Returns mapped value or computed default value.
   *
   * @example
   * let option = some(42);
   * option.mapOrElse(() => "0.00", (x) => x.toFixed(2)); // -> "42.00"
   *
   * option = none();
   * option.mapOrElse(() => "0.00", (x) => x.toFixed(2)); // -> "0.00"
   */
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

  /** Converts {@link Option} into {@link Result}.
   *
   * @see {@link okOrElse} for lazy evaluation of the error value.
   *
   * @example
   * let option = some(42);
   * option.okOr("error"); // -> Ok(42)
   *
   * option = none();
   * option.okOr("error"); // -> Err("error")
   */
  okOr<E>(err: E): Result<T, E>;

  /** Converts {@link Option} into {@link Result}.
   *
   * @example
   * let option = some(42);
   * option.okOrElse(() => "error"); // -> Ok(42)
   *
   * option = none();
   * option.okOrElse(() => "error"); // -> Err("error")
   */
  okOrElse<E>(fn: () => E): Result<T, E>;

  /** Filters {@link Option} by a predicate.
   *
   * @example
   * let option = some(42);
   * option.filter((x) => x > 0); // -> Some(42)
   *
   * option = some(-42);
   * option.filter((x) => x > 0); // -> None
   *
   * option = none();
   * option.filter((x) => x > 0); // -> None
   */
  filter(predicate: (value: T) => boolean): Option<T>;

  /** Returns other {@link Option} if this option is {@link Some} or leaves {@link None} in place.
   *
   * @see {@link andThen} for lazy evaluation of other option.
   *
   * @example
   * let option = some(42);
   * option.and(some("hello")); // -> Some("hello")
   * option.and(none());        // -> None
   *
   * option = none();
   * option.and(some("hello")); // -> None
   * option.and(none());        // -> None
   */
  and<U extends NonNullable<unknown>>(other: Option<U>): Option<U>;

  /** Returns computed other {@link Option} if this option is {@link Some} or leaves {@link None} in place.
   *
   * @example
   * let option = some(42);
   * option.and((x) => some(x.toString())); // -> Some("42")
   * option.and(() => none());              // -> None
   *
   * option = none();
   * option.and((x) => some(x.toString())); // -> None
   * option.and(() => none());              // -> None
   */
  andThen<U extends NonNullable<unknown>>(
    fn: (value: T) => Option<U>,
  ): Option<U>;

  /** Returns other {@link Option} if this option is {@link None} or leaves {@link Some} in place.
   *
   * @see {@link orElse} for lazy evaluation of other option.
   *
   * @example
   * let option = some(42);
   * option.or(some(34)); // -> Some(42)
   * option.or(none());        // -> Some(42)
   *
   * option = none();
   * option.or(some(34)); // -> Some("hello")
   * option.or(none());        // -> None
   */
  or(other: Option<T>): Option<T>;

  /** Returns computed other {@link Option} if this option is {@link None} or leaves {@link Some} in place.
   *
   * @example
   * let option = some(42);
   * option.or(() => some(34)); // -> Some(42)
   * option.or(() => none());        // -> Some(42)
   *
   * option = none();
   * option.or(() => some(34)); // -> Some("hello")
   * option.or(() => none());        // -> None
   */
  orElse(fn: () => Option<T>): Option<T>;

  /** "Pattern matching" for {@link Option}.
   *
   * We have pattern matching at home.
   *
   * @example
   * option.match({
   *   Some: (value) => console.log(`We've got a value! ${value}`)
   *   None: () => console.log("No value!")
   * });
   *
   */
  match<U>(body: { Some: (value: T) => U; None: () => U }): U;

  /** Returns a string representation of this {@link Option}.
   *
   * @example
   * some(42).toString(); // -> "Some(42)"
   * none().toString();   // -> "None"
   */
  toString(): string;

  /** Allows using {@link Option} in JSON serialization.
   *
   * Using this function directly is not recommended
   * as it ruins the whole point of {@link Option} by
   * returning `null` in case of {@link None}.
   *
   * @example
   * JSON.stringify({ some: some(42), none: none() }); // -> '{ "some": 42, "none": null }'
   */
  toJSON(): T | null;
}

/** An error thrown by some methods of {@link Option}. */
export class OptionError extends Error {
  override name = "OptionError";

  /** Checks if a value is an instance of {@link OptionError}. */
  static isOptionError(value: unknown): value is OptionError {
    return value instanceof OptionError;
  }
}

/** Represents a value that is present. */
export class Some<T extends NonNullable<unknown>> implements OptionLike<T> {
  static readonly _tag = "Some" as const;

  readonly #value: T;

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

  map<U extends NonNullable<unknown>>(fn: (value: T) => U): Option<U> {
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

  and<U extends NonNullable<unknown>>(other: Option<U>): Option<U> {
    return other;
  }

  andThen<U extends NonNullable<unknown>>(
    fn: (value: T) => Option<U>,
  ): Option<U> {
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
    return `${Some._tag}(${stringify(this.#value)})`;
  }

  toJSON(): T {
    return this.#value;
  }

  *[Symbol.iterator](): OptionGenerator<T> {
    return this.#value;
  }
}

/** Singleton that represents an absence of a value.
 *
 * Use `None.instance` to obtain an instance.
 */
export class None implements OptionLike<never> {
  static readonly _tag = "None" as const;

  static readonly instance = new None();
  private constructor() {}

  isSome(): this is never {
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

  map<U extends NonNullable<unknown>>(_: (_: never) => U): this {
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

  and<U extends NonNullable<unknown>>(_: Option<U>): this {
    return this;
  }

  andThen<U extends NonNullable<unknown>>(_: (_: never) => Option<U>): this {
    return this;
  }

  filter(_: (_: never) => boolean): this {
    return this;
  }

  or<T extends NonNullable<unknown>>(other: Option<T>): Option<T> {
    return other;
  }

  orElse<T extends NonNullable<unknown>>(fn: () => Option<T>): Option<T> {
    return fn();
  }

  match<U>(body: { None: () => U }): U {
    return body.None();
  }

  toString(): string {
    return None._tag;
  }

  toJSON(): null {
    return null;
  }

  *[Symbol.iterator](): OptionGenerator<never> {
    yield this;
    throw new Error("Do not use Option generator outside of `$maybe`");
  }
}
