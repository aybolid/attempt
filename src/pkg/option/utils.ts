import type { Nullable } from "@/internal/types";
import { isNullable } from "@/internal/utils";

import { None, Some, type Option } from "./option";

/**
 * Wraps a value in a `Some`.
 *
 * @template T The type of the value.
 *
 * @example
 * const opt = some(42);
 * console.log(opt.isSome()); // true
 */
export function some<T>(value: T): Some<T> {
  return new Some(value);
}

/**
 * Returns the singleton `None` instance.
 *
 * @example
 * const opt = none();
 * console.log(opt.isNone()); // true
 */
export function none(): None {
  return None.instance;
}

/**
 * Converts a nullable value (`null` or `undefined`) into an `Option`.
 *
 * @template T The type of the value when non-null.
 *
 * @example
 * fromNullable("hello");   // Some("hello")
 * fromNullable(null);      // None
 * fromNullable(undefined); // None
 */
export function fromNullable<T>(value: Nullable<T>): Option<T> {
  return isNullable(value) ? none() : some(value);
}
