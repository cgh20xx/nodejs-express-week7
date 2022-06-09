const jwt = require('jsonwebtoken');
const handleErrorAsync = require('./handleErrorAsync');
const AppError = require('../services/appError');
const UserModel = require('../models/UserModel');

const isAuth = handleErrorAsync(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError({
        statusCode: 401,
        message: '[授權失敗] 你尚未登入',
      })
    );
  }

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });
  const currentUser = await UserModel.findById(decoded.id);

  req.user = currentUser;
  next();
});

const generateJWT = (id) => {
  // 產生 JWT
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
};

module.exports = {
  isAuth,
  generateJWT,
};
