import { attempt, withAttempt, type Result } from "@/pkg";

class ParsingError extends Error {
  override name = "ParsingError";

  static fromAny(value: unknown): ParsingError {
    return new ParsingError(
      value instanceof Error ? value.message : String(value),
    );
  }
}

const safeParse = <T>(text: string): Result<T, ParsingError> =>
  attempt(() => JSON.parse(text), ParsingError.fromAny);

let numberResult = safeParse<number>("42");

console.assert(numberResult.isOk(), "Should be Ok");
console.assert(numberResult.unwrap() === 42, "Should be 42");

numberResult = safeParse<number>("invalid");

console.assert(numberResult.isErr(), "Should be Err");
console.assert(
  numberResult.unwrapErr() instanceof ParsingError,
  "Error value should be ParsingError",
);

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const parseAsync = async <T>(text: string): Promise<T> => {
  await sleep(100);
  return JSON.parse(text);
};

const safeParseAsync = withAttempt(parseAsync);

let stringResult = await safeParseAsync<string>('"hello"');

console.assert(stringResult.isOk(), "Should be Ok");
console.assert(stringResult.unwrap() === "hello", "Should be 'hello'");

stringResult = await safeParseAsync<string>("invalid");

console.assert(stringResult.isErr(), "Should be Err");
console.assert(
  stringResult.unwrapErr() instanceof SyntaxError,
  "Error value should be ParsingError",
);
