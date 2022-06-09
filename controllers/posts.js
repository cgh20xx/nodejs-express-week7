const PostModel = require('../models/PostModel');
const UserModel = require('../models/UserModel');
const successResponse = require('../services/successResponse');
const AppError = require('../services/appError');
const posts = {
  /**
   * 查詢所有貼文
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.find
   * @param {Object} req
   * @param {Object} res
   */
  async getPosts(req, res, next) {
    // 網址參數 timeSort: 預設貼文排序為由大到小(新到舊)。?timeSort=asc 由小到大(舊到新)
    const timeSort = req.query.timeSort == 'asc' ? 'createdAt' : '-createdAt';
    // 網址參數 q: 搜尋文章 content 包含關鍵字。?q=keyword
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {};
    // 將貼文中的 user id 替換為 user 的 name 和 photo
    // Doc:https://mongoosejs.com/docs/populate.html
    const allPost = await PostModel.find(q)
      .populate({
        path: 'user', // path 來源為 PostModel 的 user 欄位
        select: 'name photo', // 要顯示的欄位用空白隔開，若有不想顯示的欄位可加上減號。 ex:'-name'
      })
      .sort(timeSort);
    successResponse(res, allPost);
  },
  /**
   * 新增單筆貼文
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.create
   * @param {Object} req
   * @param {Object} res
   */
  async createPost(req, res, next) {
    // 注意：req.user 在 isAuth middleware 驗証成功後會自動帶入的。
    // next 第一個參數是 Error 的話，會導向 app.use(function (err, req, res, next) {])
    const user = req.user; // 登入成功就會取得 user，應該不需再判斷 user 是否存在。
    const { body } = req;

    body.content = body.content?.trim(); // 頭尾去空白
    if (!body.content)
      return next(
        new AppError({
          statusCode: 400,
          message: '[新增貼文失敗] content 未填寫',
        })
      );

    // 只開放新增 user content image
    // 現在 await PostModel.create 不再需要 try catch 包起來
    // 若 mongoose 發生 validationError 會被 handleErrorAsync 裡的 catch 統一處理！
    const newPost = await PostModel.create({
      user: user.id,
      content: body.content,
      image: body.image,
      // tags: body.tags,
      // type: body.type,
    });
    successResponse(res, newPost);
  },
  /**
   * 刪除所有貼文
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.deleteMany
   * @param {Object} req
   * @param {Object} res
   */
  async deletePosts(req, res, next) {
    await PostModel.deleteMany({});
    successResponse(res, []);
  },
  /**
   * 刪除單筆貼文
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndDelete
   * @param {Object} req
   * @param {Object} res
   */
  async deletePostById(req, res, next) {
    const id = req.params.id;
    const deletePostById = await PostModel.findByIdAndDelete(id);
    if (!deletePostById)
      return next(
        new AppError({
          statusCode: 400,
          message: '[刪除貼文失敗] 沒有此 id',
        })
      );

    successResponse(res, deletePostById);
  },
  /**
   * 修改單筆貼文
   * Doc:https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
   * @param {Object} req
   * @param {Object} res
   */
  async updatePostById(req, res, next) {
    const { body } = req;
    const id = req.params.id;

    if (body.user)
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改貼文失敗] 不可修改 user',
        })
      );
    body.content = body.content?.trim(); // 頭尾去空白
    if (!body.content)
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改貼文失敗] content 未填寫',
        })
      );
    // 只開放修改 conent image (user 不可改)
    const updatePostById = await PostModel.findByIdAndUpdate(
      id,
      {
        content: body.content,
        image: body.image,
        // tags: body.tags,
        // type: body.type,
      },
      {
        // 加這行才會返回更新後的資料，否則為更新前的資料。
        returnDocument: 'after',
        // update 相關語法預設 runValidators: false，需手動設寪 true。Doc:https://mongoosejs.com/docs/validation.html#update-validators
        runValidators: true,
      }
    );
    if (!updatePostById)
      return next(
        new AppError({
          statusCode: 400,
          message: '[修改失敗] 沒有此 id',
        })
      );
    successResponse(res, updatePostById);
  },
};
module.exports = posts;
