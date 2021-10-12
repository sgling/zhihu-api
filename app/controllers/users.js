const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')

class UsersClt {
    // 用户授权 中间件
    async checkOwner(ctx, next) {
        if(ctx.params.id !== ctx.state.user._id){
            ctx.throw(403, '没有权限')
        }
        await next()
    }
    // 获取列表
    async find(ctx){
        // 设置响应头
        // ctx.set('Allow', 'GET, POST')
        // 默认返回 10条数据
        const { per_page = 10 } = ctx.query;
        // 页数
        const page = Math.max(ctx.query.page * 1, 1) - 1 || 0;
        // 每一页的数据条数
        const perPage = Math.max(per_page * 1, 1);
        ctx.body = await User.find({
            name: new RegExp(ctx.query.q)  // 模糊搜索
        }).limit(perPage).skip(page * perPage)  // 每一页返回 10条数据
    }
    // 获取特定用户
    async findById(ctx){
        // id 校验
        // if(ctx.params.id * 1 >= db.length){
        //     ctx.throw(412)
        // }
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if(f === 'employments'){
                return 'employments.company employments.job';
            }
            if(f === 'educations'){
                return 'educations.school educations.major';
            }
            return f;
        }).join(' ');
        const user = await User.findById(ctx.params.id).select(selectFields)
        .populate(populateStr);
        if(!user){
            ctx.throw(404, '用户不存在');
            return;
        }
        ctx.body = user;
    }
    // 创建用户
    async create(ctx){
        // 请求体 校验
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        // 注册的唯一性
        const { name } = ctx.request.body
        const reqeatedUser = await User.findOne({name})
        // 判断用户是否存在
        if(reqeatedUser){
            ctx.throw(409, '用户已经存在')
            return
        }

        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    // 更新用户
    async update(ctx){
        // 请求体 校验
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false },
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if(!user){
            ctx.throw(404, '用户不存在')
            return
        }
        ctx.body = user
    }
    // 删除用户
    async del(ctx){
        const user = await User.findByIdAndRemove(ctx.params.id);
        if(!user){
            ctx.throw(404, '用户不存在');
            return;
        }
        ctx.status = 204;
    }
    // 用户登录
    async login(ctx){
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true },
        })
        const user = await User.findOne(ctx.request.body)
        // 判断用户是否存在
        if(!user){
            ctx.throw(401, '用户名或密码不正确')
            return
        }
        const { _id,name } = user
        const token = jsonwebtoken.sign({_id,name}, secret, {expiresIn: '1d'}) // 1d 表示一天
        ctx.body = { token }
    }
    // 获取粉丝列表
    async listFollowers(ctx){
        const user = await User.find({following: ctx.params.id})
        ctx.body = user
    }
    // 获取关注列表
    async listFollowing(ctx){
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if(!user){
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.following
    }
    // 检查用户是否存在
    async checkUserExist(ctx, next){
        const user = await User.findById(ctx.params.id)
        if(!user){
            ctx.throw(404, '用户不存在')
            return
        }
        await next()
    }
    // 关注
    async follow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following')
        if(!me.following.map(id => id.toString()).includes(ctx.params.id)){
            me.following.push(ctx.params.id)
            me.save()
        }
        // ctx.status = 204,
        ctx.body = {
            code: 1,
            msg: '关注成功'
        }
    }
    // 取消关注
    async unfollow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following')
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){
            me.following.splice(index, 1)
            me.save()
        }
        // ctx.status = 204,
        ctx.body = {
            code: 1,
            msg: '取消关注成功'
        }
    }
    // 获取话题列表
    async listFollowerTopics(ctx){
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if(!user){
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.followingTopics;
    } 
    // 关注话题
    async followTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        if(!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)){
            me.followingTopics.push(ctx.params.id)
            me.save()
        }
        // ctx.status = 204,
        ctx.body = {
            code: 1,
            msg: '关注话题成功'
        }
    }
    // 取消关注话题
    async unfollowTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){
            me.followingTopics.splice(index, 1)
            me.save()
        }
        // ctx.status = 204,
        ctx.body = {
            code: 1,
            msg: '取消关注话题成功'
        }
    }
    // 获取问题列表
    async listQuestion(ctx){
        const questions = await Question.find({questioner: ctx.params.id})
        ctx.body = questions
    }
    // 获取点赞列表
    async listLikingAnswers(ctx){
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
        if(!user){
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.likingAnswers;
    } 
    // 点赞答案
    async likeAnswer(ctx, next){
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
        if(!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.likingAnswers.push(ctx.params.id)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
        }
        ctx.status = 204;
        // ctx.body = {
        //     code: 1,
        //     msg: '赞答案成功'
        // }
        await next()
    }
    // 取消点赞答案
    async unlikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){
            me.likingAnswers.splice(index, 1)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
        }
        ctx.status = 204;
        // ctx.body = {
        //     code: 1,
        //     msg: '取消赞答案成功'
        // }
    }
    // 获取踩的列表
    async listDislikingAnswers(ctx){
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
        if(!user){
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.dislikingAnswers;
    } 
    // 踩答案
    async dislikeAnswer(ctx, next){
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        if(!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.dislikingAnswers.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204;
        // ctx.body = {
        //     code: 1,
        //     msg: '踩答案成功'
        // }
        await next()
    }
    // 取消踩答案
    async undislikeAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){
            me.dislikingAnswers.splice(index, 1)
            me.save()
        }
        ctx.status = 204;
        // ctx.body = {
        //     code: 1,
        //     msg: '取消踩答案成功'
        // }
    }
    // 收藏答案列表
    async listCollectingAnswers(ctx){
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
        if(!user){
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.collectingAnswers;
    } 
    // 收藏答案
    async collectAnswer(ctx, next){
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
        if(!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)){
            me.collectingAnswers.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204;
        // ctx.body = {
        //     code: 1,
        //     msg: '踩答案成功'
        // }
        await next()
    }
    // 取消收藏答案
    async uncollectAnswer(ctx){
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers')
        const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
        if(index > -1){
            me.collectingAnswers.splice(index, 1)
            me.save()
        }
        ctx.status = 204;
        // ctx.body = {
        //     code: 1,
        //     msg: '取消踩答案成功'
        // }
    }
}

module.exports = new UsersClt()