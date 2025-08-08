import { describe, expect, test, vi } from "vitest";

import { Err, Ok, ResultError } from ".";

describe("Check", () => {
  test(`${Ok.name}.${Ok.prototype.isOk.name}() should return true`, () => {
    const result = new Ok(69420);
    expect(result.isOk()).toBe(true);
  });
  test(`${Err.name}.${Err.prototype.isOk.name}() should return false`, () => {
    const result = new Err("error");
    expect(result.isOk()).toBe(false);
  });

  test(`${Ok.name}.${Ok.prototype.isErr.name}() should return false`, () => {
    const result = new Ok(69420);
    expect(result.isErr()).toBe(false);
  });
  test(`${Err.name}.${Err.prototype.isErr.name}() should return true`, () => {
    const result = new Err("error");
    expect(result.isErr()).toBe(true);
  });

  test(`${Ok.name}.${Ok.prototype.isOkAnd.name}() should return predicate boolean result`, () => {
    const result = new Ok(20);
    expect(result.isOkAnd((n) => n > 0)).toBe(true);
    expect(result.isOkAnd((n) => n > 100)).toBe(false);
  });
  test(`${Ok.name}.${Ok.prototype.isErrAnd.name}() should return false and predicate should be noop`, () => {
    const result = new Ok(20);
    const predicate = vi.fn();
    expect(result.isErrAnd(predicate)).toBe(false);
    expect(predicate).not.toBeCalled();
  });

  test(`${Err.name}.${Err.prototype.isErrAnd.name}() should return predicate boolean result`, () => {
    const result = new Err("error");
    expect(result.isErrAnd((e) => e === "error")).toBe(true);
    expect(result.isErrAnd((e) => e === "another error")).toBe(false);
  });
  test(`${Err.name}.${Err.prototype.isOkAnd.name}() should return false and predicate should be noop`, () => {
    const result = new Err("error");
    const predicate = vi.fn();
    expect(result.isOkAnd(predicate)).toBe(false);
    expect(predicate).not.toBeCalled();
  });
});

describe("Access", () => {
  test(`${Ok.name}.${Ok.prototype.unwrap.name}() should return contained value`, () => {
    const result = new Ok(69420);
    expect(result.unwrap()).toBe(69420);
  });
  test(`${Err.name}.${Err.prototype.unwrap.name}() should throw ${ResultError.name}`, () => {
    const result = new Err("error");
    expect(() => result.unwrap()).toThrowError(ResultError);
  });

  test(`${Err.name}.${Err.prototype.unwrapErr.name}() should return contained error value`, () => {
    const result = new Err("error");
    expect(result.unwrapErr()).toBe("error");
  });
  test(`${Ok.name}.${Ok.prototype.unwrapErr.name}() should throw ${ResultError.name}`, () => {
    const result = new Ok("ok");
    expect(() => result.unwrapErr()).toThrow(ResultError);
  });

  test(`${Ok.name}.${Ok.prototype.unwrapOr.name}() should return contained value`, () => {
    const result = new Ok(69420);
    expect(result.unwrapOr(42)).toBe(69420);
  });
  test(`${Err.name}.${Err.prototype.unwrapOr.name}() should return provided default value`, () => {
    const result = new Err("error");
    expect(result.unwrapOr(42)).toBe(42);
  });

  test(`${Ok.name}.${Ok.prototype.unwrapOrElse.name}() should return contained value`, () => {
    const result = new Ok(69420);
    const defaultValueFn = vi.fn();
    expect(result.unwrapOrElse(defaultValueFn)).toBe(69420);
    expect(defaultValueFn).not.toBeCalled();
  });
  test(`${Err.name}.${Err.prototype.unwrapOrElse.name}() should return result of default value function`, () => {
    const result = new Err("error");
    expect(result.unwrapOrElse((error) => error + "!")).toBe("error!");
  });

  test(`${Ok.name}.${Ok.prototype.ok.name}() should return contained value`, () => {
    const result = new Ok("success");
    expect(result.ok()).toBe("success");
  });
  test(`${Ok.name}.${Ok.prototype.err.name}() should return null`, () => {
    const result = new Ok("success");
    expect(result.err()).toBeNull();
  });

  test(`${Err.name}.${Err.prototype.ok.name}() should return null`, () => {
    const result = new Err("error");
    expect(result.ok()).toBeNull();
  });
  test(`${Err.name}.${Err.prototype.err.name}() should return contained error value`, () => {
    const result = new Err(228);
    expect(result.err()).toBe(228);
  });

  test(`${Ok.name}.${Ok.prototype.expectErr.name}() should throw an ${ResultError.name} with provided message and value as string`, () => {
    const result = new Ok(13);
    expect(() => result.expectErr("I want this to throw")).toThrow(
      "I want this to throw: 13",
    );
  });
  test(`${Err.name}.${Err.prototype.expectErr.name}() should return contained error value`, () => {
    const result = new Err(13);
    expect(result.expectErr("noop message")).toBe(13);
  });
});

describe("Transform", () => {
  test(`${Ok.name}.${Ok.prototype.map.name}() should return ${Ok.name} with mapped value`, () => {
    const result = new Ok("Hello");
    const mapped = result.map((value) => value + ", World!");
    expect(mapped.ok()).toBe("Hello, World!");
  });
  test(`${Ok.name}.${Ok.prototype.mapErr.name}() should be noop and return the same reference`, () => {
    const result = new Ok("Hello");
    const mapFn = vi.fn();
    const mapped = result.mapErr(mapFn);
    expect(mapped, "should be the same reference").toBe(result);
    expect(mapFn).not.toBeCalled();
  });

  test(`${Err.name}.${Err.prototype.map.name}() should be noop and return the same reference`, () => {
    const result = new Err("error");
    const mapFn = vi.fn();
    const mapped = result.map(mapFn);
    expect(mapped, "should be the same reference").toBe(result);
    expect(mapFn).not.toBeCalled();
  });
  test(`${Err.name}.${Err.prototype.mapErr.name}() should return ${Err.name} with mapped error value`, () => {
    const result = new Err(100);
    const mapped = result.mapErr((error) => error + 222);
    expect(mapped.err()).toBe(322);
  });

  test(`${Ok.name}.${Ok.prototype.transpose.name}() should return null if contained value is null`, () => {
    const result = new Ok(null);
    const transposed = result.transpose();
    expect(transposed).toBeNull();
  });
  test(`${Ok.name}.${Ok.prototype.transpose.name}() should return null if contained value is undefined`, () => {
    const result = new Ok(undefined);
    const transposed = result.transpose();
    expect(transposed).toBeNull();
  });
  test(`${Ok.name}.${Ok.prototype.transpose.name}() should be noop if contained value isnt null or undefined`, () => {
    const result = new Ok(13);
    const transposed = result.transpose();
    expect(transposed, "should be the same reference").toBe(result);
  });
  test(`${Err.name}.${Err.prototype.transpose.name}() should be noop and return the same reference`, () => {
    const result = new Err("error");
    const transposed = result.transpose();
    expect(transposed, "should be the same reference").toBe(result);
  });

  test(`${Ok.name}.${Ok.prototype.and.name}() should return provided other result`, () => {
    const result = new Ok(13);
    const other = new Ok(42);
    const anded = result.and(other);
    expect(anded, "should be the same reference").toBe(other);
  });
  test(`${Err.name}.${Err.prototype.and.name}() should be noop and return the same reference to ${Err.name}`, () => {
    const result = new Err(13);
    const other = new Ok(42);
    const anded = result.and(other);
    expect(anded, "should be the same reference").toBe(result);
  });

  test(`${Ok.name}.${Ok.prototype.andThen.name}() should return result of provided fn`, () => {
    const result = new Ok(13);
    const other = new Ok(42);
    const anded = result.andThen(() => other);
    expect(anded, "should be the same reference").toBe(other);
  });
  test(`${Err.name}.${Err.prototype.andThen.name}() should be noop and return the same reference to ${Err.name}`, () => {
    const result = new Err(13);
    const other = vi.fn();
    const anded = result.andThen(other);
    expect(anded, "should be the same reference").toBe(result);
    expect(other).not.toBeCalled();
  });

  test(`${Ok.name}.${Ok.prototype.or.name}() should be noop and return the same reference to ${Ok.name}`, () => {
    const result = new Ok(13);
    const other = new Ok(42);
    const ored = result.or(other);
    expect(ored, "should be the same reference").toBe(result);
  });
  test(`${Err.name}.${Err.prototype.or.name}() should return provided other result`, () => {
    const result = new Err(13);
    const other = new Ok(42);
    const ored = result.or(other);
    expect(ored, "should be the same reference").toBe(other);
  });

  test(`${Ok.name}.${Ok.prototype.orElse.name}() should be noop and return the same reference to ${Ok.name}`, () => {
    const result = new Ok(13);
    const other = vi.fn();
    const ored = result.orElse(other);
    expect(ored, "should be the same reference").toBe(result);
    expect(other).not.toBeCalled();
  });
  test(`${Err.name}.${Err.prototype.orElse.name}() should return result of provided fn`, () => {
    const result = new Err(13);
    const other = new Ok(233);
    const ored = result.orElse(() => other);
    expect(ored, "should be the same reference").toBe(other);
  });
});

describe("Misc", () => {
  test(`${Ok.name}.${Ok.prototype.toString.name}() should return valid string representation`, () => {
    let result: Ok<unknown> = new Ok("Hello");
    expect(result.toString()).toBe('Ok("Hello")');
    result = new Ok(69);
    expect(result.toString()).toBe("Ok(69)");
    result = new Ok([1, 2, 3]);
    expect(result.toString()).toBe("Ok([1,2,3])");
    result = new Ok({ name: "John", age: 30 });
    expect(result.toString()).toBe('Ok({"name":"John","age":30})');
    result = new Ok(undefined);
    expect(result.toString()).toBe("Ok(undefined)");
    result = new Ok(null);
    expect(result.toString()).toBe("Ok(null)");
  });
  test(`${Err.name}.${Err.prototype.toString.name}() should return valid string representation`, () => {
    let result: Err<unknown> = new Err("error");
    expect(result.toString()).toBe('Err("error")');
    result = new Err(69);
    expect(result.toString()).toBe("Err(69)");
    result = new Err([1, 2, 3]);
    expect(result.toString()).toBe("Err([1,2,3])");
    result = new Err({ name: "John", age: 30 });
    expect(result.toString()).toBe('Err({"name":"John","age":30})');
    result = new Err(undefined);
    expect(result.toString()).toBe("Err(undefined)");
    result = new Err(null);
    expect(result.toString()).toBe("Err(null)");
  });

  test(`${Ok.name}.${Ok.prototype.toString.name}() should not throw when ${JSON.stringify.name} fails`, () => {
    const obj = { name: "John", age: 30 };
    // @ts-ignore
    obj.self = obj;

    let result: Ok<unknown> = new Ok(obj);
    expect(result.toString()).toBe("Ok(<non-serializable>)");
  });
  test(`${Err.name}.${Err.prototype.toString.name}() should not throw when ${JSON.stringify.name} fails`, () => {
    const obj = { name: "John", age: 30 };
    // @ts-ignore
    obj.self = obj;

    let result: Err<unknown> = new Err(obj);
    expect(result.toString()).toBe("Err(<non-serializable>)");
  });
});
