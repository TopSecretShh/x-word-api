const express = require("express");
const UsersService = require("./users-service");
const { requireAuth } = require("../middleware/jwt-auth");

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter
  .route("/")
  .get((req, res, next) => {
    UsersService.getAllUsers(req.app.get("db"))
      .then((users) => {
        res.json(users.map(UsersService.serializeUser));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const newUser = { user_name, password };

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res
          .status(400)
          .json({ error: { message: `Missing '${key}' in request body` } });
      }
    }

    UsersService.hasUserWithUsername(req.app.get("db"), user_name).then(
      (hasUserWithUsername) => {
        if (hasUserWithUsername)
          return res.status(400).json({
            error: { message: `Username already exists in database` },
          });

        return UsersService.hashPassword(password)
          .then((hashedPassword) => {
            const newUser = {
              user_name,
              password: hashedPassword,
            };
            return UsersService.insertUser(req.app.get("db"), newUser).then(
              (user) => {
                res.status(201).json(UsersService.serializeUser(user));
              }
            );
          })
          .catch(next);
      }
    );
  });

// TODO see if this sends just the user_name
// TODO no test written for this...
usersRouter.route("/getusername").get(requireAuth, (req, res) => {
  res.send(req.user);
});

usersRouter
  .route("/:user_id")
  .all(requireAuth)
  .all((req, res, next) => {
    UsersService.getUserById(req.app.get("db"), req.params.user_id).then(
      (user) => {
        if (!user) {
          return res
            .status(404)
            .json({ error: { message: `User doesn't exist` } });
        }
        res.user = user;
        next();
      }
    );
  })
  .get((req, res, next) => {
    res.json(UsersService.serializeUser(res.user));
  });

module.exports = usersRouter;
