const $ = id => document.getElementById(id);
async function api(u, method = 'GET', data) {
  const r = await fetch(u, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: data ? JSON.stringify(data) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { if (r.status === 401 && u !== '/api/login') show(false); throw new Error(d.error || 'Something went wrong'); }
  return d;
}
const say = t => { $('msg').textContent = t; if (t) setTimeout(() => { if ($('msg').textContent === t) $('msg').textContent = ''; }, 4000); };
const SN = ['Power', 'Comfort', 'Technology', 'Space', 'Value'];
$('sts').innerHTML = SN.map((s, i) => `<label>${s}<input type="number" min="0" max="100" value="70" data-s="${i}"></label>`).join('');
let cars = [], editing = null, photo = '';
function show(on) { $('login').classList.toggle('hide', on); $('app').classList.toggle('hide', !on); if (on) load(); }
function el(tag, props = {}, ...kids) { const e = document.createElement(tag); Object.assign(e, props); kids.forEach(k => e.append(k)); return e; }
async function load() { cars = await api('/api/cars?all=1'); drawCars(); drawBookings(); }
function drawCars() {
  const box = $('cl2'); box.replaceChildren();
  if (!cars.length) box.append(el('p', { textContent: 'No cars yet. Add your first car above.' }));
  cars.forEach(c => {
    const i = el('div', { className: 'i' }, el('b', { textContent: c.n }), c.sold ? el('span', { className: 'tag', textContent: 'Sold' }) : '', el('br'),
      el('small', { textContent: `${c.b} · ${c.t} · ${c.y} · ${Number(c.k).toLocaleString()} km · AED ${Number(c.p).toLocaleString()}` }));
    const row = el('div', { className: 'row' }, c.img ? el('img', { src: c.img, alt: '' }) : el('div', { className: 'ph' }), i,
      el('button', { className: 'b', textContent: 'Edit', onclick: () => edit(c) }),
      el('button', { className: 'b d', textContent: 'Delete', onclick: async () => { if (confirm('Delete ' + c.n + '?')) { await api('/api/cars/' + c.uid, 'DELETE'); say('Deleted'); load(); } } }));
    box.append(row);
  });
}
function edit(c) {
  editing = c.uid; photo = '';
  $('ft').textContent = 'Edit ' + c.n;
  ['n', 'b', 't', 'y', 'k', 'p', 'tag', 'desc'].forEach(f => $(f).value = c[f === 'n' ? 'n' : f] ?? '');
  $('sold').checked = !!c.sold; $('im').value = '';
  document.querySelectorAll('[data-s]').forEach((x, i) => x.value = (c.st || [70, 70, 70, 70, 70])[i]);
  scrollTo({ top: 0, behavior: 'smooth' });
}
function clear() { editing = null; photo = ''; $('cf').reset(); $('ft').textContent = 'Add a car'; document.querySelectorAll('[data-s]').forEach(x => x.value = 70); }
$('cl').onclick = clear;
function shrink(file) {
  return new Promise((ok, no) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => { const s = Math.min(1, 1400 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * s; c.height = im.height * s; c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', .82)); };
    im.onerror = () => no(new Error('That file is not an image')); im.src = u;
  });
}
$('im').onchange = async e => { try { photo = e.target.files[0] ? await shrink(e.target.files[0]) : ''; } catch (x) { say(x.message); } };
$('cf').onsubmit = async e => {
  e.preventDefault(); $('sv').disabled = true;
  const d = { n: $('n').value, b: $('b').value, t: $('t').value, y: $('y').value, k: $('k').value, p: $('p').value, tag: $('tag').value, desc: $('desc').value, sold: $('sold').checked, st: [...document.querySelectorAll('[data-s]')].map(x => x.value) };
  if (photo) d.imageData = photo;
  try { await api(editing ? '/api/cars/' + editing : '/api/cars', editing ? 'PUT' : 'POST', d); say('Saved'); clear(); load(); } catch (x) { say(x.message); }
  $('sv').disabled = false;
};
async function drawBookings() {
  const list = await api('/api/bookings'), box = $('bl2'); box.replaceChildren();
  $('nb').textContent = list.filter(b => b.status === 'New').length ? '(' + list.filter(b => b.status === 'New').length + ' new)' : '';
  if (!list.length) box.append(el('p', { textContent: 'No booking requests yet.' }));
  list.forEach(b => {
    const sel = el('select', { onchange: async () => { await api('/api/bookings/' + b.id, 'PATCH', { status: sel.value }); drawBookings(); } });
    ['New', 'Contacted', 'Confirmed', 'Done', 'Cancelled'].forEach(s => sel.append(new Option(s, s, false, s === b.status)));
    sel.style.width = 'auto';
    box.append(el('div', { className: 'row' },
      el('div', { className: 'i' }, el('b', { textContent: (b.carName || 'General visit') + ' · ' + b.type }), el('br'),
        el('small', { textContent: `${b.name} · ${b.phone} · wants ${b.date} · sent ${new Date(b.at).toLocaleString()}` }), b.note ? el('div', { textContent: b.note }) : ''),
      sel, el('button', { className: 'b d', textContent: 'Delete', onclick: async () => { if (confirm('Delete this request?')) { await api('/api/bookings/' + b.id, 'DELETE'); drawBookings(); } } })));
  });
}
$('t1').onclick = () => { $('pc').classList.remove('hide'); $('pb').classList.add('hide'); $('t1').classList.add('on'); $('t2').classList.remove('on'); };
$('t2').onclick = () => { $('pb').classList.remove('hide'); $('pc').classList.add('hide'); $('t2').classList.add('on'); $('t1').classList.remove('on'); drawBookings(); };
$('lf').onsubmit = async e => { e.preventDefault(); try { await api('/api/login', 'POST', { password: $('pw').value }); $('pw').value = ''; $('lm').textContent = ''; show(true); } catch (x) { $('lm').textContent = x.message; } };
$('out').onclick = async () => { await api('/api/logout', 'POST', {}); show(false); };
api('/api/me').then(d => show(d.admin));
