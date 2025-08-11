import { isPromise } from "@/internal/utils";
import type { InferErrTypes, InferOkTypes } from "@/internal/types";

import type { AsyncResult, Err, Result } from "./result";

type SafeUnwrapOperator = <T, E>(result: Result<T, E>) => Generator<Err<E>, T>;

function $unwrap<T, E>(result: Result<T, E>): Generator<Err<E>, T> {
  return (function* () {
    if (result.isOk()) {
      return result.unwrap();
    } else {
      yield result;
    }
  })() as Generator<Err<E>, T>;
}

export function $try<T, E>(
  body: (scope: { $: SafeUnwrapOperator }) => Generator<Err<E>, Result<T, E>>,
): Result<T, E>;

export function $try<
  YieldErr extends Err<unknown>,
  GeneratorReturnResult extends Result<unknown, unknown>,
>(
  body: (scope: {
    $: SafeUnwrapOperator;
  }) => Generator<YieldErr, GeneratorReturnResult>,
): Result<
  InferOkTypes<GeneratorReturnResult>,
  InferErrTypes<YieldErr> | InferErrTypes<GeneratorReturnResult>
>;

export function $try<T, E>(
  body: (scope: {
    $: SafeUnwrapOperator;
  }) => AsyncGenerator<Err<E>, Result<T, E>>,
): AsyncResult<T, E>;

export function $try<
  YieldErr extends Err<unknown>,
  GeneratorReturnResult extends Result<unknown, unknown>,
>(
  body: (scope: {
    $: SafeUnwrapOperator;
  }) => AsyncGenerator<YieldErr, GeneratorReturnResult>,
): AsyncResult<
  InferOkTypes<GeneratorReturnResult>,
  InferErrTypes<YieldErr> | InferErrTypes<GeneratorReturnResult>
>;

export function $try<T, E>(
  body:
    | ((scope: { $: SafeUnwrapOperator }) => Generator<Err<E>, Result<T, E>>)
    | ((scope: {
        $: SafeUnwrapOperator;
      }) => AsyncGenerator<Err<E>, Result<T, E>>),
): Result<T, E> | AsyncResult<T, E> {
  const n = body({ $: $unwrap }).next();
  if (isPromise(n)) {
    return n.then((n) => n.value);
  }
  return n.value;
}
