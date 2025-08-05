import { describe, expect, test, vi } from "vitest";
import { Ok, ok, err, Err } from ".";

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
