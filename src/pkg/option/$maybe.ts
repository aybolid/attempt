import { isPromise } from "@/internal/utils";
import type { InferSomeTypes } from "@/internal/types";

import type { None, Option } from "./option";

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
