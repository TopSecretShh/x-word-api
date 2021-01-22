const knex = require("knex");
const bcrypt = require("bcryptjs");
const app = require("../src/app");
const helpers = require("./test-helpers");
const { TEST_DATABASE_URL } = require("../src/config");
const supertest = require("supertest");
const { expect } = require("chai");
const authRouter = require("../src/auth/auth-router");

describe("users endpoints", function () {
  let db;

  const { testUsers } = helpers.makeFixtures();
  const testUser = testUsers[0];

  let authToken;

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

  beforeEach("register and login user", () => {
    const user = {
      id: 1,
      user_name: "Jimbob",
      password: "jimbob",
    };
    return supertest(app)
      .post("/api/users")
      .send(user)
      .then((res) => {
        return supertest(app)
          .post("/api/auth/login")
          .send(user)
          .then((res) => {
            authToken = res.body.authToken;
          });
      });
  });

  describe(`GET /api/users`, () => {
    context(`Given there are users in the database`, () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });

      it(`responds with 200 and all of the users`, () => {
        const expectedUsers = testUsers.map((user) =>
          helpers.makeExpectedUser(user)
        );

        return supertest(app)
          .get("/api/users")
          .expect(200)
          .expect((res) => {
            expect(res.body[1].user_name).to.eql(expectedUsers[0].user_name);
          });
      });
    });
  });

  describe(`POST /api/users`, () => {
    context(`user validation`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = ["user_name", "password"];
      requiredFields.forEach((field) => {
        const newUser = {
          user_name: "test user name",
          password: "test password",
        };
        it(`responds with 400 and an error when the '${field}' is missing`, () => {
          delete newUser[field];
          return supertest(app)
            .post("/api/users")
            .send(newUser)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });

      it(`responds 400 'User name already exists in database' when user name isn't unique`, () => {
        const duplicateUser = {
          user_name: testUser.user_name,
          password: "test password",
        };
        return supertest(app)
          .post("/api/users")
          .send(duplicateUser)
          .expect(400, {
            error: { message: `Username already exists in database` },
          });
      });
    });

    context(`Happy path`, () => {
      it(`creates a user, storing bcrypted password, responding with 201`, () => {
        const newUser = {
          user_name: "test user name",
          password: "test password",
        };
        return supertest(app)
          .post("/api/users")
          .send(newUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body.user_name).to.eql(newUser.user_name);
          })
          .expect((res) =>
            db
              .from("users")
              .select("*")
              .where({ id: res.body.id })
              .first()
              .then((row) => {
                expect(row.user_name).to.eql(newUser.user_name);
                return bcrypt.compare(newUser.password, row.password);
              })
              .then((compareMatch) => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 1234567;
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set({ Authorization: `Bearer ${authToken}` })
          .expect(404, { error: { message: `User doesn't exist` } });
      });
    });

    context(`Given there are users in the database`, () => {
      beforeEach("insert users", () => {
        return helpers.seedUsers(db, testUsers);
      });

      it(`responds with 200 and the specified user`, () => {
        const userId = 2;
        const expectedUser = helpers.makeExpectedUser(testUsers[userId - 2]);

        return supertest(app)
          .get(`/api/users/${userId}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body.user_name).to.eql(expectedUser.user_name);
          });
      });
    });

    context(`Given an XSS attack user`, () => {
      const testUser = helpers.makeUsersArray()[1];
      const { maliciousUser, expectedUser } = helpers.makeMaliciousUser(
        testUser
      );

      beforeEach("insert malicious user", () => {
        return helpers.seedMaliciousUser(db, maliciousUser);
      });

      it(`removes XSS attack content`, () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .set({ Authorization: `Bearer ${authToken}` })
          .expect(200)
          .expect((res) => {
            expect(res.body.user_name).to.eql(expectedUser.user_name);
            expect(res.body.password).to.eql(expectedUser.password);
          });
      });
    });
  });
});
