// ============================================================
//  DATOS DE LA APLICACIÓN – PORTAFOLIO PERSONAL (SIN BD)
//  v2.0 – 2026
// ============================================================

/* ── CREDENCIALES ─────────────────────────────────────────── */
const AUTH_CREDENTIALS = {
  admin: { usuario: 'admin', password: 'admin123', rol: 'admin' }
};

/* ── PERFIL POR DEFECTO ──────────────────────────────────── */
const PERFIL_DEFAULT = {
  nombre:        'Jasmin Elena',
  apellido:      'Acosta Fernández',
  nombreCompleto:'Jasmin Elena Acosta Fernández',
  titulo:        'Estudiante de Ingeniería de Sistemas y Computación — UPLA',
  fotoUrl:       null,
  cvUrl:         null,
  bio:           'Estudiante apasionada por el desarrollo web y software, con enfoque en crear soluciones digitales innovadoras.',
  correo:        'jacosta@upla.edu.pe',
  telefono:      '+51 964 123 456',
  ubicacion:     'Huancayo, Perú',
  universidad:   'UPLA',
  ciclo:         '5.° ciclo',
  linkedin:      '#',
  github:        '#',
  instagram:     '#',
  skills:        [
    { nombre: 'HTML & CSS',     nivel: 90 },
    { nombre: 'JavaScript',     nivel: 75 },
    { nombre: 'Python',         nivel: 65 },
    { nombre: 'SQL / Bases de Datos', nivel: 70 },
    { nombre: 'Git & GitHub',   nivel: 60 }
  ]
};

/* ── GENERADOR DE SEMANAS ──────────────────────────── */
function generarSemanas(temas = []) {
  return Array.from({ length: 16 }, (_, i) => ({
    numero:   i + 1,
    titulo:   temas[i] || `Semana ${i + 1}`,
    archivos: []
  }));
}

/* ── CURSOS POR DEFECTO ───────────────────────────── */
const CURSOS_DEFAULT = [
  {
    id:          'desarrollo-web-1',
    nombre:      'Desarrollo Web I',
    descripcion: 'Fundamentos de HTML, CSS y JavaScript para el desarrollo de páginas web modernas.',
    icono:       '🌐',
    color:       '#9333ea',
    semanas:     generarSemanas([
      'Introducción a HTML5','Estructura y semántica HTML','CSS Fundamentos',
      'Diseño con Flexbox','CSS Grid Layout','JavaScript Básico',
      'DOM y eventos','Formularios y validación','CSS Avanzado / Animaciones',
      'APIs Web del navegador','LocalStorage y SessionStorage','Responsive Design',
      'Git y control de versiones','Proyecto integrador I','Proyecto integrador II',
      'Presentación final'
    ])
  },
  {
    id:          'calculo-diferencial',
    nombre:      'Cálculo Diferencial',
    descripcion: 'Límites, derivadas y aplicaciones del cálculo diferencial en ingeniería.',
    icono:       '📐',
    color:       '#2563eb',
    semanas:     generarSemanas([
      'Funciones y conjuntos','Límites de funciones','Continuidad',
      'Derivada: definición','Reglas de derivación','Derivada de funciones compuestas',
      'Derivadas de orden superior','Aplicaciones: máximos y mínimos','Regla de L\'Hôpital',
      'Teorema del valor medio','Derivadas implícitas','Derivadas de funciones inversas',
      'Optimización','Curvas y asíntotas','Repaso general','Examen final'
    ])
  },
  {
    id:          'programacion-1',
    nombre:      'Programación I',
    descripcion: 'Fundamentos de programación con Python: algoritmos, estructuras y lógica computacional.',
    icono:       '🐍',
    color:       '#16a34a',
    semanas:     generarSemanas([
      'Introducción a la programación','Variables y tipos de datos','Operadores',
      'Estructuras de decisión','Bucles: while y for','Funciones',
      'Listas y tuplas','Diccionarios','Cadenas de texto',
      'Archivos y manejo de errores','Módulos y librerías','Programación orientada a objetos I',
      'POO II: herencia','Recursividad','Proyecto final I','Presentación final'
    ])
  },
  {
    id:          'base-de-datos-1',
    nombre:      'Base de Datos I',
    descripcion: 'Diseño, modelado y consulta de bases de datos relacionales con SQL.',
    icono:       '🗄️',
    color:       '#dc2626',
    semanas:     generarSemanas([
      'Introducción a BD','Modelo entidad-relación','Modelo relacional',
      'Normalización','SQL: DDL','SQL: DML - SELECT',
      'SQL: Filtros y JOIN','SQL: Funciones agregadas','SQL: Subconsultas',
      'Índices y vistas','Procedimientos almacenados','Triggers',
      'Transacciones','Seguridad en BD','Proyecto BD I','Presentación final'
    ])
  },
  {
    id:          'matematica-discreta',
    nombre:      'Matemática Discreta',
    descripcion: 'Lógica proposicional, conjuntos, relaciones, grafos y combinatoria.',
    icono:       '🔢',
    color:       '#d97706',
    semanas:     generarSemanas([
      'Lógica proposicional','Tablas de verdad','Predicados y cuantificadores',
      'Teoría de conjuntos','Relaciones','Funciones',
      'Inducción matemática','Combinatoria I: conteo','Combinatoria II: permutaciones',
      'Probabilidad discreta','Teoría de grafos I','Teoría de grafos II',
      'Árboles','Algoritmos sobre grafos','Máquinas de estado','Repaso y examen'
    ])
  }
];

/* ── UTILIDAD SEGURA ───────────────────────────── */
function safeJSONParse(data, fallback) {
  try { return JSON.parse(data) || fallback; }
  catch { return fallback; }
}

/* ── HELPERS ───────────────────────────── */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
function getExtension(name) {
  return (name || '').split('.').pop().toLowerCase();
}
function getFileIcon(ext) {
  const map = {
    pdf:'📄', html:'🌐', htm:'🌐', css:'🎨', js:'⚡',
    sql:'🗄️', py:'🐍', ts:'⚡', json:'📋', md:'📝',
    txt:'📃', png:'🖼️', jpg:'🖼️', jpeg:'🖼️', gif:'🖼️',
    svg:'🖼️', webp:'🖼️', mp4:'🎬', mp3:'🎵', zip:'📦',
    rar:'📦', docx:'📝', doc:'📝', xlsx:'📊', pptx:'📊',
    ppt:'📊', xml:'📋', php:'🐘', java:'☕', c:'⚙️', cpp:'⚙️'
  };
  return map[ext] || '📁';
}
function getFileTypeClass(ext) {
  if (['html','htm'].includes(ext))         return 't-html';
  if (['css'].includes(ext))                return 't-css';
  if (['js','ts'].includes(ext))            return 't-js';
  if (['sql'].includes(ext))                return 't-sql';
  if (['pdf'].includes(ext))                return 't-pdf';
  if (['md','txt'].includes(ext))           return 't-md';
  if (['png','jpg','jpeg','gif','svg','webp'].includes(ext)) return 't-img';
  return 't-other';
}
function isPreviewable(ext) {
  return ['pdf','html','htm','css','js','ts','json','md','txt','sql','py',
          'png','jpg','jpeg','gif','svg','webp'].includes(ext);
}

/* ── BASE DE DATOS LOCAL ───────────────────────────── */
const DB = {

  /* ── PERFIL ── */
  getPerfil() {
    const data = localStorage.getItem('jz_perfil');
    return data ? safeJSONParse(data, { ...PERFIL_DEFAULT }) : { ...PERFIL_DEFAULT };
  },
  savePerfil(data) {
    if (!data) return;
    localStorage.setItem('jz_perfil', JSON.stringify(data));
  },

  /* ── CURSOS ── */
  getCursos() {
    const data = localStorage.getItem('jz_cursos');
    return data
      ? safeJSONParse(data, JSON.parse(JSON.stringify(CURSOS_DEFAULT)))
      : JSON.parse(JSON.stringify(CURSOS_DEFAULT));
  },
  saveCursos(cursos) {
    if (!Array.isArray(cursos)) return;
    localStorage.setItem('jz_cursos', JSON.stringify(cursos));
  },
  getCurso(id) {
    return this.getCursos().find(c => c.id === id) || null;
  },
  addCurso(curso) {
    if (!curso?.id) return false;
    const cursos = this.getCursos();
    if (cursos.find(c => c.id === curso.id)) return false;
    cursos.push({ ...curso, semanas: generarSemanas() });
    this.saveCursos(cursos);
    return true;
  },
  updateCurso(id, datos) {
    const cursos = this.getCursos();
    const idx = cursos.findIndex(c => c.id === id);
    if (idx === -1) return false;
    cursos[idx] = { ...cursos[idx], ...datos };
    this.saveCursos(cursos);
    return true;
  },
  deleteCurso(id) {
    const cursos = this.getCursos().filter(c => c.id !== id);
    this.saveCursos(cursos);
  },

  /* ── SEMANAS ── */
  updateSemana(cursoId, semanaNum, datos) {
    const cursos = this.getCursos();
    const curso  = cursos.find(c => c.id === cursoId);
    if (!curso) return false;
    const semana = curso.semanas.find(s => s.numero === semanaNum);
    if (!semana) return false;
    Object.assign(semana, datos);
    this.saveCursos(cursos);
    return true;
  },
  deleteSemana(cursoId, semanaNum) {
    const cursos = this.getCursos();
    const curso  = cursos.find(c => c.id === cursoId);
    if (!curso) return false;
    // Eliminar la semana
    curso.semanas = curso.semanas.filter(s => s.numero !== semanaNum);
    // Re-indexar para que sigan siendo correlativas (1, 2, 3...)
    curso.semanas.sort((a, b) => a.numero - b.numero);
    curso.semanas.forEach((s, idx) => {
      s.numero = idx + 1;
    });
    this.saveCursos(cursos);
    return true;
  },
  addSemana(cursoId) {
    const cursos = this.getCursos();
    const curso  = cursos.find(c => c.id === cursoId);
    if (!curso) return false;
    const maxSem = curso.semanas.reduce((max, s) => Math.max(max, s.numero), 0);
    curso.semanas.push({
      numero:   maxSem + 1,
      titulo:   `Semana ${maxSem + 1}`,
      archivos: []
    });
    this.saveCursos(cursos);
    return true;
  },

  /* ── ARCHIVOS ── */
  getArchivos(cursoId, semanaNum) {
    const curso = this.getCurso(cursoId);
    if (!curso) return [];
    const semana = curso.semanas.find(s => s.numero === semanaNum);
    return semana?.archivos || [];
  },
  addArchivo(cursoId, semanaNum, archivo) {
    if (!archivo) return false;
    const cursos = this.getCursos();
    const curso  = cursos.find(c => c.id === cursoId);
    if (!curso) return false;
    const semana = curso.semanas.find(s => s.numero === semanaNum);
    if (!semana) return false;
    if (!archivo.id) archivo.id = generateId();
    semana.archivos.push(archivo);
    this.saveCursos(cursos);
    return true;
  },
  updateArchivo(cursoId, semanaNum, archivoId, datos) {
    const cursos = this.getCursos();
    const curso  = cursos.find(c => c.id === cursoId);
    if (!curso) return false;
    const semana = curso.semanas.find(s => s.numero === semanaNum);
    if (!semana) return false;
    const idx = semana.archivos.findIndex(a => a.id === archivoId);
    if (idx === -1) return false;
    semana.archivos[idx] = { ...semana.archivos[idx], ...datos };
    this.saveCursos(cursos);
    return true;
  },
  deleteArchivo(cursoId, semanaNum, archivoId) {
    const cursos = this.getCursos();
    const curso  = cursos.find(c => c.id === cursoId);
    if (!curso) return false;
    const semana = curso.semanas.find(s => s.numero === semanaNum);
    if (!semana) return false;
    semana.archivos = semana.archivos.filter(a => a.id !== archivoId);
    this.saveCursos(cursos);
    return true;
  },

  /* ── STATS ── */
  getStats() {
    const cursos = this.getCursos();
    let semanas  = 0, archivos = 0;
    cursos.forEach(c => {
      semanas  += c.semanas.length;
      archivos += c.semanas.reduce((a, s) => a + s.archivos.length, 0);
    });
    return { cursos: cursos.length, semanas, archivos };
  },

  /* ── AUTH ── */
  login(usuario, password) {
    const creds = safeJSONParse(
      localStorage.getItem('jz_credentials'),
      AUTH_CREDENTIALS
    );
    const user = Object.values(creds)
      .find(u => u.usuario === usuario && u.password === password);
    if (user) {
      localStorage.setItem('jz_auth', JSON.stringify({ logged: true, rol: user.rol, usuario: user.usuario }));
      return true;
    }
    return false;
  },
  logout() {
    localStorage.removeItem('jz_auth');
  },
  getSession() {
    const data = localStorage.getItem('jz_auth');
    return data ? safeJSONParse(data, null) : null;
  },

  /* ── MENSAJES ── */
  getMensajes() {
    return safeJSONParse(localStorage.getItem('jz_mensajes'), []);
  },
  saveMensajes(msgs) {
    localStorage.setItem('jz_mensajes', JSON.stringify(msgs));
  },

  /* ── RESET TOTAL ── */
  resetAll() {
    ['jz_perfil','jz_cursos','jz_auth','jz_mensajes','jz_credentials'].forEach(k =>
      localStorage.removeItem(k)
    );
  }
};

/* ══════════════════════════════════════════════════════════
   MIGRACIÓN DE DATOS LEGACY
   Si el usuario tenía datos con claves antiguas, los mueve
   a las claves nuevas con prefijo 'jz_' automáticamente.
══════════════════════════════════════════════════════════ */
(function migrarDatosLegacy() {
  var migrated = false;

  // cursos → jz_cursos
  var vCursos = localStorage.getItem('cursos');
  if (vCursos && !localStorage.getItem('jz_cursos')) {
    localStorage.setItem('jz_cursos', vCursos);
    localStorage.removeItem('cursos');
    migrated = true;
  }

  // perfil → jz_perfil
  var vPerfil = localStorage.getItem('perfil');
  if (vPerfil && !localStorage.getItem('jz_perfil')) {
    localStorage.setItem('jz_perfil', vPerfil);
    localStorage.removeItem('perfil');
    migrated = true;
  }

  // auth → jz_auth
  var vAuth = localStorage.getItem('auth');
  if (vAuth && !localStorage.getItem('jz_auth')) {
    localStorage.setItem('jz_auth', vAuth);
    localStorage.removeItem('auth');
    migrated = true;
  }

  // mensajes → jz_mensajes
  var vMsg = localStorage.getItem('mensajes');
  if (vMsg && !localStorage.getItem('jz_mensajes')) {
    localStorage.setItem('jz_mensajes', vMsg);
    localStorage.removeItem('mensajes');
    migrated = true;
  }

  if (migrated) {
    console.info('[JZ Portfolio] Datos migrados a claves jz_* correctamente.');
  }
})();