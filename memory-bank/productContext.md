# Product Context

## Propósito del sistema
Este repositorio implementa un dashboard financiero full-stack para visualizar métricas clave de negocio a partir de movimientos de ingresos y egresos.

El sistema resuelve tres necesidades principales:

- Exponer datos financieros y agregaciones mediante API HTTP.
- Transformar esos datos en KPIs y series temporales para consumo ejecutivo.
- Acelerar desarrollo y onboarding con una arquitectura simple, ejecutable en Docker y validable con pruebas automáticas.

Evidencia de producto:

- Frontend React y consumo de API en frontend/src/App.tsx.
- API FastAPI y modelos de respuesta en backend/app/main.py y backend/app/routes.py.
- Descripción funcional en README.md.

## Flujo de valor

## 1) Ingesta y modelado lógico
El backend modela cada movimiento financiero con fecha, monto, tipo de operación, categoría y tipo de negocio.

## 2) Enriquecimiento y analítica
La API aplica filtros y cálculos:

- Filtros por fecha, categoría, operación y segmento B2B/B2C.
- Resúmenes por día, semana y mes.
- Top categorías por monto.
- Comparación entre periodos.
- Alertas por incremento relativo de egresos.

## 3) Presentación de valor al usuario
El frontend solicita datos de la API y construye:

- KPIs de ingreso total, egreso total, beneficio y margen.
- Gráficas de evolución mensual.
- Estado de carga y estado de error en UI.

### Mapa de flujo

| Etapa | Componente | Salida |
|---|---|---|
| Captura de datos | backend/app/routes.py | Lista de movimientos financieros |
| Agregación | backend/app/routes.py y frontend/src/lib/financial-utils.ts | KPIs, series mensuales, comparativas |
| Exposición | Endpoints FastAPI | JSON tipado por Pydantic |
| Visualización | frontend/src/App.tsx + componentes dashboard | Panel ejecutivo con KPIs y charts |

## Criterios de éxito

### Funcionales

- El sistema devuelve datos financieros coherentes y ordenados cronológicamente.
- El dashboard representa de forma consistente ingresos, egresos y margen.
- Los filtros y endpoints analíticos responden con estructuras estables.

### Técnicos y de arquitectura

- Contrato de datos explícito en backend con Pydantic.
- Frontend con utilidades puras para cálculo y formato.
- Ejecución reproducible local mediante Docker Compose.
- Pruebas automáticas en backend y frontend para validar comportamiento crítico.

### Indicadores observables en este repositorio

| Indicador | Evidencia |
|---|---|
| API disponible y documentada | endpoint /docs en FastAPI y definición en backend/app/main.py |
| Orquestación local | docker-compose.yml |
| Cálculo de métricas en cliente | frontend/src/lib/financial-utils.ts |
| Cobertura de endpoints clave | backend/tests/test_routes.py |
| Cobertura de utilidades de cálculo | frontend/src/lib/financial-utils.test.ts |
