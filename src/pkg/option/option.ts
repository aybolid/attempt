import type { Nullable } from "@/internal/types";
import { isNullable, stringify } from "@/internal/utils";

import { Err, Ok, type Result } from "../result";

/**
 * Represents an optional value.
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

  /**
   * Creates an {@link Option} from a nullable value.
   *
   * If the value is `null` or `undefined`, returns {@link None}.
   * Otherwise, returns {@link Some} containing the value.
   */
  export function fromNullable<T extends Nullable<unknown>>(
    value: T,
  ): Option<NonNullable<T>> {
    return isNullable(value)
      ? None.instance
      : new Some(value as NonNullable<T>);
  }

  /**
   * Creates an {@link Option} from a value and a predicate.
   *
   * If the predicate returns `true`, returns {@link Some} containing the value.
   * Otherwise, returns {@link None}.
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
  /** Type guard. Returns `true` if the option is a {@link Some}. */
  isSome(): this is Some<T>;

  /** Type guard. Returns `true` if the option is a {@link None}. */
  isNone(): this is None;

  /** Returns `true` if the option is a {@link Some} and the value satisfies the given predicate. */
  isSomeAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if the option is a {@link None} or the value satisfies the given predicate. */
  isNoneOr(predicate: (value: T) => boolean): boolean;

  /** Returns the contained value or throws an {@link OptionError} with the given message. */
  expect(message: string): T;

  /** Returns the contained value or throws an {@link OptionError} with a generic message. */
  unwrap(): T;

  /**
   * Returns the contained value or provided default value.
   *
   * @see {@link unwrapOrElse} for lazy evaluation of the default value.
   */
  unwrapOr(defaultValue: T): T;

  /** Returns the contained value or computed default value. */
  unwrapOrElse(fn: () => T): T;

  /** Returns {@link Some} containing mapped value or {@link None}. */
  map<U extends NonNullable<unknown>>(fn: (value: T) => U): Option<U>;

  /**
   * Returns mapped value or provided default value.
   *
   * @see {@link mapOrElse} for lazy evaluation of the default value.
   */
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  /** Returns mapped value or computed default value. */
  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

  /**
   * Converts {@link Option} into {@link Result}.
   *
   * @see {@link okOrElse} for lazy evaluation of the error value.
   */
  okOr<E>(err: E): Result<T, E>;

  /** Converts {@link Option} into {@link Result}. */
  okOrElse<E>(fn: () => E): Result<T, E>;

  /** Filters {@link Option} by a predicate. */
  filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Returns other {@link Option} if this option is {@link Some} or leaves {@link None} in place.
   *
   * @see {@link andThen} for lazy evaluation of other option.
   */
  and<U extends NonNullable<unknown>>(other: Option<U>): Option<U>;

  /** Returns computed other {@link Option} if this option is {@link Some} or leaves {@link None} in place. */
  andThen<U extends NonNullable<unknown>>(
    fn: (value: T) => Option<U>,
  ): Option<U>;

  /**
   * Returns other {@link Option} if this option is {@link None} or leaves {@link Some} in place.
   *
   * @see {@link orElse} for lazy evaluation of other option.
   */
  or(other: Option<T>): Option<T>;

  /** Returns computed other {@link Option} if this option is {@link None} or leaves {@link Some} in place. */
  orElse(fn: () => Option<T>): Option<T>;

  /** "Pattern matching" for {@link Option}. */
  match<U>(body: { Some: (value: T) => U; None: () => U }): U;

  /** Returns a string representation of this {@link Option}. */
  toString(): string;

  /**
   * Allows using {@link Option} in JSON serialization.
   *
   * Using this function directly is not recommended
   * as it ruins the whole point of {@link Option} by
   * returning `null` in case of {@link None}.
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

/**
 * Singleton that represents an absence of a value.
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
