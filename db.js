// Nova Speicher: alle Ordner und Dateien liegen lokal auf dem iPhone (IndexedDB).
// Nichts wird hochgeladen – auch nicht zu GitHub.
const NovaDB = (() => {
  const NAME = 'nova', VER = 1;
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(NAME, VER);
      r.onupgradeneeded = () => {
        const d = r.result;
        const f = d.createObjectStore('folders', { keyPath: 'id', autoIncrement: true }); f.createIndex('parent', 'parent');
        const fi = d.createObjectStore('files', { keyPath: 'id', autoIncrement: true }); fi.createIndex('folder', 'folder');
        d.createObjectStore('blobs');   // id -> Blob (Originaldatei)
        d.createObjectStore('thumbs');  // id -> Blob (Vorschaubild)
        d.createObjectStore('kv');      // Einstellungen, Verlauf, Schnellzugriffe
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  const req = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  async function tx(stores, mode, fn) {
    const d = await open(), t = d.transaction(stores, mode), out = await fn(...[].concat(stores).map((s) => t.objectStore(s)));
    await new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('Abgebrochen')); });
    return out;
  }
  // Wurzel-Ordner: parent = 0
  const api = {
    // ---- Ordner ----
    folders: () => tx('folders', 'readonly', (s) => req(s.getAll())),
    addFolder: (name, parent) => tx('folders', 'readwrite', (s) => req(s.add({ name, parent: parent || 0, created: Date.now() }))),
    renameFolder: (id, name) => tx('folders', 'readwrite', async (s) => { const f = await req(s.get(id)); f.name = name; return req(s.put(f)); }),
    moveFolder: (id, parent) => tx('folders', 'readwrite', async (s) => { const f = await req(s.get(id)); f.parent = parent || 0; return req(s.put(f)); }),
    // Ordner inkl. aller Unterordner und Dateien löschen
    async deleteFolder(id) {
      const all = await api.folders(), ids = new Set([id]);
      let grew = true; while (grew) { grew = false; for (const f of all) if (ids.has(f.parent) && !ids.has(f.id)) { ids.add(f.id); grew = true; } }
      const files = (await api.files()).filter((f) => ids.has(f.folder));
      await tx(['folders', 'files', 'blobs', 'thumbs'], 'readwrite', (fo, fi, bl, th) => { for (const i of ids) fo.delete(i); for (const f of files) { fi.delete(f.id); bl.delete(f.id); th.delete(f.id); } });
      return { folders: ids.size, files: files.length };
    },
    // ---- Dateien ----
    files: () => tx('files', 'readonly', (s) => req(s.getAll())),
    async addFile(file, folder, thumb, extra = {}) {
      return tx(['files', 'blobs', 'thumbs'], 'readwrite', async (fi, bl, th) => {
        const id = await req(fi.add({ name: file.name || 'Datei', type: kind(file), mime: file.type || '', size: file.size, folder: folder || 0, added: Date.now(), fav: false, hasThumb: !!thumb, ...extra }));
        bl.put(file, id); if (thumb) th.put(thumb, id);
        return id;
      });
    },
    blob: (id) => tx('blobs', 'readonly', (s) => req(s.get(id))),
    thumb: (id) => tx('thumbs', 'readonly', (s) => req(s.get(id))),
    updateFile: (id, patch) => tx('files', 'readwrite', async (s) => { const f = await req(s.get(id)); Object.assign(f, patch); return req(s.put(f)); }),
    deleteFiles: (ids) => tx(['files', 'blobs', 'thumbs'], 'readwrite', (fi, bl, th) => { for (const id of ids) { fi.delete(id); bl.delete(id); th.delete(id); } }),
    // ---- Einstellungen / Verlauf ----
    get: (k, d) => tx('kv', 'readonly', (s) => req(s.get(k))).then((v) => (v === undefined ? d : v)),
    set: (k, v) => tx('kv', 'readwrite', (s) => req(s.put(v, k))),
    async clearAll() { await tx(['folders', 'files', 'blobs', 'thumbs'], 'readwrite', (a, b, c, d) => { a.clear(); b.clear(); c.clear(); d.clear(); }); }
  };
  function kind(f) {
    const t = (f.type || '').toLowerCase(), n = (f.name || '').toLowerCase();
    if (t.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic|heif|bmp|svg|avif)$/.test(n)) return 'image';
    if (t.startsWith('video/') || /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/.test(n)) return 'video';
    if (t.startsWith('audio/') || /\.(mp3|m4a|aac|wav|ogg|flac|opus)$/.test(n)) return 'audio';
    if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
    if (/\.(docx?|xlsx?|pptx?|txt|rtf|odt|csv|md|pages|numbers|key)$/.test(n)) return 'doc';
    return 'other';
  }
  api.kind = kind;
  return api;
})();
