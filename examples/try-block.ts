import {
  $try,
  attempt,
  attemptAsync,
  type AsyncResult,
  type Result,
} from "@/index";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function parseAsync<T>(input: string): AsyncResult<T> {
  return attemptAsync(async () => {
    await sleep(300);
    return JSON.parse(input);
  });
}

function parse<T>(input: string): Result<T> {
  return attempt(() => JSON.parse(input));
}

const result = $try(({ $ }) => {
  const x = $(parse<number>("42"));
  const y = $(parse<number>("27"));

  return x + y;
});

const failedResult = $try<number, string>(({ $ }) => {
  const x = $(parse<number>("42").mapErr((err) => err.message));
  const y = $(parse<number>("invalidJson").mapErr((err) => err.message));

  return x + y;
});

const awaitedResult = await $try(async ({ $ }) => {
  const x = $(await parseAsync<number>("100"));
  const y = $(parse<number>("222"));

  return x + y;
});

const awaitedFailedResult = await $try<Promise<number>, string>(
  async ({ $ }) => {
    const x = $(
      await parseAsync<number>("badJson").then((r) =>
        r.mapErr((err) => err.message),
      ),
    );
    const y = $(parse<number>("222").mapErr((err) => err.message));

    return x + y;
  },
);

console.log("Result:");
console.log(result.toString());

console.log("Failed Result:");
console.log(failedResult.toString());

console.log("Awaited Result:");
console.log(awaitedResult.toString());

console.log("Awaited Failed Result:");
console.log(awaitedFailedResult.toString());
