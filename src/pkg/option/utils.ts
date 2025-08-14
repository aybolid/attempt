import { None, Some } from "./option";

/** Creates a {@link Some} instance containing the given value */
export function some<T extends NonNullable<unknown>>(value: T): Some<T> {
  return new Some(value);
}

/** Returns a {@link None} instance */
export function none(): None {
  return None.instance;
}
