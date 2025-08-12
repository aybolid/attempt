import type { Nullable } from "@/internal/types";
import { isNullable } from "@/internal/utils";

import { Err, Ok, type IntoResult, type Result } from "../result";

import * as utils from "./utils";

export type Option<T> = Some<T> | None;

export namespace Option {
  export const some = utils.some;
  export const none = utils.none;

  export function from<T>(convertable: IntoOption<T>): Option<T> {
    return convertable.intoOption();
  }

  export function fromNullable<T>(value: Nullable<T>): Option<T> {
    return isNullable(value) ? None.instance : new Some(value);
  }

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

interface OptionLike<T> extends Iterable<None, T>, IntoResult<T, Error> {
  isSome(): this is Some<T>;

  isNone(): this is None;

  isSomeAnd(predicate: (value: T) => boolean): boolean;

  isNoneOr(predicate: (value: T) => boolean): boolean;

  expect(message: string): T;

  unwrap(): T;

  unwrapOr(defaultValue: T): T;

  unwrapOrElse(fn: () => T): T;

  map<U>(fn: (value: T) => U): Option<U>;

  mapOr<U>(defaultValue: U, fn: (value: T) => U): U;

  mapOrElse<U>(defaultFn: () => U, fn: (value: T) => U): U;

  okOr<E>(err: E): Result<T, E>;

  okOrElse<E>(fn: () => E): Result<T, E>;

  filter(predicate: (value: T) => boolean): Option<T>;

  and<U>(other: Option<U>): Option<U>;

  andThen<U>(fn: (value: T) => Option<U>): Option<U>;

  or(other: Option<T>): Option<T>;

  orElse(fn: () => Option<T>): Option<T>;

  match<U>(body: { Some: (value: T) => U; None: () => U }): U;

  toString(): string;
}

export class OptionError extends Error {
  override name = "OptionError";

  static isOptionError(value: unknown): value is OptionError {
    return value instanceof OptionError;
  }
}

export class Some<T> implements OptionLike<T> {
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

export class None implements OptionLike<never> {
  static readonly _tag = "None" as const;

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
