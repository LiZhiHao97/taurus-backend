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
const cors = require('koa2-cors');

const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)

//跨域
app.use(cors({
    origin: function(ctx) {
      return '*'
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }));
// socket

io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('add-message', (message) => {
        io.emit('message', message);    
    });
});
  

// 链接mongoDB
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

server.listen(8000, () => console.log('app is runing on port 8000'))