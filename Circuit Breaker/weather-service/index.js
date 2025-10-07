const express = require('express');
const app = express();
const port = 4000;

// Simulate random failures
app.get('/weather', (req, res) => {
  const random = Math.random();
  if (random < 0.5) {
    // 50% chance to fail
    res.status(500).send('Weather service failed!');
  } else {
    res.send({ temperature: 28, condition: 'Sunny' });
  }
});

app.listen(port, () => {
  console.log(`Weather service running on http://localhost:${port}`);
});
