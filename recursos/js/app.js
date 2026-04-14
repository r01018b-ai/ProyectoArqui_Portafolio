// ============================================================
//  APP.JS – Funcionalidades compartidas
//  Tema · Auth · Toast · Nav · Animaciones
// ============================================================

/* ── TEMA ────────────────────────────────────────────────────── */
const TEMA = {
  init() {
    const saved = localStorage.getItem('jz_tema') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    this.updateIcon(saved);
  },
  toggle() {
    const cur  = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('jz_tema', next);
    this.updateIcon(next);
  },
  updateIcon(tema) {
    document.querySelectorAll('.btn-theme').forEach(btn => {
      btn.textContent = tema === 'dark' ? '☀️' : '🌙';
    });
  }
};

/* ── AUTH ────────────────────────────────────────────────────── */
const AUTH = {
  getState() {
    const s = localStorage.getItem('jz_auth');
    return s ? JSON.parse(s) : { logged: false, rol: null, usuario: null };
  },
  isLogged()  { return this.getState().logged; },
  isAdmin()   { return this.getState().rol === 'admin'; },
  login(usuario, password) {
    for (const key in AUTH_CREDENTIALS) {
      const cred = AUTH_CREDENTIALS[key];
      if (cred.usuario === usuario && cred.password === password) {
        const state = { logged: true, rol: cred.rol, usuario: cred.usuario };
        localStorage.setItem('jz_auth', JSON.stringify(state));
        return state;
      }
    }
    return null;
  },
  logout() {
    localStorage.removeItem('jz_auth');
    TOAST.show('Sesión cerrada correctamente', 'info');
    setTimeout(() => { window.location.href = getRoot() + 'index.html'; }, 900);
  }
};

/* ── TOAST ───────────────────────────────────────────────────── */
const TOAST = {
  _container: null,
  _ensure() {
    if (!this._container) {
      this._container = document.getElementById('toastContainer');
      if (!this._container) {
        this._container = document.createElement('div');
        this._container.className = 'toast-container';
        this._container.id = 'toastContainer';
        document.body.appendChild(this._container);
      }
    }
  },
  show(msg, type = 'info', duration = 3500) {
    this._ensure();
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span>
                   <span style="flex:1">${msg}</span>
                   <span class="toast-close" onclick="this.parentElement.remove()">✕</span>`;
    this._container.appendChild(t);
    setTimeout(() => t && t.remove && t.remove(), duration);
  }
};

/* ── HELPERS DE RUTA ─────────────────────────────────────────── */
function getRoot() {
  return window.location.pathname.includes('/vistas/') ? '../' : '';
}
function getUploadsPath() { return getRoot() + 'recursos/uploads/'; }

/* ── INICIALIZAR NAVEGACIÓN ──────────────────────────────────── */
function initNav(activePage) {
  const root = getRoot();
  const auth = AUTH.getState();

  /* Acciones del nav según rol */
  const navActions = document.getElementById('navActions');
  if (navActions) {
    if (auth.logged && auth.rol === 'admin') {
      const showAdmin = activePage !== 'admin';
      navActions.innerHTML = `
        <span class="badge badge-admin" style="font-size:.78rem;padding:5px 12px">
          👑 Admin
        </span>
        ${showAdmin ? `<a href="${root}vistas/admin.html" style="padding:8px 16px;border-radius:9999px;background:var(--bg2);border:1px solid var(--border);color:var(--primary);font-size:.84rem;font-weight:600;text-decoration:none;transition:all .3s">⚙️ Panel</a>` : ''}
        <button class="btn-theme" onclick="TEMA.toggle()" title="Cambiar tema">🌙</button>
        <button class="btn-logout" onclick="AUTH.logout()">Salir</button>
      `;
    } else {
      /* Visitante público: botón de tema + acceso sutil al panel admin */
      navActions.innerHTML = `
        <button class="btn-theme" onclick="TEMA.toggle()" title="Cambiar tema">🌙</button>
        <a href="${root}vistas/login.html"
           style="padding:7px 15px;border-radius:9999px;background:transparent;
                  border:1.5px solid var(--border);color:var(--txt-m);
                  font-size:.78rem;font-weight:600;text-decoration:none;
                  transition:all .3s;display:inline-flex;align-items:center;gap:5px"
           onmouseover="this.style.borderColor='var(--primary)';this.style.color='var(--primary)'"
           onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--txt-m)'"
           title="Acceso administrador">⚙️ Admin</a>
      `;
    }
  }

  /* Enlace activo */
  document.querySelectorAll('.nav-link[data-page]').forEach(el => {
    if (el.dataset.page === activePage) el.classList.add('active');
  });

  /* Hamburger */
  const ham    = document.getElementById('navHamburger');
  const navLnk = document.getElementById('navLinks');
  if (ham && navLnk) {
    ham.addEventListener('click', () => navLnk.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!ham.contains(e.target) && !navLnk.contains(e.target))
        navLnk.classList.remove('open');
    });
  }

  /* Modo oscuro al cargar */
  TEMA.init();
  TOAST._ensure();

  /* Mostrar/ocultar botón de edición perfil si admin */
  if (auth.rol === 'admin') {
    document.body.classList.add('is-admin');
  }
}

/* ── ANIMACIÓN SKILL BARS ────────────────────────────────────── */
function animateSkills() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target.querySelector('.skill-fill');
        if (fill) fill.style.width = (fill.dataset.pct || 0) + '%';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.skill-item').forEach(el => observer.observe(el));
}

/* ── FADE-IN SCROLL ──────────────────────────────────────────── */
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity  = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in-up').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px)';
    el.style.transition = `opacity .6s var(--ease), transform .6s var(--ease)`;
    const delay = el.style.animationDelay || '0s';
    el.style.transitionDelay = delay;
    observer.observe(el);
  });
}

/* ── RENDERIZAR SKILLS (usado en sobreMi) ────────────────────── */
function renderSkills(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const perfil = DB.getPerfil();
  el.innerHTML = (perfil.skills || []).map(s => `
    <div class="skill-item">
      <div class="skill-head">
        <span>${s.nombre}</span>
        <span class="skill-pct">${s.nivel}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-fill" data-pct="${s.nivel}" style="width:0%"></div>
      </div>
    </div>
  `).join('');
  animateSkills();
}

/* ── RENDERIZAR TIMELINE ─────────────────────────────────────── */
function renderTimeline(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const perfil = DB.getPerfil();
  el.innerHTML = (perfil.experiencia || []).map(item => `
    <div class="tl-item fade-in-up">
      <div class="tl-date">${item.fecha}</div>
      <div class="tl-title">${item.titulo}</div>
      <div class="tl-place">${item.lugar}</div>
      <div class="tl-desc">${item.descripcion}</div>
    </div>
  `).join('');
}

/* ── RENDER CURSOS ───────────────────────────────────────────── */
function renderCursoCards(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const root    = getRoot();
  const cursos  = DB.getCursos();
  el.innerHTML  = cursos.map(c => {
    const totalArch = c.semanas.reduce((acc, s) => acc + s.archivos.length, 0);
    return `
    <a class="curso-card fade-in-up" href="${root}vistas/semanas.html?curso=${c.id}" id="cc-${c.id}">
      <span class="curso-icon">${c.icono}</span>
      <div class="curso-weeks-badge">📅 16 semanas</div>
      <div class="curso-title">${c.nombre}</div>
      <div class="curso-desc">${c.descripcion}</div>
      <div class="curso-footer">
        <span class="curso-num">📁 ${totalArch} archivo${totalArch !== 1 ? 's' : ''}</span>
        <span class="btn btn-primary btn-sm">Ver semanas →</span>
      </div>
    </a>
  `}).join('');
  initFadeIn();
}
