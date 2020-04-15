const Topic = require('../models/topics');
const User = require('../models/users');

class TopicController {
    async find (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q);
        ctx.body = await Topic
            .find({ $or: [{ title: q }, { description: q }] })
            .populate('sponsor labels')
            .limit(perPage)
            .skip(page * perPage);
    }
    async findByIds(ctx) {
        const ids = ctx.request.body.ids;
        console.log(ids);
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
        console.log(fields);
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
    
    // async listTopicFollowers (ctx) {
    //     const users = await User.find({ tags: ctx.params.id });
    //     ctx.body = users;
    // }
}

module.exports = new TopicController();