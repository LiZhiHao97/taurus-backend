const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const Label = require('../models/labels');
const Topic = require('../models/topics');
const Answer = require('../models/answers');
const Message = require('../models/message');
const Share = require('../models/share')
const { secret } = require('../config');

class UsersController {
    async find (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        ctx.body = await User.find({name: new RegExp(ctx.query.q)}).limit(perPage).skip(page * perPage);
    }

    async findById (ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const user = await User.findById(ctx.params.id).select(selectFields).populate('tags following');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user;
    }

    async create (ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: {type: 'string', required: true}
        });
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({name});
        if (repeatedUser) {
            ctx.throw(409, '用户名已存在');
        }
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }

    async checkOwner(ctx, next) {
        if (ctx.params.id != ctx.state.user._id) {
            ctx.throw(403, '您没有操作权限');
        }
        await next();
    }
     
    async update (ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            educations: { type: 'array', itemType: 'object', required: false },
            tags: { type: 'array', itemType: 'string', required: false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user;
    }
    async delete (ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.status = 204;
    }

    async login(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const user = await User.findOne(ctx.request.body).select(' +locations +educations +tags +likingAnswers +followingTopics +createTopics +following +likingShares +email +phone').populate('tags');
        if (!user) {
            ctx.throw(401, '用户名或密码不正确')
        }
        const { _id, name } = user;;
        const token = jsonwebtoken.sign({_id, name}, secret, {expiresIn: '1d'});
        const userData = { token, user };
        ctx.body = { userData };
    }

    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) {
            ctx.throw(404);
        }
        ctx.body = user.following;
    }

    async listFollowers (ctx) {
        const users = await User.find({ following: ctx.params.id });
        ctx.body = users;
    }
    
    async checkUserExist (ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '该用户不存在');
        }
        await next();
    }
    
    async follow (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.following.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }
    
    async followTopics (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id);
            me.save();
            await Topic.findByIdAndUpdate(ctx.params.id, { $inc: { followerCount: 1 } });
        }
        ctx.status = 204;
    }

    async unfollowTopics(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.followingTopics.splice(index, 1);
            me.save();
            await Topic.findByIdAndUpdate(ctx.params.id, { $inc: { followerCount: -1 } });
        }
        ctx.status = 204;
    }

    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).sort({createdAt: -1}).select('+followingTopics');
        const followingTopicsIds = user.followingTopics;
        const followingTopics = [];
        if (!user) {
            ctx.throw(404, '用户不存在');
        }

        for (let item of followingTopicsIds) {
            const topic = await Topic
            .find({ _id: item})
            .populate('sponsor labels')
            followingTopics.push(topic[0]);
        }
        ctx.body = followingTopics;
    }
    
    async listTopics (ctx) {
        const topics = await Topic.find({sponsor: ctx.params.id}).sort({createdAt: -1});
        ctx.body = topics;
    }

    async likeAnswer (ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id);
            me.save();
            // 投票数+1， mongoose的语法
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
        }
        ctx.status = 204;
        await next();
    }

    async unlikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.likingAnswers.splice(index, 1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
        }
        ctx.status = 204;
    }

    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).sort({createdAt: -1}).select('+likingAnswers').populate('likingAnswers');
        const likingAnswersIds = user.likingAnswers;
        const likingAswers = [];
        if (!user) {
            ctx.throw(404, '用户不存在');
        }

        for (let item of likingAnswersIds) {
            const answer = await Answer
            .find({ _id: item})
            .populate('answerer topicId')
            likingAswers.push(answer[0]);
        }
        
        ctx.body = likingAswers;
    }

    async dislikeAnswer (ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
        await next();
    }

    async undislikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.dislikingAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).sort({createdAt: -1}).select('+dislikingAnswers').populate('likingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.dislikingAnswers;
    }

    async listMessage (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        
        const messages = await Message
            .find({receiver: ctx.params.id})
            .sort({createdAt: -1})
            .populate('topicId sender')
            .limit(perPage)
            .skip(page * perPage);
        ctx.body = messages;
    }

    async readAll(ctx) {
        const messages = await Message.find({receiver: ctx.params.id});
        for (let item of messages) {
            await Message.findByIdAndUpdate(item._id, {isRead: true});
        }
        ctx.status = 204;
    }

    async listFollowingTracks(ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const { following } = ctx.request.body;
        
        const answers = await Answer
            .find({ answerer: { $in: following} })
            .sort({createdAt: -1})
            .populate('answerer')
            .limit(perPage)
            .skip(page * perPage);
        ctx.body = answers;
    }

    async likeShare (ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingShares');
        if (!me.likingShares.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingShares.push(ctx.params.id);
            me.save();
            // 投票数+1， mongoose的语法
            await Share.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } });
        }
        ctx.status = 204;
        await next();
    }

    async unlikeShare(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingShares');
        const index = me.likingShares.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.likingShares.splice(index, 1);
            me.save();
            await Share.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } });
        }
        ctx.status = 204;
    }
}

module.exports = new UsersController();