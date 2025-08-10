import { err, ok, type AsyncResult, type IntoResult, type Result } from "@/pkg";

class HttpError extends Error implements IntoResult<never, HttpError> {
  override name = "HttpError";

  readonly response?: Response;

  constructor(message: string, response?: Response) {
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

  static fromAnyThrow(e: unknown): HttpError {
    const message = e instanceof Error ? e.message : `Unknown error: ${e}`;
    return new HttpError(message);
  }

  intoResult(): Result<never, HttpError> {
    return err(this);
  }

  async log(): Promise<void> {
    if (!this.response) {
      console.error("Http request failed with unexpected error:");
      console.error(`${this.name}: ${this.message}`);
    } else {
      console.error(
        "Http request failed with status:",
        this.response.status,
        this.response.statusText,
      );
      console.log(`\tData: ${await this.response.text()}`);
    }
  }
}

async function callApi(url: string): AsyncResult<Response, HttpError> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return HttpError.fromResponse(response).intoResult();
    }
    return ok(response);
  } catch (e) {
    return HttpError.fromAnyThrow(e).intoResult();
  }
}

const URL = "https://mock.httpstatus.io";

const STATUSES = [200, 203, 301, 400, 402, 404, 500];

for (const status of STATUSES) {
  const callResult = await callApi(URL + `/${status}`);

  callResult.match({
    Err: (err) => err.log(),
    Ok: async (response) => {
      console.log("Successful response:", response.status, response.statusText);
      console.log(`\tData: ${await response.text()}`);
    },
  });
}
