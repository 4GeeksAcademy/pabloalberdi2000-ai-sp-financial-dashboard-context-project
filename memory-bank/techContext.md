# Tech Context

## Vista general del stack

| Capa | Tecnología principal | Evidencia |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite | frontend/package.json |
| Visualización | Recharts | frontend/package.json |
| Estilos | Tailwind CSS v4 + utilidades de composición | frontend/package.json, frontend/src/index.css |
| Backend | Python 3.13 + FastAPI + Pydantic | backend/Dockerfile, backend/requirements.txt |
| Runtime API | Uvicorn + debugpy | backend/requirements.txt, backend/Dockerfile |
| Pruebas | Vitest (frontend), Pytest (backend) | frontend/package.json, backend/requirements.txt |
| Orquestación local | Docker Compose | docker-compose.yml |

## Frontend y entorno de ejecución

### Compatibilidad y runtime

- Aplicación web para navegador moderno (DOM y ES2023).
- Build y dev server con Vite.
- Node.js como entorno de tooling dentro del contenedor frontend.

Evidencia:

- target ES2023 y librerías DOM en frontend/tsconfig.app.json.
- Scripts dev/build/test en frontend/package.json.
- Imagen base node:24-alpine en frontend/Dockerfile.

### Configuración TypeScript

- Resolución de módulos en modo bundler.
- Alias de importación con prefijo arroba hacia src.
- Validaciones activas: noUnusedLocals, noUnusedParameters y noFallthroughCasesInSwitch.

Evidencia:

- frontend/tsconfig.app.json
- frontend/tsconfig.node.json

## Backend y core

### Nota de precisión
Este repositorio no usa TypeScript en backend; usa Python con FastAPI.
Por lo tanto, la validación de tipado estricto de TypeScript aplica al frontend y no al backend.

### Núcleo funcional backend

- Definición de modelos de dominio con Pydantic.
- Funciones de filtro, resumen, ranking y comparación en backend/app/routes.py.
- Endpoints HTTP con validaciones de parámetros Query en FastAPI.

### Modularidad y funciones puras

- Existen funciones mayormente puras para cálculos y agregaciones.
- Existe una oportunidad de mejora: separar la generación de datos mock de los handlers HTTP.

## Tooling e infraestructura de desarrollo

### Scripts y comandos

| Área | Script/comando | Propósito |
|---|---|---|
| Frontend | npm run dev | Desarrollo local con Vite |
| Frontend | npm run build | Type-check de proyecto y build de producción |
| Frontend | npm run test | Suite de pruebas unitarias |
| Frontend | npm run test:coverage | Cobertura de pruebas |
| Backend | pytest | Suite de pruebas backend |
| Full stack | docker compose up --build | Levantar frontend y backend |

### Infra de contenedores

| Servicio | Puerto | Imagen base | Observaciones |
|---|---|---|---|
| frontend | 5173 | node:24-alpine | Proxy /api hacia backend |
| backend | 8000, 5678 | python:3.13-slim | API y depuración remota |

### Integración entre capas

- El frontend usa proxy de Vite para enrutar /api al servicio backend.
- También soporta variable VITE_API_BASE_URL para apuntar a otro origen.

Evidencia:

- frontend/vite.config.ts
- frontend/src/App.tsx
- README.md

## Dependencias clave

### Frontend

| Paquete | Uso principal |
|---|---|
| react, react-dom | Renderizado de interfaz |
| recharts | Gráficas financieras |
| tailwindcss, @tailwindcss/vite | Sistema de estilos |
| clsx, tailwind-merge, class-variance-authority | Composición de clases y variantes |
| vitest, @vitest/coverage-v8 | Testing y cobertura |
| eslint, typescript-eslint, eslint-plugin-react-hooks | Calidad estática |

### Backend

| Paquete | Uso principal |
|---|---|
| fastapi | Framework API |
| uvicorn[standard] | Servidor ASGI |
| pydantic | Modelado y validación |
| debugpy | Depuración |
| pytest, pytest-cov | Testing |
| httpx | Soporte para pruebas HTTP |
