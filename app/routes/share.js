const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({prefix: '/api/share'});
const { secret } = require('../config');
const {
    find, findById, findByUser, create, update,
    checkShareExist, checkAuthor,
    delete: del
} = require('../controllers/share')

const auth = jwt({ secret });

router.get('/', find);
router.get('/:id', findById);
router.get('/users/:uid', findByUser);
// router.post('/users', findByIds);
router.post('/', auth, create);
// router.get('/:id', checkTopicExist, findById);
router.patch('/:id', auth, checkShareExist, checkAuthor, update);
router.delete('/:id', auth, checkShareExist, checkAuthor, del);

module.exports = router;