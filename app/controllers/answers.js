const Answer = require('../models/answers');
const User = require('../models/users');

class AnswerController {
    async find (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q);
        ctx.body = await Answer
            .find({ content: q, topicId: ctx.params.topicId })
            .populate('answerer')
            .limit(perPage)
            .skip(page * perPage);
    }

    async findById (ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer topicId');
        ctx.body = answer;
    }
    
    async create (ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true }
        })
        const answerer = ctx.state.user._id;
        const { topicId } = ctx.params;
        const answer = await new Answer({...ctx.request.body, answerer, topicId}).save();
        const newAnswer = await Answer.findById(answer._id).populate('answerer');
        ctx.body = newAnswer;
    }

    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state;
        console.log(answer);
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, "您没有权限这样做");
        }
        await next();
    }
    
    async update (ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }

    async delete (ctx) {
        await Answer.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }

    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        if (!answer) {
            ctx.throw(404, '该回答不存在');
        }
        // 只有删改查回答时才检查此逻辑，赞和踩回答时不检查
        console.log(ctx.params.topicId);
        if (ctx.params.topicId && answer.topicId.toString() !== ctx.params.topicId) {
            ctx.throw(404, '该话题下没有此回答');
        }
        ctx.state.answer = answer;
        await next();
    }
}

module.exports = new AnswerController();