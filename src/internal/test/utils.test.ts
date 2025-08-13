import { describe, it, expect } from "vitest";

import { isNullable, isPromise, stringify, toError } from "../utils";

describe(isPromise.name, () => {
  it("should return true for actual Promise objects", () => {
    const promise = new Promise((resolve) => resolve(42));
    expect(isPromise(promise)).toBe(true);
  });

  it("should return true for Promise.resolve()", () => {
    expect(isPromise(Promise.resolve(42))).toBe(true);
  });

  it("should return true for Promise.reject()", () => {
    expect(isPromise(Promise.reject("error").catch(() => {}))).toBe(true);
  });

  it("should return true for async function return values", async () => {
    const asyncFn = async () => 42;
    expect(isPromise(asyncFn())).toBe(true);
  });

  it("should return true for thenable objects", () => {
    const thenable = { then: () => {} };
    expect(isPromise(thenable)).toBe(true);
  });

  it("should return true for objects with then method", () => {
    const mockThenable = { then: (resolve: Function) => resolve(42) };
    expect(isPromise(mockThenable)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isPromise(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isPromise(undefined)).toBe(false);
  });

  it("should return false for numbers", () => {
    expect(isPromise(42)).toBe(false);
  });

  it("should return false for strings", () => {
    expect(isPromise("hello")).toBe(false);
  });

  it("should return false for objects without then method", () => {
    expect(isPromise({ foo: "bar" })).toBe(false);
  });

  it("should return false for objects with non-function then property", () => {
    expect(isPromise({ then: "not a function" })).toBe(false);
  });

  it("should return false for arrays", () => {
    expect(isPromise([1, 2, 3])).toBe(false);
  });

  it("should return false for functions that are not then", () => {
    expect(isPromise(() => {})).toBe(false);
  });
});

describe(toError.name, () => {
  it("should return the same Error object when passed an Error", () => {
    const error = new Error("test error");
    expect(toError(error)).toBe(error);
  });

  it("should convert string to Error", () => {
    const result = toError("error message");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("error message");
  });

  it("should convert number to Error", () => {
    const result = toError(404);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("404");
  });

  it("should convert null to Error", () => {
    const result = toError(null);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("null");
  });

  it("should convert undefined to Error", () => {
    const result = toError(undefined);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("undefined");
  });

  it("should convert boolean to Error", () => {
    const result = toError(true);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("true");
  });

  it("should convert object to Error", () => {
    const obj = { foo: "bar" };
    const result = toError(obj);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[object Object]");
  });

  it("should handle custom Error subclasses", () => {
    class CustomError extends Error {}
    const customError = new CustomError("custom message");
    expect(toError(customError)).toBe(customError);
  });

  it("should convert TypeError to itself", () => {
    const typeError = new TypeError("type error");
    expect(toError(typeError)).toBe(typeError);
  });
});

describe(isNullable.name, () => {
  it("should return true for null", () => {
    expect(isNullable(null)).toBe(true);
  });

  it("should return true for undefined", () => {
    expect(isNullable(undefined)).toBe(true);
  });

  it("should return false for empty string", () => {
    expect(isNullable("")).toBe(false);
  });

  it("should return false for zero", () => {
    expect(isNullable(0)).toBe(false);
  });

  it("should return false for false", () => {
    expect(isNullable(false)).toBe(false);
  });

  it("should return false for empty array", () => {
    expect(isNullable([])).toBe(false);
  });

  it("should return false for empty object", () => {
    expect(isNullable({})).toBe(false);
  });

  it("should return false for strings", () => {
    expect(isNullable("hello")).toBe(false);
  });

  it("should return false for numbers", () => {
    expect(isNullable(42)).toBe(false);
  });

  it("should return false for functions", () => {
    expect(isNullable(() => {})).toBe(false);
  });
});

describe(stringify.name, () => {
  it("should stringify Error objects with name and message", () => {
    const error = new Error("test message");
    expect(stringify(error)).toBe("Error: test message");
  });

  it("should stringify custom Error with custom name", () => {
    class CustomError extends Error {
      name = "CustomError";
    }
    const error = new CustomError("custom message");
    expect(stringify(error)).toBe("CustomError: custom message");
  });

  it("should stringify TypeError", () => {
    const error = new TypeError("type error");
    expect(stringify(error)).toBe("TypeError: type error");
  });

  it("should stringify simple objects", () => {
    const obj = { foo: "bar", num: 42 };
    expect(stringify(obj)).toBe('{"foo":"bar","num":42}');
  });

  it("should stringify arrays", () => {
    const arr = [1, 2, "three"];
    expect(stringify(arr)).toBe('[1,2,"three"]');
  });

  it("should stringify strings", () => {
    expect(stringify("hello")).toBe('"hello"');
  });

  it("should stringify numbers", () => {
    expect(stringify(42)).toBe("42");
  });

  it("should stringify booleans", () => {
    expect(stringify(true)).toBe("true");
    expect(stringify(false)).toBe("false");
  });

  it("should stringify null", () => {
    expect(stringify(null)).toBe("null");
  });

  it("should stringify undefined", () => {
    expect(stringify(undefined)).toBe("<non-serializable>");
  });

  it("should handle circular references", () => {
    const obj: any = { name: "test" };
    obj.self = obj; // Create circular reference
    expect(stringify(obj)).toBe("<non-serializable>");
  });

  it("should handle objects with toJSON method", () => {
    const obj = {
      value: 42,
      toJSON() {
        return { serialized: this.value };
      },
    };
    expect(stringify(obj)).toBe('{"serialized":42}');
  });

  it("should handle BigInt (non-serializable)", () => {
    expect(stringify(BigInt(123))).toBe("<non-serializable>");
  });

  it("should handle functions (non-serializable)", () => {
    expect(stringify(() => {})).toBe("<non-serializable>");
  });

  it("should handle Symbol (non-serializable)", () => {
    expect(stringify(Symbol("test"))).toBe("<non-serializable>");
  });

  it("should handle Date objects", () => {
    const date = new Date("2023-01-01T00:00:00.000Z");
    expect(stringify(date)).toBe('"2023-01-01T00:00:00.000Z"');
  });

  it("should handle nested objects", () => {
    const nested = {
      level1: {
        level2: {
          value: "deep",
        },
      },
    };
    expect(stringify(nested)).toBe('{"level1":{"level2":{"value":"deep"}}}');
  });
});
