const express = require("express");
const UsersService = require("./users-service");

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

    return UsersService.insertUser(req.app.get("db"), newUser)
      .then((user) => {
        res.status(201).json(UsersService.serializeUser(user));
      })
      .catch(next);
  });

module.exports = usersRouter;
