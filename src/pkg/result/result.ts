import { isNullable } from "@/internal/utils";

import { None, none, Some, some, type Option } from "../option";

/**
 * A discriminated union representing either a successful {@link Ok} value or an error {@link Err} value.
 *
 * This type provides a way to handle operations that may fail without throwing exceptions.
 * It forces explicit error handling.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value. Defaults to {@link Error}.
 *
 * @example
 * let result: Result<number, string>;
 * result = ok(69);     // Ok<number>
 * result = err("meh"); // Err<string>
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

/**
 * An asynchronous variant of {@link Result}, wrapped in a {@link Promise}.
 *
 * This type is useful for async operations that may fail.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value. Defaults to {@link Error}.
 *
 * @example
 * async function fetchData(): AsyncResult<string> {
 *   try {
 *     const data = await fetch('/api/data');
 *     const text = await data.text();
 *     return ok(text);
 *   } catch (e) {
 *     return err(e as Error);
 *   }
 * }
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

type ResultGenerator<T, E> = Generator<Err<E>, T>;

/**
 * Interface for types that can be converted into a {@link Result}.
 *
 * This interface allows custom types to define how they should be converted
 * into Result types, enabling seamless integration with Result-based APIs.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 *
 * @example
 * class ValidationError extends Error implements IntoResult<never, ValidationError> {
 *   override name = 'ValidationError';
 *
 *   intoResult(): Result<never, ValidationError> {
 *     return err(this);
 *   }
 * }
 */
export interface IntoResult<T, E> {
  /**
   * Converts this value into a {@link Result}.
   *
   * @returns A {@link Result} containing this value.
   */
  intoResult(): Result<T, E>;
}

/**
 * Internal interface defining the common methods for both {@link Ok} and {@link Err} results.
 *
 * This interface provides type-safe methods for working with Result values,
 * including pattern matching, transformation, and extraction operations.
 *
 * @template T - The type of the success value.
 * @template E - The type of the error value.
 */
interface ResultLike<T, E> extends Iterable<Err<E>, T> {
  /**
   * Type guard that returns `true` if this is an {@link Ok} result.
   *
   * @returns `true` if this Result contains a success value.
   *
   * @example
   * const result = mayFail();
   *
   * if (result.isOk()) {
   *   // TypeScript knows this is Ok<T>
   *   console.log(result.unwrap());
   * } else {
   *   // TypeScript knows this is Err<E>
   *   console.error(result.unwrapErr());
   * }
   */
  isOk(): this is Ok<T>;

  /**
   * Type guard that returns `true` if this is an {@link Err} result.
   *
   * @returns `true` if this Result contains an error value.
   *
   * @example
   * const result = mayFail();
   *
   * if (result.isErr()) {
   *   // Handle error case
   *   console.error('Operation failed:', result.unwrapErr());
   * }
   */
  isErr(): this is Err<E>;

  /**
   * Returns `true` if this is an {@link Ok} result and its value satisfies the predicate.
   *
   * @param predicate - Function to test the Ok value against.
   * @returns `true` if this is Ok and the predicate returns true.
   *
   * @example
   * const result = ok(42);
   * console.log(result.isOkAnd(x => x > 40)); // true
   * console.log(result.isOkAnd(x => x < 40)); // false
   */
  isOkAnd(predicate: (value: T) => boolean): boolean;

  /**
   * Returns `true` if this is an {@link Err} result and its error satisfies the predicate.
   *
   * @param predicate - Function to test the Err value against.
   * @returns `true` if this is Err and the predicate returns true.
   *
   * @example
   * const result = err(new Error('Network timeout'));
   * console.log(result.isErrAnd(e => e.message.includes('timeout'))); // true
   */
  isErrAnd(predicate: (error: E) => boolean): boolean;

  ok(): Option<T>;

  err(): Option<E>;

  /**
   * Returns the {@link Ok} value, or throws {@link ResultError} if this is an {@link Err}.
   *
   * This method will throw if called on an Err result.
   * Use {@link unwrapOr} or {@link unwrapOrElse} for safer alternatives.
   *
   * @returns The Ok value.
   * @throws If this is an Err result throws {@link ResultError}.
   *
   * @example
   * const success = ok(42);
   * console.log(success.unwrap()); // 42
   *
   * const failure = err('oops');
   * failure.unwrap(); // throws ResultError
   */
  unwrap(): T;

  /**
   * Returns the {@link Err} value, or throws {@link ResultError} if this is an {@link Ok}.
   *
   * This method will throw if called on an Ok result.
   * Use {@link err} for a safer alternative.
   *
   * @returns The Err value.
   * @throws If this is an Ok result throws {@link ResultError}.
   *
   * @example
   * const failure = err('network error');
   * console.log(failure.unwrapErr()); // 'network error'
   *
   * const success = ok(42);
   * success.unwrapErr(); // throws ResultError
   */
  unwrapErr(): E;

  /**
   * Returns the {@link Ok} value if present, otherwise returns the provided default value.
   *
   * This is a safe way to extract a value with a fallback.
   *
   * @param defaultValue - The value to return if this is an Err.
   * @returns The Ok value or the default value.
   *
   * @example
   * const success = ok(42);
   * const failure = err('oops');
   *
   * console.log(success.unwrapOr(0)); // 42
   * console.log(failure.unwrapOr(0)); // 0
   */
  unwrapOr(defaultValue: T): T;

  /**
   * Returns the {@link Ok} value if present, otherwise computes a fallback using the provided function.
   *
   * This allows for lazy computation of the default value and access to the error.
   *
   * @param defaultValueFn - Function that computes the fallback value from the error.
   * @returns The Ok value or the computed fallback value.
   *
   * @example
   * const result = err('network timeout');
   * const value = result.unwrapOrElse((error) => {
   *   console.log('Error occurred:', error);
   *   return 'default';
   * }); // 'default'
   */
  unwrapOrElse(defaultValueFn: (error: E) => T): T;

  /**
   * Returns the {@link Err} value, or throws an {@link Error} with the given message if this is an {@link Ok}.
   *
   * This is useful for asserting that a Result should be an error.
   *
   * @param message - The error message to use if this is an Ok.
   * @returns The Err value.
   * @throws If this is an Ok result throws {@link ResultError}.
   *
   * @example
   * const failure = err('validation failed');
   * const error = failure.expectErr('Should be an error'); // 'validation failed'
   *
   * const success = ok(42);
   * success.expectErr('Expected failure'); // throws ResultError
   */
  expectErr(message: string): E;

  /**
   * Maps the {@link Ok} value using the provided function.
   *
   * If this is an {@link Err}, returns self unchanged. This allows for
   * chaining transformations that only apply to success values.
   *
   * @template T2 - The type of the mapped value.
   * @param fn - Function to transform the Ok value.
   * @returns A new Result with the transformed value, or self if Err.
   *
   * @example
   * const result = ok(21)
   *   .map(x => x * 2)
   *   .map(x => x.toString()); // Ok("42")
   *
   * const error = err('oops')
   *   .map(x => x * 2); // Still Err('oops')
   */
  map<T2>(fn: (value: T) => T2): Result<T2, E>;

  /**
   * Maps the {@link Err} value using the provided function.
   *
   * If this is an {@link Ok}, returns self unchanged. This allows for
   * transforming error values while preserving success values.
   *
   * @template E2 - The type of the mapped error.
   * @param fn - Function to transform the Err value.
   * @returns A new Result with the transformed error, or self if Ok.
   *
   * @example
   * const result = err('network error')
   *   .mapErr(msg => new Error(msg)); // Err(Error('network error'))
   *
   * const success = ok(42)
   *   .mapErr(msg => new Error(msg)); // Still Ok(42)
   */
  mapErr<E2>(fn: (error: E) => E2): Result<T, E2>;

  /**
   * Returns `other` if this is an {@link Ok}; otherwise returns self.
   *
   * This is useful for chaining operations where you want the first error
   * to short-circuit the chain. For lazy evaluation, use {@link andThen}.
   *
   * @template T2 - The type of the other result's success value.
   * @param other - The Result to return if this is Ok.
   * @returns `other` if this is Ok, otherwise self.
   *
   * @example
   * const a = ok(1);
   * const b = ok('hello');
   * const c = err('oops');
   *
   * console.log(a.and(b)); // Ok('hello')
   * console.log(a.and(c)); // Err('oops')
   * console.log(c.and(b)); // Err('oops')
   */
  and<T2>(other: Result<T2, E>): Result<T2, E>;

  /**
   * Applies the function to the {@link Ok} value and returns its result.
   *
   * If this is an {@link Err}, returns self unchanged. This is the monadic
   * bind operation for Results, enabling chainable computations that may fail.
   *
   * @template T2 - The type of the new result's success value.
   * @param fn - Function that takes the Ok value and returns a new Result.
   * @returns The result of applying the function, or self if Err.
   *
   * @example
   * const parseNumber = (s: string): Result<number, string> => {
   *   const n = parseInt(s);
   *   return isNaN(n) ? err('Not a number') : ok(n);
   * };
   *
   * const result = ok('42')
   *   .andThen(parseNumber)
   *   .andThen(n => ok(n * 2)); // Ok(84)
   */
  andThen<T2>(fn: (value: T) => Result<T2, E>): Result<T2, E>;

  /**
   * Returns `other` if this is an {@link Err}; otherwise returns self.
   *
   * This is useful for providing fallback Results. For lazy evaluation,
   * use {@link orElse}.
   *
   * @template E2 - The type of the other result's error value.
   * @param other - The Result to return if this is Err.
   * @returns Self if this is Ok, otherwise `other`.
   *
   * @example
   * const primary = err('primary failed');
   * const fallback = ok('fallback value');
   * const alsoFailed = err('fallback failed');
   *
   * console.log(primary.or(fallback)); // Ok('fallback value')
   * console.log(primary.or(alsoFailed)); // Err('fallback failed')
   */
  or<E2>(other: Result<T, E2>): Result<T, E2>;

  /**
   * Applies the function to the {@link Err} value and returns its result.
   *
   * If this is an {@link Ok}, returns self unchanged. This enables
   * error recovery and transformation chains.
   *
   * @template E2 - The type of the new result's error value.
   * @param fn - Function that takes the Err value and returns a new Result.
   * @returns Self if this is Ok, otherwise the result of applying the function.
   *
   * @example
   * const retry = (error: string): Result<number, string> => {
   *   if (error.includes('timeout')) {
   *     return ok(42); // Retry succeeded
   *   }
   *   return err(`Fatal: ${error}`);
   * };
   *
   * const result = err('timeout')
   *   .orElse(retry); // Ok(42)
   */
  orElse<E2>(fn: (error: E) => Result<T, E2>): Result<T, E2>;

  transpose(): Option<Result<NonNullable<T>, E>>;

  /**
   * Matches the result against the provided handlers.
   *
   * This provides pattern matching functionality, allowing you to handle
   * both Ok and Err cases in a single expression. Both handlers are required.
   *
   * @template U - The return type of both match handlers.
   * @param body - Object containing Ok and Err handler functions.
   * @param body.Ok - Function to handle Ok values.
   * @param body.Err - Function to handle Err values.
   * @returns The result of calling the appropriate handler.
   *
   * @example
   * const result = mayFail();
   * const message = result.match({
   *   Ok: (value) => `Success: ${value}`,
   *   Err: (error) => `Error: ${error.message}`
   * });
   */
  match<U>(body: { Ok: (value: T) => U; Err: (error: E) => U }): U;

  /**
   * Returns a string representation of the result.
   *
   * @returns A string in the format "Ok(value)" or "Err(error)".
   *
   * @example
   * console.log(ok(42).toString()); // "Ok(42)"
   * console.log(err('oops').toString()); // "Err("oops")"
   */
  toString(): string;
}

/**
 * Error thrown by Result operations when attempting to unwrap incorrectly.
 *
 * This error is thrown when calling {@link Ok.unwrapErr} or {@link Err.unwrap},
 * or when using {@link Ok.expectErr} on an Ok result.
 *
 * @example
 * try {
 *   ok(42).unwrapErr();
 * } catch (error) {
 *   console.log(ResultError.isResultError(error)); // true
 * }
 */
export class ResultError extends Error {
  override name = "ResultError";

  /** Checks if the given value is an instance of ResultError. */
  static isResultError(value: unknown): value is ResultError {
    return value instanceof ResultError;
  }
}

/**
 * Represents a successful result containing a value of type `T`.
 *
 * The Ok class is immutable - once created, the contained value cannot be changed.
 * All transformation methods return new Result instances.
 *
 * @template T - The type of the success value.
 *
 * @example
 * const result = new Ok(42);
 * console.log(result.isOk()); // true
 * console.log(result.unwrap()); // 42
 */
export class Ok<T> implements ResultLike<T, never> {
  static _tag = "Ok" as const;

  readonly #value: T;

  /**
   * Creates a new Ok result containing the provided value.
   *
   * @param value - The success value to wrap.
   */
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

  transpose(): Option<Ok<NonNullable<T>>> {
    return isNullable(this.#value) ? none() : some(this as Ok<NonNullable<T>>);
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
 * Represents a failed result containing an error of type `E`.
 *
 * The Err class is immutable - once created, the contained error cannot be changed.
 * All transformation methods return new Result instances.
 *
 * @template E - The type of the error value.
 *
 * @example
 * const result = new Err('Something went wrong');
 * console.log(result.isErr()); // true
 * console.log(result.unwrapErr()); // 'Something went wrong'
 */
export class Err<E> implements ResultLike<never, E> {
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

  isErr(): this is Err<E> {
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
