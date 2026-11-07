// Nova für iPhone – Suche + Bibliothek (läuft komplett lokal im Browser)
(() => {
const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const svg = (d) => `<svg viewBox="0 0 24 24">${d}</svg>`;
const IC = {
  folder: svg('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>'),
  video: svg('<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10l5-3v10l-5-3z"/>'), audio: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  pdf: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15h6"/>'), doc: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/>'),
  other: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'),
  next: svg('<path d="M9 18l6-6-6-6"/>'), check: svg('<path d="M20 6L9 17l-5-5"/>'), star: svg('<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
  edit: svg('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'), trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'), move: svg('<path d="M5 9l-3 3 3 3M19 9l3 3-3 3M2 12h20"/>'),
  share: svg('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>'), open: svg('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>'),
  x: svg('<path d="M18 6L6 18M6 6l12 12"/>'), prev: svg('<path d="M15 18l-6-6 6-6"/>'), search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'), clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  globe: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>'), up: svg('<path d="M7 17L17 7M8 7h9v9"/>'), select: svg('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 12l3 3 5-6"/>'),
  sort: svg('<path d="M3 6h13M3 12h9M3 18h5M17 8l3-3 3 3M20 5v14"/>')
};
const icon = (n) => { const t = document.createElement('template'); t.innerHTML = IC[n] || IC.other; return t.content.firstChild; };
const fmtSize = (b) => { const u = ['B', 'KB', 'MB', 'GB']; let i = 0; while (b >= 1024 && i < 3) { b /= 1024; i++; } return (i ? b.toFixed(1) : String(Math.round(b))).replace('.', ',') + ' ' + u[i]; };
const fmtDur = (s) => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); };
let toastT; function toast(t) { const e = $('#toast'); e.textContent = t; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { e.hidden = true; }, 2600); }
const urls = new Map(); // Objekt-URLs für Vorschaubilder wiederverwenden
const thumbUrl = async (id) => { if (urls.has(id)) return urls.get(id); const b = await NovaDB.thumb(id); const u = b ? URL.createObjectURL(b) : null; urls.set(id, u); return u; };

// ---------- Einstellungen ----------
const cfg = { theme: 'system', accent: '#5b8def', engine: 'google', history: true };
const ENGINES = { google: ['Google', 'https://www.google.com/search?q='], duckduckgo: ['DuckDuckGo', 'https://duckduckgo.com/?q='], bing: ['Bing', 'https://www.bing.com/search?q='], ecosia: ['Ecosia', 'https://www.ecosia.org/search?q='] };
function applyCfg() {
  const r = document.documentElement;
  if (cfg.theme === 'system') delete r.dataset.theme; else r.dataset.theme = cfg.theme;
  r.style.setProperty('--a', cfg.accent); r.style.setProperty('--a-soft', cfg.accent + '26');
  $('meta[name=theme-color]').content = getComputedStyle(r).getPropertyValue('--bg').trim() || '#151619';
}
async function saveCfg() { await NovaDB.set('cfg', { ...cfg }); applyCfg(); }

// ---------- Ansichten ----------
let view = 'start';
function show(v) {
  view = v;
  document.querySelectorAll('.view').forEach((x) => { x.hidden = x.id !== 'v-' + v; });
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.v === v));
  if (v === 'lib') renderLib(); if (v === 'set') renderSet(); if (v === 'start') renderStart();
  window.scrollTo(0, 0);
}
document.querySelectorAll('#tabs button').forEach((b) => { b.onclick = () => show(b.dataset.v); });

// ---------- Bottom-Sheet ----------
function sheet(build) {
  return new Promise((res) => {
    const s = $('#sheet'); s.textContent = ''; s.hidden = false;
    const box = el('div', 'sh'); box.append(el('div', 'grab'));
    const close = (v) => { s.hidden = true; s.onclick = null; res(v); };
    build(box, close); s.append(box);
    s.onclick = (e) => { if (e.target === s) close(null); };
  });
}
function actions(title, list) {
  return sheet((b, close) => {
    if (title) b.append(el('h3', '', title));
    for (const a of list) { const x = el('button', 'act' + (a.danger ? ' danger' : '')); x.append(icon(a.icon), el('span', '', a.label)); x.onclick = () => { close(); a.fn(); }; b.append(x); }
  });
}
function prompt2(title, value = '', ok = 'OK', text = '') {
  return sheet((b, close) => {
    b.append(el('h3', '', title)); if (text) b.append(el('p', '', text));
    const i = el('input', 'field'); i.value = value; i.enterKeyHint = 'done'; b.append(i);
    const bt = el('div', 'btns'), c = el('button', 'btn sec', 'Abbrechen'), k = el('button', 'btn', ok);
    c.onclick = () => close(null); k.onclick = () => close(i.value.trim() || null); i.onkeydown = (e) => { if (e.key === 'Enter') k.click(); };
    bt.append(c, k); b.append(bt); setTimeout(() => { i.focus(); i.select(); }, 250);
  });
}
function confirm2(title, text, ok = 'Löschen') {
  return sheet((b, close) => {
    b.append(el('h3', '', title), el('p', '', text));
    const bt = el('div', 'btns'), c = el('button', 'btn sec', 'Abbrechen'), k = el('button', 'btn danger', ok);
    c.onclick = () => close(false); k.onclick = () => close(true); bt.append(c, k); b.append(bt);
  });
}

// =====================================================================
// Suche
// =====================================================================
const qIn = $('#q');
let links = [], hist = [];
function urlFor(q) {
  q = q.trim();
  if (/^https?:\/\//i.test(q)) return q;
  if (/^([\w-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i.test(q)) return 'https://' + q;
  return (ENGINES[cfg.engine] || ENGINES.google)[1] + encodeURIComponent(q);
}
// Öffnet in Safari (in der Home-Bildschirm-App bleibt Nova dadurch erhalten)
function openUrl(u) { const a = el('a'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; document.body.append(a); a.click(); a.remove(); }
async function go(q) {
  q = String(q || '').trim(); if (!q) return;
  if (cfg.history) { hist = [q, ...hist.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 50); await NovaDB.set('hist', hist); }
  qIn.value = ''; qIn.blur(); renderSugg(); $('#qClear').hidden = true;
  openUrl(urlFor(q));
}
function hl(text, q) { const f = document.createDocumentFragment(), i = text.toLowerCase().indexOf(q.toLowerCase()); if (!q || i < 0) { f.append(text); return f; } f.append(text.slice(0, i), el('mark', '', text.slice(i, i + q.length)), text.slice(i + q.length)); return f; }
async function renderSugg() {
  const q = qIn.value.trim(), box = $('#sugg'); box.textContent = '';
  $('#startBody').hidden = !!q || document.activeElement === qIn && hist.length > 0;
  const add = (ic, title, sub, fn, fill) => {
    const b = el('button', 'sg'); b.type = 'button'; b.append(icon(ic)); const tx = el('div', 'tx'), tt = el('div', 'tt'); tt.append(hl(title, q)); tx.append(tt); if (sub) tx.append(el('div', 'ss', sub)); b.append(tx);
    if (fill) { const f = el('span', 'fill'); f.append(icon('up')); f.onclick = (e) => { e.stopPropagation(); qIn.value = fill; qIn.focus(); renderSugg(); }; b.append(f); }
    b.onmousedown = (e) => e.preventDefault(); b.onclick = fn; box.append(b);
  };
  if (!q) {
    if (document.activeElement !== qIn) return;
    for (const h of hist.slice(0, 8)) add('clock', h, null, () => go(h), h);
    if (hist.length) { const c = el('button', 'sg'); c.append(el('span', 'ss', 'Suchverlauf löschen')); c.onmousedown = (e) => e.preventDefault(); c.onclick = async () => { hist = []; await NovaDB.set('hist', hist); renderSugg(); }; box.append(c); }
    return;
  }
  const lq = q.toLowerCase();
  // 1) direkt als Adresse/Suche
  const isUrl = /^https?:\/\//i.test(q) || /^([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i.test(q);
  add(isUrl ? 'globe' : 'search', q, isUrl ? 'Webseite öffnen' : `Mit ${(ENGINES[cfg.engine] || ENGINES.google)[0]} suchen`, () => go(q));
  // 2) Schnellzugriffe
  for (const l of links.filter((l) => l.title.toLowerCase().includes(lq) || l.url.toLowerCase().includes(lq)).slice(0, 3)) add('globe', l.title, l.url.replace(/^https?:\/\/(www\.)?/, ''), () => { openUrl(l.url); });
  // 3) Verlauf (Wortanfang zuerst)
  const hs = hist.filter((h) => h.toLowerCase().includes(lq) && h.toLowerCase() !== lq).sort((a, b) => (b.toLowerCase().startsWith(lq) ? 1 : 0) - (a.toLowerCase().startsWith(lq) ? 1 : 0)).slice(0, 5);
  for (const h of hs) add('clock', h, null, () => go(h), h);
  // 4) Bibliothek
  const files = (await NovaDB.files()).filter((f) => f.name.toLowerCase().includes(lq)).slice(0, 4);
  for (const f of files) add(f.type === 'other' ? 'other' : f.type, f.name, 'In der Bibliothek · ' + fmtSize(f.size), () => openFile(f, [f]));
}
qIn.oninput = () => { $('#qClear').hidden = !qIn.value; renderSugg(); };
qIn.onfocus = renderSugg;
qIn.onblur = () => setTimeout(() => { if (document.activeElement !== qIn) { $('#sugg').textContent = ''; $('#startBody').hidden = false; } }, 150);
$('#qClear').onclick = () => { qIn.value = ''; $('#qClear').hidden = true; qIn.focus(); renderSugg(); };
$('#searchForm').onsubmit = (e) => { e.preventDefault(); go(qIn.value); };

// Schnellzugriffe
let editLinks = false;
const DEFAULT_LINKS = [{ title: 'Google', url: 'https://www.google.com' }, { title: 'YouTube', url: 'https://www.youtube.com' }, { title: 'Wikipedia', url: 'https://de.wikipedia.org' }, { title: 'GitHub', url: 'https://github.com' }];
function renderLinks() {
  const box = $('#links'); box.textContent = '';
  links.forEach((l, i) => {
    const a = el('button', 'lk'), ic = el('span', 'ic'); let host = ''; try { host = new URL(l.url).hostname; } catch {}
    const img = new Image(); img.src = `https://${host}/favicon.ico`; img.onerror = () => { img.remove(); ic.textContent = (l.title || host)[0].toUpperCase(); }; ic.append(img);
    a.append(ic, el('span', '', l.title));
    if (editLinks) { const d = el('button', 'del', '×'); d.onclick = async (e) => { e.stopPropagation(); links.splice(i, 1); await NovaDB.set('links', links); renderLinks(); }; a.append(d); }
    a.onclick = () => { if (!editLinks) openUrl(l.url); };
    box.append(a);
  });
  if (editLinks || !links.length) {
    const a = el('button', 'lk'), ic = el('span', 'ic', '+'); a.append(ic, el('span', '', 'Hinzufügen'));
    a.onclick = async () => {
      const u = await prompt2('Schnellzugriff hinzufügen', 'https://', 'Weiter', 'Adresse der Webseite'); if (!u) return;
      let url = /^https?:\/\//i.test(u) ? u : 'https://' + u; try { url = new URL(url).href; } catch { return toast('Ungültige Adresse'); }
      const t = await prompt2('Name', new URL(url).hostname.replace(/^www\./, '').split('.')[0].replace(/^./, (c) => c.toUpperCase()), 'Speichern'); if (!t) return;
      links.push({ title: t.slice(0, 30), url }); await NovaDB.set('links', links); renderLinks();
    };
    box.append(a);
  }
}
$('#editLinks').onclick = () => { editLinks = !editLinks; $('#editLinks').textContent = editLinks ? 'Fertig' : 'Bearbeiten'; renderLinks(); };
async function renderStart() {
  renderLinks();
  const box = $('#recent'); box.textContent = '';
  const files = (await NovaDB.files()).sort((a, b) => b.added - a.added).slice(0, 12);
  if (!files.length) { box.append(el('div', 'empty', 'Noch keine Dateien. Füge im Tab „Bibliothek“ Fotos, Videos oder Dokumente hinzu.')); box.firstChild.style.padding = '18px'; return; }
  for (const f of files) box.append(await fileCard(f, files));
}
function tickClock() { const n = new Date(); $('#clock').textContent = n.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · ' + n.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); }

// =====================================================================
// Bibliothek
// =====================================================================
const lib = { cur: 0, sel: new Set(), selecting: false, type: 'all', q: '', sort: 'new', folders: [], files: [] };
const TYPES = [['all', 'Alle'], ['fav', '★ Favoriten'], ['image', 'Fotos'], ['video', 'Videos'], ['audio', 'Audio'], ['pdf', 'PDF'], ['doc', 'Dokumente'], ['other', 'Sonstige']];
const LABEL = { image: 'Foto', video: 'Video', audio: 'Audio', pdf: 'PDF', doc: 'Dokument', other: 'Datei' };
const kids = (id) => lib.folders.filter((f) => f.parent === id);
function subtree(id) { const out = new Set([id]); let g = true; while (g) { g = false; for (const f of lib.folders) if (out.has(f.parent) && !out.has(f.id)) { out.add(f.id); g = true; } } return out; }
const countIn = (id) => { const s = subtree(id); return lib.files.filter((f) => s.has(f.folder)).length; };
function pathOf(id) { const out = []; let c = lib.folders.find((f) => f.id === id), g = 0; while (c && g++ < 1000) { out.unshift(c); c = lib.folders.find((f) => f.id === c.parent); } return out; }

async function renderLib() {
  [lib.folders, lib.files] = await Promise.all([NovaDB.folders(), NovaDB.files()]);
  if (lib.cur && !lib.folders.some((f) => f.id === lib.cur)) lib.cur = 0;
  lib.sel = new Set([...lib.sel].filter((id) => lib.files.some((f) => f.id === id)));
  // Breadcrumbs: Bibliothek › Bilder › Wallpaper
  const cr = $('#crumbs'); cr.textContent = '';
  const root = el('button', '', 'Bibliothek'); root.onclick = () => openFolder(0); cr.append(root);
  for (const f of pathOf(lib.cur)) { cr.append(icon('next')); const b = el('button', '', f.name); b.onclick = () => openFolder(f.id); cr.append(b); }
  cr.scrollLeft = 1e6;
  // Typ-Filter
  const ch = $('#typeChips'); ch.textContent = '';
  for (const [k, l] of TYPES) { const c = el('button', 'chip' + (lib.type === k ? ' on' : ''), l); c.onclick = () => { lib.type = k; renderLib(); }; ch.append(c); }
  // Inhalt
  const g = $('#grid'); g.textContent = ''; g.classList.toggle('selecting', lib.selecting);
  const q = lib.q.toLowerCase();
  const scope = q ? subtree(lib.cur) : new Set([lib.cur]);
  let files = lib.files.filter((f) => scope.has(f.folder) && (!q || f.name.toLowerCase().includes(q)) && (lib.type === 'all' || (lib.type === 'fav' ? f.fav : f.type === lib.type)));
  const sorts = { new: (a, b) => b.added - a.added, old: (a, b) => a.added - b.added, az: (a, b) => a.name.localeCompare(b.name, 'de'), size: (a, b) => b.size - a.size };
  files.sort(sorts[lib.sort]);
  const folders = q || lib.type !== 'all' ? lib.folders.filter((f) => q && scope.has(f.parent) && f.name.toLowerCase().includes(q)) : kids(lib.cur).sort((a, b) => a.name.localeCompare(b.name, 'de'));
  for (const f of folders) g.append(folderCard(f));
  if (!files.length && !folders.length) {
    const e = el('div', 'empty'); e.append(icon('folder'));
    e.append(document.createTextNode(q ? `Nichts gefunden für „${lib.q}“.` : lib.type !== 'all' ? 'Keine passenden Dateien in diesem Ordner.' : 'Dieser Ordner ist leer. Tippe auf „Hinzufügen“, um Fotos, Videos oder Dateien zu speichern, oder lege mit „Ordner“ einen Unterordner an.'));
    g.append(e);
  }
  for (const f of files) g.append(await fileCard(f, files));
  renderSel();
}
function openFolder(id) { lib.cur = id; lib.q = ''; $('#libQ').value = ''; lib.sel.clear(); renderLib(); window.scrollTo(0, 0); }
function longPress(node, fn) {
  let t = null, moved = false;
  node.addEventListener('touchstart', (e) => { moved = false; t = setTimeout(() => { t = null; node.dataset.lp = '1'; if (navigator.vibrate) navigator.vibrate(10); fn(); }, 480); }, { passive: true });
  node.addEventListener('touchmove', () => { moved = true; clearTimeout(t); }, { passive: true });
  node.addEventListener('touchend', () => clearTimeout(t));
  node.addEventListener('contextmenu', (e) => { e.preventDefault(); fn(); });
}
function folderCard(f) {
  const c = el('button', 'card folder'); c.append(icon('folder'));
  const n = countIn(f.id), subs = kids(f.id).length;
  const tx = el('div'); tx.style.width = '100%'; tx.append(el('div', 'nm', f.name), el('div', 'sz', `${n} Datei${n === 1 ? '' : 'en'}${subs ? ` · ${subs} Ordner` : ''}`)); c.append(tx);
  c.onclick = () => { if (c.dataset.lp) { delete c.dataset.lp; return; } openFolder(f.id); };
  longPress(c, () => folderMenu(f));
  return c;
}
async function fileCard(f, list) {
  const c = el('button', 'card' + (lib.sel.has(f.id) ? ' sel' : '')), th = el('div', 'thumb');
  if (f.hasThumb) { const u = await thumbUrl(f.id); if (u) { const i = new Image(); i.src = u; i.alt = ''; th.append(i); } }
  if (!f.hasThumb) th.append(icon(f.type));
  if (f.type === 'video') th.append(el('span', 'dur', f.duration ? fmtDur(f.duration) : 'Video'));
  else if (!f.hasThumb) th.append(el('span', 'tag', (f.name.split('.').pop() || '').toUpperCase().slice(0, 5)));
  const chk = el('span', 'chk'); chk.append(icon('check')); th.append(chk);
  if (f.fav) { const s = el('span', 'fav'); s.append(icon('star')); th.append(s); }
  const m = el('div', 'meta'); m.append(el('div', 'nm', f.name), el('div', 'sz', `${fmtSize(f.size)} · ${LABEL[f.type]}`));
  c.append(th, m);
  c.onclick = () => { if (c.dataset.lp) { delete c.dataset.lp; return; } if (lib.selecting && view === 'lib') { toggleSel(f.id); return; } openFile(f, list); };
  longPress(c, () => fileMenu(f, list));
  return c;
}
function toggleSel(id) { lib.sel.has(id) ? lib.sel.delete(id) : lib.sel.add(id); renderLib(); }
function renderSel() {
  const b = $('#selBar'); b.hidden = !lib.selecting; b.textContent = ''; if (!lib.selecting) return;
  const ids = [...lib.sel];
  b.append(el('b', '', ids.length ? `${ids.length} ausgewählt` : 'Dateien antippen'));
  const mk = (label, fn, cls = '') => { const x = el('button', 'mini ' + cls, label); x.disabled = !ids.length && label !== 'Alle' && label !== 'Fertig'; x.onclick = fn; b.append(x); };
  mk('Alle', () => { const q = lib.q.toLowerCase(); lib.files.filter((f) => f.folder === lib.cur && (!q || f.name.toLowerCase().includes(q))).forEach((f) => lib.sel.add(f.id)); renderLib(); });
  mk('Verschieben', async () => { const t = await pickFolder('Verschieben nach', new Set()); if (t == null) return; for (const id of ids) await NovaDB.updateFile(id, { folder: t }); toast(`${ids.length} verschoben`); lib.sel.clear(); renderLib(); });
  mk('★', async () => { const anyOff = lib.files.some((f) => lib.sel.has(f.id) && !f.fav); for (const id of ids) await NovaDB.updateFile(id, { fav: anyOff }); renderLib(); });
  mk('Löschen', async () => { if (!(await confirm2(`${ids.length} Datei(en) löschen?`, 'Die Dateien werden aus Nova auf diesem iPhone entfernt.'))) return; await NovaDB.deleteFiles(ids); ids.forEach((i) => urls.delete(i)); lib.sel.clear(); toast('Gelöscht'); renderLib(); }, 'danger');
  mk('Fertig', () => { lib.selecting = false; lib.sel.clear(); renderLib(); });
}
// Ordner-Auswahl (für Verschieben)
function pickFolder(title, exclude) {
  return sheet((b, close) => {
    b.append(el('h3', '', title)); const t = el('div', 'tree');
    const row = (id, name, depth) => { const x = el('button'); x.style.paddingLeft = 4 + depth * 18 + 'px'; x.append(icon('folder'), el('span', '', name)); x.disabled = exclude.has(id); x.onclick = () => close(id); t.append(x); };
    row(0, 'Bibliothek (oberste Ebene)', 0);
    const walk = (p, d) => { for (const f of kids(p).sort((a, c) => a.name.localeCompare(c.name, 'de'))) { row(f.id, f.name, d); if (!exclude.has(f.id)) walk(f.id, d + 1); } };
    walk(0, 1); b.append(t);
    const c = el('button', 'btn sec full', 'Abbrechen'); c.style.marginTop = '10px'; c.onclick = () => close(null); b.append(c);
  });
}
function folderMenu(f) {
  actions(f.name, [
    { icon: 'folder', label: 'Öffnen', fn: () => openFolder(f.id) },
    { icon: 'edit', label: 'Umbenennen', fn: async () => { const n = await prompt2('Ordner umbenennen', f.name, 'Speichern'); if (n) { await NovaDB.renameFolder(f.id, n.slice(0, 60)); renderLib(); } } },
    { icon: 'move', label: 'Verschieben', fn: async () => { const t = await pickFolder(`„${f.name}“ verschieben nach`, subtree(f.id)); if (t == null) return; await NovaDB.moveFolder(f.id, t); toast('Verschoben'); renderLib(); } },
    { icon: 'trash', label: 'Löschen', danger: true, fn: async () => { const n = countIn(f.id), s = subtree(f.id).size - 1; if (!(await confirm2(`„${f.name}“ löschen?`, `Der Ordner${s ? ` mit ${s} Unterordner(n)` : ''} und ${n} Datei(en) werden gelöscht.`))) return; await NovaDB.deleteFolder(f.id); toast('Ordner gelöscht'); renderLib(); } }
  ]);
}
function fileMenu(f, list) {
  actions(f.name, [
    { icon: 'open', label: 'Öffnen', fn: () => openFile(f, list) },
    { icon: 'share', label: 'Teilen / In Fotos oder Dateien sichern', fn: () => shareFile(f) },
    { icon: 'star', label: f.fav ? 'Aus Favoriten entfernen' : 'Zu Favoriten', fn: async () => { await NovaDB.updateFile(f.id, { fav: !f.fav }); refresh(); } },
    { icon: 'edit', label: 'Umbenennen', fn: async () => { const n = await prompt2('Datei umbenennen', f.name, 'Speichern'); if (n) { await NovaDB.updateFile(f.id, { name: n.replace(/[\\/:*?"<>|]/g, '').slice(0, 200) }); refresh(); } } },
    { icon: 'move', label: 'Verschieben', fn: async () => { const t = await pickFolder('Verschieben nach', new Set()); if (t == null) return; await NovaDB.updateFile(f.id, { folder: t }); toast('Verschoben'); refresh(); } },
    { icon: 'select', label: 'Mehrere auswählen', fn: () => { show('lib'); lib.selecting = true; lib.sel = new Set([f.id]); renderLib(); } },
    { icon: 'trash', label: 'Löschen', danger: true, fn: async () => { if (!(await confirm2(`„${f.name}“ löschen?`, 'Die Datei wird aus Nova auf diesem iPhone entfernt.'))) return; await NovaDB.deleteFiles([f.id]); urls.delete(f.id); toast('Gelöscht'); refresh(); } }
  ]);
}
const refresh = () => (view === 'lib' ? renderLib() : view === 'start' ? renderStart() : null);
async function shareFile(f) {
  const blob = await NovaDB.blob(f.id); if (!blob) return toast('Datei nicht gefunden');
  const file = new File([blob], f.name, { type: f.mime || blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: f.name }); } catch {} return; }
  const a = el('a'); a.href = URL.createObjectURL(file); a.download = f.name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

// ---------- Betrachter (Fotos wischen, Video/Audio mit Spulen) ----------
async function openFile(start, list) {
  const media = list.filter((x) => ['image', 'video', 'audio', 'pdf'].includes(x.type));
  let i = Math.max(0, media.findIndex((x) => x.id === start.id)); if (!media.length || !media.some((x) => x.id === start.id)) { media.splice(0, media.length, start); i = 0; }
  const v = el('div', 'viewer'), top = el('div', 'vtop'), stage = el('div', 'stage'), bot = el('div', 'vbot');
  const close = el('button', 'vb'); close.append(icon('x')); const title = el('div', 't'); const share = el('button', 'vb'); share.append(icon('share'));
  top.append(close, title, share); v.append(top, stage, bot); document.body.append(v);
  let objUrl = null, sx = 0;
  const render = async () => {
    const f = media[i]; title.textContent = media.length > 1 ? `${f.name} (${i + 1}/${media.length})` : f.name;
    stage.textContent = ''; if (objUrl) URL.revokeObjectURL(objUrl);
    const blob = await NovaDB.blob(f.id); if (!blob) { stage.append(el('div', 'doc', 'Datei nicht gefunden')); return; }
    objUrl = URL.createObjectURL(blob);
    if (f.type === 'image') { const im = new Image(); im.src = objUrl; stage.append(im); }
    else if (f.type === 'video' || f.type === 'audio') {
      const m = document.createElement(f.type); m.src = objUrl; m.controls = true; m.playsInline = true; m.setAttribute('playsinline', ''); m.preload = 'metadata';
      // Letzte Position merken und fortsetzen
      m.addEventListener('loadedmetadata', () => { if (f.pos > 3 && f.pos < m.duration - 3) m.currentTime = f.pos; m.play().catch(() => {}); }, { once: true });
      let last = 0; m.ontimeupdate = () => { if (Date.now() - last > 3000) { last = Date.now(); f.pos = m.currentTime; NovaDB.updateFile(f.id, { pos: m.currentTime }); } };
      m.onended = () => { f.pos = 0; NovaDB.updateFile(f.id, { pos: 0 }); };
      stage.append(m);
    } else {
      const d = el('div', 'doc'); d.append(icon(f.type), el('div', '', f.name), el('div', '', fmtSize(f.size)));
      const o = el('button', 'btn', 'Öffnen / Teilen'); o.style.marginTop = '16px'; o.onclick = () => shareFile(f); d.append(o); stage.append(d);
    }
    bot.textContent = '';
    if (media.length > 1) {
      const p = el('button', 'vb'); p.append(icon('prev')); p.disabled = i === 0; p.onclick = () => { if (i > 0) { i--; render(); } };
      const n = el('button', 'vb'); n.append(icon('next')); n.disabled = i === media.length - 1; n.onclick = () => { if (i < media.length - 1) { i++; render(); } };
      bot.append(p, n);
    }
  };
  stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (media[i].type !== 'image' || Math.abs(dx) < 60) return; if (dx < 0 && i < media.length - 1) { i++; render(); } else if (dx > 0 && i > 0) { i--; render(); } });
  close.onclick = () => { const m = stage.querySelector('video,audio'); if (m) { m.pause(); NovaDB.updateFile(media[i].id, { pos: m.ended ? 0 : m.currentTime }); } if (objUrl) URL.revokeObjectURL(objUrl); v.remove(); refresh(); };
  share.onclick = () => shareFile(media[i]);
  render();
}

// ---------- Import mit Vorschaubildern ----------
function canvasThumb(src, w, h) { const s = 320, r = Math.min(1, s / Math.max(w, h)); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * r)); c.height = Math.max(1, Math.round(h * r)); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.8)); }
async function imageThumb(file) {
  const u = URL.createObjectURL(file);
  try { const im = new Image(); im.src = u; await im.decode(); return await canvasThumb(im, im.naturalWidth, im.naturalHeight); } catch { return null; } finally { URL.revokeObjectURL(u); }
}
function videoThumb(file) {
  return new Promise((res) => {
    const u = URL.createObjectURL(file), v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = u;
    const done = (r) => { clearTimeout(t); URL.revokeObjectURL(u); res(r); };
    const t = setTimeout(() => done({ thumb: null, duration: v.duration || 0 }), 8000);
    v.onloadedmetadata = () => { v.currentTime = Math.min(1, (v.duration || 2) / 3); };
    v.onseeked = async () => { try { done({ thumb: await canvasThumb(v, v.videoWidth || 320, v.videoHeight || 180), duration: v.duration }); } catch { done({ thumb: null, duration: v.duration }); } };
    v.onerror = () => done({ thumb: null, duration: 0 });
  });
}
async function importFiles(list) {
  if (!list.length) return;
  if (navigator.storage && navigator.storage.persist) { try { await navigator.storage.persist(); } catch {} }
  const p = el('div', 'progress'), lbl = el('div'), m = el('div', 'meter'), bar = el('i'); m.append(bar); p.append(lbl, m); document.body.append(p);
  let n = 0, fail = 0;
  for (const f of list) {
    lbl.textContent = `Wird gespeichert: ${n + 1} von ${list.length} – ${f.name}`; bar.style.width = (n / list.length * 100) + '%';
    try {
      const k = NovaDB.kind(f); let thumb = null, extra = {};
      if (k === 'image') thumb = await imageThumb(f);
      else if (k === 'video') { const r = await videoThumb(f); thumb = r.thumb; extra.duration = r.duration || 0; }
      await NovaDB.addFile(f, lib.cur, thumb, extra);
    } catch (e) { fail++; }
    n++;
  }
  bar.style.width = '100%'; setTimeout(() => p.remove(), 400);
  toast(fail ? `${n - fail} gespeichert, ${fail} fehlgeschlagen (Speicher voll?)` : `${n} Datei(en) gespeichert`);
  renderLib();
}
$('#addFiles').onclick = () => $('#fileIn').click();
$('#fileIn').onchange = (e) => { const l = [...e.target.files]; e.target.value = ''; importFiles(l); };
$('#newFolder').onclick = async () => { const n = await prompt2(lib.cur ? 'Neuer Unterordner' : 'Neuer Ordner', '', 'Erstellen'); if (!n) return; const id = await NovaDB.addFolder(n.slice(0, 60), lib.cur); toast('Ordner erstellt'); openFolder(id); };
$('#libQ').oninput = (e) => { lib.q = e.target.value; renderLib(); };
$('#libMenu').onclick = () => actions('Bibliothek', [
  { icon: 'select', label: lib.selecting ? 'Auswahl beenden' : 'Auswählen', fn: () => { lib.selecting = !lib.selecting; lib.sel.clear(); renderLib(); } },
  ...[['new', 'Neueste zuerst'], ['old', 'Älteste zuerst'], ['az', 'Name A–Z'], ['size', 'Größte zuerst']].map(([k, l]) => ({ icon: 'sort', label: (lib.sort === k ? '✓ ' : '') + 'Sortieren: ' + l, fn: () => { lib.sort = k; renderLib(); } })),
  ...(lib.cur ? [{ icon: 'edit', label: 'Diesen Ordner umbenennen', fn: () => folderMenu(lib.folders.find((f) => f.id === lib.cur)) }] : [])
]);
// Desktop: Dateien per Drag & Drop hinzufügen
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => { e.preventDefault(); if (view === 'lib' && e.dataTransfer.files.length) importFiles([...e.dataTransfer.files]); });

// =====================================================================
// Einstellungen
// =====================================================================
async function renderSet() {
  const b = $('#setBody'); b.textContent = '';
  const grp = (title, ...rows) => { const g = el('div', 'grp'), bx = el('div', 'box'); bx.append(...rows); g.append(el('h4', '', title), bx); b.append(g); };
  const row = (title, sub, ...ctl) => { const r = el('div', 'row'), tx = el('div', 'tx'); tx.append(el('div', '', title)); if (sub) tx.append(el('div', 'ss', sub)); r.append(tx, ...ctl); return r; };
  const sel = (opts, val, fn) => { const s = el('select'); opts.forEach(([v, l]) => s.append(new Option(l, v))); s.value = val; s.onchange = () => fn(s.value); return s; };
  const sw = (val, fn) => { const l = el('label', 'sw'), i = el('input'); i.type = 'checkbox'; i.checked = val; i.onchange = () => fn(i.checked); l.append(i, el('i')); return l; };
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!standalone) { const g = el('div', 'grp'), bx = el('div', 'box'), r = el('div', 'row'); r.append(el('div', 'tx', 'Tipp: In Safari auf „Teilen“ → „Zum Home-Bildschirm“ tippen. Dann startet Nova wie eine App im Vollbild.')); bx.append(r); g.append(bx); b.append(g); }
  const sws = el('div', 'swatches');
  ['#5b8def', '#0ea5e9', '#14b8a6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#64748b'].forEach((c) => { const x = el('button', c === cfg.accent ? 'on' : ''); x.style.background = c; x.onclick = async () => { cfg.accent = c; await saveCfg(); renderSet(); }; sws.append(x); });
  const accRow = el('div', 'row'); accRow.style.flexDirection = 'column'; accRow.style.alignItems = 'flex-start'; accRow.append(el('div', '', 'Akzentfarbe'), sws);
  grp('Aussehen', row('Design', null, sel([['system', 'Wie iPhone'], ['dark', 'Dunkel'], ['light', 'Hell']], cfg.theme, async (v) => { cfg.theme = v; await saveCfg(); })), accRow);
  grp('Suche',
    row('Suchmaschine', null, sel(Object.entries(ENGINES).map(([k, v]) => [k, v[0]]), cfg.engine, async (v) => { cfg.engine = v; await saveCfg(); })),
    row('Suchverlauf speichern', 'Für Vorschläge in der Suchleiste', sw(cfg.history, async (v) => { cfg.history = v; await saveCfg(); })),
    row('Suchverlauf', `${hist.length} Einträge`, (() => { const x = el('button', 'mini', 'Löschen'); x.onclick = async () => { hist = []; await NovaDB.set('hist', hist); toast('Suchverlauf gelöscht'); renderSet(); }; return x; })()));
  const files = await NovaDB.files(), total = files.reduce((s, f) => s + f.size, 0);
  let est = null, persisted = false; try { est = await navigator.storage.estimate(); persisted = await navigator.storage.persisted(); } catch {}
  const st = el('div', 'tx'); st.append(el('div', '', `${files.length} Dateien · ${fmtSize(total)}`));
  if (est && est.quota) { st.append(el('div', 'ss', `Belegt ${fmtSize(est.usage || 0)} von ca. ${fmtSize(est.quota)} verfügbar`)); const m = el('div', 'meter'), i = el('i'); i.style.width = Math.min(100, (est.usage / est.quota) * 100) + '%'; m.append(i); st.append(m); }
  const sr = el('div', 'row'); sr.append(st);
  grp('Speicher', sr, row('Dauerhaft speichern', persisted ? 'Aktiv – iOS löscht die Daten nicht automatisch' : 'Bitte Nova zum Home-Bildschirm hinzufügen, damit iOS die Daten nicht nach längerer Zeit entfernt', el('span', 'ss', persisted ? '✓' : '–')),
    row('Alle Bibliotheksdaten löschen', 'Ordner und Dateien in Nova', (() => { const x = el('button', 'mini danger', 'Löschen'); x.onclick = async () => { if (!(await confirm2('Wirklich alles löschen?', 'Alle Ordner und Dateien in Nova auf diesem Gerät werden entfernt.', 'Alles löschen'))) return; await NovaDB.clearAll(); urls.clear(); lib.cur = 0; toast('Bibliothek geleert'); renderSet(); }; return x; })()));
  grp('Info', row('Nova für iPhone', 'Alle Daten bleiben auf diesem Gerät. Nichts wird hochgeladen.', el('span', 'ss', 'Version 1.0')));
}

// ---------- Start ----------
(async () => {
  Object.assign(cfg, await NovaDB.get('cfg', {})); applyCfg();
  links = await NovaDB.get('links', DEFAULT_LINKS); hist = await NovaDB.get('hist', []);
  tickClock(); setInterval(tickClock, 15000);
  show('start');
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
})();
