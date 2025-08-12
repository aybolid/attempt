import { match, type Option, none, some, $maybe } from "@/pkg";

const parseNumber = (input: string): Option<number> => {
  const number = parseInt(input, 10);
  if (isNaN(number)) {
    return none();
  }
  return some(number);
};

const sumNumeric = (x: string, y: string) =>
  $maybe(function* () {
    const parsedX = yield* parseNumber(x);
    const parsedY = yield* parseNumber(y);

    return some(parsedX + parsedY);
  });

match(sumNumeric("12", "12"), {
  Some: (result) => console.log(`Sum is ${result}`),
  None: () => console.error("Failed to calculate sum"),
});
