import express from 'express'
import {getMoveArrs} from '../logFunctions.js'
var router = express.Router();
import {getUsage, getUsageMap, updateDB, getUsageFirebase} from '../usage.js'

router.get('/usageMap/:format', async function(req, res, next) {
    let usage = await getUsageMap(req.params.format)
    res.status(200).json({
        success: true,
        format: req.params.format,
        usageMap: usage,
    });
})

router.get('/usage/:month/:pokemon', async function(req, res, next) {
  let usage = await getUsageFirebase("Gen9OU", req.params.pokemon, req.params.month)
  res.status(200).json({
      success: true,
      pokemon: req.params.pokemon,
      format: "Gen9OU",
      usagePercentage: usage
  });
});

router.get('/usage/:format/:pokemon', async function(req, res, next) {
    let usage = await getUsage(req.params.format, req.params.pokemon)
    res.status(200).json({
        success: true,
        pokemon: req.params.pokemon,
        format: req.params.format,
        usagePercentage: usage
    });
});

router.get('/updateDB/:month/:format', async function(req, res) {
    "Send Request"
    let update = await updateDB(req.params.month, req.params.format, 100)
    res.status(200).json({
        success: true,
    });
  });

router.get('/', async function(req, res) {
    res.status(200).json({
        success: true,
    });
  });


export default router;
