import { isPromise } from "@/internal/utils";
import type { InferErrTypes, InferOkTypes } from "@/internal/types";

import type { AsyncResult, Err, Result } from "./result";

/**
 * Executes a generator or async generator function that yields `Err` values and ultimately returns a `Result`.
 *
 * This utility simplifies working with generator-based control flow where errors can be yielded as `Err`
 * to short-circuit and propagate error results.
 *
 * Supports both synchronous and asynchronous generators.
 *
 * @template T - The success value type of the resulting `Result`.
 * @template E - The error type yielded or returned by the generator.
 *
 * @param body - A function returning a generator or async generator that yields `Err` and returns a `Result`.
 *
 * @returns A `Result` or a `Promise` resolving to a `Result`, depending on the generator type.
 *
 * @example
 * // Sync example
 * const result = $try(function* () {
 *   const val = yield* err("Error early");
 *   return ok(val + 1);
 * });
 *
 * // Async example
 * const asyncResult = await $try(async function* () {
 *   const val = yield* err("Async error");
 *   return ok(val + 1);
 * });
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
