import { isNullable, stringify } from "@/internal/utils";

import { None, Option, Some, type IntoOption } from "../option";

/** Represents the result of an operation.
 *
 * Can be either {@link Ok} or {@link Err}.
 */
export type Result<T, E = Error> = Ok<T, E> | Err<T, E>;

/** Represents the result of an asynchronous operation.
 *
 * Can be either Promise<{@link Ok}> or Promise<{@link Err}>.
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

export namespace Result {
  /** Creates a {@link Result} from a value that implements {@link IntoResult} */
  export function from<T, E>(convertable: IntoResult<T, E>): Result<T, E> {
    return convertable.intoResult();
  }

  /** Creates a {@link AsyncResult} from a promise.
   *
   * `errorMapper` is used to map the error to the error type of the result.
   *
   * @example
   * const result = await Result.fromPromise(asyncMayFail());
   */
  export async function fromPromise<T, E>(
    promise: Promise<T>,
    errorMapper: (e: unknown) => E,
  ): AsyncResult<T, E> {
    return promise
      .then((value) => new Ok(value))
      .catch((e) => new Err(errorMapper(e)));
  }

  /** Wraps a function that may throw an error.
   *
   * `errorMapper` is used to map the error to the error type of the result.
   *
   * @example
   * const safeParseJson = Result.fromThrowable(JSON.parse, (e) => e as SyntaxError);
   */
  export function fromThrowable<Fn extends (...args: readonly any[]) => any, E>(
    fn: Fn,
    errorMapper: (e: unknown) => E,
  ): (...args: Parameters<Fn>) => Result<ReturnType<Fn>, E> {
    return (...args) => {
      try {
        const result = fn(...args);
        return new Ok(result);
      } catch (e) {
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

interface ResultLike<T, E>
  extends Iterable<Err<never, E>, T>,
    IntoOption<NonNullable<T>> {
  /** Type guard. Returns `true` if the result is an {@link Ok}.
   *
   * @example
   * const result = ok(42);
   * result.isOk(); // -> true
   */
  isOk(): this is Ok<T, E>;

  /** Type guard. Returns `true` if the result is an {@link Err}.
   *
   * @example
   * const result = err("error");
   * result.isErr(); // -> true
   */
  isErr(): this is Err<T, E>;

  /** Returns `true` if the result is an {@link Ok} and the value satisfies the predicate.
   *
   * @example
   * let result = ok(42);
   * result.isOkAnd((x) => x > 0);   // -> true
   * result.isOkAnd((x) => x > 100); // -> false
   *
   * result = err("error");
   * result.isOkAnd((x) => x > 0);   // -> false
   * result.isOkAnd((x) => x > 100); // -> false
   */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /** Returns `true` if the result is an {@link Err} and the error satisfies the predicate.
   *
   * @example
   * let result = err("error");
   * result.isErrAnd((e) => e === "error");  // -> true
   * result.isErrAnd((e) => e === "error2"); // -> false
   *
   * result = ok(42);
   * result.isErrAnd((e) => e === "error");  // -> false
   * result.isErrAnd((e) => e === "error2"); // -> false
   */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  /** Returns an {@link Option} containing the value if the result is an {@link Ok}, otherwise {@link None}.
   *
   * **Note: if {@link Ok} value is `null` or `undefined`, it will be converted to {@link None}.**
   *
   * @example
   * let result = ok(42);
   * result.ok(); // -> Some(42)
   *
   * result = err("error");
   * result.ok(); // -> None
   *
   * result = ok(null);
   * result.ok(); // -> None
   *
   * result = ok(undefined);
   * result.ok(); // -> None
   */
  ok(): Option<NonNullable<T>>;

  /** Returns an {@link Option} containing the error value if the result is an {@link Err}, otherwise {@link None}.
   *
   * **Note: if {@link Err} value is `null` or `undefined`, it will be converted to {@link None}.**
   *
   * @example
   * let result = err("error");
   * result.ok(); // -> Some("error")
   *
   * result = ok(42);
   * result.ok(); // -> None
   *
   * result = err(null);
   * result.ok(); // -> None
   *
   * result = err(undefined);
   * result.ok(); // -> None
   */
  err(): Option<NonNullable<E>>;

  /** Returns the contained {@link Ok} value or throws a {@link ResultError} instance.
   *
   * @example
   * let result = ok(42);
   * result.unwrap(); // -> 42
   *
   * result = err("error");
   * result.unwrap(); // -> throws ResultError(...)
   */
  unwrap(): T;

  /** Returns the contained {@link Err} value or throws a {@link ResultError} instance.
   *
   * @example
   * let result = err("error");
   * result.unwrap(); // -> "error"
   *
   * result = ok(42);
   * result.unwrap(); // -> throws ResultError(...)
   */
  unwrapErr(): E;

  /** Returns the contained {@link Ok} value or a default value.
   *
   * @see {@link unwrapOrElse} for lazy evaluation of the default value.
   *
   * @example
   * let result = ok(42);
   * result.unwrapOr(0); // -> 42
   *
   * result = err("error");
   * result.unwrapOr(0); // -> 0
   */
  unwrapOr(defaultValue: T): T;

  /** Returns the contained {@link Ok} value or a computed default value.
   *
   * @example
   * let result = ok(42);
   * result.unwrapOrElse((e) => e.length); // -> 42
   *
   * result = err("error");
   * result.unwrapOrElse((e) => e.length); // -> 5
   */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  /** Returns the contained {@link Ok} value or throws a {@link ResultError} instance.
   *
   * The good practice is to provide a meaningful error message that tells why {@link Ok} value
   * is expected.
   *
   * @example
   * let result = ok(42);
   * result.expect("should be ok because..."); // -> 42
   *
   * result = err("error");
   * result.expect("should be ok because..."); // -> throws ResultError(...)
   */
  expect(message: string): T;

  /** Returns the contained {@link Err} value or throws a {@link ResultError} instance.
   *
   * The good practice is to provide a meaningful error message that tells why an {@link Err} value
   * is expected.
   *
   * @example
   * let result = ok(42);
   * result.expectErr("should be error because..."); // -> throws ResultError(...)
   *
   * result = err("error");
   * result.expectErr("should be error because..."); // -> "error"
   */
  expectErr(message: string): E;

  /** Maps the {@link Ok} value to a new value or leaves the {@link Err} value in place.
   *
   * @example
   * let result = ok(42);
   * result.map((x) => x.toString()); // -> Ok("42")
   *
   * result = err("error");
   * result.map((x) => x + 2); // -> Err("error")
   */
  map<T2>(fn: (value: T) => T2): Result<T2, E>;

  /** Maps the {@link Err} value to a new value or leaves the {@link Ok} value in place.
   *
   * @example
   * let result = err("error");
   * result.mapErr((e) => e + "!"); // -> Err("error!")
   *
   * result = ok(42);
   * result.mapErr((e) => e + "!"); // -> Ok(42)
   */
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
