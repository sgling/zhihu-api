const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/questions'})
const { 
    find, findById, create, update, del,
    checkQuestionExist, checkQuestioner
} = require('../controllers/questions')
const { secret } = require('../config');  // 引入密钥

// 用户认证 中间件
const auth = jwt({ secret })

// 获取话题列表接口
router.get('/', find)
// 创建话题接口
router.post('/',auth, create)
// 获取特定话题接口
router.get('/:id', checkQuestionExist, findById)
// 更新话题接口
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
// 删除话题接口
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del,)

module.exports = router