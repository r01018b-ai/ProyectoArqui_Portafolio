/**
 * POO - SEMANA 1: Introducción a Clases y Objetos
 * Universidad Peruana Los Andes (UPLA) - 2026
 * Alumna: Jasmin Elena Acosta Fernández
 */

// ── CLASE BASE ────────────────────────────────────────────
public class Persona {

    // Atributos (encapsulados)
    private String nombres;
    private String apellidos;
    private String dni;
    private int    edad;

    // Constructor completo
    public Persona(String nombres, String apellidos, String dni, int edad) {
        this.nombres   = nombres;
        this.apellidos = apellidos;
        this.dni       = dni;
        this.edad      = edad;
    }

    // Constructor vacío
    public Persona() {}

    // ── GETTERS ───────────────────────────────────────────
    public String getNombres()   { return nombres; }
    public String getApellidos() { return apellidos; }
    public String getDni()       { return dni; }
    public int    getEdad()      { return edad; }

    // Nombre completo (computed)
    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }

    // ── SETTERS CON VALIDACIÓN ────────────────────────────
    public void setNombres(String nombres) {
        if (nombres == null || nombres.trim().isEmpty())
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        this.nombres = nombres.trim();
    }

    public void setEdad(int edad) {
        if (edad < 0 || edad > 120)
            throw new IllegalArgumentException("Edad inválida: " + edad);
        this.edad = edad;
    }

    public void setDni(String dni) {
        if (dni == null || !dni.matches("\\d{8}"))
            throw new IllegalArgumentException("DNI inválido (debe tener 8 dígitos)");
        this.dni = dni;
    }

    // ── MÉTODO SOBRESCRITO ────────────────────────────────
    @Override
    public String toString() {
        return String.format("Persona{nombre='%s', dni='%s', edad=%d}",
                getNombreCompleto(), dni, edad);
    }
}

// ── CLASE ESTUDIANTE (hereda de Persona) ──────────────────
class Estudiante extends Persona {

    private String codigo;
    private String escuela;
    private int    ciclo;

    public Estudiante(String nombres, String apellidos, String dni,
                      int edad, String codigo, String escuela, int ciclo) {
        super(nombres, apellidos, dni, edad);
        this.codigo  = codigo;
        this.escuela = escuela;
        this.ciclo   = ciclo;
    }

    public String getCodigo()  { return codigo; }
    public String getEscuela() { return escuela; }
    public int    getCiclo()   { return ciclo; }

    public void presentarse() {
        System.out.println("Hola, soy " + getNombreCompleto());
        System.out.println("Código: " + codigo + " | Escuela: " + escuela + " | Ciclo: " + ciclo);
    }

    @Override
    public String toString() {
        return String.format("Estudiante{nombre='%s', codigo='%s', escuela='%s', ciclo=%d}",
                getNombreCompleto(), codigo, escuela, ciclo);
    }
}

// ── PROGRAMA PRINCIPAL ────────────────────────────────────
class Main {
    public static void main(String[] args) {
        Estudiante est = new Estudiante(
            "Jasmin Elena", "Acosta Fernández",
            "74123456", 20,
            "2024001", "Sistemas y Computación", 5
        );

        est.presentarse();
        System.out.println(est);
    }
}
