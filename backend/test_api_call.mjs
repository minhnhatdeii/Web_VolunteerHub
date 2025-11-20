// Test the events API endpoint directly using fetch
async function testEventsAPI() {
  try {
    console.log('Testing /api/events endpoint...');

    // Test without any parameters (should return all events)
    const response = await fetch('http://localhost:5000/api/events');
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Number of events returned:', data.length);

    if (data && data.length > 0) {
      console.log('First few events:');
      data.slice(0, 3).forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} - Status: ${event.status}`);
      });
    }

    // Test with status parameter
    console.log('\nTesting with status=APPROVED...');
    const approvedResponse = await fetch('http://localhost:5000/api/events?status=APPROVED');
    const approvedData = await approvedResponse.json();
    console.log('Approved events count:', approvedData.length);

    // Test with query parameter (q instead of search)
    console.log('\nTesting with q parameter...');
    const qResponse = await fetch('http://localhost:5000/api/events?q=test');
    const qData = await qResponse.json();
    console.log('Events matching "test" query:', qData.length);

  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testEventsAPI();