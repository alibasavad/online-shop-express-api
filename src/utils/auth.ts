import { User } from "../models/user";
import Bcrypt from "bcryptjs";
import { UserType } from "../interfaces/index";

/**
 * @description authenticate user using email and password
 * @param {string} email type : string
 * @param {string} password type : string
 * @returns User (mongoose model) Or null
 */
const auth = async (
    email: string,
    password: string
): Promise<UserType | null> => {
    let user: UserType | null = await User.findOne({ email: email });
    if (user === null) return user;
    let passwordcheck = await Bcrypt.compare(password, user.password);
    if (passwordcheck) return user;
    else return null;
};
export default auth;
