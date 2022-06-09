const UserModel = require('../models/UserModel');
const successResponse = require('../services/successResponse');
const AppError = require('../services/appError');
const { generateJWT } = require('../services/auth');

const upload = {
  /**
   * 上傳單張圖片 (需登入)
   */
  async uploadImage(req, res, next) {
    console.log('uploadImage ct');
  },
};
module.exports = upload;
