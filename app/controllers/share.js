const Share = require('../models/share');

class ShareController {
    async find(ctx) {
        const { per_page = 10 } = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(per_page * 1, 1);

        ctx.body = await Share
            .find()
            .sort({createdAt: -1})
            .populate('author')
            .limit(perPage)
            .skip(page * perPage);;
    }

    async findById(ctx) {
        const share = await Share.findById(ctx.params.id).populate('author');
        if (!share) {
            ctx.throw(404, '该分享不存在');
        }
        ctx.body = share;
    }
    
    async create (ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            content: { type: 'string', required: true },
            covers: { type: 'array', required: true }
        })
        const author = ctx.state.user._id;
        const share = await new Share({...ctx.request.body, author}).save();
        const newShare = await Share.findById(share._id).populate('author');
        ctx.body = newShare;
    }

    async checkShareExist (ctx, next) {
        const share = await Share.findById(ctx.params.id);
        if (!share) {
            ctx.throw(404, '该分享不存在');
        }
        await next();
    }
    
    async checkAuthor(ctx, next) {
        const share = await Share.findById(ctx.params.id);
        if (share.author.toString() !== ctx.state.user._id) {
            ctx.throw(403, "您没有权限这样做");
        }
        await next();
    }
    
    async update (ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false },
            content: { type: 'string', required: false },
            covers: { type: [{type: 'string'}], required: false }
        })
        const share = await Share.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = share;
    }

    async delete (ctx) {
        await Share.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new ShareController();