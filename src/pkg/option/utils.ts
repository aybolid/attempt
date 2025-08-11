import type { Nullable } from "@/internal/types";
import { isNullable } from "@/internal/utils";

import { None, Some, type Option } from "./option";

export function some<T>(value: T): Some<T> {
  return new Some(value);
}

export function none(): None {
  return None.instance;
}

export function fromNullable<T>(value: Nullable<T>): Option<T> {
  return isNullable(value) ? none() : some(value);
}
