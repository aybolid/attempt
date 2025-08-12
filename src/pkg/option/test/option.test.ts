import { describe, expect, test, vi } from "vitest";
import { None, Option, OptionError, Some } from "../option";

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

describe("get", () => {
  test(`${Some.name}.${Some.prototype.expect.name} should return contained value`, () => {
    const opt = Option.some("value");
    expect(opt.expect("")).toBe("value");
  });
  test(`${None.name}.${None.prototype.expect.name} should throw ${OptionError.name} with provided message`, () => {
    const opt = Option.none();
    expect(() => opt.expect("bad")).toThrow(OptionError);
    expect(() => opt.expect("bad")).toThrow("bad");
  });

  test(`${Some.name}.${Some.prototype.unwrap.name} should return contained value`, () => {
    const opt = Option.some(320);
    expect(opt.unwrap()).toBe(320);
  });
  test(`${None.name}.${None.prototype.unwrap.name} should throw ${OptionError.name}`, () => {
    const opt = Option.none();
    expect(() => opt.unwrap()).toThrow(OptionError);
  });

  test(`${Some.name}.${Some.prototype.unwrapOr.name} should return contained value`, () => {
    const opt = Option.some(320);
    expect(opt.unwrapOr(0)).toBe(320);
  });
  test(`${None.name}.${None.prototype.unwrapOr.name} should return default value`, () => {
    const opt = Option.none();
    expect(opt.unwrapOr(0)).toBe(0);
  });

  test(`${Some.name}.${Some.prototype.unwrapOrElse.name} should return contained value`, () => {
    const opt = Option.some(320);
    expect(opt.unwrapOrElse(() => 0)).toBe(320);
  });
  test(`${Some.name}.${Some.prototype.unwrapOrElse.name} should never call default value function`, () => {
    const opt = Option.some(320);
    const defaultValueFn = vi.fn();
    opt.unwrapOrElse(defaultValueFn);
    expect(defaultValueFn).not.toBeCalled();
  });
  test(`${None.name}.${None.prototype.unwrapOrElse.name} should return computed default value`, () => {
    const opt = Option.none();
    expect(opt.unwrapOrElse(() => 0)).toBe(0);
  });
});
