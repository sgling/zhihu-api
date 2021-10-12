const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')

class TopicsClt {
    // 获取话题列表
    async find(ctx){
        // 默认返回 10条数据
        const { per_page = 10 } = ctx.query;
        // 页数
        const page = Math.max(ctx.query.page * 1, 1) - 1 || 0;
        // 每一页的数据条数
        const perPage = Math.max(per_page * 1, 1);
        // limit(10) ==> 表示返回 10项 数据，skip(10) ==> 表示从第10项开始返回数据
        ctx.body = await Topic.find({
            name: new RegExp(ctx.query.q)  // 模糊搜索
        }).limit(perPage).skip(page * perPage)  // 每一页返回 10条数据
    }
    // 检查话题 Id 是否存在
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id)
        if(!topic){
            ctx.throw(404, '话题不存在')
            return
        }
        await next()
    }
    // 查询特定话题
    async findById(ctx){
        const { fields='' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        ctx.body = topic
    }
    // 创建话题
    async create(ctx){
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false },
        })
        const topic = await new Topic(ctx.request.body).save()
        ctx.body = topic
    }
    // 修改话题
    async update(ctx){
        ctx.verifyParams({
            name: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false },
        })
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = topic
    }
    // 删除话题
    async del(ctx){
        const topic = await Topic.findByIdAndRemove(ctx.params.id)
        if(!topic){
            ctx.throw(404, '话题不存在')
            return
        }
        ctx.body = {
            code: 1,
            msg: '话题删除成功'
        }
    }
    // 获取话题粉丝列表
    async listTopicFollowers(ctx){
        const topics = await User.find({followingTopics: ctx.params.id})
        ctx.body = topics
    }
    // 列出话题对应的 问题列表
    async listQuestions(ctx){
        const questions = await Question.find({topics: ctx.params.id})
        ctx.body = questions
    }
}

module.exports = new TopicsClt()