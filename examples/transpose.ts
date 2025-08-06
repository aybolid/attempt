import { err, ok, type Result } from "..";

function getName(obj: unknown): Result<string | null> {
  if (typeof obj === "object" && obj !== null) {
    if ("name" in obj) {
      return ok(String(obj.name));
    } else {
      return ok(null);
    }
  }
  return err(new Error("Invalid object"));
}

function demo(obj: unknown) {
  const name: Result<string | null> = getName(obj);
  const transposed: Result<string> | null = name.transpose();

  if (!transposed) {
    console.error("Name is null");
    return;
  }

  if (transposed.isOk()) {
    console.log("Name is:", transposed.unwrap());
  } else {
    console.error("Cant extract name: ", transposed.err().message);
  }
}

demo({ name: "John" });
demo(28);
demo(null);
demo({});
