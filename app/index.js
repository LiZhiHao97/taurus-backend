const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const error = require('koa-json-error');
const parameter = require('koa-parameter'); 
const path = require('path');
const mongoose = require('mongoose');
const app = new Koa();
const routing = require('./routes');
const { connectionStr } = require('./config');

mongoose.connect(connectionStr, { useUnifiedTopology: true, useFindAndModify: false, useNewUrlParser: true }, () => console.log('MongoDB 连接成功'));
mongoose.connection.on('error', console.error);

app.use(koaStatic(path.join(__dirname, 'public')));
// 错误捕获
app.use(error({
    postFormat: (e, {stack, ...rest})  => process.env.NODE_ENV  ===  'production' ? rest : {stack, ...rest}
}));
app.use(koaBody({
    multipart: true, // 支持文件格式
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true,
    }
}));
// 参数校验
app.use(parameter(app));
routing(app);

app.listen(8000, () => console.log('app is runing on port 8000'))