const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ prefix: '/labels' });
const {
    find, findById, create, update
} = require('../controllers/labels');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);
router.post('/', auth, create);
router.get('/:id', findById);
router.patch('/:id', auth, update);

module.exports = router;