const successResponse = require('../services/successResponse');
const AppError = require('../services/appError');
const sizeOf = require('image-size');
const { ImgurClient } = require('imgur');

const upload = {
  /**
   * 上傳單張圖片 (需登入)
   */
  async uploadImage(req, res, next) {
    console.log('uploadImage file:', req.file);
    if (!req.files.length) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[上傳錯誤] 尚未上傳檔案',
        })
      );
    }
    const dimensions = sizeOf(req.files[0].buffer);
    if (dimensions.width !== dimensions.height) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[上傳錯誤] 圖片長寬不符合 1:1 尺寸',
        })
      );
    }

    const client = new ImgurClient({
      clientId: process.env.IMGUR_CLIENTID,
      clientSecret: process.env.IMGUR_CLIENT_SECRET,
      refreshToken: process.env.IMGUR_REFRESH_TOKEN,
    });
    const response = await client.upload({
      image: req.files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.IMGUR_ALBUM_ID,
    });
    successResponse(res, {
      imgUrl: response.data.link,
    });
  },
};
module.exports = upload;
