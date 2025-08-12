import { isPromise } from "@/internal/utils";
import type { InferSomeTypes } from "@/internal/types";

import type { None, Option } from "./option";

/**
 * Runs a generator or async generator that can yield `None` to short-circuit computations,
 * returning the first `None` or the final `Some` result.
 *
 * Inspired by Rust's `?` operator for `Option`.
 *
 * The generator should `yield*` `Option` values — if any yield is `None`,
 * execution stops and that `None` is returned. Otherwise, the final `Some` is returned.
 *
 * Works with both synchronous and asynchronous generators.
 *
 * @template T The inner value type of the returned `Option`.
 *
 * @example
 * // Synchronous usage
 * import { $maybe, some, none } from "./option-helpers";
 *
 * const result = $maybe(function* () {
 *   const a = yield* some(2);
 *   const b = yield* some(3);
 *   return some(a + b);
 * });
 * console.log(result.unwrap()); // 5
 *
 * @example
 * // Early return on None
 * const shortCircuit = $maybe(function* () {
 *   const a = yield* none();
 *   const b = yield* some(42); // never reached
 *   return some(a + b);
 * });
 * console.log(shortCircuit.isNone()); // true
 *
 * @example
 * // Asynchronous usage
 * const asyncResult = await $maybe(async function* () {
 *   const a = yield* some(5);
 *   const b = yield* some(7);
 *   return some(a + b);
 * });
 * console.log(asyncResult.unwrap()); // 12
 */
export function $maybe<T>(body: () => Generator<None, Option<T>>): Option<T>;

export function $maybe<GeneratorReturnResult extends Option<unknown>>(
  body: () => Generator<None, GeneratorReturnResult>,
): Option<InferSomeTypes<GeneratorReturnResult>>;

export function $maybe<T>(
  body: () => AsyncGenerator<None, Option<T>>,
): Promise<Option<T>>;

export function $maybe<GeneratorReturnResult extends Option<unknown>>(
  body: () => AsyncGenerator<None, GeneratorReturnResult>,
): Promise<Option<InferSomeTypes<GeneratorReturnResult>>>;

export function $maybe<T>(
  body:
    | (() => Generator<None, Option<T>>)
    | (() => AsyncGenerator<None, Option<T>>),
): Option<T> | Promise<Option<T>> {
  const n = body().next();
  if (isPromise(n)) return n.then((n) => n.value);
  return n.value;
}
