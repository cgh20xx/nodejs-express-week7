const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/upload');
const handleErrorAsync = require('../services/handleErrorAsync');
const { isAuth } = require('../services/auth');
const isValidImage = require('../services/isValidImage');

// 圖片上傳 (需登入)
router.post(
  '/upload',
  isAuth,
  isValidImage,
  handleErrorAsync(UploadController.uploadImage)
);

module.exports = router;
