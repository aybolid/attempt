import { None, Some } from "./option";

export function some<T extends NonNullable<unknown>>(value: T): Some<T> {
  return new Some(value);
}

export function none(): None {
  return None.instance;
}
