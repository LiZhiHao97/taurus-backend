const Topic = require('../models/topics');
const User = require('../models/users');
const recommend = require('../recommend/collaborative-filtering')
const Label = require('../models/labels')
class TopicController {
    async find (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q);
        ctx.body = await Topic
            .find({ $or: [{ title: q }, { description: q }] })
            .sort({hot: -1})
            .populate('sponsor labels')
            .limit(perPage)
            .skip(page * perPage);
    }
    async findByIds(ctx) {
        const ids = ctx.request.body.ids;
        const result = [];
        for (let item of ids) {
            const topic = await Topic.find({_id: item})
                .populate('sponsor labels');
            if (!topic) {
                ctx.throw(404, '存在话题不存在');
            }
            result.push(topic[0]);
        }
        ctx.body = result;
    }
    
    async findByUser(ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        ctx.body = await Topic
            .find({ sponsor: ctx.params.uid})
            .sort({createdAt: -1})
            .populate('sponsor labels')
            .limit(perPage)
            .skip(page * perPage);
    }
    
    async findById (ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const topic = await Topic.findById(ctx.params.id).select(selectFields).populate('sponsor labels');
        ctx.body = topic;
    }
    
    async create (ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false }
        })
        const topic = await new Topic({...ctx.request.body, sponsor: ctx.state.user._id}).save();

        const me = await User.findById(ctx.state.user._id).select('+createTopics');
        if (!me.createTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.createTopics.push(topic._id);
            me.save();
        }
        ctx.body = topic;
    }

    async checkSponsor(ctx, next) {
        const { topic } = ctx.state;
        if (topic.sponsor.toString() !== ctx.state.user._id) {
            ctx.throw(403, "您没有权限这样做");
        }
        await next();
    }
    
    async update (ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false }
        })
        await ctx.state.topic.update(ctx.request.body);
        ctx.body = ctx.state.topic;
    }

    async delete (ctx) {
        await Topic.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }

    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id).select('+sponsor');
        if (!topic) {
            ctx.throw(404, '该话题不存在');
        }
        ctx.state.topic = topic;
        await next();
    }
    
    async visit(ctx) {
        ctx.verifyParams({
            hot: { type: 'number', required: true },
            visitorCount: { type: 'number', required: true }
        })
        await ctx.state.topic.update(ctx.request.body);
        ctx.status = 204;
    }
    
    // async listTopicFollowers (ctx) {
    //     const users = await User.find({ tags: ctx.params.id });
    //     ctx.body = users;
    // }


    async recommendByCF(ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);

        // 获取关注的用户
        const me = await User.findById(ctx.state.user._id).select('+following').populate('following');
        const followingUsers = me.following;

        if (followingUsers.length) {
            // 获取关注用户的所有标签
            let tags = new Set();
            for (let user of followingUsers) {
                for (let tag of user.tags) {
                    tags.add(tag);
                }
            }
            tags = [...tags];
            // 获取关注用户感兴趣的话题
            let allTopics = await Topic.find({ labels: { $in: tags }}).select('labels');
            // 构建ratings数组
            const ratings = new Array();
            for (let i = 0; i < followingUsers.length; i++) {
                ratings[i] = new Array()
                for (let j = 0; j < allTopics.length; j++) {
                    const intersection = followingUsers[i].tags.filter((v) => {
                        return allTopics[j].labels.indexOf(v) !== -1
                    })
                    if (intersection.length) {
                        ratings[i][j] = 1;
                    } else {
                        ratings[i][j] = 0;
                    }
                }
            }
            // 获取用户浏览记录
            const { tracks } = ctx.request.body;
            const myRatings = new Array(allTopics.length);
            for (let i = 0; i < myRatings.length; i++) {
                if (tracks.indexOf(allTopics[i]._id.toString()) !== -1) {
                    myRatings[i] = 1;
                } else {
                    myRatings[i] = 0;
                }
            }
            ratings.push(myRatings);

            // 执行协同过滤算法
            const result = recommend.cFilter(ratings, ratings.length - 1);
            console.log(result);

            const recommendTopicsIds = []
            for (let i = 0; i < result.length; i++) {
                recommendTopicsIds.push(allTopics[result[i]]._id);
            }

            // 返回推荐结果
            ctx.body = await Topic
                .find({_id: { $in: recommendTopicsIds }})
                .populate('sponsor labels')
                .limit(perPage)
                .skip(page * perPage);
        } else {
            ctx.body = await Topic
                .find()
                .sort({hot: -1})
                .populate('sponsor labels')
                .limit(perPage)
                .skip(page * perPage);
        }
    }
}

module.exports = new TopicController();