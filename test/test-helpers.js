const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// BEGIN USERS
function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: "Bob",
      password: "bob",
    },
    {
      id: 2,
      user_name: "Jim",
      password: "jim",
    },
  ];
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));

  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

// END USERS
// BEGIN EVERYTHING

function makeFixtures() {
  const testUsers = makeUsersArray();

  return { testUsers };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
            users, puzzles
            RESTART IDENTITY CASCADE`
  );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}

// END EVERYTHING

module.exports = {
  makeUsersArray,
  seedUsers,

  makeFixtures,
  cleanTables,

  makeAuthHeader,
};
