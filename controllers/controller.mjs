import { userSignUp, signhelp } from '../helpers/signInUp.mjs';
import { signUserjwt, signRefreshToken } from '../middlewares/jwt.mjs';


export const signup = async (req, res) => {
  try {
    if (!req.body) {
      return res.json("Empty request body");
    }
    const signupDone = await userSignUp(req.body);
    if (signupDone.exist) {
      res.status(200).json("Mail Id Already Exist, Please Signup With Different Mail ID");
    } else {
      res.status(200).json("User Registration Successful");
    }
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

export const signin = async (req, res) => {
  const { mail, password } = req.body;
  try {
    const resolved = await signhelp(mail, password);
    if (resolved.nomatch) {
      res.status(401).json("Password does not match");
    } else if (resolved.usernotfound) {
      res.status(404).json("User not found");
    } else if (resolved.userexist) {
      const accessToken = await signUserjwt(resolved.user);
      const refreshToken = await signRefreshToken(resolved.user);
      res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 900000 }).json({
        message: "User logged in",
        accessToken,
        refreshToken
      });
    }
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json("Internal Server Error");
  }
};

export const home = (req, res) => {
  res.status(200).json("Connected");
};
