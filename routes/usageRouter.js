import express from 'express'
var router = express.Router();
import {getUsage, getUsageMap, updateDB, getUsageFirebase} from '../usage.js'


/* GET users listing. */
router.get('/usageMap/:format', async function(req, res, next) {
    let usage = await getUsageMap(req.params.format)
    res.status(200).json({
        success: true,
        format: req.params.format,
        usageMap: usage,
    });
})
router.get('/usage/:pokemon', async function(req, res, next) {
  let usage = await getUsageFirebase("Gen9OU", req.params.pokemon)
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


router.get('/:format', async function(req, res) {
    let test = await updateDB(req.params.format, 1)
    res.status(200).json({
        success: true,
        test
    });
  });




export default router;
