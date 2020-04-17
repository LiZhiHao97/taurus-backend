const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({prefix: '/api/topics'});
const { secret } = require('../config');
const {
    find, findById, findByIds, findByUser, create, update, delete: del,
    checkTopicExist, checkSponsor, visit
} = require('../controllers/topics')

const auth = jwt({ secret });

router.get('/', find);
router.get('/users/:uid', findByUser);
router.post('/users', findByIds);
router.post('/', auth, create);
router.patch('/:id/visit', checkTopicExist, visit);
router.get('/:id', checkTopicExist, findById);
router.patch('/:id', auth, checkTopicExist, checkSponsor, update);
router.delete('/:id', auth, checkTopicExist, checkSponsor, del);

module.exports = router;