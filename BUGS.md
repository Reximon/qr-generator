# Bugs pendientes

## Críticos

### 1. WiFi "sin cifrado" genera QR incorrecto
- **Archivo**: `src/utils/qrGenerator.ts:21`
- **Problema**: El frontend ofrece `nop` (None), pero `formatWiFiQR` convierte todo lo que no sea WEP en `WPA`. Un QR "sin cifrado" no conectará.
- **Solución**: Emitir `WIFI:T:nop;S:...;;` (sin campo P) cuando encryption sea `nop`.

### 2. XSS en stats.html
- **Archivo**: `public/stats.html:49`
- **Problema**: `q.url` se inserta con `innerHTML` sin escapar. Cualquiera puede hacer `POST /api/track` con una url maliciosa (`javascript:...` o rompiendo el atributo) y ejecutar script en la página de stats.
- **Solución**: Usar `textContent` / `createElement` en vez de `innerHTML`, y escapar la URL.

### 3. Dockerfile roto (producción)
- **Archivo**: `Dockerfile:18,26`
- **Problema**:
  - `addgroup -S` / `adduser -S` es sintaxis de Alpine; falla en `node:20-slim` (Debian).
  - El healthcheck usa `curl`, que no está instalado en la imagen.
- **Solución**:
  - `addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 --ingroup appgroup appuser`
  - `RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*`

## Medios

### 4. `ensureUrl` corrompe texto plano
- **Archivo**: `public/index.html:286`
- **Problema**: Todo texto sin `http` se fuerza a `https://`. Si el usuario escribe "hola mundo" (modo Texto), el QR contendrá `https://hola mundo`.
- **Solución**: Solo añadir el prefijo si el texto parece una URL.

### 5. Contraseña WiFi viaja en la query string (GET)
- **Archivo**: `public/index.html:281`, `src/routes/qr.ts:5`
- **Problema**: La contraseña queda en logs del servidor, historial del navegador y proxies.
- **Solución**: Generar el QR WiFi vía POST con body JSON.

### 6. POST `/api/qr` no devuelve base64
- **Archivo**: `src/utils/qrGenerator.ts:13`
- **Problema**: `qr.toString()` sin `type` devuelve SVG. El contrato `{ qr: base64 }` está roto.
- **Solución**: Pasar `{ type: "base64" }` en las opciones.

### 7. Password `undefined` en QR WiFi
- **Archivo**: `src/routes/qr.ts:20`
- **Problema**: `password!` sin validación; WiFi abierto sin contraseña genera `P:undefined;;`.
- **Solución**: Usar `password || ""` y omitir el campo si está vacío.

### 8. Open redirect + colisiones de código en tracking
- **Archivo**: `src/index.ts:11,26`
- **Problema**:
  - `res.redirect(entry.url)` sin validar que sea URL http(s) → open redirect.
  - `Math.random()` puede generar códigos duplicados y sobrescribir tracking silenciosamente.
- **Solución**: Validar la URL al crear el tracking; usar `crypto.randomBytes` o verificar colisión.

## Menores

### 9. Caracteres especiales sin escapar en formato WiFi
- **Archivo**: `src/utils/qrGenerator.ts:22`
- **Problema**: Un SSID/password con `;`, `:` o `,` rompe el formato WiFi (deben escaparse con `\`).

### 10. Fuga de memoria con blob URLs
- **Archivo**: `public/index.html:292`
- **Problema**: `URL.createObjectURL` sin `revokeObjectURL` en cada generación.

### 11. Tests con caracteres corruptos
- **Archivo**: `tests/qr.test.ts`
- **Problema**: Encoding roto en strings (`vǭlido`, `vacío`).

### 12. Archivos de prueba sin trackear
- **Problema**: `test-text.png` y `test-wifi.png` en la raíz; añadir a `.gitignore` o borrarlos.

### 13. Detalle menor
- El parámetro `type` de `generateQR`/`generateQRBase64` no se usa.
- `express.static("public")` depende del cwd; mejor `path.join(__dirname, "../public")`.

## Arreglados

- ~~`setLoading(false)` en el `finally` borraba el `<img>` recién generado (cuadrado en blanco)~~ — arreglado en `public/index.html`.
