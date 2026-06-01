# Resumen del Proyecto: Financial Metrics Dashboard

## 1. Objetivo
Este proyecto implementa un dashboard de métricas financieras con arquitectura full-stack:

- **Frontend** en React + TypeScript para visualización de KPIs y gráficas.
- **Backend** en FastAPI para exponer datos financieros (mock) y agregaciones.

Está orientado a práctica de desarrollo con IA y a trabajar con reglas/memoria para agentes.

---

## 2. Arquitectura General

- **Monorepo** con dos aplicaciones principales:
  - `frontend/`
  - `backend/`
- **Orquestación local** con `docker-compose.yml`.
- Comunicación entre capas por HTTP (`/api`).

### Flujo de datos
1. El frontend solicita datos al backend (`/api/metrics` y endpoints derivados).
2. El backend genera y filtra movimientos financieros mock.
3. El frontend calcula KPIs y series temporales para representar gráficas.

---

## 3. Stack Tecnológico

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts (gráficas)
- Vitest (tests)

### Backend
- Python 3.13
- FastAPI
- Uvicorn
- Pydantic
- Pytest
- Debugpy (depuración)

### Infraestructura
- Docker + Docker Compose

---

## 4. Estructura de Carpetas

```text
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── routes.py
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_routes.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   └── ui/
│   │   └── lib/
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── README.es.md
```

---

## 5. Backend: API y Lógica

El backend define modelos de movimientos y métricas, y expone endpoints para análisis financiero.

### Endpoints principales
- `GET /health` → estado de servicio.
- `GET /api/metrics` → movimientos financieros (con filtros opcionales).
- `GET /api/metrics/facets` → valores disponibles para filtros.
- `GET /api/metrics/summary` → resumen agregado por día/semana/mes.
- `GET /api/metrics/categories/top` → top categorías por importe.
- `GET /api/metrics/comparison` → comparación entre periodos.
- `GET /api/metrics/alerts` → detección de alertas por incremento de gastos.
- `GET /api/metrics/b2b` y `GET /api/metrics/b2c` → segmentos por tipo de negocio.

### Características funcionales
- Generación de datos mock con semilla fija (`seed=42`) para resultados reproducibles.
- Filtros por fecha, categoría, tipo de operación y tipo de negocio.
- Orden cronológico garantizado en respuestas.

---

## 6. Frontend: UI y Cálculo de Métricas

La app principal carga movimientos desde backend y renderiza:

- Encabezado de dashboard.
- Fila de KPIs:
  - Total Income
  - Total Outcome
  - Profit
  - Profit Margin
- Gráfica de líneas Income vs Outcome.
- Gráfica de Profit Margin (%).

### Utilidades de negocio
En `src/lib/financial-utils.ts`:
- Cálculo de KPIs globales.
- Agregación mensual para visualización.
- Formateadores de moneda y porcentaje.

---

## 7. Ejecución Local

### Opción recomendada (Docker)
```bash
docker compose up --build
```

Servicios esperados:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Docs API: `http://localhost:8000/docs`

### Nota de proxy
El frontend usa proxy de Vite para `/api` hacia `http://backend:8000` dentro de Docker.

---

## 8. Testing

### Backend
```bash
# dentro de backend/
pytest
```

### Frontend
```bash
# dentro de frontend/
npm test
```

También hay scripts de cobertura en frontend (`test:coverage`).

---

## 9. Estado Actual del Proyecto

- Proyecto funcional en local con Docker Compose.
- API operativa y consumida por frontend.
- Base sólida para extender filtros, KPIs avanzados, autenticación o conexión a datos reales.

---

## 10. Posibles Mejoras

1. Sustituir datos mock por base de datos real.
2. Añadir autenticación y control de acceso por roles.
3. Internacionalización de frontend (ES/EN).
4. Persistencia de filtros y rangos de fechas.
5. Añadir métricas adicionales (run rate, CAC, LTV, burn rate).
6. Integrar CI/CD con validación automática de tests y lint.

---

## 11. Evidencias verificadas

- Arquitectura y arranque local: [docker-compose.yml](docker-compose.yml), [backend/Dockerfile](backend/Dockerfile), [frontend/Dockerfile](frontend/Dockerfile)
- Configuración de frontend y toolchain: [frontend/package.json](frontend/package.json), [frontend/vite.config.ts](frontend/vite.config.ts), [frontend/tsconfig.app.json](frontend/tsconfig.app.json)
- Entrada y flujo principal de UI: [frontend/src/App.tsx](frontend/src/App.tsx)
- Cálculo de métricas en frontend: [frontend/src/lib/financial-utils.ts](frontend/src/lib/financial-utils.ts)
- Contrato de API y lógica backend: [backend/app/main.py](backend/app/main.py), [backend/app/routes.py](backend/app/routes.py)
- Cobertura de pruebas backend: [backend/tests/test_routes.py](backend/tests/test_routes.py)
- Cobertura de pruebas frontend: [frontend/src/lib/financial-utils.test.ts](frontend/src/lib/financial-utils.test.ts)
- Documentación base del proyecto: [README.md](README.md), [README.es.md](README.es.md)
