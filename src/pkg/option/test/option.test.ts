import { describe, expect, test, vi } from "vitest";
import { None, Option, OptionError, Some } from "../option";
import { Err, Ok } from "@/pkg/result";

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
  test(`${None.name}.${None.prototype.isSomeAnd.name} should never call the predicate fn`, () => {
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
  test(`${None.name}.${None.prototype.isNoneOr.name} should never call the predicate fn`, () => {
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
  test(`${Some.name}.${Some.prototype.unwrapOrElse.name} should never call the default value function`, () => {
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

describe("transform", () => {
  test(`${Some.name}.${Some.prototype.map.name} should return ${Some.name} with mapped value`, () => {
    const opt = Option.some(320);
    const mapped = opt.map((x) => x + 1);
    expect(mapped).toBeInstanceOf(Some);
    expect(mapped.unwrap()).toEqual(321);
  });
  test(`${None.name}.${None.prototype.map.name} should return ${None.name}`, () => {
    const opt = Option.none();
    const mapped = opt.map((x) => x + 1);
    expectNoneSingleton(mapped);
  });
  test(`${None.name}.${None.prototype.map.name} should never call the mapping function`, () => {
    const opt = Option.none();
    const mappingFn = vi.fn();
    opt.map(mappingFn);
    expect(mappingFn).not.toBeCalled();
  });

  test(`${Some.name}.${Some.prototype.mapOr.name} should return mapped value`, () => {
    const opt = Option.some(320);
    const mapped = opt.mapOr(0, (x) => x + 1);
    expect(mapped).toEqual(321);
  });
  test(`${None.name}.${None.prototype.mapOr.name} should return default value`, () => {
    const opt = Option.none();
    const mapped = opt.mapOr(0, (x) => x + 1);
    expect(mapped).toEqual(0);
  });

  test(`${Some.name}.${Some.prototype.mapOrElse.name} should return mapped value`, () => {
    const opt = Option.some(320);
    const mapped = opt.mapOrElse(
      () => 0,
      (x) => x + 1,
    );
    expect(mapped).toEqual(321);
  });
  test(`${None.name}.${None.prototype.mapOrElse.name} should return computed default value`, () => {
    const opt = Option.none();
    const mapped = opt.mapOrElse(
      () => 0,
      (x) => x + 1,
    );
    expect(mapped).toEqual(0);
  });
  test(`${None.name}.${None.prototype.mapOrElse.name} should never call the mapping function`, () => {
    const opt = Option.none();
    const mappingFn = vi.fn();
    opt.mapOrElse(() => 0, mappingFn);
    expect(mappingFn).not.toBeCalled();
  });

  test(`${Some.name}.${Some.prototype.okOr.name} should return ${Ok.name} instance containing the ${Some.name} value`, () => {
    const opt = Option.some(42);
    const result = opt.okOr("fail");
    expect(result).toBeInstanceOf(Ok);
    expect(result.unwrap()).toBe(42);
  });
  test(`${None.name}.${None.prototype.okOr.name} should return ${Err.name} instance containing provided error value`, () => {
    const opt = Option.none();
    const result = opt.okOr("fail");
    expect(result).toBeInstanceOf(Err);
    expect(result.unwrapErr()).toBe("fail");
  });

  test(`${Some.name}.${Some.prototype.okOrElse.name} should return ${Ok.name} instance containing the ${Some.name} value`, () => {
    const opt = Option.some(42);
    const result = opt.okOrElse(() => "fail");
    expect(result).toBeInstanceOf(Ok);
    expect(result.unwrap()).toBe(42);
  });
  test(`${Some.name}.${Some.prototype.okOrElse.name} should never call the error function`, () => {
    const opt = Option.some(42);
    const errorFn = vi.fn();
    opt.okOrElse(errorFn);
    expect(errorFn).not.toBeCalled();
  });
  test(`${None.name}.${None.prototype.okOrElse.name} should return ${Err.name} instance containing computed error value`, () => {
    const opt = Option.none();
    const result = opt.okOrElse(() => "fail");
    expect(result).toBeInstanceOf(Err);
    expect(result.unwrapErr()).toBe("fail");
  });

  test(`${Some.name}.${Some.prototype.filter.name} should return the same ${Some.name} instance if predicate is true`, () => {
    const opt = Option.some(42);
    const result = opt.filter(() => true);
    expect(result).toBe(opt);
  });
  test(`${Some.name}.${Some.prototype.filter.name} should return ${None.name} instance if predicate is false`, () => {
    const opt = Option.some(42);
    const result = opt.filter(() => false);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.filter.name} should return ${None.name} instance if predicate is true`, () => {
    const opt = Option.none();
    const result = opt.filter(() => true);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.filter.name} should return ${None.name} instance if predicate is false`, () => {
    const opt = Option.none();
    const result = opt.filter(() => false);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.filter.name} should never call the predicate function`, () => {
    const opt = Option.none();
    const predicate = vi.fn();
    opt.filter(predicate);
    expect(predicate).not.toBeCalled();
  });

  test(`${Some.name}.${Some.prototype.and.name} should return provided other ${Some.name} instance`, () => {
    const opt = Option.some(42);
    const other = Option.some("foo");
    const result = opt.and(other);
    expect(result).toBe(other);
  });
  test(`${Some.name}.${Some.prototype.and.name} should return provided other ${None.name} instance`, () => {
    const opt = Option.some(42);
    const other = Option.none();
    const result = opt.and(other);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.and.name} should return ${None.name} instance when other ${Some.name} instance is passed`, () => {
    const opt = Option.none();
    const other = Option.some("foo");
    const result = opt.and(other);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.and.name} should return ${None.name} instance when other ${None.name} instance is passed`, () => {
    const opt = Option.none();
    const other = Option.none();
    const result = opt.and(other);
    expectNoneSingleton(result);
  });

  test(`${Some.name}.${Some.prototype.andThen.name} should return computed other ${Some.name} instance`, () => {
    const opt = Option.some(42);
    const other = Option.some("foo");
    const result = opt.andThen(() => other);
    expect(result).toBe(other);
  });
  test(`${Some.name}.${Some.prototype.andThen.name} should return computed other ${None.name} instance`, () => {
    const opt = Option.some(42);
    const other = Option.none();
    const result = opt.andThen(() => other);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.andThen.name} should return ${None.name} instance when other ${Some.name} instance is passed`, () => {
    const opt = Option.none();
    const other = Option.some("foo");
    const result = opt.andThen(() => other);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.andThen.name} should return ${None.name} instance when other ${None.name} instance is passed`, () => {
    const opt = Option.none();
    const other = Option.none();
    const result = opt.andThen(() => other);
    expectNoneSingleton(result);
  });
  test(`${None.name}.${None.prototype.andThen.name} should never call the other Option computation`, () => {
    const opt = Option.none();
    const otherFn = vi.fn();
    opt.andThen(otherFn);
    expect(otherFn).not.toBeCalled();
  });

  test(`${Some.name}.${Some.prototype.or.name} should return the same ${Some.name} instance when other ${Some.name} instance is passed`, () => {
    const opt = Option.some(42);
    const other = Option.some(32);
    const result = opt.or(other);
    expect(result).toBe(opt);
  });
  test(`${Some.name}.${Some.prototype.or.name} should return the same ${Some.name} instance when other ${None.name} instance is passed`, () => {
    const opt = Option.some(42);
    const other = Option.none();
    const result = opt.or(other);
    expect(result).toBe(opt);
  });
  test(`${None.name}.${None.prototype.or.name} should return provided other ${Some.name} instance`, () => {
    const opt = Option.none();
    const other = Option.some(32);
    const result = opt.or(other);
    expect(result).toBe(other);
  });
  test(`${None.name}.${None.prototype.or.name} should return ${None.name} instance when other ${None.name} instance is passed`, () => {
    const opt = Option.none();
    const other = Option.none();
    const result = opt.or(other);
    expectNoneSingleton(result);
  });

  test(`${Some.name}.${Some.prototype.orElse.name} should return the same ${Some.name} instance when other ${Some.name} instance is passed`, () => {
    const opt = Option.some(42);
    const other = Option.some(32);
    const result = opt.orElse(() => other);
    expect(result).toBe(opt);
  });
  test(`${Some.name}.${Some.prototype.orElse.name} should return the same ${Some.name} instance when other ${None.name} instance is passed`, () => {
    const opt = Option.some(42);
    const other = Option.none();
    const result = opt.orElse(() => other);
    expect(result).toBe(opt);
  });
  test(`${Some.name}.${Some.prototype.orElse.name} should never call the other Option computation`, () => {
    const opt = Option.some(42);
    const otherFn = vi.fn();
    opt.orElse(otherFn);
    expect(otherFn).not.toBeCalled();
  });
  test(`${None.name}.${None.prototype.orElse.name} should return provided other ${Some.name} instance`, () => {
    const opt = Option.none();
    const other = Option.some(32);
    const result = opt.orElse(() => other);
    expect(result).toBe(other);
  });
  test(`${None.name}.${None.prototype.orElse.name} should return ${None.name} instance when other ${None.name} instance is passed`, () => {
    const opt = Option.none();
    const other = Option.none();
    const result = opt.orElse(() => other);
    expectNoneSingleton(result);
  });

  test(`${Some.name}.${Some.prototype.match.name} should return value of the ${Some.name} branch`, () => {
    const opt = Option.fromNullable(1);
    const result = opt.match({
      Some: (value) => value,
      None: () => 0,
    });
    expect(result).toBe(1);
  });
  test(`${Some.name}.${Some.prototype.match.name} should never call the ${None.name} branch`, () => {
    const opt = Option.fromNullable(1);
    const noneBranch = vi.fn();
    opt.match({
      Some: () => {},
      None: noneBranch,
    });
    expect(noneBranch).not.toBeCalled();
  });
  test(`${None.name}.${None.prototype.match.name} should return value of the ${None.name} branch`, () => {
    const opt = Option.fromNullable(null);
    const result = opt.match({
      Some: () => 1,
      None: () => 0,
    });
    expect(result).toBe(0);
  });
  test(`${None.name}.${None.prototype.match.name} should never call the ${Some.name} branch`, () => {
    const opt = Option.fromNullable(null);
    const someBranch = vi.fn();
    opt.match({
      Some: someBranch,
      None: () => {},
    });
    expect(someBranch).not.toBeCalled();
  });
});
