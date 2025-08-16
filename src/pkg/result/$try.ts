import { isPromise } from "@/internal/utils";
import type { InferErrTypes, InferOkTypes } from "@/internal/types";

import type { AsyncResult, Err, Result } from "./result";

/**
 * Simplifies working with {@link Result} values using generator-based composition.
 *
 * Provides a convenient way to chain {@link Result} operations without explicit checks
 * or verbose unwrapping. Uses generator functions with `yield*` to automatically handle
 * short-circuiting when an {@link Err} value is encountered.
 *
 * - Works with both synchronous and asynchronous generators.
 * - If the generator is synchronous, returns a {@link Result}.
 * - If the generator is asynchronous, returns an {@link AsyncResult}.
 *
 * @example
 * function parseInteger(str: string): Result<number, string> { }
 *
 * $try(function* () {
 *   const a: number = yield* parseInteger("12");
 *   const b: number = yield* parseInteger("34");
 *   return ok(a + b);
 * }); // -> Ok(46)
 *
 * $try(function* () {
 *   const a: number = yield* parseInteger("12");
 *   const b: number = yield* parseInteger("nan"); // Yields Err, stops execution here
 *   return ok(a + b); // This line never executes
 * }); // -> Err("nan")
 *
 * async function fetchUser(): AsyncResult<User, Error> { }
 * function buildDisplayName(user: User): Result<string, Error> { }
 *
 * $try(async function* () {
 *   const user: User = yield* await fetchUser();
 *   const displayName: string = yield* buildDisplayName(user);
 *   return ok({ user, displayName });
 * }); // -> Promise<Ok(...)> or Promise<Err(...)> if any step fails
 */
export function $try<T, E>(
  body: () => Generator<Err<never, E>, Result<T, E>>,
): Result<T, E>;

export function $try<
  YieldErr extends Err<never, unknown>,
  GeneratorReturnResult extends Result<unknown, unknown>,
>(
  body: () => Generator<YieldErr, GeneratorReturnResult>,
): Result<
  InferOkTypes<GeneratorReturnResult>,
  InferErrTypes<YieldErr> | InferErrTypes<GeneratorReturnResult>
>;

export function $try<T, E>(
  body: () => AsyncGenerator<Err<never, E>, Result<T, E>>,
): AsyncResult<T, E>;

export function $try<
  YieldErr extends Err<never, unknown>,
  GeneratorReturnResult extends Result<unknown, unknown>,
>(
  body: () => AsyncGenerator<YieldErr, GeneratorReturnResult>,
): AsyncResult<
  InferOkTypes<GeneratorReturnResult>,
  InferErrTypes<YieldErr> | InferErrTypes<GeneratorReturnResult>
>;

export function $try<T, E>(
  body:
    | (() => Generator<Err<never, E>, Result<T, E>>)
    | (() => AsyncGenerator<Err<never, E>, Result<T, E>>),
): Result<T, E> | AsyncResult<T, E> {
  const n = body().next();
  if (isPromise(n)) return n.then((n) => n.value);
  return n.value;
}
