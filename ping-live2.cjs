const https = require('https');

function pingSite() {
    https.get('https://www.boboanalytics.com/api/v2/restaurant/dashboard', (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Status: ${res.statusCode}`);
        if(res.statusCode === 200 || data.includes('total_revenue')) {
            console.log(`SUCCESS! Live API is up and routing! Data: ${data.substring(0, 50)}`);
            process.exit(0);
        } else {
            console.log(`Still getting: ${res.statusCode}. Wait 3s...`);
            setTimeout(pingSite, 3000);
        }
      });
    }).on('error', (e) => {
      console.error(e);
      setTimeout(pingSite, 3000);
    });
}
pingSite();
