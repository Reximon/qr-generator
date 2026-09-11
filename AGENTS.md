# QR Generator - Roadmap de Implementación

## Arquitectura del proyecto

```
qr-generator/
├── src/
│   ├── index.ts          # Entry point - Express server
│   ├── routes/
│   │   └── qr.ts         # Rutas para generar QR
│   └── utils/
│       └── qrGenerator.ts # Lógica de generación QR
├── public/
│   └── index.html        # Frontend Web UI
├── tests/
│   └── qr.test.ts        # Tests
├── Dockerfile            # Multi-stage build
├── docker-compose.yml    # Servicios, redes, volumes
├── .dockerignore
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

## Pasos de implementación

### Paso 1: Inicializar proyecto TypeScript
- `npm init -y`
- Instalar dependencias: `express`, `qrcode`, `cors`
- Instalar devDependencies: `typescript`, `@types/*`, `ts-node`, `nodemon`, `jest`, `@types/jest`, `ts-jest`
- Crear `tsconfig.json` con strict mode, target ES2020, outDir `./dist`

### Paso 2: Crear la lógica de generación QR
- `src/utils/qrGenerator.ts` — función `generateQR(text: string): Promise<Buffer>`
- Exportar también `generateQRBase64` para la UI

### Paso 3: Crear las rutas de la API
- `src/routes/qr.ts` — Express router con:
  - `GET /api/qr?text=...` → retorna imagen PNG como buffer
  - `POST /api/qr` → body `{ text, format? }` → retorna PNG o SVG
  - Validación básica del input

### Paso 4: Crear el servidor Express
- `src/index.ts` — monta express, sirve archivos estáticos de `public/`, monta rutas en `/api/qr`
- Puerto configurable via variable de entorno `PORT`

### Paso 5: Crear la Web UI básica
- `public/index.html` — formulario simple con input de texto y botón "Generar"
- JavaScript inline que hace fetch a `/api/qr?text=...` y muestra la imagen resultante
- CSS minimalista con CSS variables para dark/light mode

### Paso 6: Tests con Jest
- Test unitario de `generateQR()` — verifica que retorna un Buffer válido
- Test de integración del endpoint GET `/api/qr`
- Usar Jest + ts-jest

### Paso 7: Dockerfile multi-stage (avanzado)
- Stage 1 (builder): node:20-alpine, npm ci, build
- Stage 2 (production): node:20-alpine, user no-root, healthcheck
- Exponer puerto 3000

### Paso 8: docker-compose.yml (avanzado)
- Servicio `app` con build, restart policy, health check, resource limits
- Red dedicada `qr-network`
- Volume para datos persistentes
- Variables de entorno via `.env`
- Profile para desarrollo vs producción

### Paso 9: .dockerignore + optimizaciones
- `.dockerignore` excluir node_modules, .git, tests, *.md
- Layer caching óptimo

### Paso 10: Endpoint de salud
- `GET /health` → `{ status: "ok", uptime: ... }`

### Paso 11: Scripts de desarrollo
- `package.json` scripts: `dev` (nodemon), `build` (tsc), `start`, `test`
- `docker compose --profile dev up` para desarrollo con hot-reload
