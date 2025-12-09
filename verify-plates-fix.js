#!/usr/bin/env node
/**
 * Verify plates are loading correctly
 */

const http = require('http');

console.log('\n🔧 Testing ClampingPlateManager API...\n');

const options = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/plates',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      
      console.log('API Response Status:', res.statusCode);
      console.log('\n📊 Results:');
      console.log('  - Total plates:', parsed.metadata.totalPlates);
      console.log('  - Plates in array:', parsed.plates.length);
      
      if (parsed.plates.length === 38) {
        console.log('\n✅ SUCCESS! API returns all 38 plates');
        console.log('\n📋 Sample plate:');
        console.log('  - ID:', parsed.plates[0].id);
        console.log('  - Plate Number:', parsed.plates[0].plateNumber);
        console.log('  - Shelf:', parsed.plates[0].shelf);
        console.log('  - Health:', parsed.plates[0].health);
        console.log('  - Occupancy:', parsed.plates[0].occupancy);
        
        console.log('\n✅ Fix confirmed! Now clear browser cache:');
        console.log('  1. Open Dashboard in browser');
        console.log('  2. Press F12 (DevTools)');
        console.log('  3. Go to Application tab');
        console.log('  4. Click "Local Storage" > http://localhost:3000');
        console.log('  5. Find and delete "clampingPlateResults"');
        console.log('  6. Refresh page (Cmd+R)');
        console.log('  7. Click "All Plates" in sidebar');
        process.exit(0);
      } else {
        console.log('\n❌ FAILED: Expected 38 plates, got', parsed.plates.length);
        process.exit(1);
      }
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('   Make sure ClampingPlateManager is running on port 3003');
  process.exit(1);
});

req.end();
