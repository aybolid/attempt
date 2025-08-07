import { match, withAttempt } from "@/utils";

const parse = withAttempt(JSON.parse);

const payload = ["invalid", "13", '"hello world"', ":)", '{"name": "Bob"}'];

for (const string of payload) {
  const result = parse(string);

  match(result, {
    Ok: (data) => {
      console.log("Parsed:", data);
    },
    Err: (err) => {
      console.error(err.message);
    },
  });
}
