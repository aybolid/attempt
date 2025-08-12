import { $try, err, ok, type IntoResult, type Result, match } from "@/pkg";

class NumberParsingError
  extends Error
  implements IntoResult<never, NumberParsingError>
{
  override name = "NumberParsingError";

  intoResult(): Result<never, NumberParsingError> {
    return err(this);
  }
}

const parseNumber = (input: string): Result<number, NumberParsingError> => {
  const number = parseInt(input, 10);
  if (isNaN(number)) {
    return new NumberParsingError(`Invalid number: ${input}`).intoResult();
  }
  return ok(number);
};

const sumNumeric = (x: string, y: string) =>
  $try(function* () {
    const parsedX = yield* parseNumber(x);
    const parsedY = yield* parseNumber(y).mapErr(() => "fail");

    return ok(parsedX + parsedY);
  });

match(sumNumeric("12", "12"), {
  Ok: (result) => console.log(`Sum is ${result}`),
  Err: (error) => console.error(`Failed to calculate sum: ${error}`),
});
