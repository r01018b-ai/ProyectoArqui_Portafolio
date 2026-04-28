-- ============================================================
--  BASE DE DATOS II - Semana 1: Repaso Modelo Relacional
--  Universidad Peruana Los Andes (UPLA) - 2026
--  Alumna: Jasmin Elena Acosta Fernández
-- ============================================================

-- ── CREAR BASE DE DATOS ────────────────────────────────────
CREATE DATABASE IF NOT EXISTS universidad_upla
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE universidad_upla;

-- ── TABLA: FACULTADES ──────────────────────────────────────
CREATE TABLE facultades (
    id_facultad   INT PRIMARY KEY AUTO_INCREMENT,
    nombre        VARCHAR(100) NOT NULL,
    codigo        VARCHAR(10)  UNIQUE NOT NULL,
    decano        VARCHAR(100),
    fecha_creacion DATE,
    activa        BOOLEAN DEFAULT TRUE
);

-- ── TABLA: ESCUELAS ────────────────────────────────────────
CREATE TABLE escuelas (
    id_escuela   INT PRIMARY KEY AUTO_INCREMENT,
    nombre       VARCHAR(100) NOT NULL,
    id_facultad  INT NOT NULL,
    director     VARCHAR(100),
    CONSTRAINT fk_escuela_facultad
        FOREIGN KEY (id_facultad) REFERENCES facultades(id_facultad)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ── TABLA: ESTUDIANTES ─────────────────────────────────────
CREATE TABLE estudiantes (
    id_estudiante INT PRIMARY KEY AUTO_INCREMENT,
    codigo        VARCHAR(12) UNIQUE NOT NULL,
    nombres       VARCHAR(80) NOT NULL,
    apellidos     VARCHAR(80) NOT NULL,
    correo        VARCHAR(120) UNIQUE,
    telefono      VARCHAR(15),
    id_escuela    INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    ciclo_actual  TINYINT CHECK (ciclo_actual BETWEEN 1 AND 10),
    CONSTRAINT fk_est_escuela
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela)
);

-- ── TABLA: CURSOS ──────────────────────────────────────────
CREATE TABLE cursos (
    id_curso    INT PRIMARY KEY AUTO_INCREMENT,
    codigo      VARCHAR(10) UNIQUE NOT NULL,
    nombre      VARCHAR(120) NOT NULL,
    creditos    TINYINT DEFAULT 4,
    ciclo       TINYINT,
    id_escuela  INT,
    CONSTRAINT fk_curso_escuela
        FOREIGN KEY (id_escuela) REFERENCES escuelas(id_escuela)
);

-- ── DATOS DE PRUEBA ────────────────────────────────────────
INSERT INTO facultades (nombre, codigo, decano, fecha_creacion) VALUES
  ('Ingeniería', 'ING', 'Dr. Carlos Ríos Mendoza', '1990-03-15'),
  ('Derecho',    'DER', 'Dra. Ana Vargas Pino',    '1988-08-20');

INSERT INTO escuelas (nombre, id_facultad, director) VALUES
  ('Sistemas y Computación', 1, 'Mg. Luis Torres Salas'),
  ('Civil',                 1, 'Mg. Rosa Chávez Díaz'),
  ('Derecho',               2, 'Dr. Pedro Luna Flores');

INSERT INTO estudiantes (codigo, nombres, apellidos, correo, id_escuela, fecha_ingreso, ciclo_actual) VALUES
  ('2024001', 'Jasmin Elena', 'Acosta Fernández', 'jacosta@upla.edu.pe', 1, '2024-03-01', 5),
  ('2024002', 'Carlos',       'Quispe López',     'cquispe@upla.edu.pe', 1, '2024-03-01', 5),
  ('2023050', 'María',        'Ramírez Torres',   'mramirez@upla.edu.pe',1, '2023-03-01', 7);

-- ── CONSULTAS DE REPASO ────────────────────────────────────
-- Ver todos los estudiantes de Sistemas
SELECT e.codigo, CONCAT(e.nombres,' ',e.apellidos) AS nombre_completo,
       e.ciclo_actual, ec.nombre AS escuela
FROM estudiantes e
JOIN escuelas ec ON e.id_escuela = ec.id_escuela
WHERE ec.nombre = 'Sistemas y Computación'
ORDER BY e.apellidos;

-- Contar estudiantes por escuela
SELECT ec.nombre AS escuela, COUNT(*) AS total_estudiantes
FROM estudiantes e
JOIN escuelas ec ON e.id_escuela = ec.id_escuela
GROUP BY ec.id_escuela, ec.nombre
ORDER BY total_estudiantes DESC;
