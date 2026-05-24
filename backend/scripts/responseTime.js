const BASE_URL = 'http://localhost:5500';
const CONCURRENT_USERS = 50; // Number of simultaneous requests

async function makeRequest(url) {
  const start = performance.now();
  try {
    const response = await fetch(`${BASE_URL}${url}`);
    const end = performance.now();
    return {
      time: end - start,
      status: response.status,
      success: true
    };
  } catch (error) {
    return {
      time: 0,
      error: error.message,
      success: false
    };
  }
}

async function stressTest(endpoint) {
  console.log(`\n--- Testing ${endpoint} with ${CONCURRENT_USERS} concurrent users ---`);
  
  // Create an array of pending promises (requests starting efficiently at the same time)
  const requests = Array(CONCURRENT_USERS).fill(endpoint).map(url => makeRequest(url));
  
  const batchStart = performance.now();
  const results = await Promise.all(requests);
  const batchTotal = performance.now() - batchStart;

  // Analysis
  const successful = results.filter(r => r.success && r.status === 200);
  const failed = results.filter(r => !r.success || r.status !== 200);
  
  if (successful.length === 0) {
    console.log("All requests failed.");
    return;
  }

  const times = successful.map(r => r.time);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`Successful: ${successful.length}`);
  console.log(`Failed:     ${failed.length}`);
  console.log(`Total Batch Time: ${batchTotal.toFixed(2)}ms`);
  console.log(`Avg Request Time: ${avg.toFixed(2)}ms`);
  console.log(`Min Request Time: ${min.toFixed(2)}ms`);
  console.log(`Max Request Time: ${max.toFixed(2)}ms`);
}

async function runTests() {
  await stressTest('/tours/api/tours');
  await stressTest('/hotels/search'); 
}

runTests();