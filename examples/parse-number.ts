import { attempt, err, ok, type Result } from "../index.js";

function parseNumber(input: string): Result<number> {
  return attempt(() => {
    const n = Number(input);
    if (isNaN(n)) {
      throw `Invalid number: ${input}`;
    }
    return n;
  });
}

function reciprocal(n: number): Result<number> {
  if (n === 0) {
    return err(new Error("Division by zero"));
  }
  return ok(1 / n);

  // Same behavior can be achieved like this:
  //
  // return attempt(() => {
  //   if (n === 0) throw "Division by zero";
  //   return 1 / n;
  // });
}

function stringify(n: number): Result<string> {
  // This function cant fail but we return Result to make chaining possible
  return ok(n.toFixed(2));
}

function demo(input: string) {
  const result: Result<string> = parseNumber(input)
    .map((n: number) => n * 2)
    .andThen(reciprocal)
    .mapErr((e) => new Error(`Failed to calculate reciprocal: ${e.message}`))
    .andThen(stringify)
    .orElse((e) => ok(`Fallback value because of: ${e.message}`));

  console.log("Result as string:", result.toString());
}

demo("5"); // Should succeed
demo("0.1"); // Should succeed
demo("0"); // Should hit division by zero
demo("abc"); // Should hit invalid number
