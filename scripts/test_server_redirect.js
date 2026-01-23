const http = require('http');

const SHORT_CODE = process.argv[2];
const PORT = process.env.PORT || 5000;

if (!SHORT_CODE) {
  console.log('Usage: node scripts/test_server_redirect.js <shortCode>');
  process.exit(1);
}

const options = {
  hostname: 'localhost',
  port: PORT,
  path: `/${SHORT_CODE}`,
  method: 'GET',
  headers: {
    'User-Agent': 'TestScript/1.0'
  }
};

console.log(`Testing redirect for: http://localhost:${PORT}/${SHORT_CODE}`);

const req = http.request(options, (res) => {
  console.log(`\nStatus Code: ${res.statusCode}`);
  console.log('Headers:', res.headers);

  if (res.statusCode === 301 || res.statusCode === 302) {
    console.log(`\n✅ Redirect successful! Location: ${res.headers.location}`);
  } else if (res.statusCode === 404) {
    console.log('\n❌ URL not found (404)');
  } else {
    console.log(`\n⚠️ Unexpected status code: ${res.statusCode}`);
  }
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:', error.message);
});

req.end();
