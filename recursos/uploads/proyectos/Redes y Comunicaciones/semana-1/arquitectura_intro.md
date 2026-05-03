# 🏗️ Arquitectura de Software - Semana 1
**Universidad Peruana Los Andes (UPLA)** | Facultad de Ingeniería  
**Alumna:** Jasmin Elena Acosta Fernández | **Ciclo:** 2026-I

---

## 🎯 ¿Qué es la Arquitectura de Software?

La **arquitectura de software** es la estructura de alto nivel de un sistema, que define:
- Los **componentes** y sus responsabilidades
- Las **relaciones** entre componentes
- Los **principios** que guían el diseño

> *"La arquitectura de software define la forma de un sistema, así como la arquitectura de un edificio define su estructura."*  
> — Robert C. Martin

---

## 📐 Principales Estilos Arquitectónicos

| Estilo | Descripción | Ejemplo de uso |
|--------|-------------|----------------|
| **Monolítico** | Todo en una sola unidad | Aplicaciones pequeñas |
| **MVC** | Modelo-Vista-Controlador | Web apps, APIs |
| **Capas (N-Tier)** | Separación horizontal | Sistemas bancarios |
| **Microservicios** | Servicios independientes | Netflix, Amazon |
| **Serverless** | Sin gestión de servidores | AWS Lambda, Firebase |
| **Event-Driven** | Basado en eventos | IoT, mensajería |

---

## 📦 Principios SOLID

| Principio | Nombre completo |
|-----------|----------------|
| **S** | Single Responsibility Principle |
| **O** | Open/Closed Principle |
| **L** | Liskov Substitution Principle |
| **I** | Interface Segregation Principle |
| **D** | Dependency Inversion Principle |

---

## 🔗 Diagrama MVC (texto)

```
[ Usuario ]
     ↓ petición
[ Controlador ] ←→ [ Modelo ] ←→ [ Base de Datos ]
     ↓
[ Vista ] → respuesta → [ Usuario ]
```

---

## 📝 Tarea Semana 1
1. Investigar un sistema real y clasificar su arquitectura
2. Diagramar los componentes principales
3. Identificar qué principios SOLID aplica

---
*Siguiente semana: Requisitos y casos de uso con UML*
