'use strict';
const http = require('node:http');
const version = process.env.RELEASE_VERSION || 'unknown';
const port = Number(process.env.PORT || 3000);
const failure = process.env.SIMULATE_ERROR === 'true';
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-App-Version', version);
  if (req.url === '/health') {
    res.writeHead(200); return res.end(JSON.stringify({status:'ok', version}));
  }
  if (req.url === '/api/info') {
    res.writeHead(200); return res.end(JSON.stringify({service:'canary-demo',version}));
  }
  if (req.url === '/api/checkout') {
    if (failure && version === 'v2') {
      res.writeHead(503); return res.end(JSON.stringify({error:'simulated checkout failure',version}));
    }
    res.writeHead(200); return res.end(JSON.stringify({result:'simulated purchase accepted',version}));
  }
  res.writeHead(404); res.end(JSON.stringify({error:'not found',version}));
});
if (require.main === module) server.listen(port, '0.0.0.0', () => console.log(`Listening ${port} version=${version}`));
module.exports = {server};
