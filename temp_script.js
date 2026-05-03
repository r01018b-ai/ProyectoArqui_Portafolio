
  document.addEventListener('DOMContentLoaded', async () => {
    initNav('sobreMi');
    cargarPerfil();
    initFadeIn();
  });

  async function cargarPerfil() {
    const p = await window.SupabaseCtrl.getPerfil();

    // Foto
    const ph = document.getElementById('profilePhoto');
    if (p.foto_url) {
      ph.innerHTML = `<img src="${p.foto_url}" alt="${p.nombre_completo}" style="width:100%;height:100%;object-fit:cover">`;
    }

    document.getElementById('profileNombre').textContent = p.nombre_completo || `${p.nombre} ${p.apellido}`;
    document.getElementById('profileTitulo').textContent = p.titulo;
    document.getElementById('profileBio').textContent    = p.bio;

    // Tags
    const tags = [p.ubicacion, '💻 Ingeniería de Sistemas', '🌐 Desarrollo Web', '🗃️ Bases de Datos'];
    document.getElementById('profileTags').innerHTML = tags.filter(Boolean).map(t => `<span class="tag">${t}</span>`).join('');

    // Skills en 2 columnas
    const skills = p.skills || [];
    const half   = Math.ceil(skills.length / 2);
    const mkSkill = s => `
      <div class="skill-item fade-in-up">
        <div class="skill-head"><span>${s.nombre}</span><span class="skill-pct">${s.nivel}%</span></div>
        <div class="skill-bar"><div class="skill-fill" data-pct="${s.nivel}" style="width:0%"></div></div>
      </div>`;
    document.getElementById('skillsCol1').innerHTML = skills.slice(0, half).map(mkSkill).join('');
    document.getElementById('skillsCol2').innerHTML = skills.slice(half).map(mkSkill).join('');
    animateSkills();

    // Timeline educación
    const tl = document.getElementById('timelineEdu');
    if (tl) {
      tl.innerHTML = (p.experiencia || []).map(e => `
        <div class="tl-item fade-in-up">
          <div class="tl-date">${e.fecha}</div>
          <div class="tl-title">${e.titulo}</div>
          <div class="tl-place">${e.lugar}</div>
          <div class="tl-desc">${e.descripcion}</div>
        </div>`).join('');
    }

    // Info de contacto
    const ci = document.getElementById('contactoInfo');
    if (ci) {
      const rows = [
        { icon: '✉️', label: 'Correo', val: p.correo },
        { icon: '📞', label: 'Teléfono', val: p.telefono },
        { icon: '📍', label: 'Ubicación', val: p.ubicacion }
      ];
      ci.innerHTML = rows.map(r => `
        <div class="contact-item" style="margin-bottom:16px">
          <div class="citem-icon">${r.icon}</div>
          <div>
            <div class="citem-label">${r.label}</div>
            <div class="citem-val">${r.val || '—'}</div>
          </div>
        </div>`).join('');
    }

    // Social en perfil y footer
    const sl = document.getElementById('socialLinks');
    const fs = document.getElementById('footerSoc');
    const socialHtml = `
      <a class="social-link" href="${p.linkedin||'#'}" title="LinkedIn">in</a>
      <a class="social-link" href="${p.github||'#'}"  title="GitHub">gh</a>
      <a class="social-link" href="${p.instagram||'#'}" title="Instagram">ig</a>`;
    if (sl) sl.innerHTML = socialHtml;
    if (fs) fs.innerHTML = socialHtml;

    // Botón editar (solo admin)
    if (AUTH.isAdmin()) {
      const btn = document.getElementById('btnEditarPerfil');
      if (btn) btn.classList.remove('hidden');
    }

    initFadeIn();
  }

  /* ── Cambiar foto ── */
  function cambiarFoto(input) {
    if (!input.files.length) return;
    const reader = new FileReader();
    reader.onload = async e => {
      const p = await window.SupabaseCtrl.getPerfil();
      p.foto_url = e.target.result;
      await window.SupabaseCtrl.savePerfil(p);
      cargarPerfil();
      TOAST.show('Foto actualizada 💜', 'success');
    };
    reader.readAsDataURL(input.files[0]);
  }

  /* ── Modal editar ── */
  async function abrirModalEditar() {
    const p = await window.SupabaseCtrl.getPerfil();
    document.getElementById('editNombre').value    = p.nombre    || '';
    document.getElementById('editApellido').value  = p.apellido  || '';
    document.getElementById('editTitulo').value    = p.titulo    || '';
    document.getElementById('editBio').value       = p.bio       || '';
    document.getElementById('editCorreo').value    = p.correo    || '';
    document.getElementById('editTelefono').value  = p.telefono  || '';
    document.getElementById('editUbicacion').value = p.ubicacion || '';
    document.getElementById('editLinkedin').value  = p.linkedin  || '';
    document.getElementById('editGithub').value    = p.github    || '';
    document.getElementById('modalEditar').classList.add('show');
  }

  function cerrarModalEditar() {
    document.getElementById('modalEditar').classList.remove('show');
  }

  async function guardarPerfil(e) {
    e.preventDefault();
    const p = await window.SupabaseCtrl.getPerfil();
    const n = document.getElementById('editNombre').value.trim();
    const a = document.getElementById('editApellido').value.trim();
    p.nombre         = n;
    p.apellido       = a;
    p.nombre_completo = `${n} ${a}`;
    p.titulo         = document.getElementById('editTitulo').value.trim();
    p.bio            = document.getElementById('editBio').value.trim();
    p.correo         = document.getElementById('editCorreo').value.trim();
    p.telefono       = document.getElementById('editTelefono').value.trim();
    p.ubicacion      = document.getElementById('editUbicacion').value.trim();
    p.linkedin       = document.getElementById('editLinkedin').value.trim();
    p.github         = document.getElementById('editGithub').value.trim();
    await window.SupabaseCtrl.savePerfil(p);
    cerrarModalEditar();
    cargarPerfil();
    TOAST.show('Perfil actualizado correctamente 💜', 'success');
  }

  async function descargarCV() {
    const p = await window.SupabaseCtrl.getPerfil();
    if (p.cv_url) {
      const a = document.createElement('a');
      a.href = p.cv_url; a.download = 'CV_' + p.nombre_completo + '.pdf'; a.click();
    } else {
      TOAST.show('No hay CV cargado aún. Súbelo desde el panel de administración.', 'info');
    }
  }
