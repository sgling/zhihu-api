const Router = require('koa-router')
const router = new Router()
const { index, upload } = require('../controllers/home')

router.get('/', index)
// 文件上传接口
router.post('/upload', upload)

module.exports = router
