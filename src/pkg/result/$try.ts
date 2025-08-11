import { isPromise } from "@/internal/utils";
import type { InferErrTypes, InferOkTypes } from "@/internal/types";

import type { AsyncResult, Err, Result } from "./result";

export function $try<T, E>(
  body: () => Generator<Err<E>, Result<T, E>>,
): Result<T, E>;

export function $try<
  YieldErr extends Err<unknown>,
  GeneratorReturnResult extends Result<unknown, unknown>,
>(
  body: () => Generator<YieldErr, GeneratorReturnResult>,
): Result<
  InferOkTypes<GeneratorReturnResult>,
  InferErrTypes<YieldErr> | InferErrTypes<GeneratorReturnResult>
>;

export function $try<T, E>(
  body: () => AsyncGenerator<Err<E>, Result<T, E>>,
): AsyncResult<T, E>;

export function $try<
  YieldErr extends Err<unknown>,
  GeneratorReturnResult extends Result<unknown, unknown>,
>(
  body: () => AsyncGenerator<YieldErr, GeneratorReturnResult>,
): AsyncResult<
  InferOkTypes<GeneratorReturnResult>,
  InferErrTypes<YieldErr> | InferErrTypes<GeneratorReturnResult>
>;

export function $try<T, E>(
  body:
    | (() => Generator<Err<E>, Result<T, E>>)
    | (() => AsyncGenerator<Err<E>, Result<T, E>>),
): Result<T, E> | AsyncResult<T, E> {
  const n = body().next();
  if (isPromise(n)) return n.then((n) => n.value);
  return n.value;
}
