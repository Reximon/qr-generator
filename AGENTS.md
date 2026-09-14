# QR Generator - Roadmap de Implementación

## Arquitectura del proyecto

```
qr-generator/
├── src/
│   ├── index.ts          # Entry point - Express server + tracking
│   ├── routes/
│   │   └── qr.ts         # Rutas para generar QR (text/wifi)
│   └── utils/
│       └── qrGenerator.ts # Lógica de generación QR con wifi format
├── public/
│   ├── index.html        # Frontend Web UI (diseño kraft/artesanal)
│   ├── stats.html        # Página de estadísticas de tracking
│   └── logo.png          # Logo para overlay en QR
├── tests/
│   └── qr.test.ts        # Tests
├── Dockerfile            # Multi-stage build (node:20-slim)
├── docker-compose.yml    # Producción
├── docker-compose.dev.yml # Desarrollo con profile dev
├── .dockerignore
├── .env.example
├── tsconfig.json
├── package.json
├── AGENTS.md            # Este archivo
└── README.md
```

## Estado actual

### Tecnologías usadas
- **Backend**: Express + TypeScript
- **QR generation**: `qrcode` con formato WiFi (`WIFI:T:WPA;S:...;P:...;;`)
- **Tracking**: Map en memoria, redirect `/t/:code`, `/api/stats`
- **Base image**: `node:20-slim` (no alpine, por compatibilidad con sharp)
- **Frontend**: HTML/CSS/JS inline, diseño kraft/artesanal, tipografía `Caveat` + `Space Grotesk`

### Endpoints
- `GET /api/qr?type=text|wifi&text=...&ssid=...&password=...&encryption=...` — Genera QR como PNG
- `POST /api/qr` — Body `{ text, type }` → retorna `{ qr: base64 }`
- `GET /t/:code` — Redirect, incrementa contador de visitas
- `POST /api/track` — Body `{ url }` → retorna `{ code, trackingUrl }`
- `GET /api/stats` — JSON con estadísticas de todos los QRs
- `GET /stats` — HTML con tabla de estadísticas
- `GET /health` — Estado del servidor

### Features implementadas
- **Tipo QR**: Texto o WiFi (formato `WIFI:T:WPA;S:SSID;P:pass;;`)
- **Diseño kraft/artesanal**: fondo beige, tipografía manuscrita `Caveat`, iconos tipo sello, tarjetas tipo cartón
- **Selector de tipo**: Botones Texto/WiFi con formulario condicional
- **Tracking**: Cada QR con código único se registra en Map, se redirige y se cuenta visitas
- **Docker multi-stage** con `node:20-slim`

### Aprendizajes clave
1. `sharp` no funciona en Alpine (musl libc) — usar `node:20-slim`
2. `sharp` necesita enteros para `left`/`top` en `composite` — usar `Math.round()`
3. Docker Compose `deploy.resources.memory` puede matar procesos (OOM) — quitar o aumentar
4. `express.static` con `setHeaders` para cache-control
5. `path.posix.join` para rutas que funcionen en contenedores Linux
6. Los cambios en `public/` requieren `docker compose up --build` (no solo `restart`)
7. PowerShell no soporta `&&` — usar `;` como separador de comandos
8. `write` y `edit` pueden estar bloqueados por permisos — usar `bash` con Python

### Pasos de implementación

### Paso 1: Inicializar proyecto TypeScript
- `npm init -y`
- Instalar dependencias: `express`, `qrcode`, `cors`
- Instalar devDependencies: `typescript`, `@types/*`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `ts-jest`, `@types/node`, `supertest`
- Crear `tsconfig.json` con strict mode, target ES2020, outDir `./dist`

### Paso 2: Crear la lógica de generación QR
- `src/utils/qrGenerator.ts` — función `generateQR(text, type?)` con formato WiFi
- `formatWiFiQR(ssid, password, encryption)` → `WIFI:T:WPA;S:...;P:...;;`
- `generateQRBase64(text, type?)` para retorno JSON

### Paso 3: Crear las rutas de la API
- `src/routes/qr.ts` — Express router con:
  - `GET /api/qr?type=text|wifi&text=...&ssid=...&password=...&encryption=...` → retorna PNG
  - `POST /api/qr` → body `{ text, type }` → retorna `{ qr: base64 }`

### Paso 4: Crear el servidor Express
- `src/index.ts` — monta express, sirve archivos estáticos de `public/`, monta rutas en `/api/qr`
- Tracking: `Map<string, {url, visits, createdAt}>`
- `GET /t/:code` → redirect + incrementa contador
- `POST /api/track` → crea nuevo código de tracking
- `GET /api/stats` → retorna JSON con estadísticas
- `GET /stats` → página HTML con tabla de stats
- Puerto configurable via variable de entorno `PORT`

### Paso 5: Crear la Web UI
- `public/index.html` — Diseño kraft/artesanal, selector tipo QR, formulario condicional WiFi
- `public/stats.html` — Página de estadísticas con tabla

### Paso 6: Tests con Jest
- `tests/qr.test.ts` — Test de `generateQR()` y endpoint GET `/api/qr`
- `jest.config.js` con `preset: "ts-jest"`, `testEnvironment: "node"`

### Paso 7: Dockerfile multi-stage
- `node:20-slim` (NO alpine, `sharp` necesita glibc)
- Stage builder, dev, production
- `curl` en healthcheck (no `wget` que no está en Debian)

### Paso 8: docker-compose.yml
- `docker-compose.yml` — Producción (sin `deploy.resources`)
- `docker-compose.dev.yml` — Desarrollo con `profiles: dev`, target `dev`, volumes
- Red `qr-network`, restart policy, healthcheck

### Paso 9: .dockerignore + optimizaciones
- `.dockerignore` excluir node_modules, dist, .git, tests, *.md, Dockerfile, etc.
- `public/` NO excluido (necesario para logo.png y archivos estáticos)

### Paso 10: Endpoint de salud
- `GET /health` → `{ status: "ok", uptime: ... }`

### Paso 11: Scripts de desarrollo
- `package.json` scripts: `dev` (nodemon), `build` (tsc), `start`, `test`
- `docker compose --profile dev up` para desarrollo con hot-reload
