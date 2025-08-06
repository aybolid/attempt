import { err, ok, type Result } from "..";

class MathError extends Error {
  override name = "MathError";
}

function divide(a: number, b: number): Result<number, MathError> {
  if (b === 0) {
    return err(new MathError("Division by zero"));
  }

  return ok(a / b);
}

const args = [
  [2, 4],
  [3, 0],
  [-2, 2],
] as const;

for (const [a, b] of args) {
  console.log(`Dividing ${a} by ${b}`);
  const result = divide(a, b);
  if (result.isOk()) {
    console.log(`Result: ${result.ok()}`);
  } else {
    console.error(`Error: ${result.err()}`);
  }
}
