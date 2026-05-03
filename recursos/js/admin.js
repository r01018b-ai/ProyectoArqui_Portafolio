// ============================================================
//  ADMIN.JS – Panel de Administración · v4.0
//  CRUD: Archivos · Cursos · Semanas · Perfil · Skills
//  Fix: Sin errores de sintaxis · dataUrl · archivos grandes
// ============================================================

/* ── FUNCIONES DE MODAL GLOBALES ── */
window.abrirSuccess = function(title, msg) {
  const t = document.getElementById('successTitle');
  const m = document.getElementById('successMsg');
  const o = document.getElementById('successOverlay');
  if (t) t.textContent = title || '¡Hecho!';
  if (m) m.textContent = msg   || 'La operación se completó con éxito.';
  if (o) o.classList.add('show');
};

window.cerrarSuccess = function() {
  const o = document.getElementById('successOverlay');
  if (o) o.classList.remove('show');
};

/* ── Caché global de archivos (clave: id → objeto archivo) ── */
if (!window._JZ_FILE_CACHE) window._JZ_FILE_CACHE = {};

/* ── Helpers de tipo de archivo ── */
function isTextFile(ext) {
  return ['txt','md','html','htm','css','js','ts','json','sql','py',
          'java','c','cpp','xml','php','rb','sh','yaml','yml','csv',
          'jsx','tsx','vue','scss','sass','less'].includes(ext);
}

const ADMIN = {

  _semanaSeleccionada: 1,
  _cursoSeleccionado:  '',
  _cursosCache: [],
  _archivoActual:      null,

  /* ──────────────────────────────────────────
     INICIALIZAR
  ────────────────────────────────────────── */
  async init() {
    await this.cargarDatosPerfil();
    await this.actualizarAvatar();
    await this.cargarSelectCursos(); 
    this.renderDashboard();
    this.renderListaArchivos();
    this.renderListaCursos();
    this.renderSkills();
    this.renderMensajes();
    this.actualizarDotMensajes();
    this.renderSessionInfo();
    this._initUploadZone();
  },

  onTabChange(tab) {
    const map = {
      dashboard: () => this.renderDashboard(),
      archivos:  () => { this.cargarSelectCursos(); this.renderListaArchivos(); },
      cursos:    () => { this.renderListaCursos(); this.cargarSelectCursos(); this._poblarSemCursoSelect(); },
      skills:    () => this.renderSkills(),
      mensajes:  () => { this.renderMensajes(); this.actualizarDotMensajes(); },
      perfil:    () => { this.cargarDatosPerfil(); this.actualizarAvatar(); },
      config:    () => this.renderSessionInfo()
    };
    if (map[tab]) map[tab]();
  },

  /* ──────────────────────────────────────────
     DASHBOARD
  ────────────────────────────────────────── */
  async renderDashboard() {
    const stats = await window.SupabaseCtrl.getStats();
    const msgs  = (await window.SupabaseCtrl.getMensajes()).length;
    const sg    = document.getElementById('statsGrid');
    if (!sg) return;

    sg.innerHTML = [
      { icon:'📚', num: stats.cursos,   lbl:'Cursos'   },
      { icon:'📅', num: stats.semanas,  lbl:'Semanas'  },
      { icon:'📁', num: stats.archivos, lbl:'Archivos' },
      { icon:'💌', num: msgs,           lbl:'Mensajes' }
    ].map(s =>
      '<div class="stat-card fade-in-up">' +
        '<div class="sc-icon">' + s.icon + '</div>' +
        '<div class="sc-num">'  + s.num  + '</div>' +
        '<div class="sc-lbl">'  + s.lbl  + '</div>' +
      '</div>'
    ).join('');

    const rc = document.getElementById('resumCursos');
    if (!rc) return;
    rc.innerHTML = (await window.SupabaseCtrl.getCursos()).map(function(c) {
      var tot = c.semanas.reduce(function(a,s){ return a + s.archivos.length; }, 0);
      var con = c.semanas.filter(function(s){ return s.archivos.length > 0; }).length;
      var pct = Math.round(con / 16 * 100);
      return '<div style="margin-bottom:16px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:5px">' +
          '<span style="font-size:.875rem;font-weight:600">' + c.icono + ' ' + c.nombre + '</span>' +
          '<span style="font-size:.75rem;color:var(--txt-m)">' + tot + ' archivos</span>' +
        '</div>' +
        '<div class="prog-bar"><div class="prog-fill" style="width:' + pct + '%"></div></div>' +
        '<div style="text-align:right;font-size:.7rem;color:var(--primary);margin-top:3px;font-weight:700">' + pct + '% · ' + con + '/16 sem.</div>' +
      '</div>';
    }).join('');
    initFadeIn();
  },

  /* ──────────────────────────────────────────
     AVATAR / FOTO
  ────────────────────────────────────────── */
  async actualizarAvatar() {
    var p  = await window.SupabaseCtrl.getPerfil();
    var sa = document.getElementById('sideAvatar');
    var fw = document.getElementById('adminFotoWrap');
    var sn = document.getElementById('sideName');
    
    if (sn) sn.textContent = p ? ((p.nombre || '') + ' ' + (p.apellido || '')) : 'Administrador';
    var inputHtml = '<input type="file" accept="image/*" onchange="ADMIN.cambiarFoto(this)" ' +
      'style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;z-index:10">';
    if (p && p.foto_url) {
      var img = '<img src="' + p.foto_url + '" alt="Foto" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">';
      if (sa) sa.innerHTML = img;
      if (fw) fw.innerHTML = img + inputHtml;
    } else {
      if (sa) sa.innerHTML = '🌸';
      if (fw) fw.innerHTML = '🌸' + inputHtml;
    }
  },

  async cambiarFoto(input) {
    if (!input.files.length) return;
    var reader = new FileReader();
    var self   = this;
    reader.onload = async function(e) {
      var p = await window.SupabaseCtrl.getPerfil(); p.foto_url = e.target.result;
      await window.SupabaseCtrl.savePerfil(p); self.actualizarAvatar();
      TOAST.show('Foto actualizada 💜', 'success');
    };
    reader.readAsDataURL(input.files[0]);
  },

  async subirCV(input) {
    if (!input.files.length) return;
    var file = input.files[0];
    var st = document.getElementById('cvStatus');

    // Validar tipo de archivo
    var ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','docx','doc'].includes(ext)) {
      TOAST.show('⚠️ Solo se permiten archivos PDF o DOCX', 'error');
      return;
    }

    // Feedback visual de carga
    if (st) st.innerHTML = '⏳ Subiendo CV…';

    var reader = new FileReader();
    reader.onload = async function(e) {
      try {
        var dataUrl = e.target.result;
        var p = await window.SupabaseCtrl.getPerfil();
        if (!p) throw new Error('No se pudo obtener el perfil');

        p.cv_url    = dataUrl;
        p.cv_nombre = file.name;

        var ok = await window.SupabaseCtrl.savePerfil(p);

        if (ok) {
          // Guardar también en localStorage como respaldo
          try {
            localStorage.setItem('jz_cv_url',    dataUrl);
            localStorage.setItem('jz_cv_nombre', file.name);
          } catch(lsErr) { /* cuota excedida, ignorar */ }

          if (st) st.innerHTML = '✅ <strong>' + file.name + '</strong> guardado';
          TOAST.show('CV guardado correctamente 📄', 'success');
        } else {
          // Guardar en localStorage aunque Supabase falle
          try {
            localStorage.setItem('jz_cv_url',    dataUrl);
            localStorage.setItem('jz_cv_nombre', file.name);
            if (st) st.innerHTML = '⚠️ <strong>' + file.name + '</strong> guardado localmente';
            TOAST.show('CV guardado localmente (columnas faltantes en BD)', 'info', 6000);
          } catch(lsErr) {
            if (st) st.innerHTML = '❌ Error al guardar';
            TOAST.show('Error al guardar el CV', 'error');
          }
        }
      } catch(err) {
        if (st) st.innerHTML = '❌ Error al procesar';
        TOAST.show('Error: ' + (err.message || 'Inténtalo de nuevo'), 'error');
        console.error('subirCV error:', err);
      }
    };
    reader.onerror = function() {
      if (st) st.innerHTML = '❌ Error al leer el archivo';
      TOAST.show('No se pudo leer el archivo', 'error');
    };
    reader.readAsDataURL(file);
  },

  /* ──────────────────────────────────────────
     PERFIL
  ────────────────────────────────────────── */
  async cargarDatosPerfil() {
    var p = await window.SupabaseCtrl.getPerfil();
    if (!p) { 
      console.warn('Perfil no encontrado en Supabase.');
      return; 
    }
    function set(id, v) { var el = document.getElementById(id); if (el) el.value = v || ''; }
    set('pNombre',    p.nombre);    set('pApellido',  p.apellido);
    set('pTitulo',    p.titulo);    set('pBio',       p.bio);
    set('pCorreo',    p.correo);    set('pTelefono',  p.telefono);
    set('pUbicacion', p.ubicacion); set('pLinkedin',  p.linkedin);
    set('pGithub',    p.github);    set('pInstagram', p.instagram);

    // Mostrar CV: primero desde Supabase, si no desde localStorage
    var cvNombre = p.cv_nombre || localStorage.getItem('jz_cv_nombre');
    var st = document.getElementById('cvStatus');
    if (st && cvNombre) {
      st.innerHTML = '✅ <strong>' + cvNombre + '</strong>';
    } else if (st) {
      st.innerHTML = '<span style="color:var(--txt-m);font-size:.8rem">Sin CV cargado</span>';
    }
  },

  async guardarPerfil(e) {
    e.preventDefault();
    var btn = e.target ? e.target.querySelector('button[type="submit"]') : null;
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando…'; }

    try {
      var p   = await window.SupabaseCtrl.getPerfil();
      if (!p) throw new Error('No se pudo cargar el perfil');
      var get = function(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var n = get('pNombre'), a = get('pApellido');
      p.nombre = n; p.apellido = a; p.nombre_completo = n + ' ' + a;
      p.titulo = get('pTitulo'); p.bio = get('pBio'); p.correo = get('pCorreo');
      p.telefono = get('pTelefono'); p.ubicacion = get('pUbicacion');
      p.linkedin = get('pLinkedin'); p.github = get('pGithub'); p.instagram = get('pInstagram');

      var ok = await window.SupabaseCtrl.savePerfil(p);
      this.actualizarAvatar();
      if (ok) {
        TOAST.show('Perfil guardado correctamente 💜', 'success');
      } else {
        TOAST.show('Hubo un problema al guardar. Revisa la consola.', 'error');
      }
    } catch(err) {
      TOAST.show('Error: ' + (err.message || 'Inténtalo de nuevo'), 'error');
      console.error('guardarPerfil error:', err);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '💾 Guardar cambios'; }
    }
  },

  /* ──────────────────────────────────────────
     SELECTS Y CHIPS DE SEMANA
  ────────────────────────────────────────── */
  async cargarSelectCursos() {
    var cursos = await window.SupabaseCtrl.getCursos();
    this._cursosCache = cursos;
    var opts   = cursos.map(function(c) {
      return '<option value="' + c.id + '">' + c.icono + ' ' + c.nombre + '</option>';
    }).join('');

    var arcCurso = document.getElementById('arcCurso');
    if (arcCurso) {
      arcCurso.innerHTML = '<option value="">— Selecciona un curso —</option>' + opts;
      if (this._cursoSeleccionado) arcCurso.value = this._cursoSeleccionado;
    }
    var filtro = document.getElementById('filtroListaCurso');
    if (filtro) {
      var prev = filtro.value;
      filtro.innerHTML = '<option value="">Todos los cursos</option>' + opts;
      filtro.value = prev;
    }
  },

  async onCursoChange() {
    var el = document.getElementById('arcCurso');
    this._cursoSeleccionado  = el ? el.value : '';
    this._semanaSeleccionada = 1;
    this.cargarChipsSemanas();
    this.previsualizarRuta();
  },

  async cargarChipsSemanas() {
    var container = document.getElementById('weekChips');
    if (!container) return;
    var el      = document.getElementById('arcCurso');
    var cursoId = el ? el.value : '';
    var curso   = cursoId ? await window.SupabaseCtrl.getCurso(cursoId) : null;
    var self    = this;
    
    var html = '';
    const UNIDADES = [
      { n: 1, label: 'U1', range: [1, 4] },
      { n: 2, label: 'U2', range: [5, 8] },
      { n: 3, label: 'U3', range: [9, 12] },
      { n: 4, label: 'U4', range: [13, 16] }
    ];

    UNIDADES.forEach(u => {
      html += `
        <div class="unit-group-admin" style="margin-bottom: 12px;">
          <div style="font-size: .65rem; font-weight: 800; color: var(--primary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">Unidad 0${u.n}</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">`;
      
      for (var n = u.range[0]; n <= u.range[1]; n++) {
        var sem = curso ? curso.semanas.find(function(s) { return s.numero === n; }) : null;
        var has = sem && sem.archivos && sem.archivos.length > 0;
        var sel = self._semanaSeleccionada === n;
        var cls = 'week-chip' + (sel ? ' selected' : '') + (has ? ' has-files' : '');
        var tip = 'Semana ' + n + (has ? ' · ' + sem.archivos.length + ' archivos' : '');
        html += '<div class="' + cls + '" onclick="ADMIN.seleccionarSemana(' + n + ')" title="' + tip + '">S' + n + '</div>';
      }
      
      html += `</div></div>`;
    });
    
    container.innerHTML = html;
  },

  async seleccionarSemana(n) {
    this._semanaSeleccionada = n;
    this.cargarChipsSemanas();
    this.previsualizarRuta();
    this._habilitarBtnRegistrar();
  },

  async previsualizarRuta() {
    var el      = document.getElementById('arcCurso');
    var cursoId = el ? el.value : '';
    var archivo = this._archivoActual ? this._archivoActual.name : '';
    var prev    = document.getElementById('rutaPreview');
    if (!prev) return;
    const curso = ADMIN._cursosCache.find(c => c.id === cursoId);
    const folderName = curso ? curso.nombre : cursoId;

    if (cursoId && archivo) {
      prev.textContent = 'recursos/uploads/proyectos/' + folderName + '/semana-' + this._semanaSeleccionada + '/' + archivo;
    } else if (cursoId) {
      prev.textContent = 'recursos/uploads/proyectos/' + folderName + '/semana-' + this._semanaSeleccionada + '/[archivo]';
    } else {
      prev.textContent = '— Selecciona curso y semana —';
    }
  },

  _habilitarBtnRegistrar() {
    var btn     = document.getElementById('btnRegistrar');
    var curso   = document.getElementById('arcCurso');
    var nombre  = document.getElementById('arcNombre');
    var ok = !!(curso && curso.value && nombre && nombre.value.trim() && this._archivoActual);
    if (btn) btn.disabled = !ok;
  },

  /* ──────────────────────────────────────────
     UPLOAD ZONE (Drag & Drop)
  ────────────────────────────────────────── */
  _initUploadZone() {
    var zone  = document.getElementById('uploadZone');
    var input = document.getElementById('uploadFileInput');
    if (!zone || !input) return;
    var self  = this;

    ['dragenter','dragover'].forEach(function(ev) {
      zone.addEventListener(ev, function(e) { e.preventDefault(); zone.classList.add('drag-over'); });
    });
    ['dragleave','drop'].forEach(function(ev) {
      zone.addEventListener(ev, function(e) { e.preventDefault(); zone.classList.remove('drag-over'); });
    });
    zone.addEventListener('drop', function(e) {
      var files = e.dataTransfer.files;
      if (files.length) { input.files = files; self.onFileSelected({ files: files }); }
    });

    var arcNombre = document.getElementById('arcNombre');
    var arcCurso  = document.getElementById('arcCurso');
    if (arcNombre) arcNombre.addEventListener('input',  function() { self._habilitarBtnRegistrar(); });
    if (arcCurso)  arcCurso.addEventListener('change',  function() { self.onCursoChange(); self._habilitarBtnRegistrar(); });
  },

  onFileSelected(input) {
    if (!input.files || !input.files.length) return;
    var file   = input.files[0];
    this._archivoActual = file;

    var badge    = document.getElementById('fileSelectedBadge');
    var nameSpan = document.getElementById('fileSelectedName');
    var iconSpan = document.getElementById('fileSelectedIcon');
    if (badge && nameSpan && iconSpan) {
      var ext = getExtension(file.name);
      iconSpan.textContent = getFileIcon(ext);
      nameSpan.textContent = file.name + ' (' + (file.size / 1024).toFixed(0) + ' KB)';
      badge.classList.add('show');
    }

    var arcNombre = document.getElementById('arcNombre');
    if (arcNombre && !arcNombre.value.trim()) {
      var sinExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      arcNombre.value = sinExt.charAt(0).toUpperCase() + sinExt.slice(1);
    }
    this.previsualizarRuta();
    this._habilitarBtnRegistrar();
  },

  /* ──────────────────────────────────────────
     REGISTRAR ARCHIVO — CREATE
  ────────────────────────────────────────── */
  async registrarArchivo() {
    var elCurso  = document.getElementById('arcCurso');
    var elNombre = document.getElementById('arcNombre');
    var elDesc   = document.getElementById('arcDesc');
    var cursoId  = elCurso  ? elCurso.value.trim()  : '';
    var nombre   = elNombre ? elNombre.value.trim()  : '';
    var desc     = elDesc   ? elDesc.value.trim()    : '';
    var file     = this._archivoActual;

    if (!cursoId) { TOAST.show('Selecciona un curso', 'error');           return; }
    if (!file)    { TOAST.show('Selecciona un archivo', 'error');         return; }
    if (!nombre)  { TOAST.show('Escribe un nombre descriptivo', 'error'); return; }

    const curso = ADMIN._cursosCache.find(c => c.id === cursoId);
    const folderName = curso ? curso.nombre : cursoId;
    var semana = this._semanaSeleccionada;
    var ext    = getExtension(file.name);
    var ruta   = 'recursos/uploads/proyectos/' + folderName + '/semana-' + semana + '/' + file.name;
    var self   = this;

    var btn = document.getElementById('btnRegistrar');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Subiendo a Storage…'; }

    try {
      // 1. Subir el archivo real al Bucket 'archivos' de Supabase
      const storagePath = `${cursoId}/semana-${semana}/${Date.now()}-${file.name}`;
      const storageUrl  = await window.SupabaseCtrl.uploadArchivoStorage(file, storagePath);

      if (!storageUrl) {
        TOAST.show('Error al subir a storage. Revisa el bucket "archivos".', 'error');
        return;
      }

      // 2. Preparar el objeto para la base de datos
      var archivoObj = {
        nombre:      nombre,
        descripcion: desc,
        archivo:     file.name,
        ruta:        ruta,
        ext:         ext,
        tipo:        file.type,
        tamano:      file.size,
        storageUrl:  storageUrl
      };

      var ok = await window.SupabaseCtrl.addArchivo(cursoId, semana, archivoObj);
      if (ok) {
        abrirSuccess('¡Archivo Guardado!', 'El archivo "' + nombre + '" se ha registrado correctamente en la Semana ' + semana + '.');
        self._limpiarFormulario();
        self.cargarChipsSemanas();
        self.renderDashboard();
        self.renderListaArchivos();
      } else {
        TOAST.show('Error al guardar en la base de datos.', 'error');
      }
    } catch (err) {
      console.error('Error en registrarArchivo:', err);
      TOAST.show('Ocurrió un error inesperado al subir el archivo.', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '✅ Registrar archivo'; }
    }
  },

  async _limpiarFormulario() {
    var campos = ['arcNombre','arcDesc'];
    campos.forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    var fi = document.getElementById('uploadFileInput');
    if (fi) fi.value = '';
    var badge = document.getElementById('fileSelectedBadge');
    if (badge) badge.classList.remove('show');
    this._archivoActual = null;
    var btn = document.getElementById('btnRegistrar');
    if (btn) { btn.disabled = true; btn.textContent = '✅ Registrar archivo'; }
  },

  /* ──────────────────────────────────────────
     LISTA DE ARCHIVOS — READ
  ────────────────────────────────────────── */
  async renderListaArchivos() {
    var tbody = document.getElementById('tbodyArchivos');
    var empty = document.getElementById('emptyArchivos');
    if (!tbody) return;

    var elCurso  = document.getElementById('filtroListaCurso');
    var elSemana = document.getElementById('filtroListaSemana');
    var elUnidad = document.getElementById('filtroListaUnidad');
    var filtroCurso  = elCurso  ? elCurso.value  : '';
    var filtroSemana = elSemana ? elSemana.value  : '';
    var filtroUnidad = elUnidad ? elUnidad.value  : '';

    // Poblar select de semanas (solo 1ª vez)
    if (elSemana && elSemana.options.length === 1) {
      for (var i = 1; i <= 16; i++) {
        var opt = document.createElement('option');
        opt.value = i; opt.textContent = 'Semana ' + i;
        elSemana.appendChild(opt);
      }
    }

    var cursos = await window.SupabaseCtrl.getCursos();
    if (filtroCurso) cursos = cursos.filter(function(c) { return c.id === filtroCurso; });
    var rows = [];

    cursos.forEach(function(c) {
      c.semanas.forEach(function(s) {
        if (filtroSemana && s.numero !== parseInt(filtroSemana)) return;
        
        // Calcular unidad
        const uNum = Math.ceil(s.numero / 4);
        if (filtroUnidad && uNum !== parseInt(filtroUnidad)) return;

        s.archivos.forEach(function(a) {
          window._JZ_FILE_CACHE[a.id] = a; // Actualizar caché
          rows.push({ curso:c, semana:s, unidad:uNum, archivo:a, ext: getExtension(a.archivo) });
        });
      });
    });

    if (!rows.length) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    var html = '';
    rows.forEach(function(r) {
      var a = r.archivo;
      var tieneContenido = !!(a.storageUrl || a.dataUrl || a.objectUrl);
      var puedeVer = tieneContenido && isPreviewable(r.ext);

      // Badge de estado
      var estadoBadge = '';
      if (a.truncado)   estadoBadge = '<span style="font-size:.65rem;color:#f59e0b;margin-top:2px">✂️ Vista parcial</span>';
      if (a.soloSesion) estadoBadge = '<span style="font-size:.65rem;color:#f59e0b;margin-top:2px">⚡ Solo esta sesión</span>';
      if (a.sinVista)   estadoBadge = '<span style="font-size:.65rem;color:#ef4444;margin-top:2px">⚠️ Sin vista previa</span>';

      // Botones de acción (usando ID, NO JSON.stringify)
      var btnVer = puedeVer
        ? '<button class="btn btn-primary btn-sm" onclick="ADMIN._verArchivo(\'' + a.id + '\')" title="Vista previa">👁 Ver</button>'
        : (tieneContenido ? '<span style="font-size:.72rem;color:var(--txt-m)">—</span>' : '<span style="font-size:.72rem;color:#ef4444" title="Re-sube el archivo">⚠️</span>');

      var btnDl  = '<button class="btn btn-ghost btn-sm" onclick="ADMIN._descargarArchivo(\'' + a.id + '\')" title="Descargar">⬇</button>';
      var btnEdt = '<button class="btn btn-icon btn-sm" style="color:var(--primary)" onclick="abrirEditArchivo(\'' + r.curso.id + '\',' + r.semana.numero + ',\'' + a.id + '\')" title="Editar">✏️</button>';
      var btnDel = '<button class="btn btn-icon btn-sm" style="color:#ef4444" onclick="ADMIN.pedirEliminarArchivo(\'' + r.curso.id + '\',' + r.semana.numero + ',\'' + a.id + '\')" title="Eliminar">🗑</button>';

      html +=
        '<tr>' +
          '<td><div class="archivo-ticon ' + getFileTypeClass(r.ext) + '" style="width:34px;height:34px;display:inline-flex;font-size:1.1rem">' + getFileIcon(r.ext) + '</div></td>' +
          '<td>' +
            '<div style="font-weight:600;font-size:.875rem;color:var(--txt)">' + (a.nombre || '') + '</div>' +
            (a.descripcion ? '<div style="font-size:.72rem;color:var(--txt-m)">' + a.descripcion + '</div>' : '') +
            (a.fechaSubida ? '<div style="font-size:.68rem;color:var(--txt-m);margin-top:2px">📅 ' + a.fechaSubida + '</div>' : '') +
            (estadoBadge ? '<div>' + estadoBadge + '</div>' : '') +
          '</td>' +
          '<td><span style="font-family:monospace;font-size:.74rem;color:var(--txt-m)">' + (a.archivo || '') + '</span> <span class="ext-badge">' + r.ext + '</span></td>' +
          '<td>' +
            '<div style="font-weight:800;font-size:.8rem;color:var(--primary)">U' + r.unidad + '</div>' +
            '<div style="font-weight:600;font-size:.74rem;color:var(--txt-m)">Sem ' + r.semana.numero + '</div>' +
          '</td>' +
          '<td><span class="curso-pill">' + r.curso.icono + ' ' + r.curso.nombre + '</span></td>' +
          '<td><div style="display:flex;gap:5px;flex-wrap:wrap">' + btnVer + btnDl + btnEdt + btnDel + '</div></td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  },

  /* ── VER en visor (desde caché global) ── */
  async _verArchivo(id) {
    var archivo = window._JZ_FILE_CACHE[id];
    if (!archivo) { TOAST.show('Archivo no encontrado en caché', 'error'); return; }
    VISOR.open(archivo, '../');
  },

  /* ── DESCARGAR (dataUrl o objectUrl o ruta física) ── */
  async _descargarArchivo(id) {
    var archivo = window._JZ_FILE_CACHE[id];
    if (!archivo) { TOAST.show('Archivo no encontrado', 'error'); return; }
    var a      = document.createElement('a');
    var url    = archivo.storageUrl || archivo.dataUrl || archivo.objectUrl;
    if (!url) {
      const rutaLimpia = archivo.ruta.startsWith('/') ? archivo.ruta.substring(1) : archivo.ruta;
      url = '../' + rutaLimpia;
    }
    
    if (url.includes('supabase.co/storage')) {
      url += url.includes('?') ? '&download=' : '?download=';
      url += encodeURIComponent(archivo.archivo || archivo.nombre);
    }
    
    a.href     = url;
    a.download = archivo.archivo || archivo.nombre;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    TOAST.show('Descarga iniciada 📥', 'info');
  },

  /* Compatibilidad con semanas.html */
  descargarArchivo: function(cursoId, semanaNum, id) { this._descargarArchivo(id); },

  /* ──────────────────────────────────────────
     EDITAR ARCHIVO — UPDATE
  ────────────────────────────────────────── */
  async guardarEdicionArchivo() {
    var id      = document.getElementById('editArchivoId').value;
    var cursoId = document.getElementById('editArchivoCurso').value;
    var semana  = parseInt(document.getElementById('editArchivoSemana').value);
    var nombre  = document.getElementById('editNombre').value.trim();
    var desc    = document.getElementById('editDesc').value.trim();
    if (!nombre) { TOAST.show('El nombre es obligatorio', 'error'); return; }
    var ok = await window.SupabaseCtrl.updateArchivo(cursoId, semana, id, { nombre:nombre, descripcion:desc });
    if (ok) {
      if (window._JZ_FILE_CACHE[id]) {
        window._JZ_FILE_CACHE[id].nombre      = nombre;
        window._JZ_FILE_CACHE[id].descripcion = desc;
      }
      cerrarEditModal();
      this.renderListaArchivos();
      abrirSuccess('¡Archivo Actualizado!', 'Los datos del archivo se han modificado correctamente.');
    } else { TOAST.show('Error al actualizar', 'error'); }
  },

  /* ──────────────────────────────────────────
     ELIMINAR ARCHIVO — DELETE
  ────────────────────────────────────────── */
  async pedirEliminarArchivo(cursoId, semanaNum, archivoId) {
    var cached = window._JZ_FILE_CACHE[archivoId];
    var nombre = cached ? cached.nombre : 'este archivo';
    pedirConfirm('🗑', '¿Eliminar archivo?',
      'Se eliminará "' + nombre + '" permanentemente. Esta acción no se puede deshacer.',
      async function() { ADMIN.eliminarArchivo(cursoId, semanaNum, archivoId); }
    );
  },

  async eliminarArchivo(cursoId, semanaNum, archivoId) {
    await window.SupabaseCtrl.deleteArchivo(cursoId, semanaNum, archivoId);
    delete window._JZ_FILE_CACHE[archivoId];
    this.renderListaArchivos();
    this.renderDashboard();
    this.cargarChipsSemanas();
    abrirSuccess('¡Archivo Eliminado!', 'El archivo se ha quitado del portafolio permanentemente.');
  },

  /* ──────────────────────────────────────────
     GESTIÓN DE CURSOS — CRUD
  ────────────────────────────────────────── */
  async agregarCurso() {
    var nombre = (document.getElementById('cNombreCurso') || {}).value || '';
    var desc   = (document.getElementById('cDescCurso')   || {}).value || '';
    var icono  = (document.getElementById('cIconoCurso')  || {}).value || '📘';
    var color  = (document.getElementById('cColorCurso')  || {}).value || '#9333ea';
    var imagen = (document.getElementById('cImagenCurso') || {}).value || '';
    nombre = nombre.trim(); desc = desc.trim(); icono = icono.trim(); imagen = imagen.trim();

    if (!nombre) { TOAST.show('⚠️ El campo Nombre del curso está vacío. Es obligatorio.', 'warning'); return; }

    var id = nombre.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!id) id = generateId();

    var cursos = await window.SupabaseCtrl.getCursos();
    if (cursos.find(function(c) { return c.id === id; })) { 
      TOAST.show('❌ Ya existe un curso registrado previamente con el ID: ' + id, 'error'); 
      return; 
    }

    // Insertar curso en Supabase
    var okCurso = await window.SupabaseCtrl.addCurso({ 
      id:id, 
      nombre:nombre, 
      descripcion:desc, 
      icono:icono, 
      color:color, 
      imagen_url:imagen 
    });
    if (!okCurso) {
      TOAST.show('❌ Hubo un problema al crear el curso en la base de datos.', 'error');
      return;
    }

    // Insertar 16 semanas en Supabase
    var okSemanas = await window.SupabaseCtrl.init16Semanas(id);
    if (!okSemanas) {
      TOAST.show('❌ Se creó el curso pero falló la generación de semanas. Contactar soporte.', 'error');
    }

    // Limpiar formulario y refrescar TODO
    ['cNombreCurso','cDescCurso','cIconoCurso','cImagenCurso'].forEach(function(elId) {
      var el = document.getElementById(elId); if (el) el.value = '';
    });
    this.renderListaCursos();
    this.cargarSelectCursos();
    this.renderDashboard();
    this._poblarSemCursoSelect();
    
    abrirSuccess('¡Curso Creado!', 'El curso "' + nombre + '" y sus 16 semanas se han generado correctamente.');
    
    switchCrudTab('cur-lista');
  },

  async renderListaCursos() {
    var el = document.getElementById('listaCursos');
    if (!el) return;
    try {
      var cursos = await window.SupabaseCtrl.getCursos();
      console.log('Admin: Renderizando cursos...', cursos);
      
      if (!cursos || !cursos.length) {
        el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--txt-m);">' +
          '<div style="font-size:3rem;margin-bottom:10px">📂</div>' +
          '<p>No hay cursos registrados todavía.</p>' +
        '</div>';
        return;
      }

      var html = '';
      cursos.forEach(function(c) {
        try {
          var sems = c.semanas || [];
          var tot = sems.reduce(function(a,s){ return a + (s.archivos ? s.archivos.length : 0); }, 0);
          var con = sems.filter(function(s){ return s.archivos && s.archivos.length > 0; }).length;
          var pct = Math.round(con / 16 * 100);
          
          html +=
            '<div class="curso-admin-card fade-in">' +
              '<div class="cac-icon">' + (c.icono || '📘') + '</div>' +
              '<div class="cac-info">' +
                '<div class="cac-name">' + c.nombre + '</div>' +
                '<div class="cac-meta">' + (c.descripcion || 'Sin descripción') + '</div>' +
                '<div class="prog-bar" style="margin-top:10px;max-width:200px">' +
                  '<div class="prog-fill" style="width:' + pct + '%"></div>' +
                '</div>' +
                '<div style="font-size:.75rem;color:var(--card-txt);opacity:0.8;margin-top:6px;font-weight:600">' + 
                  tot + ' archivos · ' + con + '/16 semanas completadas (' + pct + '%)' + 
                '</div>' +
              '</div>' +
              '<div class="cac-actions">' +
                '<a href="semanas.html?curso=' + c.id + '" class="btn btn-secondary btn-sm" target="_blank">👁️ Ver</a>' +
                '<button class="btn btn-icon" style="color:var(--primary)" onclick="abrirEditCurso(\'' + c.id + '\')" title="Editar">' +
                  '✏️' +
                '</button>' +
                '<button class="btn btn-icon" style="color:#ef4444" onclick="ADMIN.pedirEliminarCurso(\'' + c.id + '\')" title="Eliminar">' +
                  '🗑️' +
                '</button>' +
              '</div>' +
            '</div>';
        } catch(err) {
          console.error('Error renderizando curso individual:', err, c);
        }
      });
      el.innerHTML = html;
    } catch(err) {
      console.error('Error en renderListaCursos:', err);
      el.innerHTML = '<p style="color:#ef4444;text-align:center;padding:20px">Error al cargar la lista de cursos.</p>';
    }
  },

  async guardarEdicionCurso() {
    var id     = document.getElementById('editCursoId').value;
    var nombre = document.getElementById('editCursoNombre').value.trim();
    var desc   = document.getElementById('editCursoDesc').value.trim();
    var icono  = document.getElementById('editCursoIcono').value.trim() || '📘';
    var color  = document.getElementById('editCursoColor').value;
    var imagen = document.getElementById('editCursoImagen').value.trim();
    if (!nombre) { TOAST.show('El nombre es obligatorio', 'error'); return; }
    if (await window.SupabaseCtrl.updateCurso(id, { nombre:nombre, descripcion:desc, icono:icono, color:color, imagen_url:imagen })) {
      cerrarCursoModal();
      this.renderListaCursos(); this.cargarSelectCursos(); this.renderDashboard();
      abrirSuccess('¡Curso Actualizado!', 'La información de la materia se ha actualizado correctamente.');
    } else { TOAST.show('Error al actualizar el curso', 'error'); }
  },

  async pedirEliminarCurso(id) {
    var curso = await window.SupabaseCtrl.getCurso(id);
    var nombre = curso ? curso.nombre : id;
    pedirConfirm('⚠️', '¿Eliminar curso?',
      'Se eliminará "' + nombre + '" y TODOS sus archivos. Esta acción no se puede deshacer.',
      async function() { ADMIN.eliminarCurso(id); }
    );
  },

  async eliminarCurso(id) {
    await window.SupabaseCtrl.deleteCurso(id);
    this.renderListaCursos(); this.cargarSelectCursos();
    this.renderDashboard(); this._poblarSemCursoSelect();
    abrirSuccess('¡Curso Eliminado!', 'La materia y todos sus contenidos han sido eliminados.');
  },

  /* ──────────────────────────────────────────
     SEMANAS — Editar títulos
  ────────────────────────────────────────── */
  async _poblarSemCursoSelect() {
    var sel = document.getElementById('semCursoSelect');
    if (!sel) return;
    var prev   = sel.value;
    var cursos = await window.SupabaseCtrl.getCursos();
    sel.innerHTML = '<option value="">— Selecciona curso —</option>' +
      cursos.map(function(c) { return '<option value="' + c.id + '">' + c.icono + ' ' + c.nombre + '</option>'; }).join('');
    if (prev && cursos.find(function(c){ return c.id === prev; })) sel.value = prev;
  },

  async renderSemanasAdmin() {
    var sel     = document.getElementById('semCursoSelect');
    var cursoId = sel ? sel.value : '';
    var grid    = document.getElementById('semanasAdminGrid');
    if (!grid) return;
    if (!cursoId) {
      grid.innerHTML = '<p style="color:var(--txt-m);font-size:.84rem;grid-column:span 4">Selecciona un curso</p>';
      return;
    }
    var curso = await window.SupabaseCtrl.getCurso(cursoId);
    if (!curso) { grid.innerHTML = ''; return; }
    var html = '';
    curso.semanas.forEach(function(s) {
      var n = s.archivos.length;
      html += '<div class="sem-admin-card ' + (n>0?'has':'') + '" onclick="abrirEditSemana(\'' + cursoId + '\',' + s.numero + ')" title="Editar semana ' + s.numero + '">' +
        (n>0 ? '<span class="sem-count-badge">' + n + '</span>' : '') +
        '<div class="sem-num">S' + s.numero + '</div>' +
        '<div class="sem-title-mini">' + s.titulo + '</div>' +
        '<button class="btn btn-icon btn-sm" style="position:absolute;bottom:5px;right:5px;color:#ef4444;opacity:0.6"' +
        ' onclick="event.stopPropagation(); ADMIN.pedirEliminarSemana(\'' + cursoId + '\',' + s.numero + ')" title="Eliminar semana">🗑</button>' +
      '</div>';
    });
    // Botón agregar semana al final
    html += '<div class="sem-admin-card" style="border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;min-height:80px;cursor:pointer"' +
            ' onclick="ADMIN.agregarSemana(\'' + cursoId + '\')">' +
            '<div style="font-size:1.5rem;color:var(--txt-m)">➕</div>' +
            '</div>';
    grid.innerHTML = html;
  },

  async agregarSemana(cursoId) {
    if (!cursoId) return;
    if (await window.SupabaseCtrl.addSemana(cursoId)) {
      this.renderSemanasAdmin();
      this.renderDashboard();
      TOAST.show('Semana agregada ✅', 'success');
    }
  },

  async pedirEliminarSemana(cursoId, semanaNum) {
    var curso = await window.SupabaseCtrl.getCurso(cursoId);
    var sem   = curso ? curso.semanas.find(s => s.numero === semanaNum) : null;
    var nombre = sem ? sem.titulo : ('Semana ' + semanaNum);
    pedirConfirm('🗑', '¿Eliminar semana?',
      'Se eliminará "' + nombre + '" y TODOS sus archivos. ¿Estás segura?',
      async function() { ADMIN.eliminarSemana(cursoId, semanaNum); }
    );
  },

  async eliminarSemana(cursoId, semanaNum) {
    if (await window.SupabaseCtrl.deleteSemana(cursoId, semanaNum)) {
      this.renderSemanasAdmin();
      this.renderDashboard();
      this.renderListaArchivos();
      TOAST.show('Semana eliminada', 'info');
    }
  },

  async guardarEdicionSemana() {
    var cursoId = document.getElementById('editSemCurso').value;
    var num     = parseInt(document.getElementById('editSemNum').value);
    var titulo  = document.getElementById('editSemTitulo').value.trim();
    if (!titulo) { TOAST.show('El título es obligatorio', 'error'); return; }
    if (await window.SupabaseCtrl.updateSemana(cursoId, num, { titulo:titulo })) {
      cerrarSemanaModal(); this.renderSemanasAdmin();
      abrirSuccess('¡Semana Actualizada!', 'El título de la semana ' + num + ' se ha guardado.');
    } else { TOAST.show('Error al actualizar', 'error'); }
  },

  /* ──────────────────────────────────────────
     HABILIDADES — CRUD
  ────────────────────────────────────────── */
  async agregarSkill() {
    var nombre = (document.getElementById('skNombre') || {}).value || '';
    var nivel  = parseInt((document.getElementById('skNivel') || {}).value || 75);
    nombre = nombre.trim();
    if (!nombre) { TOAST.show('Escribe el nombre de la habilidad', 'error'); return; }
    var p = await window.SupabaseCtrl.getPerfil();
    if (!p.skills) p.skills = [];
    if (p.skills.find(function(s) { return s.nombre.toLowerCase() === nombre.toLowerCase(); })) {
      TOAST.show('Esa habilidad ya existe', 'error'); return;
    }
    p.skills.push({ nombre:nombre, nivel:nivel });
    await window.SupabaseCtrl.savePerfil(p);
    var elN = document.getElementById('skNombre'); if (elN) elN.value = '';
    var elL = document.getElementById('skNivel');  if (elL) elL.value = 75;
    var elT = document.getElementById('skNivelLabel'); if (elT) elT.textContent = '75';
    this.renderSkills();
    TOAST.show('Habilidad agregada 🎯', 'success');
  },

  async renderSkills() {
    var el = document.getElementById('listaSkills');
    if (!el) return;
    var skills = (await window.SupabaseCtrl.getPerfil()).skills || [];
    if (!skills.length) {
      el.innerHTML = '<p style="color:var(--txt-m);font-size:.84rem;text-align:center;padding:20px">Sin habilidades aún</p>';
      return;
    }
    var html = '';
    skills.forEach(async function(s, i) {
      html +=
        '<div class="skill-admin-row">' +
          '<div style="flex:1"><div style="font-weight:700;font-size:.875rem;margin-bottom:6px">' + s.nombre + '</div>' +
          '<div class="prog-bar"><div class="prog-fill" style="width:' + s.nivel + '%"></div></div></div>' +
          '<span style="font-weight:800;color:var(--primary);min-width:40px;text-align:right">' + s.nivel + '%</span>' +
          '<button class="btn btn-icon btn-sm" style="color:var(--primary)" onclick="ADMIN.editarSkill(' + i + ')" title="Editar">✏️</button>' +
          '<button class="btn btn-icon btn-sm" style="color:#ef4444" onclick="ADMIN.eliminarSkill(' + i + ')" title="Eliminar">🗑</button>' +
        '</div>';
    });
    el.innerHTML = html;
  },

  async editarSkill(idx) {
    var p = await window.SupabaseCtrl.getPerfil(); var skill = p.skills[idx]; if (!skill) return;
    var nv = parseInt(prompt('Nivel para "' + skill.nombre + '" (10-100):', skill.nivel));
    if (isNaN(nv) || nv < 10 || nv > 100) { TOAST.show('Nivel inválido (10-100)', 'error'); return; }
    p.skills[idx].nivel = nv; await window.SupabaseCtrl.savePerfil(p); this.renderSkills();
    TOAST.show('Nivel actualizado ✅', 'success');
  },

  async eliminarSkill(idx) {
    var p = await window.SupabaseCtrl.getPerfil(); var name = p.skills[idx] ? p.skills[idx].nombre : '';
    pedirConfirm('🗑', '¿Eliminar habilidad?', 'Se eliminará "' + name + '".',
      async function() { p.skills.splice(idx,1); await window.SupabaseCtrl.savePerfil(p); ADMIN.renderSkills(); TOAST.show('Habilidad eliminada', 'info'); }
    );
  },

  /* ──────────────────────────────────────────
     MENSAJES — READ + DELETE
  ────────────────────────────────────────── */
  async renderMensajes() {
    var el = document.getElementById('listaMensajesAdmin');
    if (!el) return;
    var msgs = await window.SupabaseCtrl.getMensajes();
    if (!msgs.length) {
      el.innerHTML = '<div style="text-align:center;padding:60px;color:var(--txt-m)">' +
        '<div style="font-size:3rem;margin-bottom:14px">📭</div>' +
        '<strong style="font-size:.95rem;color:var(--txt)">Sin mensajes recibidos</strong>' +
        '<p style="font-size:.84rem;margin-top:6px">Los mensajes del formulario aparecerán aquí</p></div>';
      return;
    }
    var html = '';
    msgs.forEach(async function(m) {
      html +=
        '<div class="msg-card msg-unread">' +
          '<div class="msg-header"><div class="msg-autor"><strong>' + (m.nombre||'Anónimo') + '</strong><span>' + (m.correo||'') + '</span></div>' +
          '<div style="display:flex;align-items:center;gap:10px"><span class="msg-fecha">' + (m.fecha||'') + '</span>' +
          '<button class="btn btn-icon btn-sm" style="color:#ef4444" onclick="ADMIN.eliminarMensaje(\'' + m.id + '\')">🗑</button></div></div>' +
          (m.asunto ? '<div class="msg-asunto">📌 ' + m.asunto + '</div>' : '') +
          '<div class="msg-body">' + (m.mensaje||'') + '</div>' +
        '</div>';
    });
    el.innerHTML = html;
  },

  async eliminarMensaje(id) {
    await window.SupabaseCtrl.deleteMensaje(id);
    this.renderMensajes(); this.actualizarDotMensajes();
    TOAST.show('Mensaje eliminado', 'info');
  },

  async limpiarMensajes() {
    pedirConfirm('⚠️', '¿Limpiar todos los mensajes?',
      'Se eliminarán todos los mensajes. Esta acción no se puede deshacer.',
      async function() { await window.SupabaseCtrl.deleteAllMensajes(); ADMIN.renderMensajes(); ADMIN.actualizarDotMensajes(); TOAST.show('Bandeja limpiada 📭', 'info'); }
    );
  },

  async actualizarDotMensajes() {
    var dot = document.getElementById('msgDot');
    if (dot) dot.style.display = (await window.SupabaseCtrl.getMensajes()).length ? 'inline-block' : 'none';
  },

  /* ──────────────────────────────────────────
     CONFIGURACIÓN
  ────────────────────────────────────────── */
  async renderSessionInfo() {
    var el = document.getElementById('sessionInfo');
    if (!el) return;
    var s = await window.SupabaseCtrl.getSession() || {};
    el.innerHTML =
      '<div>👤 <strong>Usuario:</strong> ' + (s.usuario||'—') + '</div>' +
      '<div>👑 <strong>Rol:</strong> ' + (s.rol||'—') + '</div>' +
      '<div>🕐 <strong>Fecha:</strong> ' + new Date().toLocaleString('es-PE') + '</div>';
  },

  cambiarPass: function(rol) {
    var val = (document.getElementById('newPassAdmin') || {}).value || '';
    val = val.trim();
    if (!val || val.length < 6) { TOAST.show('Mínimo 6 caracteres', 'error'); return; }
    var creds = safeJSONParse(localStorage.getItem('jz_credentials'), AUTH_CREDENTIALS);
    creds[rol].password = val;
    localStorage.setItem('jz_credentials', JSON.stringify(creds));
    var el = document.getElementById('newPassAdmin'); if (el) el.value = '';
    TOAST.show('Contraseña actualizada 🔑', 'success');
  },

  resetData: function() {
    pedirConfirm('⚠️', '¿Restablecer TODOS los datos?',
      'Se borrarán cursos, archivos, perfil, mensajes y credenciales. NO se puede deshacer.',
      function() {
        DB.resetAll(); window._JZ_FILE_CACHE = {};
        TOAST.show('Datos restablecidos. Recargando…', 'info');
        setTimeout(function() { location.reload(); }, 1200);
      }
    );
  },

  async repararNombresCursos() {
    const mapping = {
      'unidad-01': { n: 'ARQUITECTURA DE SOFTWARE', i: '🏗️', img: '../recursos/img/banners/software_architecture.png' },
      'unidad-03': { n: 'LEGISLACIÓN INFORMÁTICA', i: '⚖️', img: '../recursos/img/banners/legislacion_informatica.png' },
      'unidad-04': { n: 'TALLER DE INVESTIGACIÓN I', i: '🔬', img: '../recursos/img/banners/taller_investigacion.png' },
      'unidad-05': { n: 'COMERCIO ELECTRÓNICO', i: '🛒', img: '../recursos/img/banners/comercio_electronico.png' },
      'unidad-06': { n: 'SEGURIDAD DE LA INFRAESTRUCTURA DE TI I', i: '🛡️', img: '../recursos/img/banners/seguridad_ti.png' }
    };

    let count = 0;
    for (let id in mapping) {
      const ok = await window.SupabaseCtrl.updateCurso(id, { 
        nombre: mapping[id].n, 
        icono: mapping[id].i,
        imagen_url: mapping[id].img
      });
      if (ok) count++;
    }
    
    if (count > 0) {
      abrirSuccess('¡Sistema Actualizado!', 'Se han corregido los nombres y asignado las nuevas imágenes a ' + count + ' materias.');
      this.renderListaCursos();
      this.cargarSelectCursos();
      this.renderDashboard();
    } else {
      TOAST.show('No se encontraron cursos con los IDs unidad-01, unidad-03, etc.', 'warning');
    }
  }
};

window.ADMIN = ADMIN;
