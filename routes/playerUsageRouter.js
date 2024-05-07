import express from 'express'
var router = express.Router();
import {getPlayerUsage, getPlayerUsageMap} from '../usage.js'
import {getUserInfo} from '../userInfo.js'

router.get('/:name/:format/:pokemon', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, req.params.format, 1);
    let playerUsage = await getPlayerUsage(userInfo, req.params.pokemon);
    res.status(200).json({
        success: true,
        user: req.params.name,
        usagePercentage: playerUsage
    });
})

router.get('/:name/:pokemon', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, 'Gen9OU', 1);
    let playerUsage = await getPlayerUsage(userInfo, req.params.pokemon, req.params.name);
    res.status(200).json({
        success: true,
        user: req.params.name,
        usagePercentage: playerUsage
    });
})

router.get('/:name', async function(req, res, next) {
    let userInfo = await getUserInfo(req.params.name, 'Gen9OU', 5);
    let playerUsage = await getPlayerUsageMap(userInfo, req.params.name);
    res.status(200).json({
        success: true,
        user: req.params.name,
        usageMap: playerUsage
    });
})


export default router;