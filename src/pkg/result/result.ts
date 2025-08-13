import { isNullable, stringify } from "@/internal/utils";

import { None, Option, Some, type IntoOption } from "../option";

import * as utils from "./utils";

export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export namespace Result {
  export const ok = utils.ok;
  export const err = utils.err;

  export function from<T, E>(convertable: IntoResult<T, E>): Result<T, E> {
    return convertable.intoResult();
  }

  export async function fromPromise<T, E>(
    promise: Promise<T>,
    errorMapper: (e: unknown) => E,
  ): AsyncResult<T, E> {
    return promise
      .then((value) => new Ok(value))
      .catch((e) => new Err(errorMapper(e)));
  }

  export function fromThrowable<
    Fn extends (...args: readonly unknown[]) => unknown,
    E,
  >(
    fn: Fn,
    errorMapper: (e: unknown) => E,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> {
    return (...args) => {
      try {
        const result = fn(...args) as ReturnType<Fn>;
        return new Ok(result);
      } catch (e) {
        return new Err(errorMapper(e));
      }
    };
  }
}

type ResultGenerator<T, E> = Generator<Err<never, E>, T>;

export interface IntoResult<T, E> {
  intoResult(): Result<T, E>;
}

interface ResultLike<T, E>
  extends Iterable<Err<never, E>, T>,
    IntoOption<NonNullable<T>> {
  isOk(): this is Ok<T, E>;

  isErr(): this is Err<T, E>;

  isOkAnd(predicate: (value: T) => boolean): boolean;

  isErrAnd(predicate: (error: E) => boolean): boolean;

  ok(): Option<NonNullable<T>>;

  err(): Option<NonNullable<E>>;

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

  ok(): Option<NonNullable<T>> {
    return Option.fromNullable(this.#value);
  }

  err(): None {
    return None.instance;
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
      ? None.instance
      : new Some(this as Ok<NonNullable<T>, E>);
  }

  match<U>(body: { Ok: (value: T) => U }): U {
    return body.Ok(this.#value);
  }

  toString(): string {
    return `${Ok._tag}(${stringify(this.#value)})`;
  }

  intoOption(): Option<NonNullable<T>> {
    return Option.fromNullable(this.#value);
  }

  *[Symbol.iterator](): ResultGenerator<T, never> {
    return this.#value;
  }
}

export class Err<T, E> implements ResultLike<never, E> {
  static _tag = "Err" as const;
  readonly #value: E;

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
    return None.instance;
  }

  err(): Option<NonNullable<E>> {
    return Option.fromNullable(this.#value);
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
    return new Some(this);
  }

  match<U>(body: { Err: (error: E) => U }): U {
    return body.Err(this.#value);
  }

  toString(): string {
    return `${Err._tag}(${stringify(this.#value)})`;
  }

  intoOption(): None {
    return None.instance;
  }

  *[Symbol.iterator](): ResultGenerator<never, E> {
    yield this;
    throw new Error("Do not use Result generator outside of `$try`");
  }
}
