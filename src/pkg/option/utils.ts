import { None, Some } from "./option";

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
