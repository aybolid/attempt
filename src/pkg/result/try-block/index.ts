import { err, ok, type AsyncResult, type Result } from "..";

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
   * caught by the surrounding {@link $try} function.
   *
   * @example
   * // Instead of:
   * const result = getResult();
   * if (result.isErr()) return result;
   * const value = result1.ok();
   *
   * // You can write:
   * const value = $(getResult());
   */
  $: <T>(result: Result<T, ErrValue>) => T;
}) => OkValue;

function unwrapOp<OkValue, ErrValue>(
  result: Result<OkValue, ErrValue>,
): OkValue {
  if (result.isErr()) {
    throw result.err();
  }
  return result.ok();
}

/**
 * Executes a function that uses the `$` unwrap operator, automatically converting thrown
 * error values into a `Result.Err`.
 *
 * This function enables a more ergonomic way to handle multiple `Result` values by allowing
 * early returns on errors without deeply nested conditional checks. It's inspired by Rust's
 * `?` operator and provides similar functionality for JavaScript/TypeScript.
 *
 * @example
 * // Without $try - verbose error handling
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
 * // With $try - clean and concise
 * function processData(): Result<string, Error> {
 *   return $try(({ $ }) => {
 *     const input = $(parseInput());
 *     const validated = $(validateData(input));
 *     const formatted = $(formatOutput(validated));
 *     return formatted;
 *   });
 * }
 *
 * @see {@link TryFn} for the function type that can be passed to `$try`
 * @see {@link Result} for the Result type being handled
 */
export function $try<OkValue extends Promise<unknown>, ErrValue = Error>(
  tryFn: TryFn<OkValue, ErrValue>,
): AsyncResult<Awaited<OkValue>, ErrValue>;

export function $try<OkValue, ErrValue = Error>(
  tryFn: TryFn<OkValue, ErrValue>,
): Result<OkValue, ErrValue>;

export function $try<OkValue, ErrValue = Error>(
  tryFn: TryFn<OkValue, ErrValue>,
): Result<OkValue, ErrValue> | AsyncResult<Awaited<OkValue>, ErrValue> {
  try {
    const result = tryFn({ $: unwrapOp });

    // handle async overload
    if (result instanceof Promise) {
      return (result as Promise<Awaited<OkValue>>).then(ok, (e: ErrValue) =>
        err(e),
      );
    }

    // handle sync overload
    return ok(result);
  } catch (error) {
    return err(error as ErrValue);
  }
}
