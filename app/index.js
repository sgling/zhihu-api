const Koa = require('koa')
const app = new Koa();
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const path = require('path')
const routing = require('./routes/index')
const { connectionStr } = require('./config')

mongoose.connect(connectionStr, () => {
    console.log('MongoDB 连接成功');
})
mongoose.connection.on('error', console.error)

// 静态资源目录
app.use(koaStatic(path.join(__dirname, 'public')))

app.use(error({
    postFormat: (err, {stack, ...rest}) => process.env.NODE_ENV === 'production'? rest:{stack, ...rest}
}))

app.use(koaBody({
    multipart: true,  // 应许上传文件
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true,  // 保留文件后缀名（拓展名）
    }
}))
app.use(parameter(app))
// 挂载路由
routing(app)

app.listen(8000, () => {
    console.log('服务启动在8000端口');
})