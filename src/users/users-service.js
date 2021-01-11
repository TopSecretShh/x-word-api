const xss = require("xss");

const UsersService = {
  getAllUsers(db) {
    return db.from("users").select("*");
  },
  getUserById(db, id) {
    return db.from("users").select("*").where("id", id).first();
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
};

module.exports = UsersService;
