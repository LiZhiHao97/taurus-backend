const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({prefix: '/api/message'});
const { secret } = require('../config');
const {
    find, create, update,
    checkMessageExist, checkOwner,
    delete: del
} = require('../controllers/message')

const auth = jwt({ secret });

router.get('/', find);
// router.get('/users/:uid', findByUser);
// router.post('/users', findByIds);
router.post('/', auth, create);
// router.get('/:id', checkTopicExist, findById);
router.patch('/:id', auth, checkMessageExist, checkOwner, update);
router.delete('/:id', auth, checkMessageExist, checkOwner, del);

module.exports = router;