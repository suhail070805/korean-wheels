// Korean Wheels: tiny zero-dependency server. Run: node server.js
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 3000;
const PASS = process.env.ADMIN_PASSWORD || 'admin123'; // CHANGE THIS before going live
const PUB = path.join(__dirname, 'public'), DATA = path.join(__dirname, 'data');
fs.mkdirSync(DATA, { recursive: true }); fs.mkdirSync(path.join(PUB, 'uploads'), { recursive: true });
const F = { cars: path.join(DATA, 'cars.json'), bookings: path.join(DATA, 'bookings.json') };
if (!fs.existsSync(F.cars)) fs.copyFileSync(path.join(PUB, 'seed-cars.json'), F.cars);
if (!fs.existsSync(F.bookings)) fs.writeFileSync(F.bookings, '[]');
const rd = k => JSON.parse(fs.readFileSync(F[k], 'utf8')), wr = (k, v) => fs.writeFileSync(F[k], JSON.stringify(v, null, 2));
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const COL = { Hyundai: ['#1f3a6b', '#0f1a33'], Kia: ['#7a1f1a', '#2a0d0c'], Genesis: ['#2b2f3a', '#0c0f16'], 'Mercedes-Benz': ['#8a8f99', '#2a2e36'], def: ['#33503f', '#12211a'] };
const sessions = new Set(), hits = {};
const limited = (key, max) => { const t = Date.now(), a = (hits[key] || []).filter(x => t - x < 3600e3); a.push(t); hits[key] = a; return a.length > max; };
const send = (res, code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
const body = req => new Promise((ok, no) => { let b = '', n = 0; req.on('data', c => { n += c.length; if (n > 12e6) { no(new Error('Too large')); req.destroy(); } else b += c; }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(e); } }); });
const str = (v, n = 200) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n);
const isAdmin = req => { const m = /kw_admin=([a-f0-9]+)/.exec(req.headers.cookie || ''); return !!m && sessions.has(m[1]); };
const sha = s => crypto.createHash('sha256').update(s).digest();
function cleanCar(b, old = {}) {
  const c = { ...old, uid: old.uid || crypto.randomBytes(4).toString('hex'), n: str(b.n, 80), b: str(b.b, 40), t: str(b.t, 30) || 'SUV',
    y: +b.y || new Date().getFullYear(), k: Math.max(0, +b.k || 0), p: Math.max(0, +b.p || 0), tag: str(b.tag, 40), desc: str(b.desc, 600), sold: !!b.sold };
  if (Array.isArray(b.st) && b.st.length === 5) c.st = b.st.map(v => Math.min(100, Math.max(0, +v || 0)));
  c.c = COL[c.b] || COL.def;
  if (typeof b.imageData === 'string' && /^data:image\/jpeg;base64,/.test(b.imageData)) {
    const buf = Buffer.from(b.imageData.split(',')[1], 'base64');
    if (buf.length < 6e6) { const f = 'uploads/' + c.uid + '-' + Date.now() + '.jpg'; fs.writeFileSync(path.join(PUB, f), buf); c.img = f; }
  }
  c.img = c.img || '';
  return c;
}
http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://x'), p = u.pathname, M = req.method, ip = req.socket.remoteAddress;
    if (p.startsWith('/api/')) {
      const parts = p.split('/').filter(Boolean); // api, thing, id
      if (p === '/api/cars' && M === 'GET') return send(res, 200, rd('cars').filter(c => !c.sold || (u.searchParams.get('all') && isAdmin(req))));
      if (p === '/api/me') return send(res, 200, { admin: isAdmin(req) });
      if (p === '/api/login' && M === 'POST') {
        if (limited('login' + ip, 10)) return send(res, 429, { error: 'Too many attempts. Try later.' });
        const b = await body(req);
        if (!crypto.timingSafeEqual(sha(String(b.password || '')), sha(PASS))) return send(res, 401, { error: 'Wrong password' });
        const t = crypto.randomBytes(24).toString('hex'); sessions.add(t);
        res.setHeader('Set-Cookie', `kw_admin=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`);
        return send(res, 200, { ok: true });
      }
      if (p === '/api/logout') { const m = /kw_admin=([a-f0-9]+)/.exec(req.headers.cookie || ''); if (m) sessions.delete(m[1]); res.setHeader('Set-Cookie', 'kw_admin=; Max-Age=0; Path=/'); return send(res, 200, { ok: true }); }
      if (p === '/api/bookings' && M === 'POST') {
        if (limited('book' + ip, 10)) return send(res, 429, { error: 'Too many requests' });
        const b = await body(req);
        if (!str(b.name) || !str(b.phone) || !str(b.date)) return send(res, 400, { error: 'Name, phone and date are required' });
        const all = rd('bookings');
        all.unshift({ id: crypto.randomBytes(4).toString('hex'), at: new Date().toISOString(), carId: str(b.carId, 20), carName: str(b.carName, 80), name: str(b.name, 80), phone: str(b.phone, 30), date: str(b.date, 20), type: str(b.type, 30), note: str(b.note, 400), status: 'New' });
        wr('bookings', all); return send(res, 200, { ok: true });
      }
      if (!isAdmin(req)) return send(res, 401, { error: 'Admin only' });
      if (p === '/api/bookings' && M === 'GET') return send(res, 200, rd('bookings'));
      if (parts[1] === 'bookings' && parts[2]) {
        let all = rd('bookings'); const i = all.findIndex(x => x.id === parts[2]); if (i < 0) return send(res, 404, { error: 'Not found' });
        if (M === 'PATCH') { all[i].status = str((await body(req)).status, 20) || all[i].status; } else if (M === 'DELETE') all.splice(i, 1); else return send(res, 405, {});
        wr('bookings', all); return send(res, 200, { ok: true });
      }
      if (p === '/api/cars' && M === 'POST') { const all = rd('cars'), c = cleanCar(await body(req)); if (!c.n) return send(res, 400, { error: 'Name is required' }); all.push(c); wr('cars', all); return send(res, 200, c); }
      if (parts[1] === 'cars' && parts[2]) {
        const all = rd('cars'), i = all.findIndex(x => x.uid === parts[2]); if (i < 0) return send(res, 404, { error: 'Not found' });
        if (M === 'PUT') { all[i] = cleanCar(await body(req), all[i]); wr('cars', all); return send(res, 200, all[i]); }
        if (M === 'DELETE') { all.splice(i, 1); wr('cars', all); return send(res, 200, { ok: true }); }
      }
      return send(res, 404, { error: 'Not found' });
    }
    const f = path.join(PUB, decodeURIComponent(p === '/' ? '/index.html' : p));
    if (!f.startsWith(PUB + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  } catch (e) { send(res, 400, { error: e.message }); }
}).listen(PORT, () => console.log(`Korean Wheels running: http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin.html`));
