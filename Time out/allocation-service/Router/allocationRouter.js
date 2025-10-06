const express= require('express')
const router=express.Router()
const allocationController=require("../Controller/allocationController");

router.get('/info',allocationController.getAllocationInfo)

module.exports=router;