const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({prefix: '/topics/:topicId/answers'});
const { secret } = require('../config');
const {
    find, findById, create, update, delete: del,
    checkAnswerer, checkAnswerExist
} = require('../controllers/answers');

const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', checkAnswerExist, findById);
router.post('/', auth, create);
router.get('/:id', checkAnswerExist, findById);
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del);

module.exports = router;