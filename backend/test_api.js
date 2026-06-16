const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000/api/research';
const TEST_TOPIC = 'Impact of space debris on active satellites';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log(`Starting automated API test...`);
  console.log(`Sending POST request to ${BACKEND_URL} with topic: "${TEST_TOPIC}"`);

  let jobId;
  try {
    const postResponse = await axios.post(BACKEND_URL, { topic: TEST_TOPIC });
    jobId = postResponse.data._id;
    console.log(`Job successfully initiated. ID: ${jobId}. Initial status: ${postResponse.data.status}`);
  } catch (error) {
    console.error('Failed to start research job:', error.message);
    process.exit(1);
  }

  // Poll job status
  console.log(`Entering polling loop...`);
  let status = 'pending';
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes max

  while (['pending', 'searching', 'reading', 'writing', 'critiquing'].includes(status) && attempts < maxAttempts) {
    attempts++;
    await wait(2000); // Wait 2s between polls
    
    try {
      const getResponse = await axios.get(`${BACKEND_URL}/${jobId}`);
      status = getResponse.data.status;
      console.log(`[Attempt ${attempts}] Status: ${status}`);

      if (status === 'completed') {
        console.log('\n--- SUCCESS! Research Job Completed ---');
        console.log(`Selected URL: ${getResponse.data.selectedUrl}`);
        console.log(`Report word count: ${getResponse.data.report.split(' ').length}`);
        console.log(`Critic score: ${getResponse.data.score}/10`);
        console.log(`Critic Feedback Preview:\n${getResponse.data.feedback.substring(0, 300)}...\n`);
        break;
      } else if (status === 'failed') {
        console.error(`\n--- FAILURE! Research Job Failed ---`);
        console.error(`Error: ${getResponse.data.error}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error polling job details:`, error.message);
    }
  }

  if (attempts >= maxAttempts) {
    console.error('Test timed out. Job took too long to complete.');
    process.exit(1);
  }

  // Cleanup: Test delete endpoint
  console.log(`Testing DELETE endpoint for job ${jobId}...`);
  try {
    const deleteResponse = await axios.delete(`${BACKEND_URL}/${jobId}`);
    console.log(`Delete response:`, deleteResponse.data);
    console.log('Automated validation completed successfully!');
  } catch (error) {
    console.error(`Failed to delete test job:`, error.message);
  }
}

runTest();
