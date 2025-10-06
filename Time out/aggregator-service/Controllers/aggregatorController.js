
// Controller method
exports.aggregator = async (req, res) => {
  try {
    const result = await scatterGather();
    res.json(result); // single combined object
  } catch (err) {
    console.error("Aggregator Error:", err.message);
  }
};

// to make sure all services not called by orderly

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//For the data fetching and time out
async function fetchWithTimeout(url, timeout = 2000) { 
  const fetchPromise = fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Failed ${url}`);
    return res.json();
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${timeout}ms for ${url}`)), timeout)
  );

  return Promise.race([fetchPromise, timeoutPromise]);
}

// Scatter–Gather logic with random order and timeout
async function scatterGather() {
  const services = [
    { name: "allocation", url: "http://allocation:8081/allocation/info?company=Fortude" },
    { name: "logistic", url: "http://logistic:8082/logistic/info?company=Fortude" },
    { name: "rate", url: "http://rate:8083/rate/infomations?company=Fortude" },
  ];

  // Step 1: Shuffling
  const shuffled = shuffle(services);

  const responses = await Promise.all(
    shuffled.map(async (svc) => {
      try {
        const data = await fetchWithTimeout(svc.url, 2000); // 2s timeout
        return { name: svc.name, data, timeout: false };
      } catch (err) {
        console.warn(err.message);
        return { name: svc.name, data: {}, timeout: true }; // mark as timed out
      }
    })
  );

  // Step 3: Gather – reconstruct based on service name
  const allocationRes = responses.find((r) => r.name === "allocation") || {};
  const logisticRes   = responses.find((r) => r.name === "logistic")   || {};
  const rateRes       = responses.find((r) => r.name === "rate")       || {};

  // Step 4: Create combined object with timeout handling
  return new CompanyInformation(
    rateRes.timeout ? "Not Responded" : rateRes.data.company || "Unknown Company", 
    new Date().toISOString(), // always current time
    rateRes.timeout ? "Not Responded" : rateRes.data.rate || 0,
    allocationRes.timeout ? "Not Responded" : allocationRes.data.duration || "N/A",
    logisticRes.timeout ? "Not Responded" : logisticRes.data.locations || "N/A"
  );
}

// Class definition
class CompanyInformation {
  constructor(company, time, rate, duration, location) {
    this.company = company;
    this.time = time;
    this.rate = rate;
    this.duration = duration;
    this.location = location;
  }
}
