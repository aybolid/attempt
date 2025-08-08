import { none, some, type Option } from "@/pkg";

function divide(a: number, b: number): Option<number> {
  if (b === 0) {
    return none();
  }
  return some(a / b);
}

const result = divide(10, 2);

result.match({
  Some: (value) => console.log(value),
  None: () => console.error("Cannot divide by zero"),
});
