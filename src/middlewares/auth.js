import User from "../models/user";
const Bcrypt = require("bcryptjs");

// authenticate user using email and password
const auth = async (email, password) => {
  let user = await User.findOne({ email: email });
  if (user === null) return user;
  let passwordcheck = await Bcrypt.compare(password, user.password);
  if (passwordcheck) return user;
  else return null;
};
export default auth;
