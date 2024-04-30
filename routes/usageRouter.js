import express from 'express'
var router = express.Router();
import {getUsage} from '../usage.js'

/* GET users listing. */
router.get('/usage/:pokemon', async function(req, res, next) {
  let usage = await getUsage("gen9OU", req.params.pokemon)
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


export default router;
