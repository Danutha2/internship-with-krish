const express=require('express');
const app=express();
const port=8081
const allocationRouter=require("./Router/allocationRouter");

app.use("/allocation",allocationRouter);
app.listen(port, ()=>{
    console.log(`Allocation service is on port ${port}`);
});
