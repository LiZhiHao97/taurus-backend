const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({ prefix: '/api/labels' });
const {
    find, findById, create, update,
    listLabelsFollowers, checkLabelExist,
    listTopics
} = require('../controllers/labels');
const { secret } = require('../config');
const auth = jwt({ secret });

router.get('/', find);

router.post('/', auth, create);

router.get('/:id', checkLabelExist, findById);

router.patch('/:id', checkLabelExist, auth, update);

router.get('/:id/followers', checkLabelExist, listLabelsFollowers);

router.get('/:id/topics', checkLabelExist, listTopics);

module.exports = router;