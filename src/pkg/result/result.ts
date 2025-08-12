import { isNullable } from "@/internal/utils";

import { None, none, Some, some, type Option } from "../option";

export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

type ResultGenerator<T, E> = Generator<Err<never, E>, T>;

export interface IntoResult<T, E> {
  intoResult(): Result<T, E>;
}

interface ResultLike<T, E> extends Iterable<Err<never, E>, T> {
  isOk(): this is Ok<T, E>;

  isErr(): this is Err<T, E>;

  isOkAnd(predicate: (value: T) => boolean): boolean;

  isErrAnd(predicate: (error: E) => boolean): boolean;

  ok(): Option<T>;

  err(): Option<E>;

  unwrap(): T;

  unwrapErr(): E;

  unwrapOr(defaultValue: T): T;

  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  expectErr(message: string): E;

  map<T2>(fn: (value: T) => T2): Result<T2, E>;

  mapErr<E2>(fn: (error: E) => E2): Result<T, E2>;

  and<T2>(other: Result<T2, E>): Result<T2, E>;

  andThen<T2>(fn: (value: T) => Result<T2, E>): Result<T2, E>;

  or<E2>(other: Result<T, E2>): Result<T, E2>;

  orElse<E2>(fn: (error: E) => Result<T, E2>): Result<T, E2>;

  transpose(): Option<Result<NonNullable<T>, E>>;

  match<U>(body: { Ok: (value: T) => U; Err: (error: E) => U }): U;

  toString(): string;
}

export class ResultError extends Error {
  override name = "ResultError";

  /** Checks if the given value is an instance of ResultError. */
  static isResultError(value: unknown): value is ResultError {
    return value instanceof ResultError;
  }
}

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
