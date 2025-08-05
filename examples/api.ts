import { attemptAsync, type AsyncResult } from "..";

async function safeFetch(url: string): AsyncResult<Response> {
  return attemptAsync(async () => {
    const res = await fetch(url);
    if (!res.ok) throw `HTTP Error: ${res.status} ${res.statusText}`; // attemptAsync contructs error
    return res;
  });
}

const codes = [202, 400, 204, 500, 418, 301];

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
