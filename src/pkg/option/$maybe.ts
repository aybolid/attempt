import { isPromise } from "@/internal/utils";
import type { InferSomeTypes } from "@/internal/types";

import type { None, Option } from "./option";

/**
 * Simplifies working with {@link Option} values using generator-based composition.
 *
 * Provides a convenient way to chain {@link Option} operations without explicit checks
 * or verbose unwrapping. Uses generator functions with `yield*` to automatically handle
 * short-circuiting when a {@link None} value is encountered.
 *
 * - Works with both synchronous and asynchronous generators.
 * - If the generator is synchronous, returns a {@link Option}.
 * - If the generator is asynchronous, returns an Promise<{@link Option}>.
 *
 * @example
 * function parseInteger(str: string): Option<number> { }
 *
 * $maybe(function* () {
 *   const a: number = yield* parseInteger("12");
 *   const b: number = yield* parseInteger("34");
 *   return some(a + b);
 * }); // -> Some(46)
 *
 * $maybe(function* () {
 *   const a: number = yield* parseInteger("12");
 *   const b: number = yield* parseInteger("nan"); // Yields None, stops execution here
 *   return some(a + b); // This line never executes
 * }); // -> None
 *
 * async function getCurrentUser(): Promise<Option<User>> { }
 * function buildDisplayName(user: User): Option<string> { }
 *
 * $maybe(async function* () {
 *   const user: User = yield* await getCurrentUser();
 *   const displayName: string = yield* buildDisplayName(user);
 *   return some({ user, displayName });
 * }); // -> Promise<Some(...)> or Promise<None> if any step fails
 */
export function $maybe<T extends NonNullable<unknown>>(
  body: () => Generator<None, Option<T>>,
): Option<T>;

export function $maybe<
  GeneratorReturnResult extends Option<NonNullable<unknown>>,
>(
  body: () => Generator<None, GeneratorReturnResult>,
): Option<InferSomeTypes<GeneratorReturnResult>>;

export function $maybe<T extends NonNullable<unknown>>(
  body: () => AsyncGenerator<None, Option<T>>,
): Promise<Option<T>>;

export function $maybe<
  GeneratorReturnResult extends Option<NonNullable<unknown>>,
>(
  body: () => AsyncGenerator<None, GeneratorReturnResult>,
): Promise<Option<InferSomeTypes<GeneratorReturnResult>>>;

export function $maybe<T extends NonNullable<unknown>>(
  body:
    | (() => Generator<None, Option<T>>)
    | (() => AsyncGenerator<None, Option<T>>),
): Option<T> | Promise<Option<T>> {
  const n = body().next();
  if (isPromise(n)) return n.then((n) => n.value);
  return n.value;
}
