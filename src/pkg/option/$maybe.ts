import { isPromise } from "@/internal/utils";
import type { InferSomeTypes } from "@/internal/types";

import type { None, Option } from "./option";

type SafeUnwrapOperator = <T>(option: Option<T>) => Generator<None, T>;

function $unwrap<T>(option: Option<T>): Generator<None, T> {
  return (function* () {
    if (option.isSome()) {
      return option.unwrap();
    } else {
      yield option;
    }
  })() as Generator<None, T>;
}

export function $maybe<T>(
  body: (scope: { $: SafeUnwrapOperator }) => Generator<None, Option<T>>,
): Option<T>;

export function $maybe<GeneratorReturnResult extends Option<unknown>>(
  body: (scope: {
    $: SafeUnwrapOperator;
  }) => Generator<None, GeneratorReturnResult>,
): Option<InferSomeTypes<GeneratorReturnResult>>;

export function $maybe<T>(
  body: (scope: { $: SafeUnwrapOperator }) => AsyncGenerator<None, Option<T>>,
): Promise<Option<T>>;

export function $maybe<GeneratorReturnResult extends Option<unknown>>(
  body: (scope: {
    $: SafeUnwrapOperator;
  }) => AsyncGenerator<None, GeneratorReturnResult>,
): Promise<Option<InferSomeTypes<GeneratorReturnResult>>>;

export function $maybe<T>(
  body:
    | ((scope: { $: SafeUnwrapOperator }) => Generator<None, Option<T>>)
    | ((scope: { $: SafeUnwrapOperator }) => AsyncGenerator<None, Option<T>>),
): Option<T> | Promise<Option<T>> {
  const n = body({ $: $unwrap }).next();
  if (isPromise(n)) {
    return n.then((n) => n.value);
  }
  return n.value;
}
