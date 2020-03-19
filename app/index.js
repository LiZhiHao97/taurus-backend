const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const error = require('koa-json-error');
const parameter = require('koa-parameter'); 
const mongoose = require('mongoose');
const app = new Koa();
const routing = require('./routes');
const { connectionStr } = require('./config');

mongoose.connect(connectionStr, { useUnifiedTopology: true }, () => console.log('MongoDB 连接成功'));
mongoose.connection.on('error', console.error);

// 错误捕获
app.use(error({
    postFormat: (e, {stack, ...rest})  => process.env.NODE_ENV  ===  'production' ? rest : {stack, ...rest}
}));
app.use(bodyparser());
// 参数校验
app.use(parameter(app));
routing(app);

app.listen(8000, () => console.log('app is runing on port 8000'))