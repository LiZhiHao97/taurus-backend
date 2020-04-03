const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({prefix: '/api/users'});
const {
    find, findById,
    create, update,
    delete: del,
    login, checkOwner, listFollowing, listFollowers, checkUserExist,
    follow, unfollow,
    followLabel, unfollowLabel,
    listFollowingLabels,
    listTopics,
    listLikingAnswers, likeAnswer, unlikeAnswer,
    listDislikingAnswers, dislikeAnswer, undislikeAnswer
} = require('../controllers/users')
const { secret } = require('../config');

const { checkLabelExist } = require('../controllers/labels');
const { checkAnswerExist } = require('../controllers/answers');


const auth = jwt({ secret });

router.get('/', find);

router.post('/', create);

router.get('/:id', findById);

router.patch('/:id', auth, checkOwner, update);

router.delete('/:id', auth, checkOwner, del);

router.post('/login', login);

router.get('/:id/following', listFollowing);

router.get('/:id/followers', listFollowers);

router.put('/following/:id', auth, checkUserExist, follow);

router.delete('/following/:id', auth, checkUserExist, unfollow);

router.put('/followingLabels/:id', auth, checkLabelExist, followLabel);

router.delete('/followingLabels/:id', auth, checkLabelExist, unfollowLabel);

router.get('/:id/followingLabels', listFollowingLabels);

router.get('/:id/topics', listTopics);

router.get('/:id/likingAnswers', listLikingAnswers);

router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer);

router.delete('/unlikingAnswers/:id', auth, checkAnswerExist, unlikeAnswer);

router.get('/:id/dislikingAnswers', listDislikingAnswers);

router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer);

router.delete('/undislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer);
 

module.exports = router;