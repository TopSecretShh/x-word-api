const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// BEGIN USERS
function makeUsersArray() {
  return [
    {
      id: 2,
      user_name: "Bob",
      password: "bob",
    },
    {
      id: 3,
      user_name: "Jim",
      password: "jim",
    },
  ];
}

function makeExpectedUser(user) {
  return {
    id: user.id,
    user_name: user.user_name,
    password: user.password,
  };
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

function makeMaliciousUser() {
  const maliciousUser = {
    id: 911,
    user_name: '<script>alert("xss");</script>',
    password: '<script>alert("xss");</script>',
  };
  const expectedUser = {
    id: 911,
    user_name: '&lt;script&gt;alert("xss");&lt;/script&gt;',
    password: '&lt;script&gt;alert("xss");&lt;/script&gt;',
  };

  return { maliciousUser, expectedUser };
}

function seedMaliciousUser(db, user) {
  return db.into("users").insert([user]);
}

// END USERS

// BEGIN PUZZLES

function makePuzzlesArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      title: "test title",
      rows: 3,
      cols: 3,
      blocks: [true, true, true, true, false, true, true, true, true],
      letters: ["", "", "", "", "", "", "", "", ""],
      cell_id: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      clues_across: [
        ["1 across", "a"],
        ["2 across", "b"],
      ],
      clues_down: [
        ["1 down", "c"],
        ["2 down", "d"],
      ],
    },
    {
      id: 2,
      user_id: users[users.length - 1].id,
      title: "test title",
      rows: 3,
      cols: 3,
      blocks: [true, true, true, true, false, true, true, true, true],
      letters: ["", "", "", "", "", "", "", "", ""],
      cell_id: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      clues_across: [
        ["1 across", "a"],
        ["2 across", "b"],
      ],
      clues_down: [
        ["1 down", "c"],
        ["2 down", "d"],
      ],
    },
  ];
}

function makeExpectedPuzzle(puzzle) {
  return {
    id: puzzle.id,
    user_id: puzzle.user_id,
    title: puzzle.title,
    rows: puzzle.rows,
    cols: puzzle.cols,
    blocks: puzzle.blocks,
    letters: puzzle.letters,
    cell_id: puzzle.cell_id,
    clues_across: puzzle.clues_across,
    clues_down: puzzle.clues_down,
  };
}

function makeExpectedUserPuzzles(userId, puzzles) {
  const expectedPuzzles = puzzles.filter((p) => p.user_id === userId);
  return expectedPuzzles.map((puzzle) => {
    return {
      id: puzzle.id,
      user_id: puzzle.user_id,
      title: puzzle.title,
      rows: puzzle.rows,
      cols: puzzle.cols,
      blocks: puzzle.blocks,
      letters: puzzle.letters,
      cell_id: puzzle.cell_id,
      clues_across: puzzle.clues_across,
      clues_down: puzzle.clues_down,
    };
  });
}

function seedPuzzles(db, puzzles) {
  return db.into("puzzles").insert(puzzles);
}

function seedUsersAndPuzzles(db, users, puzzles = []) {
  return db
    .into("users")
    .insert(users)
    .then(() => puzzles.length && db.into("puzzles").insert(puzzles));
}

function makeMaliciousPuzzle(users) {
  const maliciousPuzzle = {
    id: 911,
    user_id: users[0].id,
    title: '<script>alert("xss");</script>',
    rows: 3,
    cols: 3,
    blocks: [true, true, true, true, false, true, true, true, true],
    letters: ["", "", "", "", "", "", "", "", ""],
    cell_id: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    clues_across: [
      ["1 across", '<script>alert("xss");</script>'],
      ["2 across", '<script>alert("xss");</script>'],
    ],
    clues_down: [
      ["1 down", '<script>alert("xss");</script>'],
      ["2 down", '<script>alert("xss");</script>'],
    ],
  };
  const expectedPuzzle = {
    id: 911,
    user_id: users[0].id,
    title: '&lt;script&gt;alert("xss");&lt;/script&gt;',
    rows: 3,
    cols: 3,
    blocks: [true, true, true, true, false, true, true, true, true],
    letters: ["", "", "", "", "", "", "", "", ""],
    cell_id: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    clues_across: [
      ["1 across", '&lt;script&gt;alert("xss");&lt;/script&gt;'],
      ["2 across", '&lt;script&gt;alert("xss");&lt;/script&gt;'],
    ],
    clues_down: [
      ["1 down", '&lt;script&gt;alert("xss");&lt;/script&gt;'],
      ["2 down", '&lt;script&gt;alert("xss");&lt;/script&gt;'],
    ],
  };
  return { maliciousPuzzle, expectedPuzzle };
}

function seedMaliciousPuzzle(db, users, puzzle) {
  return db
    .into("users")
    .insert(users)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    )
    .then(() => db.into("puzzles").insert([puzzle]));
}

// END PUZZLES
// BEGIN EVERYTHING

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testPuzzles = makePuzzlesArray(testUsers);

  return { testUsers, testPuzzles };
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
  makeExpectedUser,
  seedUsers,
  makeMaliciousUser,
  seedMaliciousUser,

  makePuzzlesArray,
  makeExpectedPuzzle,
  makeExpectedUserPuzzles,
  seedPuzzles,
  seedUsersAndPuzzles,
  makeMaliciousPuzzle,
  seedMaliciousPuzzle,

  makeFixtures,
  cleanTables,

  makeAuthHeader,
};
