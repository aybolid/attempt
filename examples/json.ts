import { attempt, type Result } from "..";

function safeJsonParse<T = unknown>(str: string): Result<T> {
  return attempt(() => JSON.parse(str));
}

const toParse: string[] = [
  "this will fail",
  '{"key":"value"}',
  '"hello world!"',
  "[1,2,3,4]",
  '{"key2":"value2"}',
  ":)",
  "13",
];

let i = 1;
for (const str of toParse) {
  console.log(`${i}. Parsing "${str}"...`);
  const result = safeJsonParse(str);

  console.log("Result:");
  if (result.isOk()) {
    console.log(result.unwrap());
  } else {
    console.error(result.unwrapErr().message);
  }

  console.log();
  i++;
}
