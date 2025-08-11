import type { Option, Result } from "@/pkg";

export type Nullable<T> = T | null | undefined;

export type InferOkTypes<R> = R extends Result<infer T, unknown> ? T : never;
export type InferErrTypes<R> = R extends Result<unknown, infer E> ? E : never;

export type InferSomeTypes<O> = O extends Option<infer T> ? T : never;
