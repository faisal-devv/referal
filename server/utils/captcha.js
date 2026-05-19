const https = require('https');

const verifyHcaptcha = (token) => new Promise((resolve) => {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret || !token) { resolve(false); return; }
  const params = `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`;
  const req = https.request({
    hostname: 'hcaptcha.com', path: '/siteverify', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(params) },
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => { try { resolve(JSON.parse(data).success === true); } catch { resolve(false); } });
  });
  req.on('error', () => resolve(false));
  req.write(params);
  req.end();
});

module.exports = { verifyHcaptcha };
