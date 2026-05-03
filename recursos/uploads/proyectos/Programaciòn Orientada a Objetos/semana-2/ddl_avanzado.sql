-- ============================================================
--  BASE DE DATOS II - Semana 2: DDL Avanzado
--  Jasmin Elena Acosta Fernández | UPLA 2026
-- ============================================================

-- ── MODIFICAR TABLAS (ALTER TABLE) ─────────────────────────

-- Agregar columna
ALTER TABLE estudiantes
  ADD COLUMN estado ENUM('activo','inactivo','egresado') DEFAULT 'activo';

-- Modificar columna existente
ALTER TABLE estudiantes
  MODIFY COLUMN telefono VARCHAR(20);

-- Renombrar columna (MySQL 8.0+)
ALTER TABLE cursos
  RENAME COLUMN creditos TO creditos_academicos;

-- Agregar índice único
ALTER TABLE estudiantes
  ADD UNIQUE INDEX idx_correo (correo);

-- Agregar índice de búsqueda
ALTER TABLE cursos
  ADD INDEX idx_nombre_curso (nombre);

-- ── CONSTRAINTS AVANZADOS ──────────────────────────────────

-- Tabla matriculas con constraints
CREATE TABLE matriculas (
    id_matricula  INT PRIMARY KEY AUTO_INCREMENT,
    id_estudiante INT NOT NULL,
    id_curso      INT NOT NULL,
    ciclo         VARCHAR(10) NOT NULL COMMENT 'Ej: 2026-I',
    nota_final    DECIMAL(4,2),
    estado        ENUM('matriculado','aprobado','desaprobado','retirado') DEFAULT 'matriculado',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Evitar matrícula duplicada
    UNIQUE KEY uk_matricula (id_estudiante, id_curso, ciclo),

    -- Check constraint
    CONSTRAINT chk_nota CHECK (nota_final IS NULL OR nota_final BETWEEN 0 AND 20),

    CONSTRAINT fk_mat_est  FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    CONSTRAINT fk_mat_cur  FOREIGN KEY (id_curso)      REFERENCES cursos(id_curso)
);

-- ── VISTAS ────────────────────────────────────────────────

CREATE OR REPLACE VIEW v_estudiantes_activos AS
SELECT
    e.codigo,
    CONCAT(e.nombres, ' ', e.apellidos) AS nombre_completo,
    e.correo,
    e.ciclo_actual,
    ec.nombre AS escuela,
    f.nombre  AS facultad
FROM estudiantes e
JOIN escuelas ec ON e.id_escuela = ec.id_escuela
JOIN facultades f ON ec.id_facultad = f.id_facultad
WHERE e.estado = 'activo';

-- Consulta a la vista
SELECT * FROM v_estudiantes_activos ORDER BY nombre_completo;
