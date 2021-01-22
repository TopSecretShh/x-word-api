const xss = require("xss");
const bcrypt = require("bcryptjs");

const UsersService = {
  getAllUsers(db) {
    return db.from("users").select("*");
  },
  getUserById(db, id) {
    return db.from("users").select("*").where("id", id).first();
  },
  // TODO do we need the below for anything? I don't think so...
  getUserByUsername(db, user_name) {
    return db.from("users").select("*").where("user_name", user_name).first();
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("users")
      .returning("*")
      .then(([user]) => user)
      .then((user) => UsersService.getUserById(db, user.id));
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      password: xss(user.password),
    };
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  hasUserWithUsername(db, user_name) {
    return db("users")
      .where({ user_name })
      .first()
      .then((user) => !!user);
  },
};

module.exports = UsersService;
