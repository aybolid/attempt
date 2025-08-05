import { describe, expect, test, vi } from "vitest";
import { Ok, ok, err, Err, attempt, attemptAsync } from ".";

describe(`${Ok.name} and ${Err.name}`, () => {
  describe("Create", () => {
    test(`${ok.name}() should create an ${Ok.name} instance`, () => {
      const result = ok(69420);
      expect(result).toBeInstanceOf(Ok);
    });
    test(`${err.name}() should create an ${Err.name} instance`, () => {
      const result = err("error");
      expect(result).toBeInstanceOf(Err);
    });
  });

  describe("Check", () => {
    test(`${Ok.name}.${Ok.prototype.isOk.name}() should return true`, () => {
      const result = ok(69420);
      expect(result.isOk()).toBe(true);
    });
    test(`${Err.name}.${Err.prototype.isOk.name}() should return false`, () => {
      const result = err("error");
      expect(result.isOk()).toBe(false);
    });

    test(`${Ok.name}.${Ok.prototype.isErr.name}() should return false`, () => {
      const result = ok(69420);
      expect(result.isErr()).toBe(false);
    });
    test(`${Err.name}.${Err.prototype.isErr.name}() should return true`, () => {
      const result = err("error");
      expect(result.isErr()).toBe(true);
    });

    test(`${Ok.name}.${Ok.prototype.isOkAnd.name}() should return predicate boolean result`, () => {
      const result = ok(20);
      expect(result.isOkAnd((n) => n > 0)).toBe(true);
      expect(result.isOkAnd((n) => n > 100)).toBe(false);
    });
    test(`${Ok.name}.${Ok.prototype.isErrAnd.name}() should return false and predicate should be noop`, () => {
      const result = ok(20);
      const predicate = vi.fn();
      expect(result.isErrAnd(predicate)).toBe(false);
      expect(predicate).not.toBeCalled();
    });

    test(`${Err.name}.${Err.prototype.isErrAnd.name}() should return predicate boolean result`, () => {
      const result = err("error");
      expect(result.isErrAnd((e) => e === "error")).toBe(true);
      expect(result.isErrAnd((e) => e === "another error")).toBe(false);
    });
    test(`${Err.name}.${Err.prototype.isOkAnd.name}() should return false and predicate should be noop`, () => {
      const result = err("error");
      const predicate = vi.fn();
      expect(result.isOkAnd(predicate)).toBe(false);
      expect(predicate).not.toBeCalled();
    });
  });

  describe("Access", () => {
    test(`${Ok.name}.${Ok.prototype.unwrap.name}() should return contained value`, () => {
      const result = ok(69420);
      expect(result.unwrap()).toBe(69420);
    });
    test(`${Err.name}.${Err.prototype.unwrap.name}() should throw contained error value`, () => {
      const result = err("error");
      expect(() => result.unwrap()).toThrow("error");
    });

    test(`${Ok.name}.${Ok.prototype.unwrapOr.name}() should return contained value`, () => {
      const result = ok(69420);
      expect(result.unwrapOr(42)).toBe(69420);
    });
    test(`${Err.name}.${Err.prototype.unwrapOr.name}() should return provided default value`, () => {
      const result = err("error");
      expect(result.unwrapOr(42)).toBe(42);
    });

    test(`${Ok.name}.${Ok.prototype.unwrapOrElse.name}() should return contained value`, () => {
      const result = ok(69420);
      const defaultValueFn = vi.fn();
      expect(result.unwrapOrElse(defaultValueFn)).toBe(69420);
      expect(defaultValueFn).not.toBeCalled();
    });
    test(`${Err.name}.${Err.prototype.unwrapOrElse.name}() should return result of default value function`, () => {
      const result = err("error");
      expect(result.unwrapOrElse((error) => error + "!")).toBe("error!");
    });

    test(`${Ok.name}.${Ok.prototype.ok.name}() should return contained value`, () => {
      const result = ok("success");
      expect(result.ok()).toBe("success");
    });
    test(`${Ok.name}.${Ok.prototype.err.name}() should return null`, () => {
      const result = ok("success");
      expect(result.err()).toBeNull();
    });

    test(`${Err.name}.${Err.prototype.ok.name}() should return null`, () => {
      const result = err("error");
      expect(result.ok()).toBeNull();
    });
    test(`${Err.name}.${Err.prototype.err.name}() should return contained error value`, () => {
      const result = err(228);
      expect(result.err()).toBe(228);
    });
  });

  describe("Transform", () => {
    test(`${Ok.name}.${Ok.prototype.map.name}() should return ${Ok.name} with mapped value`, () => {
      const result = ok("Hello");
      const mapped = result.map((value) => value + ", World!");
      expect(mapped.ok()).toBe("Hello, World!");
    });
    test(`${Ok.name}.${Ok.prototype.mapErr.name}() should be noop and return the same reference`, () => {
      const result = ok("Hello");
      const mapFn = vi.fn();
      const mapped = result.mapErr(mapFn);
      expect(mapped, "should be the same reference").toBe(result);
      expect(mapFn).not.toBeCalled();
    });

    test(`${Err.name}.${Err.prototype.map.name}() should be noop and return the same reference`, () => {
      const result = err("error");
      const mapFn = vi.fn();
      const mapped = result.map(mapFn);
      expect(mapped, "should be the same reference").toBe(result);
      expect(mapFn).not.toBeCalled();
    });
    test(`${Err.name}.${Err.prototype.mapErr.name}() should return ${Err.name} with mapped error value`, () => {
      const result = err(100);
      const mapped = result.mapErr((error) => error + 222);
      expect(mapped.err()).toBe(322);
    });
  });

  describe("Utils", () => {
    test(`${Ok.name}.${Ok.prototype.toString.name}() should return valid string representation`, () => {
      let result: Ok<unknown> = ok("Hello");
      expect(result.toString()).toBe("Ok(Hello)");
      result = ok(69);
      expect(result.toString()).toBe("Ok(69)");
      result = ok([1, 2, 3]);
      expect(result.toString()).toBe("Ok(1,2,3)");
      result = ok({ name: "John", age: 30 });
      expect(result.toString()).toBe("Ok([object Object])");
      result = ok(undefined);
      expect(result.toString()).toBe("Ok(undefined)");
      result = ok(null);
      expect(result.toString()).toBe("Ok(null)");
    });
    test(`${Err.name}.${Err.prototype.toString.name}() should return valid string representation`, () => {
      let result: Err<unknown> = err("error");
      expect(result.toString()).toBe("Err(error)");
      result = err(69);
      expect(result.toString()).toBe("Err(69)");
      result = err([1, 2, 3]);
      expect(result.toString()).toBe("Err(1,2,3)");
      result = err({ name: "John", age: 30 });
      expect(result.toString()).toBe("Err([object Object])");
      result = err(undefined);
      expect(result.toString()).toBe("Err(undefined)");
      result = err(null);
      expect(result.toString()).toBe("Err(null)");
    });
  });
});

describe(`${attempt.name} and ${attemptAsync.name}`, () => {
  const fn = (opts: { shouldThrow: boolean }) => {
    if (opts.shouldThrow) {
      throw new Error("error");
    }
    return "success";
  };

  const asyncFn = async (opts: { shouldThrow: boolean }) => {
    if (opts.shouldThrow) {
      throw new Error("error");
    }
    return "success";
  };

  test(`Successfull call with ${attempt.name} hof should return ${Ok.name}`, () => {
    const result = attempt(() => fn({ shouldThrow: false }));
    expect(result).toBeInstanceOf(Ok);
  });
  test(`Unsuccessfull call with ${attempt.name} hof should return ${Err.name} with ${Error.name} value`, () => {
    const result = attempt(() => fn({ shouldThrow: true }));
    expect(result).toBeInstanceOf(Err);
    const error = result.err();
    expect(error).toBeInstanceOf(Error);
  });

  test(`Successful call with ${attemptAsync.name} hof should return ${Promise.name}<${Ok.name}>`, async () => {
    const result = attemptAsync(() => asyncFn({ shouldThrow: false }));
    expect(result).toBeInstanceOf(Promise);
    const awaitedResult = await result;
    expect(awaitedResult).toBeInstanceOf(Ok);
  });
  test(`Unsuccessful call with ${attemptAsync.name} hof should return ${Promise.name}<${Err.name}> with ${Error.name} value`, async () => {
    const result = attemptAsync(() => asyncFn({ shouldThrow: true }));
    expect(result).toBeInstanceOf(Promise);
    const awaitedResult = await result;
    expect(awaitedResult).toBeInstanceOf(Err);
    const error = awaitedResult.err();
    expect(error).toBeInstanceOf(Error);
  });

  test(`When throwing non-${Error.name} value with ${attempt.name} hof, new ${Error.name} should be constructed`, () => {
    const result = attempt(() => {
      throw 13;
    });
    expect(result).toBeInstanceOf(Err);
    const error = result.err();
    expect(error).toBeInstanceOf(Error);
  });
  test(`When throwing non-${Error.name} value with ${attemptAsync.name} hof, new ${Error.name} should be constructed`, async () => {
    const result = attemptAsync(() => {
      throw 13;
    });
    expect(result).toBeInstanceOf(Promise);
    const awaitedResult = await result;
    const error = awaitedResult.err();
    expect(error).toBeInstanceOf(Error);
  });
});
