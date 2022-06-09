const UserModel = require('../models/UserModel');
const successResponse = require('../services/successResponse');
const AppError = require('../services/appError');
const { generateJWT } = require('../services/auth');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const users = {
  /**
   * 註冊會員 (新增單筆使用者)
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.create
   */
  async signUp(req, res, next) {
    let { name, email, password, confirmPassword } = req.body;
    // 檢查 name 空值
    name = name?.trim();
    if (!name) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] name 未填寫',
        })
      );
    }

    // 檢查 email 空值
    email = email?.trim();
    if (!email) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] email 未填寫',
        })
      );
    }

    // 檢查 email 格式
    // validator Doc: https://www.npmjs.com/package/validator
    if (!validator.isEmail(email)) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] email 格式錯誤',
        })
      );
    }

    // 檢查 email 是否已存在 DB
    const existUser = await UserModel.findOne({
      email,
    });
    if (existUser) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] email 已存在',
        })
      );
    }

    // 檢查 password 空值
    password = password?.trim();
    if (!password) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] password 未填寫',
        })
      );
    }

    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] password 長度少於8碼',
        })
      );
    }

    // 檢查 confirmPassword 空值
    confirmPassword = confirmPassword?.trim();
    if (!confirmPassword) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] confirmPassword 未填寫',
        })
      );
    }

    // 檢查 password confirmPassword 是否一致
    if (password !== confirmPassword) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[註冊失敗] password 不一致',
        })
      );
    }

    // 存進資料庫的密碼需加密過
    password = await bcrypt.hash(password, 12);

    // 能到這裡表示以上檢查都通過，準備新增使用者。
    const newUser = await UserModel.create({
      name,
      email,
      password,
    });

    //  產生 jwt token
    const token = generateJWT(newUser._id);

    successResponse(res, { token, name: newUser.name });
  },
  /**
   * 登入 (發 JWT)
   */
  async logIn(req, res, next) {
    let { email, password } = req.body;
    // 檢查 email 空值
    email = email?.trim();
    if (!email) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[登入失敗] email 未填寫',
        })
      );
    }

    // 檢查 password 空值
    password = password?.trim();
    if (!password) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[登入失敗] password 未填寫',
        })
      );
    }

    // 用 email 找使用者
    const existUser = await UserModel.findOne({
      email,
    }).select('+password');

    if (!existUser) {
      // 該 email 找不到使用者，也不要直接回 email 不存在，否則容易被 try email。
      return next(
        new AppError({
          statusCode: 400,
          message: '[登入失敗] email or password 錯誤',
        })
      );
    }

    // 比對傳入的 email 與資料庫中是否相同
    // bcrypt Doc:https://www.npmjs.com/package/bcrypt
    const isPasswordSame = await bcrypt.compare(password, existUser.password);
    if (!isPasswordSame) {
      // 密碼錯，也不要直接回密碼錯，否則容易被 try password。
      return next(
        new AppError({
          statusCode: 400,
          message: '[登入失敗] email or password 錯誤',
        })
      );
    }

    // 到這步表示 email password 都驗証成功
    // 產生 jwt token
    const token = generateJWT(existUser._id);

    successResponse(res, {
      token,
      _id: existUser._id,
      name: existUser.name,
      photo: existUser.photo,
    });
  },

  /**
   * 重設密碼 (需登入)
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
   */
  async updatPassword(req, res, next) {
    // 注意：req.user 在 isAuth middleware 驗証成功後會自動帶入的。
    console.log(req.user);
    let { password, confirmPassword } = req.body;
    // 檢查 password 空值
    password = password?.trim();
    if (!password) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[重設密碼失敗] password 未填寫',
        })
      );
    }

    // 密碼 8 碼以上
    if (!validator.isLength(password, { min: 8 })) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[重設密碼失敗] password 長度少於8碼',
        })
      );
    }

    // 檢查 confirmPassword 空值
    confirmPassword = confirmPassword?.trim();
    if (!confirmPassword) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[重設密碼失敗] confirmPassword 未填寫',
        })
      );
    }

    // 檢查 password confirmPassword 是否一致
    if (password !== confirmPassword) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[重設密碼失敗] password 不一致',
        })
      );
    }

    // 存進資料庫的密碼需加密過
    const newPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.findByIdAndUpdate(req.user.id, {
      password: newPassword,
    });

    successResponse(res, user);
  },
  /**
   * 取得個人資料 (需登入)
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
   */
  async getProfile(req, res, next) {
    // 注意：req.user 在 isAuth middleware 驗証成功後會自動帶入的。
    successResponse(res, req.user);
  },
  /**
   * 更新個人資料 (需登入)
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
   */
  async updateProfile(req, res, next) {
    // 注意：req.user 在 isAuth middleware 驗証成功後會自動帶入的。
    // console.log(req.user.id); // 629cd7d3bd9015cec13961b7
    // console.log(req.user._id);  // new ObjectId("629cd7d3bd9015cec13961b7")
    let { email, name, photo } = req.body;
    const { id } = req.user;

    // 檢查 name 空值
    name = name?.trim();
    if (!name) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改個人資料失敗] name 未填寫',
        })
      );
    }

    if (email !== undefined) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改個人資料失敗] 不可修改 email',
        })
      );
    }

    const updateUserById = await UserModel.findByIdAndUpdate(
      id,
      {
        name,
        photo,
      },
      {
        // 加這行才會返回更新後的資料，否則為更新前的資料。
        returnDocument: 'after',
        // update 相關語法預設 runValidators: false，需手動設寪 true。Doc:https://mongoosejs.com/docs/validation.html#update-validators
        runValidators: true,
      }
    );
    if (!updateUserById)
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改個人資料失敗] 沒有此 id',
        })
      );
    successResponse(res, updateUserById);
  },
  /**
   * 取得所有使用者
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.find
   */
  async getUsers(req, res, next) {
    const allUser = await UserModel.find();
    successResponse(res, allUser);
  },
  /**
   * 修改單筆使用者
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
   */
  async updateUserById(req, res, next) {
    let { email, name, photo } = req.body;
    const id = req.params.id;
    if (email !== undefined) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改使用者失敗] 不可修改 email',
        })
      );
    }

    name = name?.trim(); // 頭尾去空白
    if (!name) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改使用者失敗] name 未填寫',
        })
      );
    }

    const updateUserById = await UserModel.findByIdAndUpdate(
      id,
      {
        name,
        photo,
      },
      {
        // 加這行才會返回更新後的資料，否則為更新前的資料。
        returnDocument: 'after',
        // update 相關語法預設 runValidators: false，需手動設寪 true。Doc:https://mongoosejs.com/docs/validation.html#update-validators
        runValidators: true,
      }
    );
    if (!updateUserById) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改使用者失敗] 沒有此 id',
        })
      );
    }

    successResponse(res, updateUserById);
  },
  /**
   * 刪除所有使用者
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.deleteMany
   */
  async deleteUsers(req, res, next) {
    await UserModel.deleteMany({});
    successResponse(res, []);
  },
  /**
   * 刪除單筆使用者
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndDelete
   */
  async deleteUserById(req, res, next) {
    const id = req.params.id;
    const deleteUserById = await UserModel.findByIdAndDelete(id);
    if (!deleteUserById) {
      return next(
        new AppError({
          statusCode: 400,
          message: '[刪除使用者失敗] 沒有此 id',
        })
      );
    }

    successResponse(res, deleteUserById);
  },
};
module.exports = users;
