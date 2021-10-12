const Question = require('../models/questions')

class QuestionsClt {
    // 获取问题列表
    async find(ctx){
        // 默认返回 10条数据
        const { per_page = 10 } = ctx.query;
        // 页数
        const page = Math.max(ctx.query.page * 1, 1) - 1 || 0;
        // 每一页的数据条数
        const perPage = Math.max(per_page * 1, 1);
        // 匹配 项
        const q = new RegExp(ctx.query.q);
        // limit(10) ==> 表示返回 10项 数据，skip(10) ==> 表示从第10项开始返回数据
        ctx.body = await Question.find({
            $or: [{title: q}, {description: q}]   // 模糊搜索，title 和 description 字段
        }).limit(perPage).skip(page * perPage)  // 每一页返回 10条数据
    }
    // 检查问题 Id 是否存在
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner')
        if(!question){
            ctx.throw(404, '问题不存在')
            return
        }
        ctx.state.question = question;
        await next()
    }
    // 查询特定问题
    async findById(ctx){
        const { fields='' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
        ctx.body = question
    }
    // 创建问题
    async create(ctx){
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false },
        })
        const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save()
        ctx.body = question
    }
    // 判断是否为提问者
    async checkQuestioner(ctx, next){
        const { question } = ctx.state;
        if(question.questioner.toString() !== ctx.state.user._id){
            ctx.throw(403, '没有权限')
            return
        }
        await next()
    }
    // 修改问题
    async update(ctx){
        ctx.verifyParams({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false },
        })
        await ctx.state.question.update(ctx.request.body)
        ctx.body = ctx.state.question;
    }
    // 删除问题
    async del(ctx){
        await Question.findByIdAndRemove(ctx.params.id);
        ctx.body = {
            code: 1,
            msg: '问题删除成功'
        }
    }
    // 获取问题粉丝列表
    async listQuestionFollowers(ctx){
        const Questions = await User.find({followingQuestions: ctx.params.id})
        ctx.body = Questions
    }
}

module.exports = new QuestionsClt()