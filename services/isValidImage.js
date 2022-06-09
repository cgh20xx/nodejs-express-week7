const multer = require('multer');
const path = require('path');
const AppError = require('./appError');
const handleErrorAsync = require('./handleErrorAsync');
const upload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024, // 上傳限制 2MB
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg' && ext !== '.gif') {
      cb(
        new AppError({
          statusCode: 400,
          message:
            '[上傳錯誤] 檔案格式錯誤：僅限上傳 jpg、jpeg、png 與 gif 格式。',
        })
      );
    }
    cb(null, true);
  },
}).any();

module.exports = upload;
