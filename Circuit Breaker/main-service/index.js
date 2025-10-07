const express = require('express');
const axios = require('axios');
const CircuitBreaker = require('opossum');

const app = express();
const port = 3000;

// Function that calls weather service
async function getWeather() {
  const response = await axios.get('http://localhost:4000/weather');
  return response.data;
}

// Circuit breaker options
const options = {
  timeout: 2000, 
  errorThresholdPercentage: 50, 
  resetTimeout: 5000 // Try again after 5 seconds
};

// Create breaker
const breaker = new CircuitBreaker(getWeather, options);

// Fallback if circuit is open or call fails
breaker.fallback(() => {
  return { temperature: 'N/A', condition: '⚠️ Fallback: Weather service unavailable' };
});

// Route that uses circuit breaker
app.get('/weather', async (req, res) => {
  try {
    const result = await breaker.fire();
    res.json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Show breaker state
app.get('/breaker-state', (req, res) => {
  res.send(`Circuit Breaker State: ${breaker.opened ? 'OPEN' : 'CLOSED'}`);
});

app.listen(port, () => {
  console.log(`Main service running on http://localhost:${port}`);
});
