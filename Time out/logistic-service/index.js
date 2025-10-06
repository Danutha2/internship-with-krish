const express=require('express');
const app=express();
const port=8082
const router=require('./Router/logistic-router');

app.use('/logistic',router)

app.listen(port,()=>{
    console.log(`Logistic service is on port ${port}`);
})