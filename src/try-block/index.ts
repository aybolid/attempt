import type { Result } from "@/result";
import { err, ok } from "@/utils";

/**
 * A function that receives a scope with an unwrap operator (`$`) for safely unwrapping {@link Result} values.
 *
 * The function operates within a "try block" context where the `$` operator can be used to unwrap
 * `Result` values. If any unwrap operation encounters an `Err`, it will cause the entire function
 * to return that `Err` value wrapped in a `Result`.
 *
 * @warning **Throwing exceptions directly inside this function is unsafe and must be avoided.**
 *
 * @example
 * const tryFn: TryFn<string, Error> = ({ $ }) => {
 *   const value1 = $(getResult1()); // Unwraps or throws
 *   const value2 = $(getResult2()); // Unwraps or throws
 *   return value1 + value2;
 * };
 */
type TryFn<OkValue, ErrValue> = (scope: {
  /**
   * Unwraps a {@link Result}, returning the success value if `Ok` or throwing the error value if `Err`.
   *
   * This operator provides a clean way to handle `Result` values without explicit error checking.
   * When a `Result.Err` is encountered, the error value is thrown and will be automatically
   * caught by the surrounding {@link tryBlock} function.
   *
   * @example
   * // Instead of:
   * const result1 = getResult();
   * if (result1.isErr()) return result1;
   * const value1 = result1.ok();
   *
   * // You can write:
   * const value1 = $(getResult());
   */
  $: <T>(result: Result<T, ErrValue>) => T;
}) => OkValue;

/**
 * Executes a function that uses the `$` unwrap operator, automatically converting thrown
 * error values into a `Result.Err`.
 *
 * This function enables a more ergonomic way to handle multiple `Result` values by allowing
 * early returns on errors without deeply nested conditional checks. It's inspired by Rust's
 * `?` operator and provides similar functionality for JavaScript/TypeScript.
 *
 * @example
 * // Without tryBlock - verbose error handling
 * function processData(): Result<string, Error> {
 *   const result1 = parseInput();
 *   if (result1.isErr()) return result1;
 *
 *   const result2 = validateData(result1.ok());
 *   if (result2.isErr()) return result2;
 *
 *   const result3 = formatOutput(result2.ok());
 *   if (result3.isErr()) return result3;
 *
 *   return ok(result3.ok());
 * }
 *
 * // With tryBlock - clean and concise
 * function processData(): Result<string, Error> {
 *   return tryBlock(({ $ }) => {
 *     const input = $(parseInput());
 *     const validated = $(validateData(input));
 *     const formatted = $(formatOutput(validated));
 *     return formatted;
 *   });
 * }
 *
 * @see {@link TryFn} for the function type that can be passed to `tryBlock`
 * @see {@link Result} for the Result type being handled
 */
export function tryBlock<OkValue, ErrValue = Error>(
  tryFn: TryFn<OkValue, ErrValue>,
): Result<OkValue, ErrValue> {
  const unwrapOp = <T>(result: Result<T, ErrValue>): T => {
    if (result.isErr()) {
      throw result.err();
    }
    return result.ok();
  };

  try {
    return ok(tryFn({ $: unwrapOp }));
  } catch (error) {
    return err(error as ErrValue);
  }
}

// TODO: async tryBlock
