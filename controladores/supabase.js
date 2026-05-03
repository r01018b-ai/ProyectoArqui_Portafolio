const SUPABASE_URL = 'https://uhryqlwjknqdovgemcvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocnlxbHdqa25xZG92Z2VtY3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzg0NjEsImV4cCI6MjA5MTc1NDQ2MX0.48TWW08Sx-9Q95gdGqFvOV7C5DM2Drwxnvw4AyZp8gI';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SupabaseCtrl = {
  // --------- PERFIL ---------
  async getPerfil() {
    const { data, error } = await supabaseClient.from('perfil').select('*').limit(1).single();
    if (error) return null;
    if (data && typeof data.skills === 'string') {
      data.skills = JSON.parse(data.skills);
    }
    return data;
  },

  async savePerfil(perfilData) {
    if (typeof perfilData.skills !== 'string') {
      perfilData.skills = JSON.stringify(perfilData.skills);
    }
    const { data: existing } = await supabaseClient.from('perfil').select('id').limit(1).single();
    if (existing) {
      const { error } = await supabaseClient.from('perfil').update(perfilData).eq('id', existing.id);
      return !error;
    } else {
      const { error } = await supabaseClient.from('perfil').insert([perfilData]);
      return !error;
    }
  },

  // --------- CURSOS ---------
  async getCursos() {
    const { data, error } = await supabaseClient
      .from('cursos')
      .select('*, semanas(*, archivos(*))');
    if (error) return [];
    data.forEach(c => {
      if (c.semanas) {
        c.semanas.sort((a, b) => a.numero - b.numero);
        c.semanas.forEach(s => {
          if (s.archivos) {
            s.archivos.forEach(a => {
              a.archivo = a.archivo_nombre;
              a.fechaSubida = a.fecha_subida;
              a.dataUrl = a.data_url;
              a.storageUrl = a.storage_url;
            });
          }
        });
      }
    });
    return data;
  },

  async getCurso(id) {
    const { data, error } = await supabaseClient
      .from('cursos')
      .select('*, semanas(*, archivos(*))')
      .eq('id', id)
      .single();
    if (error) return null;
    if (data.semanas) {
      data.semanas.sort((a, b) => a.numero - b.numero);
      data.semanas.forEach(s => {
        if (s.archivos) {
          s.archivos.forEach(a => {
            a.archivo = a.archivo_nombre;
            a.fechaSubida = a.fecha_subida;
            a.dataUrl = a.data_url;
            a.storageUrl = a.storage_url;
          });
        }
      });
    }
    return data;
  },

  async addCurso(cursoData) {
    // Si queremos generar un ID aquí, en DB relacional podemos dejar que lo haga el default, 
    // pero el front enviaba el ID. Asumimos que viene con el id en cursoData.
    const { error } = await supabaseClient.from('cursos').insert([cursoData]);
    return !error;
  },

  async updateCurso(id, cursoData) {
    const { error } = await supabaseClient.from('cursos').update(cursoData).eq('id', id);
    return !error;
  },

  async deleteCurso(id) {
    const { error } = await supabaseClient.from('cursos').delete().eq('id', id);
    return !error;
  },

  // --------- SEMANAS ---------
  async addSemana(cursoId) {
    // Necesitamos saber el numero maximo para esta semana
    const { data: semanas } = await supabaseClient.from('semanas').select('numero').eq('curso_id', cursoId);
    let max = 0;
    if (semanas && semanas.length > 0) {
      max = Math.max(...semanas.map(s => s.numero));
    }
    const { error } = await supabaseClient.from('semanas').insert([{
      curso_id: cursoId,
      numero: max + 1,
      titulo: `Semana ${max + 1}`
    }]);
    return !error;
  },

  async init16Semanas(cursoId) {
    const weeks = [];
    for (let i = 1; i <= 16; i++) {
      weeks.push({ curso_id: cursoId, numero: i, titulo: `Semana ${i}` });
    }
    const { error } = await supabaseClient.from('semanas').insert(weeks);
    return !error;
  },

  async updateSemana(cursoId, semanaNum, datos) {
    // Para no usar UUIDs directamente en el form viejo, buscamos por curso y numero
    const { data } = await supabaseClient.from('semanas').select('id').eq('curso_id', cursoId).eq('numero', semanaNum).single();
    if (!data) return false;
    const { error } = await supabaseClient.from('semanas').update(datos).eq('id', data.id);
    return !error;
  },

  async deleteSemana(cursoId, semanaNum) {
    const { data } = await supabaseClient.from('semanas').select('id').eq('curso_id', cursoId).eq('numero', semanaNum).single();
    if (!data) return false;
    const { error } = await supabaseClient.from('semanas').delete().eq('id', data.id);
    return !error;
  },

  // --------- ARCHIVOS ---------
  async getArchivos(cursoId, semanaNum) {
    const { data: semana } = await supabaseClient.from('semanas').select('id').eq('curso_id', cursoId).eq('numero', semanaNum).single();
    if (!semana) return [];
    const { data, error } = await supabaseClient.from('archivos').select('*').eq('semana_id', semana.id);
    if (error) return [];
    data.forEach(a => {
      a.archivo = a.archivo_nombre;
      a.fechaSubida = a.fecha_subida;
      a.dataUrl = a.data_url;
      a.storageUrl = a.storage_url;
    });
    return data;
  },

  async addArchivo(cursoId, semanaNum, archivo) {
    const { data: semana } = await supabaseClient.from('semanas').select('id').eq('curso_id', cursoId).eq('numero', semanaNum).single();
    if (!semana) return false;

    const newArchivo = {
      semana_id: semana.id,
      nombre: archivo.nombre,
      descripcion: archivo.descripcion,
      archivo_nombre: archivo.archivo || archivo.nombre,
      ruta: archivo.ruta,
      ext: archivo.ext,
      tipo: archivo.tipo,
      tamano: archivo.tamano || 0,
      fecha_subida: new Date().toISOString(),
      data_url: archivo.dataUrl || null,
      storage_url: archivo.storageUrl || null
    };
    const { error } = await supabaseClient.from('archivos').insert([newArchivo]);
    return !error;
  },

  /* ── STORAGE: Subir archivo real a un bucket ── */
  async uploadArchivoStorage(file, path) {
    // Intentamos subir al bucket 'archivos'
    const { data, error } = await supabaseClient.storage
      .from('archivos')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Error al subir a Storage:', error.message);
      return null;
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('archivos')
      .getPublicUrl(path);

    return publicUrl;
  },

  async updateArchivo(cursoId, semanaNum, id, datos) {
    const { error } = await supabaseClient.from('archivos').update(datos).eq('id', id);
    return !error;
  },

  async deleteArchivo(cursoId, semanaNum, id) {
    const { error } = await supabaseClient.from('archivos').delete().eq('id', id);
    return !error;
  },

  // --------- MENSAJES ---------
  async getMensajes() {
    const { data, error } = await supabaseClient.from('mensajes').select('*').order('fecha', { ascending: false });
    return error ? [] : data;
  },

  async addMensaje(mensajeData) {
    const { error } = await supabaseClient.from('mensajes').insert([{
      ...mensajeData,
      leido: false
    }]);
    return !error;
  },

  async deleteMensaje(id) {
    const { error } = await supabaseClient.from('mensajes').delete().eq('id', id);
    return !error;
  },

  async deleteAllMensajes() {
    const { error } = await supabaseClient.from('mensajes').delete().neq('id', 'dummy');
    return !error;
  },

  // --------- STATS ---------
  async getStats() {
    // Calculate simple stats fetching all
    const cursos = await this.getCursos();
    let semanas = 0, archivos = 0;
    cursos.forEach(c => {
      semanas += (c.semanas || []).length;
      archivos += (c.semanas || []).reduce((acc, s) => acc + (s.archivos || []).length, 0);
    });
    return { cursos: cursos.length, semanas, archivos };
  },

  // --------- AUTH ---------
  async login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      console.error('Error de autenticación:', error.message);
      return false;
    }
    return true;
  },

  async logout() {
    await supabaseClient.auth.signOut();
  },

  async getSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) return null;

    // Adaptamos el formato compatible que espera tu frontend para no romper la app
    return {
      logged: true,
      rol: 'admin',
      usuario: data.session.user.email
    };
  }
};

window.SupabaseCtrl = SupabaseCtrl;
window.supabaseClient = supabaseClient;
