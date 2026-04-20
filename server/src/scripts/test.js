import fs from 'fs';
fs.writeFileSync('test_log.txt', 'Script started\n');
console.log('Test log created');
process.exit(0);
