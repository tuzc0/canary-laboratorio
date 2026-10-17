const test = require('node:test');
const assert = require('node:assert/strict');
const {server} = require('../app/server');
let base;
test.before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => { await new Promise(resolve => server.close(resolve)); });
test('health responde 200', async () => {
  const r = await fetch(base + '/health'); assert.equal(r.status,200);
  assert.equal((await r.json()).status,'ok');
});
test('info expone version', async () => {
  const r = await fetch(base + '/api/info'); assert.equal(r.status,200);
  assert.ok((await r.json()).version);
});
test('checkout responde 200 sin fallos simulados', async () => {
  const r = await fetch(base + '/api/checkout'); assert.equal(r.status,200);
});
