const path = require('path');

class HomeController {
    index(ctx) {
        ctx.body = '<h1>这是主页</h1>';
    }

    upload(ctx) {
        const file = ctx.request.files.file;
        const basename = path.basename(file.path);
        ctx.body = { url: `${ctx.origin}/uploads/${basename}`};
    }

    uploadImages(ctx) {
        const files = ctx.request.files;
        const keys = Object.keys(files);
        const result = []
        for (let key of keys) {
            const basename = path.basename(files[key].path);
            result.push(`${ctx.origin}/uploads/${basename}`);
        }
        ctx.body = result;
    }
}

module.exports = new HomeController();