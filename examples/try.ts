import { toError } from "@/internal/utils";
import { $try, err, ok, type Result } from "@/pkg";

const parseNumber = (input: string): Result<number, string> => {
  const number = parseInt(input, 10);
  if (isNaN(number)) {
    return err(`Invalid number: ${input}`);
  }
  return ok(number);
};

const parseJson = <T>(input: string): Result<T> => {
  try {
    return ok(JSON.parse(input));
  } catch (error) {
    return err(toError(error));
  }
};

const sum = $try(function* ({ $ }) {
  const x = yield* $(parseNumber("12"));
  const y = yield* $(parseJson<number>("12"));

  return ok(x + y);
});

console.log(sum.toString());

const sum2 = await $try(async function* ({ $ }) {
  // const x = yield* $(await (async () => parseNumber("12"))());
  const y = yield* $(await (async () => parseJson<number>("12"))());

  return ok(y + 2);
});

console.log(sum2.toString());
