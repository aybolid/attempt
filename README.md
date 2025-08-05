# Result Type

A lightweight `Result` type implementation for TypeScript.  Inspired by Rust's `Result` type, this library provides a way to handle operations that may fail, offering a clear and concise way to manage success and error scenarios.

## Usage

```typescript
import { Result, ok, err, attempt, attemptAsync } from 'attempt';

// Creating Result instances
const success: Result<number> = ok(42);
const failure: Result<never, string> = err("Something went wrong");

// Using attempt()
const result = attempt(() => {
  // Potentially failing operation
  return "success";
});

if (result.isOk()) {
  console.log("Success:", result.ok());
} else {
  console.error("Error:", result.err());
}

// Using attemptAsync()
async function doSomethingAsync(): Promise<Result<string>> {
  const asyncResult = await attemptAsync(async () => {
    // Potentially failing async operation
    return "async success";
  });
  return asyncResult;
}

doSomethingAsync().then(asyncResult => {
  if (asyncResult.isOk()) {
    console.log("Async Success:", asyncResult.ok());
  } else {
    console.error("Async Error:", asyncResult.err());
  }
});
```
