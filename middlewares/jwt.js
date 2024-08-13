import jwt from 'jsonwebtoken';

export function signUserjwt(user) {
  return new Promise((resolve, reject) => {
    const jwtKey = process.env.JWT_KEY;
    const payLoad = {
      userId: user._id,
      userName: user.userName,
    };
    jwt.sign(payLoad, jwtKey, { expiresIn: '15m' }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
}

export function signRefreshToken(user) {
  return new Promise((resolve, reject) => {
    const refreshKey = process.env.JWT_KEY;
    const payLoad = {
      userId: user._id,
      userName: user.userName,
    };
    jwt.sign(payLoad, refreshKey, { expiresIn: '7d' }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
  });
}
