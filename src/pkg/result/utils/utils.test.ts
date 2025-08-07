import { expect, describe, test } from "vitest";

import { attempt, err, ok } from ".";
import { Err, Ok } from "..";

describe(`${ok.name} and ${err.name}`, () => {
  test(`${ok.name}() should create an ${Ok.name} instance`, () => {
    const result = ok(69420);
    expect(result).toBeInstanceOf(Ok);
  });
  test(`${err.name}() should create an ${Err.name} instance`, () => {
    const result = err("error");
    expect(result).toBeInstanceOf(Err);
  });
});

describe(`${attempt.name}`, () => {
  const fn = (opts: { shouldThrow: boolean }) => {
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

  test(`When throwing non-${Error.name} value with ${attempt.name} hof, new ${Error.name} should be constructed`, () => {
    const result = attempt(() => {
      if (true) {
        throw 13;
      }
      return 240;
    });
    expect(result).toBeInstanceOf(Err);
    const error = result.err();
    expect(error).toBeInstanceOf(Error);
  });
});
