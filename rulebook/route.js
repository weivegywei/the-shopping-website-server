const https = require('https');

const url = 'https://media.wizards.com/2021/downloads/MagicCompRules%2020210419.txt'

export const getRuleBookRoute = (app) => app.get('/api/other/rulebook', async (req, res) => {
    let body = '';
    const responseFromMagic = await https.get(url, (innerRes) => {
        innerRes.on('data', function(chunk) {
            body += chunk;
          });
          innerRes.on('end', function() {
             res.json({body});
            // all data has been downloaded
          });
    });
})