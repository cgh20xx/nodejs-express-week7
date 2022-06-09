const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/posts');
const handleErrorAsync = require('../services/handleErrorAsync');
const { isAuth } = require('../services/auth');

// 取得所有貼文 (需登入)
router.get('/posts', isAuth, handleErrorAsync(PostsController.getPosts));

// 新增個人貼文 (需登入)
router.post('/post', isAuth, handleErrorAsync(PostsController.createPost));

// 刪除所有貼文
router.delete('/posts', handleErrorAsync(PostsController.deletePosts));

// 刪除單筆貼文
router.delete('/post/:id', handleErrorAsync(PostsController.deletePostById));

// 修改單筆貼文
router.patch('/post/:id', handleErrorAsync(PostsController.updatePostById));

module.exports = router;
