const jwt = require('koa-jwt')
const Router = require('koa-router')
const router = new Router({prefix: '/users'})
// 用户控制器
const { 
    find, findById, create, update, del, login, checkOwner,
    listFollowing, checkUserExist, follow, unfollow, listFollowers,
    followTopic, unfollowTopic, listFollowerTopics, listQuestion,
    listLikingAnswers, likeAnswer, unlikeAnswer,
    listDislikingAnswers, dislikeAnswer, undislikeAnswer,
    listCollectingAnswers, collectAnswer, uncollectAnswer
} = require('../controllers/users')
// 话题控制器
const { checkTopicExist } = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')

const { secret } = require('../config');  // 引入密钥

// 用户认证 中间件
const auth = jwt({ secret })

// 获取用户列表接口
router.get('/', find)
// 创建用户接口
router.post('/', create)
// 获取特定用户接口
router.get('/:id', findById)
// 更新用户接口
router.patch('/:id', auth, checkOwner, update)
// 删除用户接口
router.delete('/:id', auth, checkOwner, del)
// 登录接口
router.post('/login', login)
// 获取关注列表接口
router.get('/:id/following', listFollowing)
// 获取粉丝列表接口
router.get('/:id/followers', listFollowers)
// 关注接口
router.put('/following/:id', auth, checkUserExist, follow)
// 取消关注接口
router.delete('/following/:id', auth, checkUserExist, unfollow)
// 获取关注话题列表接口
router.get('/:id/followingTopics', listFollowerTopics)
// 关注话题接口
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
// 取消关注话题接口
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)
// 获取问题列表接口
router.get('/:id/questions', listQuestion)
// 获取点赞答案列表接口
router.get('/:id/likingAnswers', listLikingAnswers)
// 点赞答案接口
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer)
// 取消点赞答案接口
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer)
// 获取踩答案列表接口
router.get('/:id/dislikingAnswers', listDislikingAnswers)
// 踩答案接口
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)
// 取消踩答案接口
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)
// 获取收藏答案列表接口
router.get('/:id/collectingAnswers', listCollectingAnswers)
// 收藏答案接口
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer)
// 取消收藏答案接口
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)

module.exports = router