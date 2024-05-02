import express from 'express'
import {getUserInfo} from '../userInfo.js'
var router = express.Router();

/* GET home page. */

router.get('/:name/pages/:pages', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, "all", req.params.pages);
    res.status(200).json({
        success: true,
        user: req.params.name,
        recentMatches: userInfo
    });
})


router.get('/:name/:format/:pages', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, req.params.format, req.params.pages);
    res.status(200).json({
        success: true,
        user: req.params.name,
        recentMatches: userInfo
    });
})

router.get('/:name/:format', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, req.params.format, 1);
    res.status(200).json({
        success: true,
        user: req.params.name,
        recentMatches: userInfo
    });
})



router.get('/:name', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, "all", 1);
    res.status(200).json({
        success: true,
        user: req.params.name,
        recentMatches: userInfo
    });
})



export default router;
