export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return !!value && typeof (value as any).then === "function";
}

export function toError(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  }

  return new Error(String(e));
}

export function isNullable(value: unknown): value is null | undefined {
  return value == null || value === undefined;
}
