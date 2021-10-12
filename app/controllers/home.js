const path = require('path')

class HomeCtl{
    index(ctx){
        ctx.body = '<h1>这是首页</h1>'
    }
    // 上传控制器
    upload(ctx){
        const file = ctx.request.files.file
        const basename = path.basename(file.path)
        ctx.body = { url: `${ctx.origin}/uploads/${basename}` }
    }
}

module.exports = new HomeCtl()