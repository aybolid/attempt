import { describe, expect, test, vi } from "vitest";

import { $maybe } from "../$maybe";
import { None, Option, Some } from "../option";

const expectNoneSingleton = (value: unknown) => {
  expect(value).toBeInstanceOf(None);
  expect(value).toBe(None.instance);
};

const expectSome = (value: unknown, expectedValue: unknown) => {
  expect(value).toBeInstanceOf(Some);
  expect((value as Some<NonNullable<unknown>>).unwrap()).toBe(expectedValue);
};

describe("sync", () => {
  test(`${$maybe.name} should return ${Some.name} for generator returning ${Some.name}`, () => {
    const opt = $maybe(function* () {
      return Option.some(20);
    });
    expectSome(opt, 20);
  });
  test(`${$maybe.name} should return ${None.name} for generator returning ${None.name}`, () => {
    const opt = $maybe(function* () {
      return Option.none();
    });
    expectNoneSingleton(opt);
  });
});

describe("async", () => {
  test(`${$maybe.name} should return Promise<${Some.name}> for async generator returning ${Some.name}`, async () => {
    const result = $maybe(async function* () {
      return Option.some(42);
    });

    expect(result).toBeInstanceOf(Promise);
    const opt = await result;
    expectSome(opt, 42);
  });

  test(`${$maybe.name} should return Promise<${None.name}> for async generator returning ${None.name}`, async () => {
    const result = $maybe(async function* () {
      return Option.none();
    });

    expect(result).toBeInstanceOf(Promise);
    const opt = await result;
    expectNoneSingleton(opt);
  });

  test(`${$maybe.name} should handle async operations within async generator`, async () => {
    const asyncOperation = vi.fn().mockResolvedValue(100);

    const result = $maybe(async function* () {
      const value = await asyncOperation();
      return Option.some(value * 2);
    });

    const opt = await result;
    expectSome(opt, 200);
  });
});

describe("chaining / composition", () => {
  test(`${$maybe.name} should handle multiple yields with ${Some.name} values`, () => {
    const opt = $maybe(function* () {
      const a = yield* Option.some(10);
      const b = yield* Option.some(20);
      return Option.some(a + b);
    });

    expectSome(opt, 30);
  });

  test(`${$maybe.name} should short circuit on first ${None.name} in chain`, () => {
    const laterFn = vi.fn();

    const opt = $maybe(function* () {
      const a = yield* Option.some(10);
      const b = yield* Option.none();
      laterFn();
      const c = yield* Option.some(30);
      return Option.some(a + b + c);
    });

    expectNoneSingleton(opt);
    expect(laterFn).not.toBeCalled();
  });

  test(`${$maybe.name} should handle nested ${$maybe.name} calls`, () => {
    const inner = $maybe(function* () {
      return Option.some(42);
    });

    const outer = $maybe(function* () {
      const value = yield* inner;
      return Option.some(value * 2);
    });

    expectSome(outer, 84);
  });
});

describe("errors", () => {
  test(`${$maybe.name} should throw on exception in generator`, () => {
    expect(() => {
      $maybe(function* () {
        throw new Error("Test error");
      });
    }).toThrow("Test error");
  });

  test(`${$maybe.name} should throw on exception in async generator`, async () => {
    const promise = $maybe(async function* () {
      throw new Error("Async test error");
    });

    await expect(promise).rejects.toThrow("Async test error");
  });
});
