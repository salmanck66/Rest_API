import { userSignUp, signhelp } from '../helpers/signInUp.mjs';
import { signUserjwt, signRefreshToken } from '../middlewares/jwt.mjs';
import { body, validationResult } from 'express-validator';

export const signup = async (req, res) => {
  // Define the validation rules
  await body('mail').isEmail().withMessage('Must be a valid email').run(req);
  await body('phno').isLength({ min: 10, max: 10 }).withMessage('Phone number must be exactly 10 digits').isNumeric().withMessage('Phone number must be numeric').run(req);
  await body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  // Define the validation rules
  await body('mail').isEmail().withMessage('Must be a valid email').run(req);
  await body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .run(req);

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
