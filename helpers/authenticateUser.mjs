import jwt from 'jsonwebtoken';
import { User } from '../models/User.mjs';

export const authenticateUser = async (req, res, next) => {
  const token = req.cookies.jwt; 
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    req.user = user;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
