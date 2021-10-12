const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/questions/:questionId/answers/:answerId/comments'})
const { 
    find, findById, create, update, del,
    checkCommentExist, checkCommentator
} = require('../controllers/comments')
const { secret } = require('../config');  // 引入密钥

// 用户认证 中间件
const auth = jwt({ secret })

// 获取答案列表接口
router.get('/', find)
// 创建答案接口
router.post('/',auth, create)
// 获取特定答案接口
router.get('/:id', checkCommentExist, findById)
// 更新答案接口
router.patch('/:id', auth, checkCommentExist, checkCommentator, update)
// 删除答案接口
router.delete('/:id', auth, checkCommentExist, checkCommentator, del,)

module.exports = router