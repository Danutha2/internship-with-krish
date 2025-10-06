// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

exports.getRateInfo = async (req, res) => {
    const companyName = req.query.company;
    const epochTime = Date.now();
    const value = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000; 
    // await sleep(5000);

    res.json({
        company: companyName,
        time: epochTime,
        rate: value
    });
};
