const Label = require('../models/labels');

class LabelsController {
    async find (ctx) {
        ctx.body = await Label.find();
    }

    async findById (ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const label = await Label.findById(ctx.params.id).select(selectFields);
        ctx.body = label;
    }
    
    async create (ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        })
        const label = await new Label(ctx.request.body).save();
        ctx.body = label;
    }

    async update (ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        })
        const label = await Label.findByIdAndUpdate(ctx.params.id, ctx.request.body, {new: true});
        ctx.body = label;
    }
}

module.exports = new LabelsController();