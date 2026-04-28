# 📡 Redes y Comunicaciones - Semana 1
**UPLA** · Escuela de Sistemas y Computación · 2026-I  
**Alumna:** Jasmin Elena Acosta Fernández

---

## ¿Qué es una red de computadoras?

Una **red de computadoras** es un conjunto de dispositivos interconectados que pueden compartir recursos e información.

### Clasificación por tamaño

| Tipo | Nombre | Alcance |
|------|--------|---------|
| **PAN** | Personal Area Network | ~10 metros (Bluetooth) |
| **LAN** | Local Area Network | Edificio, campus |
| **MAN** | Metropolitan Area Network | Ciudad |
| **WAN** | Wide Area Network | País, continente |
| **Internet** | — | Global |

---

## Modelos de referencia

### Modelo OSI (7 capas)
```
7. Aplicación     ← HTTP, FTP, SMTP, DNS
6. Presentación   ← SSL/TLS, cifrado
5. Sesión         ← NetBIOS, RPC
4. Transporte     ← TCP, UDP
3. Red            ← IP, ICMP, ARP
2. Enlace datos   ← Ethernet, Wi-Fi (MAC)
1. Física         ← Cables, señales
```

### Modelo TCP/IP (4 capas)
```
4. Aplicación     ← HTTP, DNS, DHCP
3. Transporte     ← TCP, UDP
2. Internet       ← IP, ICMP
1. Acceso red     ← Ethernet, Wi-Fi
```

---

## Dispositivos de red básicos

- 🔌 **Hub** — repite señal a todos los puertos (obsoleto)
- 🔀 **Switch** — envía datos al puerto correcto (dirección MAC)
- 🌐 **Router** — conecta redes diferentes (dirección IP)
- 🛡️ **Firewall** — filtra tráfico según reglas de seguridad
- 📶 **Access Point** — punto de acceso inalámbrico

---

## Práctica: Comando `ping`
```bash
ping google.com          # Prueba conectividad
ping -c 4 8.8.8.8        # Solo 4 paquetes (Linux/Mac)
ping -n 4 8.8.8.8        # Solo 4 paquetes (Windows)
tracert google.com       # Traza la ruta (Windows)
traceroute google.com    # Traza la ruta (Linux)
```

---
*Próxima semana: Modelo OSI en profundidad*
