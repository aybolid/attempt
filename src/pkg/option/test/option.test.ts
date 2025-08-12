import { describe, expect, test, vi } from "vitest";
import { None, Option, Some } from "../option";

const expectNoneSingleton = (value: unknown) => {
  expect(value).toBeInstanceOf(None);
  expect(value).toBe(None.instance);
};

describe("create", () => {
  test(`Option.${Option.some.name} should return instance of ${Some.name}`, () => {
    const opt = Option.some(20);
    expect(opt).toBeInstanceOf(Some);
  });
  test(`Option.${Option.none.name} should return instance of ${None.name}`, () => {
    const opt = Option.none();
    expectNoneSingleton(opt);
  });

  test(`Option.${Option.fromNullable.name} should return instance of ${Some.name} if non-null value is passed`, () => {
    const opt = Option.fromNullable(false);
    expect(opt).toBeInstanceOf(Some);
  });
  test(`Option.${Option.fromNullable.name} should return instance of ${None.name} if null value is passed`, () => {
    const opt = Option.fromNullable(null);
    expectNoneSingleton(opt);
  });
  test(`Option.${Option.fromNullable.name} should return instance of ${None.name} if undefined value is passed`, () => {
    const opt = Option.fromNullable(undefined);
    expectNoneSingleton(opt);
  });

  test(`Option.${Option.fromPredicate.name} should return instance of ${Some.name} if predicate is true`, () => {
    const opt = Option.fromPredicate(20, (x) => x > 10);
    expect(opt).toBeInstanceOf(Some);
  });
  test(`Option.${Option.fromPredicate.name} should return instance of ${None.name} if predicate is false`, () => {
    const opt = Option.fromPredicate(20, (x) => x < 10);
    expectNoneSingleton(opt);
  });

  // TODO: test Option.from
});

describe("check", () => {
  test(`${Some.name}.${Some.prototype.isSome.name} should return true`, () => {
    const opt = Option.some(20);
    expect(opt.isSome()).toBe(true);
  });
  test(`${None.name}.${None.prototype.isSome.name} should return false`, () => {
    const opt = Option.none();
    expect(opt.isSome()).toBe(false);
  });

  test(`${Some.name}.${Some.prototype.isNone.name} should return false`, () => {
    const opt = Option.some(20);
    expect(opt.isNone()).toBe(false);
  });
  test(`${None.name}.${None.prototype.isNone.name} should return true`, () => {
    const opt = Option.none();
    expect(opt.isNone()).toBe(true);
  });

  test(`${Some.name}.${Some.prototype.isSomeAnd.name} should return true if predicate is true`, () => {
    const opt = Option.some(20);
    expect(opt.isSomeAnd((x) => x > 10)).toBe(true);
  });
  test(`${Some.name}.${Some.prototype.isSomeAnd.name} should return false if predicate is false`, () => {
    const opt = Option.some(20);
    expect(opt.isSomeAnd((x) => x < 10)).toBe(false);
  });
  test(`${None.name}.${None.prototype.isSomeAnd.name} should return false if predicate is true`, () => {
    const opt = Option.none();
    expect(opt.isSomeAnd(() => true)).toBe(false);
  });
  test(`${None.name}.${None.prototype.isSomeAnd.name} should return false if predicate is false`, () => {
    const opt = Option.none();
    expect(opt.isSomeAnd(() => false)).toBe(false);
  });
  test(`${None.name}.${None.prototype.isSomeAnd.name} should never call predicate fn`, () => {
    const opt = Option.none();
    const predicate = vi.fn();
    opt.isSomeAnd(predicate);
    expect(predicate).not.toBeCalled();
  });

  test(`${Some.name}.${Some.prototype.isNoneOr.name} should return true if predicate is true`, () => {
    const opt = Option.some(20);
    expect(opt.isNoneOr((x) => x > 10)).toBe(true);
  });
  test(`${Some.name}.${Some.prototype.isNoneOr.name} should return false if predicate is false`, () => {
    const opt = Option.some(20);
    expect(opt.isNoneOr((x) => x < 10)).toBe(false);
  });
  test(`${None.name}.${None.prototype.isNoneOr.name} should return true if predicate is true`, () => {
    const opt = Option.none();
    expect(opt.isNoneOr(() => true)).toBe(true);
  });
  test(`${None.name}.${None.prototype.isNoneOr.name} should return true if predicate is false`, () => {
    const opt = Option.none();
    expect(opt.isNoneOr(() => false)).toBe(true);
  });
  test(`${None.name}.${None.prototype.isNoneOr.name} should never call predicate fn`, () => {
    const opt = Option.none();
    const predicate = vi.fn();
    opt.isNoneOr(predicate);
    expect(predicate).not.toBeCalled();
  });
});
