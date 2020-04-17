const Router = require('koa-router');
const router = new Router({prefix: '/api'});
const {index, upload, uploadImages} = require('../controllers/home')

router.get('/', index);

router.post('/upload', upload);

router.post('/uploadImages', uploadImages);

module.exports = router;