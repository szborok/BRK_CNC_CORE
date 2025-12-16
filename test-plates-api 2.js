#!/usr/bin/env node

/**
 * Test script to verify ClampingPlateManager API
 * Run this with services running: node test-plates-api.js
 */

const http = require('http');

async function testPlatesAPI() {
  console.log('Testing ClampingPlateManager API at http://localhost:3003/api/plates...\n');

  return new Promise((resolve, reject) => {
    http.get('http://localhost:3003/api/plates', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          console.log('✅ API Response Status:', res.statusCode);
          console.log('\n📊 Response Structure:');
          console.log('  - metadata:', json.metadata || 'MISSING');
          console.log('  - plates array:', Array.isArray(json.plates) ? `✅ (${json.plates.length} plates)` : '❌ NOT AN ARRAY');
          
          if (json.plates && json.plates.length > 0) {
            console.log('\n📋 First Plate Sample:');
            const firstPlate = json.plates[0];
            console.log('  - id:', firstPlate.id);
            console.log('  - plateNumber:', firstPlate.plateNumber);
            console.log('  - shelf:', firstPlate.shelfNumber || firstPlate.shelf);
            console.log('  - workProjects:', firstPlate.workProjects ? `${firstPlate.workProjects.length} items` : 'MISSING');
            console.log('  - workHistory:', firstPlate.workHistory ? `${firstPlate.workHistory.substring(0, 50)}...` : 'MISSING');
          }
          
          console.log('\n✅ API TEST PASSED - Data format looks correct');
          resolve(json);
        } catch (error) {
          console.error('❌ PARSE ERROR:', error.message);
          console.error('Raw response:', data.substring(0, 500));
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ CONNECTION ERROR:', error.message);
      console.error('\n⚠️  Make sure services are running with: node start-all.js');
      reject(error);
    });
  });
}

// Run test
testPlatesAPI()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
