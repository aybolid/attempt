import type { ResultLike, Result, AsyncResult } from "./types";
export type { Result, AsyncResult };

export class ResultError extends Error {
  override name = "ResultError";
}

/** Represents a successful result containing a value of generic type `OkValue`. The value is immutable. */
export class Ok<OkValue> implements ResultLike<OkValue, never> {
  static _tag = "Ok" as const;

  readonly #value: OkValue;

  constructor(value: OkValue) {
    this.#value = value;
  }

  isErr(): this is never {
    return false;
  }

  isOk(): this is Ok<OkValue> {
    return true;
  }

  isOkAnd(predicate: (value: OkValue) => boolean): boolean {
    return predicate(this.#value);
  }

  isErrAnd(_: (_: never) => boolean): boolean {
    return false;
  }

  ok(): OkValue {
    return this.#value;
  }

  err(): null {
    return null;
  }

  unwrap(): OkValue {
    return this.#value;
  }

  unwrapErr(): never {
    throw new ResultError(`Unwrapping error value on ${this.toString()}`);
  }

  unwrapOr(_: OkValue): OkValue {
    return this.#value;
  }

  unwrapOrElse(_: (_: never) => OkValue): OkValue {
    return this.#value;
  }

  expectErr(message: string): never {
    throw new Error(`${message}: ${this.#value}`);
  }

  map<OtherOkValue>(fn: (value: OkValue) => OtherOkValue): Ok<OtherOkValue> {
    return new Ok(fn(this.#value));
  }

  mapErr<OtherErrValue>(_: (_: never) => OtherErrValue): this {
    return this;
  }

  and<OtherOkValue, OtherErrValue>(
    other: Result<OtherOkValue, OtherErrValue>,
  ): Result<OtherOkValue, OtherErrValue> {
    return other;
  }

  andThen<OtherOkValue, OtherErrorValue>(
    fn: (value: OkValue) => Result<OtherOkValue, OtherErrorValue>,
  ): Result<OtherOkValue, OtherErrorValue> {
    return fn(this.#value);
  }

  or<_, OtherErrValue>(_: Result<OkValue, OtherErrValue>): this {
    return this;
  }

  orElse<_, OtherErrorValue>(
    _: (_: never) => Result<OkValue, OtherErrorValue>,
  ): this {
    return this;
  }

  transpose(): Ok<NonNullable<OkValue>> | null {
    return this.#value === null || this.#value === undefined
      ? null
      : (this as Ok<NonNullable<OkValue>>);
  }

  match<ReturnValue>(body: {
    Ok: (value: OkValue) => ReturnValue;
  }): ReturnValue {
    return body.Ok(this.#value);
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Ok._tag}(${this.#value})`;
  }
}

/** Represents a failed result containing an error of generic type `ErrValue`. The error is immutable. */
export class Err<ErrValue> implements ResultLike<never, ErrValue> {
  static _tag = "Err" as const;

  readonly #value: ErrValue;

  constructor(value: ErrValue) {
    this.#value = value;
  }

  isOk(): this is never {
    return false;
  }

  isErr(): this is Err<ErrValue> {
    return true;
  }

  isOkAnd(_: (_: never) => boolean): boolean {
    return false;
  }

  isErrAnd(predicate: (value: ErrValue) => boolean): boolean {
    return predicate(this.#value);
  }

  ok(): null {
    return null;
  }

  err(): ErrValue {
    return this.#value;
  }

  unwrap(): never {
    throw new ResultError(`Unwrapping value on ${this.toString()}`);
  }

  unwrapErr(): ErrValue {
    return this.#value;
  }

  unwrapOr<DefaultOkValue>(defaultValue: DefaultOkValue): DefaultOkValue {
    return defaultValue;
  }

  unwrapOrElse<DefaultOkValue>(
    fn: (errorValue: ErrValue) => DefaultOkValue,
  ): DefaultOkValue {
    return fn(this.#value);
  }

  expectErr(_: string): ErrValue {
    return this.#value;
  }

  map<OtherOkValue>(_: (_: never) => OtherOkValue): this {
    return this;
  }

  mapErr<OtherErrValue>(
    fn: (error: ErrValue) => OtherErrValue,
  ): Err<OtherErrValue> {
    return new Err(fn(this.#value));
  }

  and<OtherOkValue, _>(_: Result<OtherOkValue, ErrValue>): this {
    return this;
  }

  andThen<OtherOkValue, _>(
    _: (_: never) => Result<OtherOkValue, ErrValue>,
  ): this {
    return this;
  }

  or<OtherOkValue, OtherErrValue>(
    other: Result<OtherOkValue, OtherErrValue>,
  ): Result<OtherOkValue, OtherErrValue> {
    return other;
  }

  orElse<OtherOkValue, OtherErrorValue>(
    fn: (error: ErrValue) => Result<OtherOkValue, OtherErrorValue>,
  ): Result<OtherOkValue, OtherErrorValue> {
    return fn(this.#value);
  }

  transpose(): this {
    return this;
  }

  match<ReturnValue>(body: {
    Err: (error: ErrValue) => ReturnValue;
  }): ReturnValue {
    return body.Err(this.#value);
  }

  toString(): string {
    // TODO: should use JSON.stringify?
    return `${Err._tag}(${this.#value})`;
  }
}
