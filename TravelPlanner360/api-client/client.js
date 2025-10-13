import 'dotenv/config';
import fetch from 'node-fetch';

const API_VERSION = process.env.API_VERSION || '2';
const BASE_URL = process.env.BASE_URL;
const from = process.env.FROM;
const destination = process.env.DESTINATION;
const date = process.env.DATE;
const location = process.env.LOCATION;

async function callApi() {
  const endpoint = `${BASE_URL}/v${API_VERSION}/trips/search?from=${from}&destination=${destination}&date=${date}&location=${location}`;

  console.log(`🔹 Calling: ${endpoint}`);

  try {
    const response = await fetch(endpoint);
    const result = await response.json();
    console.log(' API Response:', result);
  } catch (error) {
    console.error(' Error calling API:', error.message);
  }
}

callApi();
