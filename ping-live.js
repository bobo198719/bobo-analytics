const https = require('https');

https.get('https://www.boboanalytics.com/api/v2/restaurant/dashboard', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    console.log(`Body: ${data.substring(0, 500)}`);
  });
}).on('error', (e) => {
  console.error(e);
});
