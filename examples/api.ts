import { attemptAsync, type AsyncResult } from "..";

async function safeFetch(url: string): AsyncResult<Response> {
  return attemptAsync(async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
    return res;
  });
}

async function run() {
  const codes = [202, 400, 204, 505];

  for (const code of codes) {
    const url = `https://mock.httpstatus.io/${code}`;
    const result = await safeFetch(url);

    if (result.isOk()) {
      const res = result.unwrap();
      console.log(`${res.status} ${res.statusText} <- ${url}`);
    } else {
      console.error(`Failed (${url}): ${result.unwrapErr().message}`);
    }
  }
}

run();
