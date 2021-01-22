const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const { TEST_DATABASE_URL } = require("../src/config");
const supertest = require("supertest");
const { expect } = require("chai");

describe.only("puzzles endpoints", function () {
  let db;

  const { testUsers, testPuzzles } = helpers.makeFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`GET /api/puzzles`, () => {
    context(`Given there are no puzzles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app).get("/api/puzzles").expect(200, []);
      });
    });

    context(`Given there are puzzles in the database`, () => {
      beforeEach("insert puzzles", () => {
        return helpers.seedUsersAndPuzzles(db, testUsers, testPuzzles);
      });

      it(`responds with 200 and all of the puzzles`, () => {
        const expectedPuzzles = testPuzzles.map((puzzle) =>
          helpers.makeExpectedPuzzle(puzzle)
        );
        return supertest(app).get("/api/puzzles").expect(200, expectedPuzzles);
      });
    });

    context(`Given an XSS attack puzzle`, () => {
      const { maliciousPuzzle, expectedPuzzle } = helpers.makeMaliciousPuzzle(
        testUsers
      );
      beforeEach("insert malicious puzzle", () => {
        return helpers.seedMaliciousPuzzle(db, testUsers, maliciousPuzzle);
      });

      it(`removes XSS attack content`, () => {
        return supertest(app)
          .get("/api/puzzles")
          .expect(200)
          .expect((res) => {
            expect(res.body[0].user_id).to.eql(expectedPuzzle.user_id);
            expect(res.body[0].title).to.eql(expectedPuzzle.title);
            expect(res.body[0].rows).to.eql(expectedPuzzle.rows);
            expect(res.body[0].cols).to.eql(expectedPuzzle.cols);
            expect(res.body[0].blocks).to.eql(expectedPuzzle.blocks);
            expect(res.body[0].letters).to.eql(expectedPuzzle.letters);
            expect(res.body[0].cell_id).to.eql(expectedPuzzle.cell_id);
            expect(res.body[0].clues_across).to.have.members(
              expectedPuzzle.clues_across
            );
            expect(res.body[0].clues_down).to.have.members(
              expectedPuzzle.clues_down
            );
          });
      });
    });
  });

  describe(`POST /api/puzzles`, () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
    const testUser = testUsers[0];

    const requiredFields = [
      "user_id",
      "title",
      "rows",
      "cols",
      "blocks",
      "letters",
      "cell_id",
      "clues_across",
      "clues_down",
    ];
    requiredFields.forEach((field) => {
      const newPuzzle = {
        user_id: testUser.id,
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
      };

      it(`responds with 400 and an error when the '${field}' is missing`, () => {
        delete newPuzzle[field];
        return supertest(app)
          .post("/api/puzzles")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newPuzzle)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` },
          });
      });
    });

    it(`creates a puzzle, responding with 201 and the new puzzle`, () => {
      const newPuzzle = {
        user_id: testUser.id,
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
      };

      return supertest(app)
        .post("/api/puzzles")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newPuzzle)
        .expect(201)
        .expect((res) => {
          expect(res.body.user_id).to.eql(newPuzzle.user_id);
          expect(res.body.title).to.eql(newPuzzle.title);
          expect(res.body.rows).to.eql(newPuzzle.rows);
          expect(res.body.cols).to.eql(newPuzzle.cols);
          expect(res.body.blocks).to.eql(newPuzzle.blocks);
          expect(res.body.letters).to.eql(newPuzzle.letters);
          expect(res.body.cell_id).to.eql(newPuzzle.cell_id);
          expect(res.body.clues_across).to.have.deep.members(
            newPuzzle.clues_across
          );
          expect(res.body.clues_down).to.have.deep.members(
            newPuzzle.clues_down
          );
        });
    });

    it(`removes XSS attack content from response`, () => {
      const { maliciousPuzzle, expectedPuzzle } = helpers.makeMaliciousPuzzle(
        testUsers
      );

      return supertest(app)
        .post("/api/puzzles")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(maliciousPuzzle)
        .expect(201)
        .expect((res) => {
          expect(res.body.user_id).to.eql(expectedPuzzle.user_id);
          expect(res.body.title).to.eql(expectedPuzzle.title);
          expect(res.body.rows).to.eql(expectedPuzzle.rows);
          expect(res.body.cols).to.eql(expectedPuzzle.cols);
          expect(res.body.blocks).to.eql(expectedPuzzle.blocks);
          expect(res.body.letters).to.eql(expectedPuzzle.letters);
          expect(res.body.cell_id).to.eql(expectedPuzzle.cell_id);
          expect(res.body.clues_across).to.have.members(
            expectedPuzzle.clues_across
          );
          expect(res.body.clues_down).to.have.members(
            expectedPuzzle.clues_down
          );
        });
    });
  });

  describe(`GET /api/puzzles/:puzzle_id`, () => {
    context(`Given no puzzles`, () => {
      before("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });
      it(`responds with 404`, () => {
        const puzzleId = 1234567;
        return supertest(app)
          .get(`/api/puzzles/${puzzleId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `Puzzle doesn't exist` } });
      });
    });

    context(`Given there are puzzles in the database`, () => {
      beforeEach("insert puzzles", () => {
        return helpers.seedUsersAndPuzzles(db, testUsers, testPuzzles);
      });

      it(`responds with 200 and the specified puzzle`, () => {
        const puzzleId = 2;
        const expectedPuzzle = helpers.makeExpectedPuzzle(
          testPuzzles[puzzleId - 1]
        );

        return supertest(app)
          .get(`/api/puzzles/${puzzleId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedPuzzle);
      });
    });

    context(`Given an XSS attack puzzle`, () => {
      const { maliciousPuzzle, expectedPuzzle } = helpers.makeMaliciousPuzzle(
        testUsers
      );
      beforeEach("insert malicious puzzle", () => {
        return helpers.seedMaliciousPuzzle(db, testUsers, maliciousPuzzle);
      });

      it(`removes XSS attack content`, () => {
        return supertest(app)
          .get(`/api/puzzles/${maliciousPuzzle.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body.user_id).to.eql(expectedPuzzle.user_id);
            expect(res.body.title).to.eql(expectedPuzzle.title);
            expect(res.body.rows).to.eql(expectedPuzzle.rows);
            expect(res.body.cols).to.eql(expectedPuzzle.cols);
            expect(res.body.blocks).to.eql(expectedPuzzle.blocks);
            expect(res.body.letters).to.eql(expectedPuzzle.letters);
            expect(res.body.cell_id).to.eql(expectedPuzzle.cell_id);
            expect(res.body.clues_across).to.have.members(
              expectedPuzzle.clues_across
            );
            expect(res.body.clues_down).to.have.members(
              expectedPuzzle.clues_down
            );
          });
      });
    });
  });

  describe(`GET /api/puzzles/user/:user_id`, () => {
    context(`Given no user`, () => {
      before("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });
      it(`responds with 404`, () => {
        const userId = 2;
        return supertest(app)
          .get(`/api/puzzles/user/${userId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: { message: `User doesn't exist` } });
      });
    });
  });
});
