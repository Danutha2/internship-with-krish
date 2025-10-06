const express=require('express');
const app=express();
const port=9090
const aggregatorRouter= require('./Routers/aggregator-router');

app.use('/company',aggregatorRouter);

app.listen(port,()=>{
    console.log(`Aggregator service is on port ${port}`);
});
