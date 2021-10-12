const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/questions/:questionId/answers'})
const { 
    find, findById, create, update, del,
    checkAnswerExist, checkAnswerer
} = require('../controllers/answers')
const { secret } = require('../config');  // 引入密钥

// 用户认证 中间件
const auth = jwt({ secret })

// 获取答案列表接口
router.get('/', find)
// 创建答案接口
router.post('/',auth, create)
// 获取特定答案接口
router.get('/:id', checkAnswerExist, findById)
// 更新答案接口
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)
// 删除答案接口
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del,)

module.exports = router