// ============================================================
//  VISOR.JS – Universal Royal Previewer · v4.0
//  Soporta: Office (Word, Excel, PPT), PDF, Imágenes, Video, Audio, Código
// ============================================================

const VISOR = {
  _path:    null,
  _name:    null,
  _dataUrl: null,
  _archivo: null,
  _overlay: null,

  /* ──────────── HELPERS ────────────────────────────── */
  _isImage: (ext) => ['png','jpg','jpeg','gif','svg','webp','bmp','ico'].includes(ext),
  _isCode:  (ext) => ['css','js','ts','json','md','txt','sql','py','java','c','cpp','xml','php','csv'].includes(ext),
  _isOffice:(ext) => ['doc','docx','xls','xlsx','ppt','pptx'].includes(ext),
  _isVideo: (ext) => ['mp4','webm','ogg'].includes(ext),
  _isAudio: (ext) => ['mp3','wav','m4a','flac'].includes(ext),

  /* ──────────── CONSTRUIR MODAL ────────────────────── */
  _build() {
    if (document.getElementById('visorOverlay')) {
      this._overlay = document.getElementById('visorOverlay');
      return;
    }
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="visor-overlay" id="visorOverlay" role="dialog" aria-modal="true">
        <div class="visor-modal" id="visorModal">
          <div class="visor-head">
            <div class="visor-ficon" id="visorFicon">📄</div>
            <div style="flex:1;min-width:0;overflow:hidden">
              <div class="visor-title" id="visorTitleTxt">—</div>
              <div class="visor-type" id="visorTypeTxt"></div>
            </div>
            <div class="visor-acts">
              <button class="btn btn-ghost btn-sm" onclick="VISOR.openTab()" title="Abrir en nueva pestaña">
                <span style="font-size:1.1rem">↗</span> <span class="d-none-mobile">Abrir</span>
              </button>
              <button class="btn btn-primary btn-sm" onclick="VISOR.download()" title="Descargar">
                <span style="font-size:1.1rem">⬇</span> <span class="d-none-mobile">Descargar</span>
              </button>
              <button class="btn btn-ghost btn-sm" onclick="VISOR.close()" title="Cerrar" style="font-size:1.2rem;padding:6px 12px">✕</button>
            </div>
          </div>
          <div id="visorBanner" style="display:none" class="visor-banner"></div>
          <div class="visor-body" id="visorBody"></div>
        </div>
      </div>`;

    document.body.appendChild(wrap.firstElementChild);
    this._overlay = document.getElementById('visorOverlay');
    this._overlay.onclick = (e) => { if (e.target === this._overlay) this.close(); };
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
  },

  /* ──────────── ABRIR ───────────────────────────────── */
  open(archivo, uploadsBasePath) {
    if (!archivo) return;
    this._build();
    const base = uploadsBasePath !== undefined ? uploadsBasePath : '';
    const ext  = (typeof getExtension === 'function' ? getExtension(archivo.archivo || '') : archivo.archivo.split('.').pop()).toLowerCase();

    // Prioridad de fuente
    const path = archivo.storageUrl || archivo.dataUrl || archivo.objectUrl || (base + (archivo.ruta || ''));

    this._path    = path;
    this._name    = archivo.archivo || 'archivo';
    this._dataUrl = archivo.dataUrl || null;
    this._archivo = archivo;

    // Actualizar Encabezado
    document.getElementById('visorFicon').textContent = (typeof getFileIcon === 'function') ? getFileIcon(ext) : '📄';
    document.getElementById('visorTitleTxt').textContent = archivo.nombre || this._name;
    document.getElementById('visorTypeTxt').textContent = `.${ext.toUpperCase()} ${archivo.descripcion ? ' — ' + archivo.descripcion : ''}`;

    this._setBanner(archivo);
    this._renderBody(ext, path, archivo);

    this._overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  _setBanner(archivo) {
    const banner = document.getElementById('visorBanner');
    let msg = '';
    if (archivo.truncado) msg = '✂️ Vista previa parcial (archivo muy grande). Descárgalo para ver completo.';
    else if (archivo.soloSesion) msg = '⚡ Archivo temporal de esta sesión. No persistirá si recargas.';

    if (msg) {
      banner.style.display = 'flex';
      banner.innerHTML = `<span style="font-size:1.2rem">⚠️</span> <span>${msg}</span>`;
    } else {
      banner.style.display = 'none';
    }
  },

  /* ──────────── RENDERIZADO UNIVERSAL ───────────────── */
  _renderBody(ext, path, archivo) {
    const body = document.getElementById('visorBody');
    body.innerHTML = '';

    if (!path) {
      body.innerHTML = this._noPreview(ext, 'No hay una ruta válida para este archivo.');
      return;
    }

    // 1. IMÁGENES
    if (this._isImage(ext)) {
      if (ext === 'svg') {
        body.innerHTML = `<iframe src="${path}" class="visor-iframe" frameborder="0" style="background:#ffffff;"></iframe>`;
      } else {
        const img = document.createElement('img');
        img.src = path;
        img.className = 'visor-img-preview';
        img.onerror = () => body.innerHTML = this._noPreview(ext, 'No se pudo cargar la imagen.');
        body.appendChild(img);
      }
    }
    // 2. PDF
    else if (ext === 'pdf') {
      body.innerHTML = `<iframe src="${path}" class="visor-iframe"></iframe>`;
    }
    // 3. OFFICE (Word, Excel, PPT)
    else if (this._isOffice(ext)) {
      if (path.startsWith('http')) {
        const officeUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(path)}&embedded=true`;
        body.innerHTML = `<iframe src="${officeUrl}" class="visor-iframe" frameborder="0"></iframe>`;
      } else {
        body.innerHTML = this._noPreview(ext, 'La previsualización de documentos Office requiere que el archivo esté subido a la nube (Supabase). Por favor, descárgalo.');
      }
    }
    // 4. VIDEO
    else if (this._isVideo(ext)) {
      body.innerHTML = `<div class="visor-media-wrap"><video controls autoplay src="${path}" class="visor-video"></video></div>`;
    }
    // 5. AUDIO
    else if (this._isAudio(ext)) {
      body.innerHTML = `
        <div class="visor-media-wrap">
          <div style="font-size:5rem;margin-bottom:20px;filter:drop-shadow(0 0 20px var(--primary))">🎵</div>
          <audio controls autoplay src="${path}" style="width:100%;max-width:500px"></audio>
        </div>`;
    }
    // 6. CÓDIGO / TEXTO
    else if (this._isCode(ext) || ext === 'html') {
      body.innerHTML = `<div class="visor-code"><pre id="visorCodePre">⌛ Procesando contenido...</pre></div>`;
      this._loadTextContent(path, archivo, ext === 'html');
    }
    // 7. FALLBACK
    else {
      body.innerHTML = this._noPreview(ext, `El formato .${ext.toUpperCase()} no tiene previsualización directa, pero puedes descargarlo para abrirlo.`);
    }
  },

  async _loadTextContent(path, archivo, isHtml) {
    const pre = document.getElementById('visorCodePre');
    try {
      let text = '';
      if (archivo.dataUrl) {
        text = atob(archivo.dataUrl.split(',')[1]);
      } else {
        const res = await fetch(path);
        text = await res.text();
      }
      if (isHtml) {
        const blob = new Blob([text], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        document.getElementById('visorBody').innerHTML = `<iframe src="${url}" sandbox="allow-scripts" class="visor-iframe"></iframe>`;
      } else {
        pre.textContent = text;
      }
    } catch (e) {
      pre.textContent = '❌ Error al cargar el contenido del archivo.';
    }
  },

  _noPreview(ext, msg) {
    return `
      <div class="visor-noprev">
        <div class="np-icon">${(typeof getFileIcon === 'function') ? getFileIcon(ext) : '📄'}</div>
        <h3 style="color:var(--txt);margin-bottom:10px;font-weight:900">Vista previa limitada</h3>
        <p style="max-width:400px;margin:0 auto 24px;line-height:1.6">${msg}</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-primary" onclick="VISOR.download()">⬇ Descargar Archivo</button>
          <button class="btn btn-secondary" onclick="VISOR.openTab()">↗ Abrir Externo</button>
        </div>
      </div>`;
  },

  openById(id, basePath) {
    const cache = window._JZ_FILE_CACHE || {};
    const archivo = cache[id];
    if (archivo) this.open(archivo, basePath || '../');
    else if (typeof TOAST !== 'undefined') TOAST.show('Archivo no encontrado', 'error');
  },

  /* ──────────── ACCIONES ────────────────────────────── */
  openTab() { if (this._path) window.open(this._path, '_blank'); },
  download() {
    if (!this._path) return;
    let url = this._path;
    // Forzar descarga directa si es de Supabase Storage
    if (url.includes('supabase.co/storage')) {
      url += url.includes('?') ? '&download=' : '?download=';
      url += encodeURIComponent(this._name);
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = this._name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  close() {
    if (this._overlay) this._overlay.classList.remove('show');
    document.body.style.overflow = '';
    const body = document.getElementById('visorBody');
    if (body) body.innerHTML = '';
    this._path = this._archivo = null;
  }
};
