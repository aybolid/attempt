import { expect, describe, test } from "vitest";

import { Err, Ok } from "@/result";

import { attempt, attemptAsync, ok, err } from ".";

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
