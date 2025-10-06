const express=require('express');
const router=express.Router();
const aggregatorController=require('../Controllers/aggregatorController');


router.get("/all-info",aggregatorController.aggregator);

module.exports=router;