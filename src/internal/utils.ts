export function isPromise<T = unknown>(obj: unknown): obj is Promise<T> {
  return !!obj && typeof (obj as any).then === "function";
}

export function toError(e: unknown): Error {
  if (e instanceof Error) {
    return e;
  }

  return new Error(String(e));
}
