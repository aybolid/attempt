import { err, ok, type AsyncResult, type IntoResult, type Result } from "@/pkg";

class HttpError extends Error implements IntoResult<never, HttpError> {
  override name = "HttpError";

  readonly response: Response;

  constructor(message: string, response: Response) {
    if (response) {
      console.assert(
        !response.ok,
        `Http error with successful response? (${response.status} ${response.statusText})`,
      );
    }
    super(message);
    this.response = response;
  }

  static fromResponse(response: Response): HttpError {
    const message = `HTTP ${response.status} ${response.statusText}`;
    return new HttpError(message, response);
  }

  static isHttpError(e: unknown): e is HttpError {
    return e instanceof HttpError;
  }

  intoResult(): Result<never, HttpError> {
    return err(this);
  }

  async log(): Promise<void> {
    console.error(
      "Http request failed with status:",
      this.response.status,
      this.response.statusText,
    );
    console.error(`\tData: ${await this.response.text()}`);
  }
}

async function callApi(url: string): AsyncResult<Response, HttpError | Error> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return HttpError.fromResponse(response).intoResult();
    }
    return ok(response);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

const URL = "https://mock.httpstatus.io";

const STATUSES = [200, 203, 301, 400, 402, 404, 500];

for (const status of STATUSES) {
  const callResult = await callApi(URL + `/${status}`);

  callResult.match({
    Err: (err) =>
      HttpError.isHttpError(err) ? err.log() : console.error(err.message),
    Ok: async (response) => {
      console.log("Successful response:", response.status, response.statusText);
      console.log(`\tData: ${await response.text()}`);
    },
  });
}
