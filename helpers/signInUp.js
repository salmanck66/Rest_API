import bcrypt from "bcrypt";
import { User } from "../models/user.js";

export async function userSignUp(userData) {
  const { mail, password, userName, phno } = userData;
  try {
    console.log(mail, password, userName, phno);
    const exist = await User.findOne({ mail });
    if (exist) {
      return { exist: true };
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const user = new User({
        userName: userName,
        mail: mail,
        password: hashed,
        phno: phno,
      });
      const savedUser = await user.save();
      return { success: true, user: savedUser };
    }
  } catch (error) {
    console.error("Error in userSignUp:", error);
    throw error;
  }
}

export async function signhelp(mail, password) {
  try {
    const user = await User.findOne({ mail });
    if (user) {
      const matchpass = await bcrypt.compare(password, user.password);
      if (!matchpass) {
        return { nomatch: true };
      } else {
        return { userexist: true, user };
      }
    } else {
      return { usernotfound: true };
    }
  } catch (error) {
    console.error("Error in signhelp:", error);
    throw error;
  }
}
