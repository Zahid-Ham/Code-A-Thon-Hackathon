const axios = require('axios');

const TEST_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=5&status=open';

console.log('--- STARTING EONET CONNECTIVITY TEST ---');
console.log(`Target URL: ${TEST_URL}`);
console.log('Attempting to fetch data (Timeout: 20 seconds)...');

async function testConnection() {
    try {
        const start = Date.now();
        const response = await axios.get(TEST_URL, { timeout: 20000 });
        const duration = (Date.now() - start) / 1000;
        
        console.log(`\n✅ SUCCESS! Connection established in ${duration}s`);
        console.log(`Status Code: ${response.status}`);
        console.log(`Data Received: found ${response.data.events.length} events.`);
        console.log('Sample Event:', response.data.events[0].title);
    } catch (error) {
        console.error('\n❌ FAILED! Connection could not be established.');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        if (error.response) {
            console.error('Server Responded:', error.response.status);
        } else if (error.request) {
            console.error('Assessment: The request was sent but no response was received.');
            console.error('Likely Causes: Firewall blocking NASA, ISP restriction, or NASA server downtime.');
        }
    }
    console.log('\n--- TEST COMPLETE ---');
}

testConnection();
