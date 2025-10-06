const express= require("express");
const router = express.Router();
const rateController= require("../Controller/rateController");

router.get("/infomations",rateController.getRateInfo)

module.exports=router;