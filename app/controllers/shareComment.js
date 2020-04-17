const ShareComment = require('../models/shareComment');
const User = require('../models/users');

class ShareCommentController {
    async find (ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);
        const q = new RegExp(ctx.query.q);
        const { shareId } = ctx.params;
        const { rootCommentId } = ctx.query;
        ctx.body = await ShareComment
            .find({ content: q, shareId, rootCommentId })
            .limit(perPage)
            .skip(page * perPage)
            .populate('commentator replyTo');
    }

    async findById (ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const shareComment = await ShareComment.findById(ctx.params.id).select(selectFields).populate('commentator');
        ctx.body = shareComment;
    }
    
    async create (ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string', required: false }
        })
        const commentator = ctx.state.user._id;
        const { shareId } = ctx.params;
        const shareComment = await new ShareComment({...ctx.request.body, commentator, shareId}).save();
        const newComment = await ShareComment.findById(shareComment._id).populate('replyTo commentator')
        
        ctx.body = newComment;
    }

    async checkCommentator(ctx, next) {
        const { shareComment } = ctx.state;
        if (shareComment.commentator.toString() !== ctx.state.user._id) {
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
        await ctx.state.shareComment.update({content});
        ctx.body = ctx.state.shareComment;
    }

    async delete (ctx) {
        await ShareComment.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }

    async checkCommentExist(ctx, next) {
        const shareComment = await ShareComment.findById(ctx.params.id).select('+commentator');
        if (!shareComment) {
            ctx.throw(404, '该分享不存在');
        }
        if (ctx.params.topicId && shareComment.topicId !== ctx.params.shareId) {
            ctx.throw(404, '该分享下没有此评论');
        }
        ctx.state.shareComment = shareComment;
        await next();
    }
}

module.exports = new ShareCommentController();