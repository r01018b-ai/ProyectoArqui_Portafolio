// ============================================================
//  VISOR.JS – Visor flotante · v3.0
//  Soporta: dataUrl · objectUrl · ruta física · truncado
// ============================================================

/* ── Helpers internos ── */
function isImage(ext) {
  return ['png','jpg','jpeg','gif','svg','webp','bmp','ico'].includes(ext);
}
function isCode(ext) {
  return ['css','js','ts','json','md','txt','sql','py','java','c','cpp',
          'xml','php','rb','sh','yaml','yml','csv','jsx','tsx','sass',
          'scss','less','vue'].includes(ext);
}

const VISOR = {
  _path:    null,
  _name:    null,
  _dataUrl: null,
  _archivo: null,      // Objeto completo (para acceder a flags)
  _overlay: null,

  /* ──────────── CONSTRUIR ELEMENTO ─────────────────── */
  _build() {
    if (document.getElementById('visorOverlay')) {
      this._overlay = document.getElementById('visorOverlay');
      return;
    }
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="visor-overlay" id="visorOverlay" role="dialog" aria-modal="true">' +
        '<div class="visor-modal" id="visorModal">' +

          '<div class="visor-head">' +
            '<div class="visor-ficon" id="visorFicon">📄</div>' +
            '<div style="flex:1;min-width:0;overflow:hidden">' +
              '<div class="visor-title" id="visorTitleTxt" ' +
                   'style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">—</div>' +
              '<div class="visor-type"  id="visorTypeTxt"></div>' +
            '</div>' +
            '<div class="visor-acts">' +
              '<button class="btn btn-ghost btn-sm" onclick="VISOR.openTab()" title="Abrir en nueva pestaña">↗ Abrir</button>' +
              '<button class="btn btn-primary btn-sm" onclick="VISOR.download()" title="Descargar">⬇ Descargar</button>' +
              '<button class="btn btn-ghost btn-sm" onclick="VISOR.close()" title="Cerrar" ' +
                      'style="font-size:1.1rem;padding:6px 10px">✕</button>' +
            '</div>' +
          '</div>' +

          // Banner informativo (truncado / soloSesion)
          '<div id="visorBanner" style="display:none;margin:0;padding:8px 20px;' +
               'background:rgba(245,158,11,.12);border-bottom:1px solid rgba(245,158,11,.3);' +
               'font-size:.8rem;color:#d97706;display:flex;align-items:center;gap:8px"></div>' +

          '<div class="visor-body" id="visorBody"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap.firstElementChild);
    this._overlay = document.getElementById('visorOverlay');

    var self = this;
    this._overlay.addEventListener('click', function(e) {
      if (e.target === self._overlay) self.close();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') self.close();
    });
  },

  /* ──────────── ABRIR ───────────────────────────────── */
  open(archivo, uploadsBasePath) {
    if (!archivo) return;
    this._build();
    var base = uploadsBasePath !== undefined ? uploadsBasePath : '';
    var ext  = getExtension(archivo.archivo || '');

    // Prioridad de fuente del contenido:
    // 1. dataUrl  → almacenado en localStorage (persistente)
    // 2. objectUrl → blob URL (solo sesión, archivos grandes)
    // 3. ruta física → requiere servidor + archivo en carpeta
    var path = archivo.dataUrl
      || archivo.objectUrl
      || (base + (archivo.ruta || ''));

    this._path    = path;
    this._name    = archivo.archivo  || 'archivo';
    this._dataUrl = archivo.dataUrl  || null;
    this._archivo = archivo;

    // Encabezado
    document.getElementById('visorFicon').textContent    = getFileIcon(ext);
    document.getElementById('visorTitleTxt').textContent = archivo.nombre || this._name;
    document.getElementById('visorTypeTxt').textContent  =
      '.' + ext.toUpperCase() + (archivo.descripcion ? ' — ' + archivo.descripcion : '');

    // Banner de advertencia
    this._setBanner(archivo);

    // Renderizar cuerpo
    this._renderBody(ext, path, archivo);

    document.getElementById('visorOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  },

  /* ──────────── BANNER INFORMATIVO ─────────────────── */
  _setBanner(archivo) {
    var banner = document.getElementById('visorBanner');
    if (!banner) return;
    var msg = '';
    if (archivo.truncado) {
      msg = '✂️ Vista parcial: se muestran los primeros 80 KB del archivo. Descárgalo para ver el contenido completo.';
    } else if (archivo.soloSesion) {
      msg = '⚡ Vista disponible solo en esta sesión. Coloca el archivo físicamente en: ' + (archivo.ruta || '');
    }
    if (msg) {
      banner.style.display = 'flex';
      banner.textContent   = msg;
    } else {
      banner.style.display = 'none';
    }
  },

  /* ──────────── RENDERIZAR CONTENIDO ───────────────── */
  _renderBody(ext, path, archivo) {
    var body = document.getElementById('visorBody');
    if (!body) return;
    body.innerHTML = '';

    var self = this;

    // Si no hay ninguna fuente disponible
    if (!path || path === '') {
      body.innerHTML = this._noPreview(ext,
        'El archivo no tiene contenido almacenado. ' +
        'Coloca el archivo en: <code>' + (archivo.ruta || '') + '</code> y vuelve a intentarlo.');
      return;
    }

    if (isImage(ext)) {
      // ── IMAGEN ──
      var img   = document.createElement('img');
      img.src   = path;
      img.alt   = archivo.nombre || '';
      img.style.cssText = 'max-width:100%;max-height:75vh;display:block;margin:0 auto';
      img.onerror = function() {
        body.innerHTML = self._noPreview(ext, 'No se encontró la imagen.');
      };
      body.appendChild(img);

    } else if (ext === 'pdf') {
      // ── PDF ──
      var pdfSrc = path;
      // Si el path es un dataUrl o blob URL, usarlo directamente en el iframe
      body.innerHTML =
        '<iframe src="' + pdfSrc + '" title="' + (archivo.nombre || 'PDF') + '" ' +
        'style="width:100%;height:650px;border:none" ' +
        'onerror="this.style.display=\'none\'"></iframe>';

      // Si es ruta física (no dataUrl ni blob), verificar cargó
      if (!archivo.dataUrl && !archivo.objectUrl) {
        var iframe = body.querySelector('iframe');
        if (iframe) {
          iframe.addEventListener('error', function() {
            body.innerHTML = self._noPreview('pdf',
              'No se pudo cargar el PDF. Verifica que el archivo esté en: <br>' +
              '<code style="font-size:.8rem">' + archivo.ruta + '</code>');
          });
        }
      }

    } else if (['html','htm'].includes(ext)) {
      // ── HTML (renderizado en sandbox) ──
      if (archivo.dataUrl) {
        // Extraer el texto HTML del dataUrl y mostrar en iframe
        var htmlContent = atob(archivo.dataUrl.split(',')[1] || '');
        var blob = new Blob([htmlContent], { type: 'text/html' });
        var blobUrl = URL.createObjectURL(blob);
        body.innerHTML =
          '<iframe src="' + blobUrl + '" sandbox="allow-scripts allow-same-origin" ' +
          'style="width:100%;height:560px;border:none" title="' + (archivo.nombre || '') + '"></iframe>';
      } else {
        body.innerHTML =
          '<iframe src="' + path + '" sandbox="allow-scripts allow-same-origin" ' +
          'style="width:100%;height:560px;border:none" title="' + (archivo.nombre || '') + '"></iframe>';
      }

    } else if (isCode(ext)) {
      // ── CÓDIGO / TEXTO ──
      body.innerHTML =
        '<div class="visor-code"><pre id="visorCodePre">⏳ Cargando...</pre></div>';
      var pre = document.getElementById('visorCodePre');

      if (archivo.dataUrl) {
        // Decodificar desde dataUrl base64
        try {
          var b64parts = archivo.dataUrl.split(',');
          var decoded  = b64parts.length > 1 ? atob(b64parts[1]) : '';
          // Intentar decodificar UTF-8
          try {
            decoded = decodeURIComponent(
              decoded.split('').map(function(c){
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join('')
            );
          } catch(e) { /* si falla, usar decoded as-is */ }
          if (pre) pre.textContent = decoded || '(archivo vacío)';
        } catch(err) {
          if (pre) pre.textContent = 'Error al decodificar el archivo.';
        }
      } else {
        // Cargar desde ruta mediante fetch
        fetch(path)
          .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.text();
          })
          .then(function(txt) {
            var p = document.getElementById('visorCodePre');
            if (p) p.textContent = txt;
          })
          .catch(function() {
            var p = document.getElementById('visorCodePre');
            if (p) {
              body.innerHTML = self._noPreview(ext,
                'No se pudo cargar el archivo. Asegúrate de que esté en: ' + path);
            }
          });
      }

    } else {
      // ── SIN PREVISUALIZACIÓN PARA ESTE FORMATO ──
      body.innerHTML = this._noPreview(ext,
        'Este formato (' + ext.toUpperCase() + ') no tiene vista previa disponible. ' +
        'Descárgalo para abrirlo con su aplicación correspondiente.');
    }
  },

  /* ──────────── MENSAJE "SIN PREVIEW" ──────────────── */
  _noPreview(ext, msg) {
    return '<div class="visor-noprev">' +
      '<div class="np-icon">' + getFileIcon(ext) + '</div>' +
      '<strong>Vista previa no disponible</strong>' +
      '<p>' + msg + '</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:12px">' +
        '<button class="btn btn-primary" onclick="VISOR.openTab()">↗ Abrir en nueva pestaña</button>' +
        '<button class="btn btn-secondary" onclick="VISOR.download()">⬇ Descargar</button>' +
      '</div>' +
    '</div>';
  },

  /* ──────────── ACCIONES ────────────────────────────── */
  openTab() {
    if (this._path) window.open(this._path, '_blank');
  },

  openById(id, basePath) {
    var cache   = window._JZ_FILE_CACHE || {};
    var archivo = cache[id];
    if (archivo) {
      this.open(archivo, basePath || '../');
    } else {
      if (typeof TOAST !== 'undefined') TOAST.show('Archivo no encontrado en caché', 'error');
    }
  },

  download() {
    if (!this._path && !this._dataUrl) return;
    var a      = document.createElement('a');
    a.href     = this._dataUrl || this._path;
    a.download = this._name   || 'archivo';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },

  close() {
    var overlay = document.getElementById('visorOverlay');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
    var body = document.getElementById('visorBody');
    if (body) body.innerHTML = '';
    var banner = document.getElementById('visorBanner');
    if (banner) banner.style.display = 'none';
    this._path    = null;
    this._name    = null;
    this._dataUrl = null;
    this._archivo = null;
  }
};
