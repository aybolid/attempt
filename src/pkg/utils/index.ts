import type { Option } from "../option";
import type { Result } from "../result";

export function match<T, E, U>(
  result: Result<T, E>,
  body: { Ok: (value: T) => U; Err: (errorValue: E) => U },
): U;

export function match<T, U>(
  option: Option<T>,
  body: { Some: (value: T) => U; None: () => U },
): U;

export function match<T, E, U>(
  value: Result<T, E> | Option<T>,
  body:
    | { Ok: (value: T) => U; Err: (errorValue: E) => U }
    | { Some: (value: T) => U; None: () => U },
): U {
  // @ts-expect-error this is valid (source - trust me bro)
  return value.match(body);
}
