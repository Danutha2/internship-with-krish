// function sleep(ms){
//     return new Promise(reslove =>{setTimeout(reslove,ms)})
// }

exports.getLogisticInfo=async (req,res)=>{
    const company = req.query.company;
    const time =Date.now().toString;
    const locations=["Colombo","Bandarawela","Badulla"]

    // await sleep(70000);

    res.json({
        company:company,
        time:time,
        locations:locations
    })
}