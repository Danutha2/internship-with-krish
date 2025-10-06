// function sleep(ms){
//       return new Promise(resolve => setTimeout(resolve, ms));
// }

exports.getAllocationInfo =async (req,res)=>{

    const date= new Date();
    const company = req.query.company;
    const time =date.toISOString();
    const duration =Math.floor(Math.random() * (100 - 10 + 1)) + 10;

    // await sleep(40000);

    return res.json({
        company: company,
        time:time,
        duration:duration
    });

    
}