import { Option, type Result, match } from "@/pkg";

type User = {
  id: string;
  name: string;
  age: number;
};

const USERS: Array<User> = [
  {
    id: "1",
    name: "John Doe",
    age: 30,
  },
  {
    id: "3",
    name: "Jane Doe",
    age: 25,
  },
  {
    id: "4",
    name: "Alice Smith",
    age: 28,
  },
];

function getUserResultById(id: string): Result<User> {
  return Option.fromNullable(USERS.find((user) => user.id === id)).okOr(
    new Error(`User not found (id: ${id})`),
  );
}

for (const id of ["1", "2", "3", "4", "5"]) {
  const userResult = getUserResultById(id);

  console.log(userResult.toString());

  match(userResult, {
    Ok: (user) => console.log("\t", user),
    Err: (error) => console.error("\t", error.message),
  });
}
console.log();

function getUserOptionById(id: string): Option<User> {
  return getUserResultById(id).ok();
}

for (const id of ["1", "2", "3", "4", "5"]) {
  const userOption = getUserOptionById(id);

  console.log(userOption.toString());

  match(userOption, {
    Some: (user) => console.log("\t", user),
    None: () => console.error("\t", `User not found (id: ${id})`),
  });
}
