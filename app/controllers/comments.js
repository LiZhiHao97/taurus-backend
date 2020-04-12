const Comment = require('../models/comments');
const User = require('../models/users');
const Answer = require('../models/answers');

class CommentController {
    async find (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q);
        const { topicId, answererId } = ctx.params;
        const { rootCommentId } = ctx.query;
        ctx.body = await Comment
            .find({ content: q, topicId, answererId, rootCommentId })
            .limit(perPage)
            .skip(page * perPage)
            .populate('commentator replyTo');
    }

    async findById (ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator');
        ctx.body = comment;
    }
    
    async create (ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string', required: false }
        })
        const commentator = ctx.state.user._id;
        const { topicId, answerId } = ctx.params;
        const comment = await new Comment({...ctx.request.body, commentator, topicId, answerId}).save();
        const newComment = await Comment.findById(comment._id).populate('replyTo commentator')

        await Answer.findByIdAndUpdate(answerId, { $inc: { replyCount: 1 } });
        
        ctx.body = newComment;
    }

    async checkCommentator(ctx, next) {
        const { comment } = ctx.state;
        console.log(comment);
        if (comment.commentator.toString() !== ctx.state.user._id) {
            ctx.throw(403, "您没有权限这样做");
        }
        await next();
    }
    
    async update (ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        })
        // 只允许更新content属性
        const { content } = ctx.request.body;
        await ctx.state.comment.update(content);
        ctx.body = ctx.state.comment;
    }

    async delete (ctx) {
        await Comment.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }

    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator');
        if (!comment) {
            ctx.throw(404, '该回答不存在');
        }
        if (ctx.params.topicId && comment.topicId !== ctx.params.topicId) {
            ctx.throw(404, '该话题下没有此评论');
        }
        if (ctx.params.answererId && comment.answererId !== ctx.params.answererId) {
            ctx.throw(404, '该回答下没有此评论');
        }
        ctx.state.comment = comment;
        await next();
    }
}

module.exports = new CommentController();