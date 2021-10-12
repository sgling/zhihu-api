const Comment = require('../models/comments')

class CommentClt {
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
        const { questionId, answerId } = ctx.params;
        const { rootCommentId } = ctx.query;
        // limit(10) ==> 表示返回 10项 数据，skip(10) ==> 表示从第10项开始返回数据
        ctx.body = await Comment.find({
            content: q, questionId, answerId, rootCommentId   // 模糊搜索，title 和 description 字段
        }).limit(perPage).skip(page * perPage).populate('commentator replyTo')  // 每一页返回 10条数据
    }
    // 检查答案 Id 是否存在
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator')
        if(!comment){
            ctx.throw(404, '评论不存在')
            return
        }
        // 只有在删改查答案时，才检查此逻辑。赞 和 踩 答案时候不检查
        if(ctx.params.questionId && comment.questionId !== ctx.params.questionId){
            ctx.throw(404, '该问题下没有此评论')
        }
        // 答案 Id
        if(ctx.params.answerId && comment.answerId !== ctx.params.answerId){
            ctx.throw(404, '该答案下没有此评论')
        }
        ctx.state.comment = comment;
        await next()
    }
    // 查询特定答案
    async findById(ctx){
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
        ctx.body = comment
    }
    // 创建答案
    async create(ctx){
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string', required: false },
        })
        const commentator = ctx.state.user._id;
        const { questionId, answerId} = ctx.params;
        const comment = await new Comment({...ctx.request.body, commentator, questionId, answerId }).save()
        ctx.body = comment
    }
    // 检查回答者 是否为当前登录人
    async checkCommentator(ctx, next){
        const { comment } = ctx.state;
        if(comment.commentator.toString() !== ctx.state.user._id){
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
        const { content } = ctx.request.body;
        await ctx.state.comment.update({ content })
        ctx.body = ctx.state.comment;
    }
    // 删除答案
    async del(ctx){
        await Comment.findByIdAndRemove(ctx.params.id);
        ctx.body = {
            code: 1,
            msg: '评论删除成功'
        }
    }
}

module.exports = new CommentClt()