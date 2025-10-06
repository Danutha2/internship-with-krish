const express=require('express');
const router =express.Router();
const logisticController=require('../Controller/logistic-controller');

router.get("/info",logisticController.getLogisticInfo);

module.exports=router