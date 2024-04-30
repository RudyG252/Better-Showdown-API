import express from 'express'
var router = express.Router();

/* GET home page. */

router.get('/test', function(req, res, next) {
    res.send("test")
})
router.get('/', function(req, res, next) {
    res.send("Hello")
});

export default router;
