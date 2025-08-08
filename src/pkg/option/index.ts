export * from "./types";

interface OptionLike<T> {
  isSome(): this is Some<T>;

  isNone(): this is None;

  isSomeAnd(predicate: (value: T) => boolean): boolean;

  isNoneOr(predicate: (value: T) => boolean): boolean;

  match<U>(body: { Some: (value: T) => U; None: () => U }): U;
}

export class Some<T> implements OptionLike<T> {
  readonly #value: T;

  constructor(value: T) {
    this.#value = value;
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None {
    return false;
  }

  isSomeAnd(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  isNoneOr(predicate: (value: T) => boolean): boolean {
    return predicate(this.#value);
  }

  match<U>(body: { Some: (value: T) => U }): U {
    return body.Some(this.#value);
  }
}

export class None implements OptionLike<never> {
  isSome(): this is Some<never> {
    return false;
  }

  isNone(): this is None {
    return true;
  }

  isSomeAnd(_: (value: never) => boolean): boolean {
    return false;
  }

  isNoneOr(_: (value: never) => boolean): boolean {
    return true;
  }

  match<U>(body: { None: () => U }): U {
    return body.None();
  }
}

export function some<T>(value: T): Some<T> {
  return new Some(value);
}

export function none(): None {
  return new None();
}
