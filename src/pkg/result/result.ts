import { stringify, toError } from "@/internal/utils";

import { None, Option, Some, type IntoOption } from "../option";

/**
 * Represents the result of an operation.
 *
 * Can be either {@link Ok} or {@link Err}.
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

/**
 * Represents the result of an asynchronous operation.
 *
 * Can be either a `Promise<Ok>` or a `Promise<Err>`.
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export namespace Result {
  /** Creates a {@link Result} from a value that implements {@link IntoResult}. */
  export function from<T, E>(convertable: IntoResult<T, E>): Result<T, E> {
    return convertable.intoResult();
  }

  /**
   * Creates an {@link AsyncResult} from a promise.
   *
   * If `errorMapper` is provided, it maps the thrown error to the expected error type.
   * Defaults to {@link Error}.
   */
  export async function fromPromise<T>(promise: Promise<T>): AsyncResult<T>;
  export async function fromPromise<T, E>(
    promise: Promise<T>,
    errorMapper: (e: unknown) => E,
  ): AsyncResult<T, E>;
  export async function fromPromise<T, E = Error>(
    promise: Promise<T>,
    errorMapper?: (e: unknown) => E,
  ): AsyncResult<T, E> {
    try {
      const value = await promise;
      return new Ok(value);
    } catch (e) {
      errorMapper ??= toError as (e: unknown) => E;
      return new Err(errorMapper(e));
    }
  }

  /**
   * Wraps a function that may throw, converting its result into a {@link Result}.
   *
   * If `errorMapper` is provided, it maps the thrown error to the expected error type.
   * Defaults to {@link Error}.
   */
  export function fromThrowable<Fn extends (...args: readonly any[]) => any>(
    fn: Fn,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>>;
  export function fromThrowable<Fn extends (...args: readonly any[]) => any, E>(
    fn: Fn,
    errorMapper: (e: unknown) => E,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E>;
  export function fromThrowable<Fn extends (...args: readonly any[]) => any, E>(
    fn: Fn,
    errorMapper?: (e: unknown) => E,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> {
    return (...args) => {
      try {
        const result = fn(...args);
        return new Ok(result);
      } catch (e) {
        errorMapper ??= toError as (e: unknown) => E;
        return new Err(errorMapper(e));
      }
    };
  }
}

type ResultGenerator<T, E> = Generator<Err<never, E>, T>;

/** Defines an interface for converting a value into a {@link Result}. */
export interface IntoResult<T, E> {
  /** Converts the value into a {@link Result}. */
  intoResult(): Result<T, E>;
}

/**
 * Shared interface for {@link Ok} and {@link Err}.
 *
 * Provides utility methods for inspecting, unwrapping, and transforming results.
 */
interface ResultLike<T, E>
  extends Iterable<Err<never, E>, T>,
    IntoOption<NonNullable<T>> {
  /** Returns `true` if the result is {@link Ok}. */
  isOk(): this is Ok<T, E>;

  /** Returns `true` if the result is {@link Err}. */
  isErr(): this is Err<T, E>;

  /** Returns `true` if the result is {@link Ok} and satisfies the predicate. */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if the result is {@link Err} and satisfies the predicate. */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  /**
   * Converts {@link Ok} to {@link Some}, otherwise {@link None}.
   *
   * **If {@link Ok} value is nullable (`null` or `undefined`) this function will return {@link None}!**
   */
  ok(): Option<NonNullable<T>>;

  /**
   * Converts {@link Err} to {@link Some}, otherwise {@link None}.
   *
   * **If {@link Err} value is nullable (`null` or `undefined`) this function will return {@link None}!**
   */
  err(): Option<NonNullable<E>>;

  /** Returns the {@link Ok} value or throws a {@link ResultError}. */
  unwrap(): T;

  /** Returns either {@link Ok} value or {@link Err} value. */
  unwrapAny(): T | E;

  /** Returns the {@link Err} value or throws a {@link ResultError}. */
  unwrapErr(): E;

  /** Returns the {@link Ok} value or the provided default. */
  unwrapOr(defaultValue: T): T;

  /** Returns the {@link Ok} value or computes a default from the error. */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  /** Returns the {@link Ok} value or throws with a custom message. */
  expect(message: string): T;

  /** Returns the {@link Err} value or throws with a custom message. */
  expectErr(message: string): E;

  /** Maps the {@link Ok} value to a new value, leaving {@link Err} unchanged. */
  map<T2>(fn: (value: T) => T2): Result<T2, E>;

  /** Maps the {@link Err} value to a new value, leaving {@link Ok} unchanged. */
  mapErr<E2>(fn: (error: E) => E2): Result<T, E2>;

  /** Returns `other` if {@link Ok}, otherwise keeps {@link Err}. */
  and<T2>(other: Result<T2, E>): Result<T2, E>;

  /** Calls `fn` if {@link Ok}, otherwise keeps {@link Err}. */
  andThen<T2>(fn: (value: T) => Result<T2, E>): Result<T2, E>;

  /** Returns `other` if {@link Err}, otherwise keeps {@link Ok}. */
  or<E2>(other: Result<T, E2>): Result<T, E2>;

  /** Calls `fn` if {@link Err}, otherwise keeps {@link Ok}. */
  orElse<E2>(fn: (error: E) => Result<T, E2>): Result<T, E2>;

  /**
   * Pattern matching: runs the appropriate branch depending on {@link Ok}/{@link Err}.
   *
   * ~We have pattern matching at home!~
   */
  match<U>(body: { Ok: (value: T) => U; Err: (error: E) => U }): U;

  /** Returns string representation of the result. */
  toString(): string;
}

/** Error thrown when unwrapping an invalid {@link Result}. */
export class ResultError extends Error {
  override name = "ResultError";

  /** Type guard to check if a value is a {@link ResultError}. */
  static isResultError(value: unknown): value is ResultError {
    return value instanceof ResultError;
  }
}

/** Represents a successful {@link Result}. */
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

  unwrapAny(): T {
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

  expect(_: string): T {
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

/** Represents a failed {@link Result}. */
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

  unwrapAny(): E {
    return this.#value;
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

  expect(message: string): never {
    throw new ResultError(`${message}: ${this.#value}`);
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
