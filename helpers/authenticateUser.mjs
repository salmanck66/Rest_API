import jwt from 'jsonwebtoken';
import { User } from '../models/User.mjs';

export const authenticateUser = async (req, res, next) => {
  const token = req.cookies.jwt;
  const refreshToken = req.cookies.refreshtoken;

  if (!token) {
    if (!refreshToken) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_KEY);
      const user = await User.findById(decodedRefresh.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      
      const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_KEY, { expiresIn: '15m' });
      
      res.cookie('jwt', accessToken, { httpOnly: true, maxAge: 900000 });

      req.user = user;
      return next();
    } catch (error) {
      console.error('Error verifying refresh token:', error);
      return res.status(400).json({ message: 'Invalid refresh token.' });
    }
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
    console.error('Error verifying access token:', ex);
    res.status(400).json({ message: 'Invalid token.' });
  }
};
