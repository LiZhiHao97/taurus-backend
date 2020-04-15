const Message = require('../models/message');

class MessageController {
    async find(ctx) {
        ctx.body = await Message.find();
    }
    async create (ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            topicId: { type: 'string', required: true },
            answerId: { type: 'string', required: true },
            sender: { type: 'string', required: true },
            receiver: { type: 'string', required: true }
        })
        const message = await new Message(ctx.request.body).save();
        ctx.body = message;
    }

    async checkMessageExist (ctx, next) {
        const message = await Message.findById(ctx.params.id);
        if (!message) {
            ctx.throw(404, '该消息不存在');
        }
        await next();
    }
    
    async checkOwner(ctx, next) {
        const message = await Message.findById(ctx.params.id);
        console.log(message);
        console.log(ctx.state.user);
        if (message.receiver.toString() !== ctx.state.user._id) {
            ctx.throw(403, "您没有权限这样做");
        }
        await next();
    }
    
    async update (ctx) {
        ctx.verifyParams({
            isRead: { type: 'boolean', required: true }
        })
        const message = await Message.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = message;
    }

    async delete (ctx) {
        await Message.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new MessageController();