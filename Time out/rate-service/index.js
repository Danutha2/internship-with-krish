const express=require('express');
const app=express();
const port=8083
const rateRouter= require("./Router/rateRouter");


app.use("/rate",rateRouter);

app.listen(port,()=>{
    console.log(`Rate service is on port ${port}`);

});