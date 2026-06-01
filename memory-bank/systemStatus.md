# System Status

## Estado actual
El sistema está operativo como dashboard financiero full-stack en entorno local con Docker Compose, con API funcional y visualización en frontend.

## Características implementadas

### 1) Modelado y contrato de datos

- Modelo de movimiento financiero con campos de fecha, monto, operación, categoría y tipo de negocio.
- Modelos de respuesta para facets, summary, top categorías, comparación y alertas.

Evidencia:

- backend/app/routes.py

### 2) Endpoints y análisis disponibles

| Endpoint | Funcionalidad |
|---|---|
| /health | Verificación de servicio |
| /api/metrics | Listado de movimientos con filtros |
| /api/metrics/facets | Catálogos de filtros y rango de fechas |
| /api/metrics/summary | Resumen por día/semana/mes |
| /api/metrics/categories/top | Ranking de categorías por monto |
| /api/metrics/comparison | Comparación entre periodo actual y previo |
| /api/metrics/alerts | Alertas por incremento de egresos |
| /api/metrics/b2b y /api/metrics/b2c | Segmentación por tipo de negocio |

### 3) Frontend de dashboard

- Carga de datos desde API.
- Render de KPIs agregados.
- Gráfica de ingresos vs egresos.
- Gráfica de margen de beneficio.
- Estado loading y estado error en la vista principal.

Evidencia:

- frontend/src/App.tsx
- frontend/src/components/dashboard
- frontend/src/lib/financial-utils.ts

### 4) Testing

- Backend con pruebas de endpoints y filtros clave.
- Frontend con pruebas de utilidades de cálculo y formato.

Evidencia:

- backend/tests/test_routes.py
- frontend/src/lib/financial-utils.test.ts

## Brechas conocidas

Las siguientes brechas se basan en análisis técnico previo y en el estado observable del código:

| Categoría | Brecha | Impacto |
|---|---|---|
| Seguridad | CORS abierto sin segmentación por entorno en backend/app/main.py | Riesgo de exposición si se despliega sin endurecimiento |
| Arquitectura backend | Generación de datos mock acoplada a handlers HTTP | Dificulta migración a persistencia real |
| Arquitectura frontend | Consumo de API directo en App, sin cliente HTTP central | Menor reutilización y control uniforme de errores |
| Testing frontend | Falta de pruebas de integración para loading, success y error | Riesgo de regresiones en UX |
| Contrato de datos | Tipos frontend y modelos backend sincronizados manualmente | Riesgo de deriva de contrato |
| Configuración UI | Contexto de periodo hardcodeado en cabecera principal | Menor flexibilidad para escenarios reales |
| Documentación técnica | Pocas descripciones de intención en funciones de cálculo | Onboarding más lento |

## Siguientes prioridades de ingeniería

### Prioridad 1: Robustez y seguridad

1. Parametrizar CORS por entorno y restringir orígenes en producción.
2. Introducir validaciones adicionales de rangos de fechas y edge cases en API.

### Prioridad 2: Evolución de arquitectura

1. Extraer capa de servicios/repositorio en backend para desacoplar datos mock de endpoints.
2. Crear cliente API central en frontend para manejo unificado de errores, cancelación y trazabilidad.

### Prioridad 3: Calidad y escalabilidad

1. Añadir pruebas de integración de UI para flujo asíncrono.
2. Fortalecer sincronización de contrato API entre backend y frontend.
3. Externalizar textos y contexto de dashboard para reducir hardcodes.

### Prioridad 4: Camino a producto real

1. Sustituir dataset mock por persistencia real.
2. Añadir autenticación/autorización según perfil de usuario.
3. Incorporar observabilidad básica de API y frontend para diagnóstico.

## Riesgo global y preparación

| Dimensión | Estado |
|---|---|
| Funcionalidad MVP | Alto |
| Mantenibilidad | Medio |
| Seguridad para producción | Bajo a Medio |
| Escalabilidad de datos reales | Medio |
| Testabilidad end-to-end | Medio |

Conclusión:
La base actual es adecuada para aprendizaje y evolución incremental. Con las prioridades propuestas, puede transicionar a un baseline de ingeniería apto para escenarios de producción controlada.
