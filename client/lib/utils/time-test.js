// Test file for time formatting functions
// Run this with: node lib/utils/time-test.js

// Import the functions (adjust path if needed)
const { formatTimeForInput, formatTimeForDatabase } = require('./date');

console.log('🧪 Testing time formatting functions...\n');

// Test cases for formatTimeForInput
console.log('📥 Testing formatTimeForInput (MySQL TIME to HTML input):');
const inputTests = [
  '12:30:00',  // MySQL format
  '08:45:30',  // MySQL format
  '23:59:59',  // MySQL format
  '12:30',     // Already HTML format
  '08:45',     // Already HTML format
  '',          // Empty string
  null,        // Null value
  undefined,   // Undefined value
  '25:70:80',  // Invalid time
];

inputTests.forEach(test => {
  try {
    const result = formatTimeForInput(test);
    console.log(`  "${test}" → "${result}"`);
  } catch (error) {
    console.log(`  "${test}" → ERROR: ${error.message}`);
  }
});

console.log('\n📤 Testing formatTimeForDatabase (HTML input to MySQL TIME):');
const databaseTests = [
  '12:30',     // HTML format
  '08:45',     // HTML format
  '23:59',     // HTML format
  '12:30:00',  // Already MySQL format
  '08:45:30',  // Already MySQL format
  '',          // Empty string
  null,        // Null value
  undefined,   // Undefined value
  '25:70',     // Invalid time
];

databaseTests.forEach(test => {
  try {
    const result = formatTimeForDatabase(test);
    console.log(`  "${test}" → "${result}"`);
  } catch (error) {
    console.log(`  "${test}" → ERROR: ${error.message}`);
  }
});

console.log('\n✅ Testing complete!');

// Example usage scenario
console.log('\n🎯 Example usage scenario:');
console.log('1. Data from MySQL database: "14:30:00"');
const mysqlTime = '14:30:00';
const htmlTime = formatTimeForInput(mysqlTime);
console.log(`2. Formatted for HTML input: "${htmlTime}"`);
console.log(`3. User changes to: "15:45"`);
const userTime = '15:45';
const backToMysql = formatTimeForDatabase(userTime);
console.log(`4. Formatted back for MySQL: "${backToMysql}"`);
