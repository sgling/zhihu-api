const Answer = require('../models/answers')

class AnswersClt {
    // 获取答案列表
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
        ctx.body = await Answer.find({
            content: q, questionId: ctx.params.questionId   // 模糊搜索，title 和 description 字段
        }).limit(perPage).skip(page * perPage)  // 每一页返回 10条数据
    }
    // 检查答案 Id 是否存在
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer')
        if(!answer){
            ctx.throw(404, '答案不存在')
            return
        }
        // 只有在删改查答案时，才检查此逻辑。赞 和 踩 答案时候不检查
        if(ctx.params.questionId && answer.questionId !== ctx.params.questionId){
            ctx.throw(404, '该问题下没有此答案')
        }
        ctx.state.answer = answer;
        await next()
    }
    // 查询特定答案
    async findById(ctx){
        const { fields='' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
        ctx.body = answer
    }
    // 创建答案
    async create(ctx){
        ctx.verifyParams({
            content: { type: 'string', required: true },
        })
        const answerer = ctx.state.user._id;
        const { questionId } = ctx.params;
        const answer = await new Answer({...ctx.request.body, answerer, questionId }).save()
        ctx.body = answer
    }
    // 检查回答者 是否为当前登录人
    async checkAnswerer(ctx, next){
        const { answer } = ctx.state;
        if(answer.answerer.toString() !== ctx.state.user._id){
            ctx.throw(403, '没有权限')
            return
        }
        await next()
    }
    // 修改答案
    async update(ctx){
        ctx.verifyParams({
            content: { type: 'string', required: false },
        })
        await ctx.state.answer.update(ctx.request.body)
        ctx.body = ctx.state.answer;
    }
    // 删除答案
    async del(ctx){
        await Answer.findByIdAndRemove(ctx.params.id);
        ctx.body = {
            code: 1,
            msg: '答案删除成功'
        }
    }
}

module.exports = new AnswersClt()