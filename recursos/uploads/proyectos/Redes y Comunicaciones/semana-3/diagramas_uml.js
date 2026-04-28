/**
 * Arquitectura de Software - Semana 3: Diagramas UML en código
 * Patrón MVC implementado en JavaScript
 * Jasmin Elena Acosta Fernández | UPLA 2026
 */

'use strict';

// ── MODELO ────────────────────────────────────────────────
class EstudianteModel {
  #datos = [];

  agregar(estudiante) {
    if (!estudiante.codigo || !estudiante.nombre)
      throw new Error('Código y nombre son obligatorios');
    this.#datos.push({ ...estudiante, id: Date.now() });
    return true;
  }

  obtenerTodos() {
    return [...this.#datos];
  }

  buscarPorCodigo(codigo) {
    return this.#datos.find(e => e.codigo === codigo) || null;
  }

  eliminar(id) {
    const idx = this.#datos.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.#datos.splice(idx, 1);
    return true;
  }

  actualizar(id, datosNuevos) {
    const idx = this.#datos.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.#datos[idx] = { ...this.#datos[idx], ...datosNuevos };
    return true;
  }
}

// ── VISTA ─────────────────────────────────────────────────
class EstudianteView {
  renderListado(estudiantes) {
    if (!estudiantes.length) {
      console.log('📭 No hay estudiantes registrados.');
      return;
    }
    console.log('\n📋 LISTADO DE ESTUDIANTES');
    console.log('─'.repeat(50));
    estudiantes.forEach(e => {
      console.log(`  [${e.codigo}] ${e.nombre} — Ciclo ${e.ciclo}`);
    });
    console.log('─'.repeat(50));
    console.log(`Total: ${estudiantes.length} estudiante(s)\n`);
  }

  mostrarError(msg) {
    console.error('❌ Error:', msg);
  }

  mostrarExito(msg) {
    console.log('✅', msg);
  }
}

// ── CONTROLADOR ───────────────────────────────────────────
class EstudianteController {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view  = view;
  }

  agregar(codigo, nombre, ciclo) {
    try {
      this.#model.agregar({ codigo, nombre, ciclo });
      this.#view.mostrarExito(`Estudiante "${nombre}" registrado.`);
    } catch (err) {
      this.#view.mostrarError(err.message);
    }
  }

  listar() {
    const todos = this.#model.obtenerTodos();
    this.#view.renderListado(todos);
  }

  eliminar(id) {
    const ok = this.#model.eliminar(id);
    if (ok) this.#view.mostrarExito('Estudiante eliminado.');
    else    this.#view.mostrarError('ID no encontrado.');
  }
}

// ── DEMO (simula uso de la app) ───────────────────────────
const modelo      = new EstudianteModel();
const vista       = new EstudianteView();
const controlador = new EstudianteController(modelo, vista);

controlador.agregar('2024001', 'Jasmin Elena Acosta Fernández', 5);
controlador.agregar('2024002', 'Carlos Quispe López',           5);
controlador.agregar('2023010', 'María Ramírez Torres',          7);
controlador.listar();
