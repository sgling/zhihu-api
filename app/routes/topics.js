const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/topics'})
const { 
    find, findById, create, update, del, listTopicFollowers,
    checkTopicExist, listQuestions
} = require('../controllers/topics')
const { secret } = require('../config');  // 引入密钥

// 用户认证 中间件
const auth = jwt({ secret })

// 获取话题列表接口
router.get('/', find)
// 创建话题接口
router.post('/',auth, create)
// 获取特定话题接口
router.get('/:id', checkTopicExist, findById)
// 更新话题接口
router.patch('/:id', auth, checkTopicExist, update)
// 删除话题接口
router.delete('/:id', auth, del)
// 话题粉丝接口
router.get('/:id/followers', checkTopicExist, listTopicFollowers)
// 获取话题对应的 问题列表
router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router